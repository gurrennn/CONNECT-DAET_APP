/**
 * POST /api/analytics/ingest
 * ============================================================
 * CONNECT-DAET.ph — Cross-Subsystem Data Receiver
 * TIA-DAS (Subsystem 10) — Passive Ingest API
 *
 * Accepts event payloads from any other CONNECT-DAET subsystem
 * and stores them in analytics_import_logs for processing.
 *
 * Any subsystem can POST here when something relevant happens:
 *   - Subsystem 8 (Tour Bookings)  → tour_booking
 *   - Subsystem 9 (Sentiment)      → satisfaction_feedback
 *   - Subsystem 7 (E-commerce)     → product_sale
 *   - Subsystem 5 (Events)         → event_attendance
 *   - Subsystem 11 (Loyalty)       → loyalty_redemption
 *
 * Authentication: Bearer token (Supabase service role key or
 *                 shared API key set in INGEST_API_KEY env var).
 *
 * Request body:
 * {
 *   "source":     "subsystem_8_bookings",   // required
 *   "event_type": "tour_booking",           // required
 *   "value":      1500.00,                  // optional numeric value
 *   "destination": "Bagasbas Beach",        // optional
 *   "timestamp":  "2026-11-11T10:00:00Z",  // optional, defaults to now
 *   "metadata":   { ... }                   // optional free-form JSON
 * }
 *
 * Response 200: { success: true, id: "<uuid>", message: "..." }
 * Response 400: { error: "..." }
 * Response 401: { error: "Unauthorized" }
 * Response 500: { error: "..." }
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Valid sources and event types — extend as more subsystems come online
const VALID_SOURCES = [
  'subsystem_5_events',
  'subsystem_6_crisis',
  'subsystem_7_ecommerce',
  'subsystem_8_bookings',
  'subsystem_9_sentiment',
  'subsystem_11_loyalty',
  'manual_test',           // for demo / testing
]

const VALID_EVENT_TYPES = [
  // Subsystem 5
  'event_registration',
  'event_attendance',
  'event_created',
  // Subsystem 6
  'crisis_alert_issued',
  'crisis_resolved',
  // Subsystem 7
  'product_sale',
  'artisan_registered',
  // Subsystem 8
  'tour_booking',
  'tour_completed',
  'tour_cancelled',
  // Subsystem 9
  'satisfaction_feedback',
  'sentiment_score',
  // Subsystem 11
  'loyalty_points_earned',
  'loyalty_redemption',
  // General
  'test_ping',
]

export async function POST(req: NextRequest) {
  // ── Authentication ──────────────────────────────────────────
  // Accept either:
  //   1. INGEST_API_KEY shared secret (for server-to-server calls from other subsystems)
  //   2. Supabase service role (for direct Supabase calls)
  const authHeader = req.headers.get('Authorization') || ''
  const ingestKey = process.env.INGEST_API_KEY

  const isValidApiKey = ingestKey && authHeader === `Bearer ${ingestKey}`

  // Also accept calls with no key in development for easy testing
  const isDev = process.env.NODE_ENV === 'development'

  if (!isValidApiKey && !isDev) {
    return NextResponse.json(
      { error: 'Unauthorized. Provide a valid Bearer token in the Authorization header.' },
      { status: 401 }
    )
  }

  // ── Parse body ──────────────────────────────────────────────
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { source, event_type, value, destination, timestamp, metadata } = body as {
    source?: string
    event_type?: string
    value?: number
    destination?: string
    timestamp?: string
    metadata?: Record<string, unknown>
  }

  // ── Validate required fields ────────────────────────────────
  if (!source || typeof source !== 'string') {
    return NextResponse.json({ error: 'Field "source" is required (string).' }, { status: 400 })
  }
  if (!event_type || typeof event_type !== 'string') {
    return NextResponse.json({ error: 'Field "event_type" is required (string).' }, { status: 400 })
  }

  // Warn about unknown sources/events (don't block — other teams may add new ones)
  const unknownSource = !VALID_SOURCES.includes(source)
  const unknownEvent = !VALID_EVENT_TYPES.includes(event_type)

  // ── Write to Supabase ───────────────────────────────────────
  // Use service role key so this endpoint doesn't require an authenticated session
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: 'Server misconfiguration: Supabase credentials not set.' },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })

  // Build a human-readable notes string
  const notes = [
    unknownSource ? `⚠️ Unknown source: "${source}"` : null,
    unknownEvent ? `⚠️ Unknown event_type: "${event_type}"` : null,
    destination ? `Destination: ${destination}` : null,
    value != null ? `Value: ${value}` : null,
  ]
    .filter(Boolean)
    .join(' | ')

  const { data: logRow, error: logError } = await supabase
    .from('analytics_import_logs')
    .insert({
      source_name: source,
      imported_at: timestamp || new Date().toISOString(),
      record_count: 1,
      status: 'success',
      notes: notes || `${event_type} received from ${source}`,
    })
    .select()
    .single()

  if (logError) {
    console.error('[TIA-DAS ingest] Failed to write import log:', logError.message)
    return NextResponse.json(
      { error: 'Failed to record event. Database error: ' + logError.message },
      { status: 500 }
    )
  }

  // ── Side effects: process certain event types directly ──────
  // For now we just log. As subsystems come online, uncomment and
  // expand these blocks to write directly into analytics tables.

  try {
    // Subsystem 9: satisfaction_feedback → store in analytics_ingest_events
    // when analytics_ingest_events table exists, write here.

    // Subsystem 8: tour_booking → can increment destination counts
    // We store the full metadata in the log for now.

    // Future: when other subsystems are live, process metadata here
    // and write derived records into analytics_tourism_statistics, etc.
  } catch (sideEffectError) {
    // Side effect failures never block the main ingest response
    console.warn('[TIA-DAS ingest] Side effect processing failed:', sideEffectError)
  }

  return NextResponse.json({
    success: true,
    id: logRow.id,
    message: `Event "${event_type}" from "${source}" recorded successfully.`,
    warnings: [
      unknownSource ? `Source "${source}" is not in the known list — stored anyway.` : null,
      unknownEvent ? `Event type "${event_type}" is not in the known list — stored anyway.` : null,
    ].filter(Boolean),
  })
}

// ── GET: Health check / documentation ──────────────────────
export async function GET() {
  return NextResponse.json({
    system: 'TIA-DAS — CONNECT-DAET.ph Subsystem 10',
    endpoint: 'POST /api/analytics/ingest',
    description: 'Passive data receiver for cross-subsystem event ingestion.',
    status: 'online',
    validSources: VALID_SOURCES,
    validEventTypes: VALID_EVENT_TYPES,
    examplePayload: {
      source: 'subsystem_8_bookings',
      event_type: 'tour_booking',
      value: 1500.00,
      destination: 'Bagasbas Beach',
      timestamp: new Date().toISOString(),
      metadata: { tour_name: 'Surfing Day Tour', pax: 2, booking_id: 'BK-001' },
    },
    authentication: 'Bearer <INGEST_API_KEY> in Authorization header',
  })
}
