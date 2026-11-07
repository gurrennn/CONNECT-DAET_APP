# Setup Guide for Real Data Integration

This guide will help you switch from mock data to real Supabase data for your CONNECT-DAET analytics system.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose a name (e.g., "connect-daet-analytics")
5. Set a strong password
6. Choose a region closest to your users
7. Click "Create new project"
8. Wait for the project to be ready (2-3 minutes)

## Step 2: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy these values:
   - **Project URL** (looks like: https://xyz.supabase.co)
   - **anon/public key** (looks like: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)

## Step 3: Set Up Environment Variables

1. Create a file named `.env.local` in your project root (same folder as package.json)
2. Add the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace the placeholder values with your actual Supabase credentials.

## Step 4: Create Database Tables

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" (icon that looks like a terminal)
3. Click "New Query"
4. Copy the contents of `supabase-schema.sql` file
5. Paste it into the SQL Editor
6. Click "Run" to execute the schema creation
7. Wait for all tables to be created successfully

## Step 5: Add Sample Data (Optional)

If you want to test with sample data:

1. In the SQL Editor, create a new query
2. Copy the contents of `supabase-seed-data.sql` file
3. Paste it into the SQL Editor
4. Click "Run" to insert sample data
5. This will populate your tables with realistic test data

## Step 6: Verify Your Setup

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Navigate to your analytics page
3. The charts should now display real data from your Supabase database

## Step 7: Set Up Login and Admin Access

1. In Supabase, enable the Email provider under Authentication settings.
2. Set the site's URL and allowed redirect URLs for your local and deployed app.
3. Disable public sign-ups in Supabase Authentication settings. This app is configured for the existing administrator account only.
4. Sign in at `/auth` with the existing admin account. The app allows analytics access only to user ID `c89843cd-b551-4925-b777-6c5c5cd3cb65`.
5. Run the updated `supabase-schema.sql` in the SQL Editor to replace public analytics read policies with a policy restricted to that administrator account.

The app does not create accounts. Manage the administrator password through Supabase Auth.

### Configure Gemini AI reports

1. Revoke and replace any Gemini API key that has been shared or exposed.
2. Put the replacement key in the project-root `.env.local` file as `GEMINI_API_KEY=your_new_key`. Do not add a `NEXT_PUBLIC_` prefix or commit the key.
3. Restart the Next.js development server after changing environment variables. For deployment, add `GEMINI_API_KEY` in the hosting provider's server environment settings.
4. Run the updated `supabase-schema.sql`; it adds the administrator-only `get_tourism_ai_metrics` function used to retrieve aggregate records for the last 30 days.

The Gemini brief uses the `gemini-3.5-flash-lite` model and reports recorded revenue, visitation events, and facility measurements. Google lists this model with free-tier input/output pricing, subject to project quota and access limits. It does not claim to measure jobs; the database currently has no verified employment data. The separate “Example Forecasts” dashboard section is sample data, not Gemini output.

Generating a brief sends these aggregate metrics (not visitor names, emails, or row-level records) to Google's Gemini API for processing. Confirm this data sharing is appropriate for your municipality before using production records.

## Step 8: Check Data in Supabase Dashboard

To verify your data is being stored correctly:

1. Go to "Table Editor" in Supabase
2. Click on each table (shop_transactions, tours_bookings, etc.)
3. You should see the data you inserted
4. You can add, edit, or delete data directly here

## Troubleshooting

### Error: "Supabase client not initialized"
- Make sure your `.env.local` file exists
- Verify the environment variables are set correctly
- Restart your development server after adding the file

### Error: "Table does not exist"
- Run the `supabase-schema.sql` file again
- Check the SQL Editor for any error messages
- Make sure you're connected to the correct project

### Charts show no data
- Check if your tables have data using the Table Editor
- Run the `supabase-seed-data.sql` to add sample data
- Check the browser console for any error messages

### Permission denied errors
- Make sure Row Level Security (RLS) policies are set correctly
- The schema includes public read policies for analytics
- You may need to adjust policies based on your security needs

## Next Steps

Once you have real data flowing:

1. **Connect to other team systems**: Coordinate with Teams 3, 4, 7, 8, 9, 11 to integrate their actual data sources
2. **Set up automated data collection**: Create API endpoints or webhooks to capture real user interactions
3. **Implement data validation**: Add checks to ensure data quality
4. **Set up backups**: Configure regular database backups in Supabase
5. **Monitor performance**: Use Supabase's dashboard to monitor query performance

## Data Flow Overview

```
User Actions → Team Subsystems → Supabase Tables → Analytics Fetcher → Charts
```

- **Team 7**: Shop transactions → `shop_transactions` table
- **Team 8**: Tour bookings → `tours_bookings` table  
- **Team 3**: Museum scans → `museum_scans` table
- **Team 4**: Experience check-ins → `experiences_checkins` table
- **Team 9**: Feedback → `feedback` table
- **Team 11**: Rewards → `reward_history` table

## Support

If you encounter issues:

1. Check the Supabase logs: Dashboard → Logs
2. Review the browser console for JavaScript errors
3. Verify your SQL queries executed successfully
4. Make sure environment variables are loaded correctly

## Security Notes

- The anon key is safe to use in client-side code
- Never expose your service_role key in client code
- Consider implementing authentication for write operations
- Review RLS policies before going to production
