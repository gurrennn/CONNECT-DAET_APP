# 🏛️ CONNECT-DAET Tourism Analytics System

**Comprehensive Tourism Management Platform for Daet Municipality, Camarines Norte, Philippines**

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-green?logo=supabase)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwindcss)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Subsystems](#subsystems)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

CONNECT-DAET is an integrated tourism analytics and management platform designed for Daet Municipality. The system aggregates data from multiple subsystems to provide real-time insights, predictive analytics, and operational intelligence for tourism management.

### Key Capabilities

- **Real-time Analytics Dashboard** - Comprehensive metrics across all tourism operations
- **AI-Powered Insights** - Automated trend detection and recommendations
- **Multi-Subsystem Integration** - Unified view of shop, tours, museum, experiences, and more
- **Resource Management** - Track facility usage, sustainability metrics
- **Visitor Analytics** - Detailed visitor behavior and satisfaction tracking
- **Export & Reporting** - Generate reports in CSV, Excel, JSON, and PDF formats

---

## ✨ Features

### Analytics & Reporting
- 📊 **Advanced Dashboard** - Real-time metrics with interactive charts
- 📈 **Predictive Analytics** - AI-powered forecasting and trend detection
- 🔍 **Anomaly Detection** - Automatic identification of unusual patterns
- 📅 **Date Range Filtering** - Flexible time period selection with comparisons
- 📥 **Data Export** - Multiple format support (CSV, Excel, JSON, PDF)
- 🎯 **Quick Stats** - Animated metric cards with trend indicators

### Subsystems (Coming Soon)
- 🛍️ **Shop Management** - E-commerce transactions and inventory
- 🗺️ **Tours & Bookings** - Tour management and booking system
- 🏛️ **Museum Experience** - QR code scanning and exhibit tracking
- 🎨 **Experiences & Activities** - Check-in system for tourism activities
- 🏆 **Rewards Program** - Loyalty points and gamification
- 💬 **Feedback System** - Visitor ratings and sentiment analysis
- 👥 **User Profiles** - Visitor demographics and preferences
- 🏢 **Facility Management** - Resource usage and sustainability tracking

### Advanced Features
- 🤖 **AI Insights Engine** - Powered by Google Gemini AI
- ⚡ **Real-time Updates** - Live data synchronization (planned)
- 🔐 **Role-Based Access** - Admin, manager, and viewer roles (planned)
- 📱 **Mobile Responsive** - Optimized for all devices (in development)
- 🌐 **Multi-language** - English and Tagalog support (planned)

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- **Framework:** Next.js 16.2 (App Router)
- **UI Library:** React 19.2
- **Language:** TypeScript 5.x
- **Styling:** TailwindCSS 4.0
- **Charts:** Recharts 3.8 + Tremor React 3.18
- **State Management:** React Hooks

**Backend:**
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Row Level Security:** Enabled on all tables
- **API:** Next.js API Routes

**AI & Analytics:**
- **AI Provider:** Google Gemini AI
- **Analytics Engine:** Custom TypeScript implementation
- **Insights Generation:** AI-powered recommendations

**Infrastructure:**
- **Hosting:** Vercel (recommended)
- **Database:** Supabase Cloud
- **Version Control:** Git + GitHub

### Project Structure

```
connect-daet/
├── app/
│   ├── (subsystems)/
│   │   ├── analytics/       # Analytics dashboard
│   │   ├── shop/           # Shop subsystem (planned)
│   │   ├── tours/          # Tours subsystem (planned)
│   │   ├── museum/         # Museum subsystem (planned)
│   │   ├── experiences/    # Experiences subsystem (planned)
│   │   ├── rewards/        # Rewards subsystem (planned)
│   │   └── feedback/       # Feedback subsystem (planned)
│   ├── api/                # API routes
│   │   └── ai-tourism-report/ # AI insights endpoint
│   ├── auth/               # Authentication pages
│   ├── components/         # Shared components
│   │   └── ui/            # UI components
│   ├── lib/               # Utilities and helpers
│   │   ├── supabaseClient.ts
│   │   ├── analytics-fetcher.ts
│   │   ├── exportUtils.ts
│   │   ├── rewards.ts
│   │   └── adminAccess.ts
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── public/                # Static assets
├── supabase-schema.sql    # Database schema
├── supabase-seed-data.sql # Sample data
├── .env                   # Environment variables (not in git)
├── .env.example           # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x or later
- **npm** or **yarn** or **pnpm**
- **Supabase Account** (free tier works)
- **Google Gemini API Key** (optional, for AI features)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/jpudo05/jerold.git
cd jerold
```

2. **Install dependencies:**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables:**
```bash
# Copy the example file
copy .env.example .env

# Edit .env and add your credentials:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - GEMINI_API_KEY
```

4. **Set up the database:**
```bash
# Go to your Supabase project dashboard
# Navigate to SQL Editor
# Run the contents of supabase-schema.sql
# Optionally run supabase-seed-data.sql for sample data
```

5. **Configure admin access:**
```bash
# Create an admin user in Supabase Auth
# Copy their user ID (UUID)
# Update app/lib/adminAccess.ts with the UUID
# Update supabase-schema.sql RLS policies with the UUID
```

6. **Run the development server:**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

7. **Open your browser:**
```
http://localhost:3000
```

### First Time Setup

1. **Navigate to:** `http://localhost:3000/auth`
2. **Sign in** with your admin credentials
3. **Explore** the analytics dashboard
4. **Configure** subsystems as needed

---

## 🎯 Subsystems

### 1. Analytics Dashboard ✅
**Status:** Fully Implemented

**Features:**
- Real-time metrics visualization
- Date range selection (7 days to all-time)
- Multi-dimensional filtering
- AI-powered insights
- Anomaly detection
- Export capabilities
- Period comparisons
- Top/bottom performer lists

**Path:** `/analytics`

### 2. Shop Management 🚧
**Status:** Planned

**Features:**
- Product catalog
- Transaction tracking
- Inventory management
- Sales analytics

**Path:** `/shop` (coming soon)

### 3. Tours & Bookings 🚧
**Status:** Planned

**Features:**
- Tour listings
- Booking calendar
- Payment processing
- Booking confirmations

**Path:** `/tours` (coming soon)

### 4. Museum Experience 🚧
**Status:** Planned

**Features:**
- QR code generator
- Exhibit tracking
- Visitor flow analytics
- Interactive exhibits

**Path:** `/museum` (coming soon)

### 5. Experiences & Activities 🚧
**Status:** Planned

**Features:**
- Activity listings
- Check-in system
- Participant tracking
- Experience ratings

**Path:** `/experiences` (coming soon)

### 6. Rewards Program 🚧
**Status:** Planned

**Features:**
- Points system
- Badge achievements
- Reward redemption
- Gamification

**Path:** `/rewards` (coming soon)

### 7. Feedback System 🚧
**Status:** Planned

**Features:**
- Rating collection
- Sentiment analysis
- Feedback dashboard
- Response management

**Path:** `/feedback` (coming soon)

---

## 🗄️ Database Schema

### Tables

- **shop_transactions** - E-commerce transactions
- **tours_bookings** - Tour bookings and reservations
- **museum_scans** - QR code scan tracking
- **experiences_checkins** - Activity check-ins
- **reward_history** - Points and rewards
- **feedback** - Visitor feedback and ratings
- **profiles** - User profiles and demographics
- **facility_usage** - Resource and facility tracking

### Security

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Admin-only read access via RLS policies
- ✅ Hardened PostgreSQL functions
- ✅ UUID-based access control

See `supabase-schema.sql` for full schema.

---

## 🔌 API Routes

### Authentication
- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signout` - User sign out

### Analytics
- `POST /api/ai-tourism-report` - Generate AI insights

### Data (Planned)
- `GET /api/analytics/metrics` - Fetch analytics data
- `GET /api/shop/transactions` - Shop data
- `GET /api/tours/bookings` - Tours data
- `GET /api/museum/scans` - Museum data
- `GET /api/feedback/ratings` - Feedback data

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub** (already done)
2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Add environment variables
   - Deploy

3. **Set environment variables in Vercel:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   GEMINI_API_KEY=your_gemini_key
   ```

4. **Access your live site:**
   ```
   https://your-project.vercel.app
   ```

### Alternative Deployment Options

- **Netlify** - Similar to Vercel
- **AWS Amplify** - AWS-native hosting
- **Self-hosted** - Use `npm run build` + `npm run start`

---

## 🔐 Security

### ⚠️ IMPORTANT: API Keys

**If you cloned this repository:**
1. The exposed API keys in `.env` are INVALID placeholders
2. Generate your own keys:
   - **Supabase:** Project Settings > API > Generate new key
   - **Gemini:** [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Never commit `.env` to git (it's in `.gitignore`)

### Best Practices

- ✅ All sensitive credentials in environment variables
- ✅ Row Level Security (RLS) on all database tables
- ✅ Admin-only access enforcement
- ✅ Input validation on all forms
- ✅ HTTPS required in production
- ✅ Regular security audits

### Data Privacy

- User data encrypted at rest (Supabase)
- Secure authentication flow (Supabase Auth)
- GDPR-compliant data handling
- No third-party tracking

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with clear messages:**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. **Push to your fork:**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines

- Write TypeScript (avoid `any`)
- Follow React best practices
- Add JSDoc comments
- Test on mobile devices
- Check accessibility (WCAG 2.1 AA)
- Run `npm run lint` before committing

---

## 📚 Documentation

- **User Guide:** See `QUICK-START-ANALYTICS.md`
- **Features Guide:** See `ANALYTICS-FEATURES.md`
- **Setup Guide:** See `SETUP-REAL-DATA.md`
- **API Docs:** Coming soon
- **Component Library:** Coming soon

---

## 📄 License

Copyright © 2026 CONNECT-DAET Project

This software is developed for Daet Municipality, Camarines Norte, Philippines.

---

## 🙏 Acknowledgments

- **Daet Municipality** - Project sponsor
- **11 Development Teams** - Subsystem builders
- **Supabase** - Backend infrastructure
- **Vercel** - Deployment platform
- **Google** - Gemini AI API

---

## 📞 Support

For questions or issues:
- **GitHub Issues:** [Report a bug](https://github.com/jpudo05/jerold/issues)
- **Email:** support@connect-daet.gov.ph
- **Documentation:** Check the `/docs` folder

---

## 🗺️ Roadmap

### Phase 1: Foundation ✅
- [x] Analytics dashboard
- [x] Authentication system
- [x] Database schema
- [x] AI insights
- [x] Export functionality

### Phase 2: Core Subsystems 🚧
- [ ] Shop management system
- [ ] Tours booking platform
- [ ] Museum QR system
- [ ] Real data integration
- [ ] Mobile responsive design

### Phase 3: Advanced Features 📅
- [ ] Real-time updates (WebSocket)
- [ ] Role-based access control
- [ ] Multi-language support
- [ ] Email notifications
- [ ] SMS alerts

### Phase 4: Scale & Optimize 🔮
- [ ] Performance optimization
- [ ] Advanced ML models
- [ ] Mobile native apps
- [ ] API for third-party integrations
- [ ] Custom dashboard builder

---

**Built with ❤️ for Daet Municipality Tourism**

*Last Updated: November 8, 2026*
