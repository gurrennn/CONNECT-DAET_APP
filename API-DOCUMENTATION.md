# 🔌 CONNECT-DAET API Documentation

Complete API reference for all endpoints in the CONNECT-DAET Tourism Analytics System.

**Base URL:** `http://localhost:3000/api` (development)  
**Production URL:** `https://your-domain.com/api`

**Authentication:** Currently admin-only via Supabase Auth session cookies

---

## 📊 Analytics API

### GET /api/analytics/metrics

Fetch aggregated analytics metrics across all subsystems.

**Query Parameters:**
- `since` (optional): ISO date string. Default: 30 days ago

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "revenue_php": 2890000,
      "transaction_count": 1234,
      "visitor_events": 5678,
      "average_resource_usage_percent": 67.5,
      "resource_readings": 450,
      "average_energy_usage": 234.56,
      "average_water_usage": 123.45
    },
    "details": {
      "shop_transactions": [...],
      "tours_bookings": [...],
      "museum_scans": [...],
      "experiences_checkins": [...],
      "feedback": [...]
    }
  },
  "source": "database" | "mock"
}
```

**Example:**
```bash
curl "http://localhost:3000/api/analytics/metrics?since=2026-10-01T00:00:00Z"
```

---

## 🛍️ Shop API

### GET /api/shop/products

Fetch all available products in the shop.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Daet Souvenir T-Shirt",
      "description": "Premium cotton t-shirt with Daet landmark print",
      "price": 450,
      "category": "Apparel",
      "stock": 125,
      "image_url": "/products/tshirt.jpg",
      "is_active": true
    }
  ]
}
```

**Example:**
```bash
curl "http://localhost:3000/api/shop/products"
```

---

### GET /api/shop/transactions

Fetch shop transaction history.

**Query Parameters:**
- `limit` (optional): Number of transactions. Default: 100

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "user_id": "user-123",
      "amount": 450,
      "items": {"product_name": "Daet Souvenir T-Shirt", "quantity": 1},
      "created_at": "2026-11-08T10:30:00Z",
      "updated_at": "2026-11-08T10:30:00Z",
      "status": "completed"
    }
  ],
  "source": "database" | "mock"
}
```

**Example:**
```bash
curl "http://localhost:3000/api/shop/transactions?limit=50"
```

---

## 🗺️ Tours API

### GET /api/tours/bookings

Fetch tour bookings.

**Query Parameters:**
- `status` (optional): Filter by status (`confirmed`, `pending`, `cancelled`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "tour_name": "Bagasbas Beach Experience",
      "price": 1200,
      "booking_date": "2026-11-15",
      "status": "confirmed",
      "created_at": "2026-11-08T10:30:00Z"
    }
  ],
  "source": "database" | "mock"
}
```

**Example:**
```bash
curl "http://localhost:3000/api/tours/bookings?status=confirmed"
```

---

### POST /api/tours/bookings

Create a new tour booking.

**Request Body:**
```json
{
  "tour_name": "Bagasbas Beach Experience",
  "price": 1200,
  "booking_date": "2026-11-15"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "tour_name": "Bagasbas Beach Experience",
    "price": 1200,
    "booking_date": "2026-11-15",
    "status": "confirmed",
    "created_at": "2026-11-08T10:30:00Z"
  }
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/api/tours/bookings" \
  -H "Content-Type: application/json" \
  -d '{"tour_name":"Bagasbas Beach Experience","price":1200,"booking_date":"2026-11-15"}'
```

---

## 💬 Feedback API

### GET /api/feedback/submit

Fetch all feedback entries.

**Query Parameters:**
- `subsystem` (optional): Filter by subsystem (`shop`, `tours`, `museum`, etc.)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "subsystem": "tours",
      "rating": 5,
      "comment": "Amazing beach experience!",
      "sentiment": "positive",
      "created_at": "2026-11-08T10:30:00Z"
    }
  ],
  "sentiment": {
    "positive": 1847,
    "neutral": 543,
    "negative": 180
  },
  "source": "database" | "mock"
}
```

**Example:**
```bash
curl "http://localhost:3000/api/feedback/submit?subsystem=tours"
```

---

### POST /api/feedback/submit

Submit new visitor feedback.

**Request Body:**
```json
{
  "subsystem": "tours",
  "rating": 5,
  "comment": "Amazing beach experience!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "subsystem": "tours",
    "rating": 5,
    "comment": "Amazing beach experience!",
    "sentiment": "positive",
    "created_at": "2026-11-08T10:30:00Z"
  },
  "message": "Feedback submitted successfully"
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/api/feedback/submit" \
  -H "Content-Type: application/json" \
  -d '{"subsystem":"tours","rating":5,"comment":"Amazing beach experience!"}'
```

---

## 🤖 AI API

### POST /api/ai-tourism-report

Generate AI-powered tourism insights and recommendations.

**Request Body:**
```json
{
  "since": "2026-10-01T00:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "report": {
    "summary": "Analysis of Daet tourism data...",
    "insights": [
      "Revenue increased by 24% compared to last period",
      "Visitor satisfaction remains high at 4.5/5",
      "Museum exhibits seeing increased engagement"
    ],
    "recommendations": [
      "Consider expanding beach tour offerings",
      "Optimize shop inventory based on sales trends"
    ]
  }
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/api/ai-tourism-report" \
  -H "Content-Type: application/json" \
  -d '{"since":"2026-10-01T00:00:00Z"}'
```

---

## 🔐 Authentication

All API endpoints require authentication via Supabase Auth session cookies.

**Client-side usage:**
```typescript
import { supabase } from '@/app/lib/supabaseClient'

// User must be authenticated
const { data: { session } } = await supabase.auth.getSession()

if (session) {
  // Make API call
  const response = await fetch('/api/analytics/metrics')
  const data = await response.json()
}
```

**Server-side validation:**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: Request) {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // Process request...
}
```

---

## 📝 Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔄 Data Fallback Strategy

All GET endpoints implement a fallback mechanism:

1. **First attempt:** Query real Supabase database
2. **On error:** Return mock/sample data
3. **Response includes:** `source` field indicating data origin (`"database"` or `"mock"`)

This ensures the application remains functional even if the database is unavailable.

---

## 🧪 Testing APIs

### Using curl:
```bash
# Test analytics metrics
curl "http://localhost:3000/api/analytics/metrics"

# Test product listing
curl "http://localhost:3000/api/shop/products"

# Test creating a booking
curl -X POST "http://localhost:3000/api/tours/bookings" \
  -H "Content-Type: application/json" \
  -d '{"tour_name":"Beach Tour","price":1200,"booking_date":"2026-12-01"}'
```

### Using Postman:
1. Import the endpoints
2. Set base URL to `http://localhost:3000/api`
3. For POST requests, set Content-Type header to `application/json`

### Using JavaScript:
```javascript
// Fetch products
const products = await fetch('/api/shop/products')
  .then(res => res.json())

// Create booking
const booking = await fetch('/api/tours/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tour_name: 'Beach Tour',
    price: 1200,
    booking_date: '2026-12-01'
  })
}).then(res => res.json())
```

---

## 📊 Rate Limiting

Currently no rate limiting is implemented. For production deployment, consider:

- **Vercel:** Built-in DDoS protection
- **Upstash Rate Limit:** For custom rate limiting
- **Cloudflare:** For advanced protection

---

## 🔮 Future API Endpoints (Planned)

- `GET /api/museum/scans` - Museum QR scan data
- `POST /api/museum/generate-qr` - Generate QR codes
- `GET /api/experiences/checkins` - Activity check-ins
- `POST /api/experiences/checkin` - Record check-in
- `GET /api/rewards/points` - User points balance
- `POST /api/rewards/claim` - Claim reward
- `GET /api/users/profiles` - User demographics
- `GET /api/facilities/usage` - Facility metrics

---

## 📚 Additional Resources

- **Supabase Docs:** https://supabase.com/docs
- **Next.js API Routes:** https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **TypeScript:** https://www.typescriptlang.org/docs/

---

**Last Updated:** November 8, 2026  
**API Version:** 1.0  
**Maintainer:** CONNECT-DAET Development Team
