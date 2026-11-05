# Team 10: Analytics Subsystem

## Overview
The Analytics subsystem serves as the "eyes" of CONNECT-Daet.ph, providing comprehensive data visualization and reporting for municipal decision-makers.

## Key Features

### 🔐 Admin Protection
- Only the configured administrator account can access `/analytics`
- Authentication is checked with Supabase Auth
- Graceful fallback for unauthorized users

### 📊 Data Visualization
- **Visitor Spending Trends**: Line charts showing monthly revenue patterns
- **Foot Traffic Analysis**: Daily visitor counts from museum scans and experience check-ins
- **Rewards Tracking**: Weekly rewards claimed from Team 11's system
- **Sentiment Analysis**: Visitor feedback sentiment breakdown
- **Demographics**: Age group distribution of visitors
- **Resource Usage**: Facility utilization percentages

### 🤖 AI-Powered Features
- **Predictive Analytics**: Next week visitors, next month revenue forecasts
- **Sustainability Score**: Overall tourism sustainability rating (0-100)
- **Resource Strain Warnings**: Predictive alerts for capacity management

### 📈 Cross-Table Queries
The system integrates data from multiple teams:
- **Team 7 (Shop)**: Transaction data for revenue analysis
- **Team 8 (Tours)**: Booking data for visitor patterns
- **Team 3 (Museum)**: QR scan data for foot traffic
- **Team 4 (Experiences)**: Check-in data for activity tracking
- **Team 9 (Feedback)**: Sentiment analysis and ratings
- **Team 11 (Rewards)**: Gamification effectiveness metrics

## Technical Architecture

### Directory Structure
```
src/app/(subsystems)/analytics/
├── page.tsx                    # Main dashboard
├── components/
│   ├── Charts.tsx             # Recharts chart components
│   └── PredictiveAnalytics.tsx # AI prediction components
└── README.md                  # This file

src/lib/
└── analytics-fetcher.ts        # Data fetching functions

src/components/analytics/
└── AdminOnly.tsx             # Authentication wrapper
```

### Data Flow
1. **Mock Data**: Currently using mock data for development
2. **Real Integration**: TODO sections marked for actual Supabase queries
3. **Cross-Team Communication**: Functions ready to query other teams' tables

### Key Components

#### AdminOnly Wrapper
```typescript
<AdminOnly>
  <YourAnalyticsContent />
</AdminOnly>
```

#### Chart Components
- `VisitorSpendingChart`: Monthly revenue trends
- `FootTrafficChart`: Daily visitor counts
- `RewardsChart`: Weekly rewards claimed
- `SentimentChart`: Feedback sentiment pie chart
- `DemographicsChart`: Age group distribution
- `ResourceUsageChart`: Facility utilization

#### Predictive Analytics
- `PredictiveAnalytics`: AI forecasts with confidence levels
- `SustainabilityScore`: Overall sustainability rating

## Implementation Notes

### Week 1-2 Tasks ✅
- [x] Admin authentication middleware
- [x] Mock data structure
- [x] Chart components with Recharts
- [x] Predictive analytics UI
- [x] Sustainability score calculation
- [x] Cross-table query templates

### Future Development
- [ ] Replace mock data with real Supabase queries
- [ ] Implement actual ML model for predictions
- [ ] Add real-time data updates
- [ ] Create exportable report generation
- [ ] Add custom date range filters

### Database Schema Requirements

#### Tables to Query (from other teams)
```sql
-- Team 7: Shop Transactions
shop_transactions (id, user_id, amount, created_at)

-- Team 8: Tour Bookings  
tours_bookings (id, user_id, price, created_at)

-- Team 3: Museum Scans
museum_scans (id, user_id, scan_time, location)

-- Team 4: Experience Check-ins
experience_checkins (id, user_id, checkin_time, experience_id)

-- Team 9: Feedback
feedback (id, user_id, rating, sentiment, created_at)

-- Team 11: Rewards
reward_history (id, user_id, points_earned, subsystem_source, created_at)
```

#### Analytics-specific Tables
```sql
-- Facility Usage Tracking
facility_usage (id, facility_name, usage_percentage, recorded_at)

-- Sustainability Metrics
sustainability_metrics (id, factor_type, score, recorded_at)
```

## Integration Guide for Other Teams

### What Teams Need to Provide
1. **Table Names**: Exact names of their main data tables
2. **Column Names**: Key columns for analytics (amount, price, user_id, timestamps)
3. **Data Format**: Consistent date/time formats
4. **Access Permissions**: Read access for analytics queries

### Example Communication Template
```
Hi Team [X], 

For the Analytics subsystem, could you please provide:
- Main table name for [your data type]
- Column names for: user_id, amount/price, created_at
- Any special data formats we should know about?

This will help us build accurate cross-table queries for the municipal dashboard.
```

## Development Commands

### Install Dependencies
```bash
npm install recharts @tremor/react --legacy-peer-deps
```

### Development Server
```bash
npm run dev
```

### Access Analytics Dashboard
Visit: `http://localhost:3000/analytics` (requires admin role)

## Testing with Mock Data

The system includes comprehensive mock data for:
- 6 months of visitor spending data
- 7 days of foot traffic patterns
- 4 weeks of rewards tracking
- Sentiment analysis breakdown
- Demographic distributions
- Resource utilization metrics
- AI predictions with confidence levels

This allows immediate development and testing without waiting for other teams' implementation.

## Performance Considerations

- **Lazy Loading**: Charts only render when data is available
- **Error Boundaries**: Graceful handling of missing data
- **Responsive Design**: Mobile-first chart layouts
- **Caching**: Ready for Supabase query result caching
- **Optimized Queries**: Efficient JOIN statements planned

## Security

- **Role-Based Access**: Admin-only authentication
- **Data Sanitization**: Safe handling of user-generated data
- **SQL Injection Prevention**: Parameterized queries in Supabase
- **XSS Protection**: React's built-in protections utilized

This Analytics subsystem provides the foundation for data-driven tourism management in Daet, enabling municipal leaders to make informed decisions based on comprehensive real-time data.
