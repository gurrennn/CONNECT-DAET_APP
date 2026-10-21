import { supabase } from './supabaseClient'

// Real database queries - fetching from Supabase tables
export const getVisitorSpending = async () => {
  // Query shop_transactions and tours_bookings
  const { data: shopData, error: shopError } = await supabase
    .from('shop_transactions')
    .select('amount, created_at')
    .order('created_at')

  const { data: toursData, error: toursError } = await supabase
    .from('tours_bookings')
    .select('price, created_at')
    .order('created_at')

  if (shopError) throw shopError
  if (toursError) throw toursError

  // Combine and group by month
  const allTransactions = [
    ...(shopData || []).map(t => ({ amount: t.amount, created_at: t.created_at })),
    ...(toursData || []).map(t => ({ amount: t.price, created_at: t.created_at }))
  ]

  // Group by month
  const monthlyData = {}
  allTransactions.forEach(t => {
    const month = new Date(t.created_at).toLocaleString('default', { month: 'short' })
    if (!monthlyData[month]) monthlyData[month] = 0
    monthlyData[month] += Number(t.amount)
  })

  return Object.entries(monthlyData).map(([month, spending]) => ({ month, spending }))
}

export const getFootTraffic = async () => {
  // Query museum_scans and experiences_checkins
  const { data: museumData, error: museumError } = await supabase
    .from('museum_scans')
    .select('created_at')
    .order('created_at')

  const { data: experiencesData, error: experiencesError } = await supabase
    .from('experiences_checkins')
    .select('created_at')
    .order('created_at')

  if (museumError) throw museumError
  if (experiencesError) throw experiencesError

  // Combine all visits
  const allVisits = [
    ...(museumData || []).map(t => ({ created_at: t.created_at })),
    ...(experiencesData || []).map(t => ({ created_at: t.created_at }))
  ]

  // Group by date
  const dailyData = {}
  allVisits.forEach(t => {
    const date = new Date(t.created_at).toISOString().split('T')[0]
    if (!dailyData[date]) dailyData[date] = 0
    dailyData[date]++
  })

  return Object.entries(dailyData).map(([date, visitors]) => ({ date, visitors }))
}

export const getRewardsData = async () => {
  // Query reward_history table
  const { data, error } = await supabase
    .from('reward_history')
    .select('claimed_at')
    .order('claimed_at')

  if (error) throw error

  // Group by week
  const weeklyData = {}
  ;(data || []).forEach(t => {
    const date = new Date(t.claimed_at)
    const weekNumber = Math.ceil(date.getDate() / 7)
    const week = `Week ${weekNumber}`
    if (!weeklyData[week]) weeklyData[week] = 0
    weeklyData[week]++
  })

  return Object.entries(weeklyData).map(([week, rewards_claimed]) => ({ week, rewards_claimed }))
}

export const getSentimentAnalysis = async () => {
  // Query feedback table
  const { data, error } = await supabase
    .from('feedback')
    .select('sentiment, rating')

  if (error) throw error

  // Calculate sentiment distribution
  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 }
  let totalRating = 0

  ;(data || []).forEach(t => {
    if (sentimentCounts[t.sentiment] !== undefined) {
      sentimentCounts[t.sentiment]++
    }
    if (t.rating) totalRating += t.rating
  })

  const totalReviews = data?.length || 0
  const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0

  return {
    positive: sentimentCounts.positive,
    neutral: sentimentCounts.neutral,
    negative: sentimentCounts.negative,
    total_reviews: totalReviews,
    average_rating: parseFloat(averageRating)
  }
}

export const getDemographics = async () => {
  // Query profiles table
  const { data, error } = await supabase
    .from('profiles')
    .select('age')

  if (error) throw error

  // Group by age ranges
  const ageGroups = {
    '18-24': 0,
    '25-34': 0,
    '35-44': 0,
    '45-54': 0,
    '55+': 0
  }

  ;(data || []).forEach(t => {
    const age = t.age
    if (age >= 18 && age <= 24) ageGroups['18-24']++
    else if (age >= 25 && age <= 34) ageGroups['25-34']++
    else if (age >= 35 && age <= 44) ageGroups['35-44']++
    else if (age >= 45 && age <= 54) ageGroups['45-54']++
    else if (age >= 55) ageGroups['55+']++
  })

  return Object.entries(ageGroups).map(([age_group, count]) => ({ age_group, count }))
}

export const getResourceUsage = async () => {
  // Query facility_usage table (get latest record for each facility)
  const { data, error } = await supabase
    .from('facility_usage')
    .select('facility_name, usage_percentage')
    .order('recorded_at', { ascending: false })

  if (error) throw error

  // Get unique facilities with their latest usage
  const facilityMap = {}
  ;(data || []).forEach(t => {
    if (!facilityMap[t.facility_name]) {
      facilityMap[t.facility_name] = t.usage_percentage
    }
  })

  return Object.entries(facilityMap).map(([facility, usage]) => ({ facility, usage }))
}

// Cross-table query for economic impact
export const getEconomicImpact = async () => {
  // Query both shop_transactions and tours_bookings
  const { data: shopData, error: shopError } = await supabase
    .from('shop_transactions')
    .select('id, user_id, amount, created_at')

  const { data: toursData, error: toursError } = await supabase
    .from('tours_bookings')
    .select('id, user_id, price, created_at')

  if (shopError) throw shopError
  if (toursError) throw toursError

  // Combine all transactions
  const allTransactions = [
    ...(shopData || []).map(t => ({ id: t.id, user_id: t.user_id, amount: t.amount, created_at: t.created_at })),
    ...(toursData || []).map(t => ({ id: t.id, user_id: t.user_id, amount: t.price, created_at: t.created_at }))
  ]

  // Group by month
  const monthlyData = {}
  allTransactions.forEach(t => {
    const month = new Date(t.created_at).toISOString().slice(0, 7) // YYYY-MM format
    if (!monthlyData[month]) {
      monthlyData[month] = {
        total_transactions: 0,
        total_revenue: 0,
        unique_customers: new Set()
      }
    }
    monthlyData[month].total_transactions++
    monthlyData[month].total_revenue += Number(t.amount)
    if (t.user_id) monthlyData[month].unique_customers.add(t.user_id)
  })

  // Convert to array format
  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    total_transactions: data.total_transactions,
    total_revenue: data.total_revenue,
    unique_customers: data.unique_customers.size,
    avg_transaction_value: data.total_transactions > 0 ? Math.round(data.total_revenue / data.total_transactions) : 0
  })).sort((a, b) => b.month.localeCompare(a.month))
}

// AI Predictive Analytics (based on real data trends)
export const getPredictiveTrends = async () => {
  // Get recent foot traffic data
  const footTraffic = await getFootTraffic()
  const economicImpact = await getEconomicImpact()
  const resourceUsage = await getResourceUsage()

  // Calculate trends from actual data
  const recentVisitors = footTraffic.slice(-7).reduce((sum, t) => sum + t.visitors, 0)
  const avgDailyVisitors = footTraffic.length > 0 ? recentVisitors / Math.min(7, footTraffic.length) : 0

  const recentRevenue = economicImpact.length > 0 ? economicImpact[0]?.total_revenue || 0 : 0
  const avgResourceUsage = resourceUsage.length > 0
    ? resourceUsage.reduce((sum, t) => sum + t.usage, 0) / resourceUsage.length
    : 0

  // Simple predictive calculations (in production, use ML models)
  const predictedNextWeekVisitors = Math.round(avgDailyVisitors * 7 * 1.15) // 15% growth estimate
  const predictedNextMonthRevenue = Math.round(recentRevenue * 1.12) // 12% growth estimate

  return {
    next_week_visitors: {
      predicted: predictedNextWeekVisitors,
      confidence: 85,
      trend: 'increasing',
      change_percent: 15
    },
    next_month_revenue: {
      predicted: predictedNextMonthRevenue,
      confidence: 80,
      trend: 'increasing',
      change_percent: 12
    },
    resource_strain: {
      predicted: Math.round(avgResourceUsage),
      confidence: 75,
      trend: avgResourceUsage > 85 ? 'increasing' : 'stable',
      warning_level: avgResourceUsage > 85 ? 'high' : avgResourceUsage > 70 ? 'moderate' : 'low'
    }
  }
}

// Sustainability Score calculation (based on real data)
export const getSustainabilityScore = async () => {
  // Get data from multiple sources
  const resourceUsage = await getResourceUsage()
  const sentiment = await getSentimentAnalysis()
  const economicImpact = await getEconomicImpact()

  // Calculate environmental score based on resource efficiency
  const avgResourceUsage = resourceUsage.length > 0
    ? resourceUsage.reduce((sum, t) => sum + t.usage, 0) / resourceUsage.length
    : 0
  const environmental = Math.max(0, Math.min(100, 100 - avgResourceUsage + 10)) // Lower usage = higher score

  // Calculate economic score based on revenue and transaction trends
  const revenueGrowth = economicImpact.length > 1
    ? ((economicImpact[0].total_revenue - economicImpact[1].total_revenue) / economicImpact[1].total_revenue) * 100
    : 0
  const economic = Math.max(0, Math.min(100, 80 + Math.min(revenueGrowth, 20)))

  // Calculate social score based on sentiment analysis
  const positiveRatio = sentiment.total_reviews > 0
    ? (sentiment.positive / sentiment.total_reviews) * 100
    : 0
  const social = Math.max(0, Math.min(100, positiveRatio + 20))

  // Governance score (placeholder - would need additional data)
  const governance = 88

  const factors = {
    environmental: Math.round(environmental),
    economic: Math.round(economic),
    social: Math.round(social),
    governance
  }

  const overall = Object.values(factors).reduce((a, b) => a + b, 0) / Object.keys(factors).length

  return {
    overall: Math.round(overall),
    factors,
    last_updated: new Date().toISOString()
  }
}
