import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'
import { isAdminUser } from '@/app/lib/adminAccess'

export const runtime = 'nodejs'
const GEMINI_MODEL = 'gemini-3.5-flash-lite'

interface TourismMetrics {
  revenue_php: number
  transaction_count: number
  visitor_events: number
  average_resource_usage_percent: number | null
  resource_readings: number
  average_energy_usage: number | null
  average_water_usage: number | null
}

function isTourismMetrics(value: unknown): value is TourismMetrics {
  if (!value || typeof value !== 'object') return false

  const metrics = value as Record<string, unknown>
  return (
    typeof metrics.revenue_php === 'number' &&
    typeof metrics.transaction_count === 'number' &&
    typeof metrics.visitor_events === 'number' &&
    (typeof metrics.average_resource_usage_percent === 'number' ||
      metrics.average_resource_usage_percent === null) &&
    typeof metrics.resource_readings === 'number' &&
    (typeof metrics.average_energy_usage === 'number' || metrics.average_energy_usage === null) &&
    (typeof metrics.average_water_usage === 'number' || metrics.average_water_usage === null)
  )
}

export async function POST(request: Request) {
  const authorization = request.headers.get('authorization')
  const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]

  if (!accessToken) {
    return Response.json({ error: 'Sign in with the administrator account to generate a report.' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('AI tourism report is missing Supabase server configuration.')
    return Response.json({ error: 'The report service is not configured.' }, { status: 503 })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  })

  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
  if (authError || !isAdminUser(user)) {
    return Response.json({ error: 'Only the configured administrator can generate this report.' }, { status: 403 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'Gemini is not configured. Add GEMINI_API_KEY to the server environment and restart the app.' }, { status: 503 })
  }

  const periodStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: rawMetrics, error: metricsError } = await supabase.rpc(
    'get_tourism_ai_metrics',
    { p_since: periodStart }
  )

  if (metricsError) {
    console.error('Unable to load tourism metrics for AI report:', metricsError.message)
    return Response.json({
      error: 'Could not load tourism data. Apply the latest supabase-schema.sql and confirm the administrator data policies are active.'
    }, { status: 503 })
  }

  if (!isTourismMetrics(rawMetrics)) {
    console.error('Tourism metrics RPC returned an unexpected result.')
    return Response.json({ error: 'Tourism data returned an unexpected format.' }, { status: 500 })
  }

  const metrics = rawMetrics
  if (
    metrics.transaction_count === 0 &&
    metrics.visitor_events === 0 &&
    metrics.resource_readings === 0
  ) {
    return Response.json({
      error: 'There is no tourism data for the last 30 days yet. Add verified records before generating an analysis.'
    }, { status: 422 })
  }

  const prompt = `You are assisting Daet municipal tourism decision-makers. Analyze only the recorded aggregate metrics below for the last 30 days.

Metrics:
- Recorded shop and confirmed tour revenue: PHP ${metrics.revenue_php.toLocaleString('en-PH')}
- Revenue transactions: ${metrics.transaction_count}
- Recorded museum scans and experience check-ins (visitation events, not unique visitors): ${metrics.visitor_events}
- Facility resource readings: ${metrics.resource_readings}
- Average facility usage/capacity: ${metrics.average_resource_usage_percent === null ? 'not available' : `${metrics.average_resource_usage_percent}%`}
- Average energy usage (unit not specified in the database): ${metrics.average_energy_usage === null ? 'not available' : metrics.average_energy_usage}
- Average water usage (unit not specified in the database): ${metrics.average_water_usage === null ? 'not available' : metrics.average_water_usage}
- Verified jobs data: not collected by this system.

Write a concise executive brief with observations, sustainability considerations, and practical next steps. Explicitly say when information is missing. Do not invent causes, job figures, forecasts, or facts beyond these metrics. Distinguish recorded totals from unique visitors and estimates.`

  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        maxOutputTokens: 400
      }
    })
    const report = response.text?.trim()

    if (!report) {
      console.error('Gemini returned an empty tourism report.')
      return Response.json({ error: 'Gemini returned an empty report. Please try again.' }, { status: 502 })
    }

    return Response.json({
      report,
      periodStart,
      generatedAt: new Date().toISOString(),
      model: GEMINI_MODEL
    })
  } catch (error) {
    const status = typeof error === 'object' && error !== null && 'status' in error &&
      typeof error.status === 'number'
      ? error.status
      : null
    const message = error instanceof Error ? error.message : 'Unknown Gemini API error'
    console.error('Gemini tourism report request failed:', {
      status,
      message: apiKey ? message.replaceAll(apiKey, '[redacted]').slice(0, 500) : message.slice(0, 500)
    })

    if (status === 400 || status === 404) {
      return Response.json({
        error: `Gemini rejected the request or model "${GEMINI_MODEL}" is unavailable. Confirm this model is enabled for your Google AI Studio project.`
      }, { status: 502 })
    }

    if (status === 401) {
      return Response.json({
        error: 'Gemini rejected the API key. Check that the replacement GEMINI_API_KEY is valid, save .env.local, and restart the server.'
      }, { status: 502 })
    }

    if (status === 403) {
      return Response.json({
        error: 'The Gemini API key or Google project is not permitted to use this model. Check the API key restrictions, project status, and Gemini API access in AI Studio.'
      }, { status: 502 })
    }

    if (status === 429) {
      return Response.json({
        error: 'Gemini rate limit or free-tier quota was reached. Check the project’s usage limits in Google AI Studio and try again after the quota resets.'
      }, { status: 429 })
    }

    if (status !== null && status >= 500) {
      return Response.json({
        error: 'Gemini is temporarily unavailable. Wait a little and try again.'
      }, { status: 502 })
    }

    return Response.json({
      error: 'Gemini could not generate the report. Check the server terminal for the Gemini error details.'
    }, { status: 502 })
  }
}
