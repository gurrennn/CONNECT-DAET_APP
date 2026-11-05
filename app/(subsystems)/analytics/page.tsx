'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import AdminOnly from "../../components/AdminOnly"
import { supabase } from '../../lib/supabaseClient'
import {
  VisitorSpendingChart,
  FootTrafficChart,
  RewardsChart,
  SentimentChart,
  DemographicsChart,
  ResourceUsageChart
} from './components/Charts'
import { PredictiveAnalytics, SustainabilityScore } from './components/PredictiveAnalytics'
import {
  getVisitorSpending,
  getFootTraffic,
  getRewardsData,
  getSentimentAnalysis,
  getDemographics,
  getResourceUsage,
  getPredictiveTrends,
  getSustainabilityScore,
  getEconomicImpact,
  getSocialImpact,
  getEnvironmentalImpact
} from '../../lib/analytics-fetcher'

function AnalyticsContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [selectedChartInfo, setSelectedChartInfo] = useState<any>(null)
  const [generatingReport, setGeneratingReport] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [signingOut, setSigningOut] = useState(false)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [data, setData] = useState<{
    visitorSpending: Array<{ month: string; spending: number }>
    footTraffic: Array<{ date: string; visitors: number }>
    rewards: Array<{ week: string; rewards_claimed: number }>
    sentiment: { positive: number; neutral: number; negative: number }
    demographics: Array<{ age_group: string; count: number }>
    resourceUsage: Array<{ facility: string; usage: number }>
    predictive: {
      next_week_visitors: {
        predicted: number
        confidence: number
        trend: 'increasing' | 'decreasing' | 'stable'
        change_percent: number
      }
      next_month_revenue: {
        predicted: number
        confidence: number
        trend: 'increasing' | 'decreasing' | 'stable'
        change_percent: number
      }
      resource_strain: {
        predicted: number
        confidence: number
        trend: 'increasing' | 'decreasing' | 'stable'
        warning_level: 'low' | 'moderate' | 'high'
      }
    } | null
    sustainability: {
      overall: number
      factors: {
        environmental: number
        economic: number
        social: number
        governance: number
      }
      last_updated: string
    } | null
    economicImpact: {
      total_revenue: number
      total_transactions: number
      avg_transaction_value: number
      estimated_jobs: number
      revenue_by_category: {
        shop_sales: number
        tour_bookings: number
      }
      last_updated: string
    } | null
    socialImpact: {
      community_satisfaction: number
      local_engagement_rate: number
      cultural_preservation_score: number
      social_inclusion_index: number
      total_feedback_collected: number
      last_updated: string
    } | null
    environmentalImpact: {
      carbon_footprint: number
      energy_efficiency: number
      water_conservation: number
      waste_management_score: number
      sustainability_score: number
      last_updated: string
    } | null
  }>({
    visitorSpending: [],
    footTraffic: [],
    rewards: [],
    sentiment: { positive: 0, neutral: 0, negative: 0 },
    demographics: [],
    resourceUsage: [],
    predictive: null,
    sustainability: null,
    economicImpact: null,
    socialImpact: null,
    environmentalImpact: null
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          visitorSpending,
          footTraffic,
          rewards,
          sentiment,
          demographics,
          resourceUsage,
          predictive,
          sustainability,
          economicImpact,
          socialImpact,
          environmentalImpact
        ] = await Promise.all([
          getVisitorSpending(),
          getFootTraffic(),
          getRewardsData(),
          getSentimentAnalysis(),
          getDemographics(),
          getResourceUsage(),
          getPredictiveTrends(),
          getSustainabilityScore(),
          getEconomicImpact(),
          getSocialImpact(),
          getEnvironmentalImpact()
        ])

        setData({
          visitorSpending,
          footTraffic,
          rewards,
          sentiment,
          demographics,
          resourceUsage,
          predictive,
          sustainability,
          economicImpact,
          socialImpact,
          environmentalImpact
        })
      } catch (error) {
        console.error('Error fetching analytics data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const chartInfo = {
    'visitor-spending': {
      title: '💰 Visitor Spending Trends',
      description: 'This line chart displays monthly visitor spending patterns, showing how much money visitors are spending across all CONNECT-DAET services.',
      howItWorks: '• Aggregates transaction data from shop purchases, tour bookings, and experience fees\n• Tracks spending trends over time to identify seasonal patterns\n• Helps forecast revenue and plan marketing campaigns\n• Monitors the effectiveness of pricing strategies',
      metrics: '• Total monthly spending in Philippine Pesos\n• Spending growth rate month-over-month\n• Average spending per visitor\n• Peak spending periods'
    },
    'foot-traffic': {
      title: '👥 Daily Foot Traffic',
      description: 'This bar chart shows the number of visitors to CONNECT-DAET facilities on a daily basis, helping identify peak visitation days.',
      howItWorks: '• Counts visitors from museum QR code scans and experience check-ins\n• Displays daily visitor counts to identify patterns\n• Helps with staffing and resource planning\n• Used to optimize facility operations',
      metrics: '• Daily visitor count\n• Peak traffic days\n• Weekday vs weekend comparison\n• Visitor flow patterns'
    },
    'rewards': {
      title: '🎁 Rewards Claimed per Week',
      description: 'This bar chart tracks how many rewards are being claimed by users each week, showing engagement with the rewards program.',
      howItWorks: '• Monitors reward redemption from the gamification system\n• Tracks weekly reward claim patterns\n• Helps assess the effectiveness of reward incentives\n• Used to optimize reward offerings',
      metrics: '• Weekly rewards claimed\n• Reward redemption rate\n• Popular reward types\n• User engagement with rewards program'
    },
    'sentiment': {
      title: '😊 Visitor Sentiment Analysis',
      description: 'This pie chart shows the distribution of visitor feedback sentiment - positive, neutral, and negative responses across all services.',
      howItWorks: '• Analyzes feedback ratings and reviews from all subsystems\n• Categorizes responses into positive, neutral, and negative\n• Helps identify areas needing improvement\n• Tracks overall visitor satisfaction trends',
      metrics: '• Positive feedback percentage\n• Neutral feedback percentage\n• Negative feedback percentage\n• Overall sentiment score'
    },
    'demographics': {
      title: '👤 Visitor Demographics',
      description: 'This horizontal bar chart displays the age distribution of CONNECT-DAET visitors, helping understand the visitor profile.',
      howItWorks: '• Analyzes user profile data and booking information\n• Groups visitors by age ranges\n• Helps tailor services to target demographics\n• Used for marketing and service planning',
      metrics: '• Visitor count by age group\n• Age distribution percentages\n• Target demographic identification\n• Demographic trends over time'
    },
    'resource-usage': {
      title: '⚡ Resource Utilization',
      description: 'This bar chart shows the percentage of resource usage across different CONNECT-DAET facilities, helping identify capacity and efficiency.',
      howItWorks: '• Monitors facility utilization rates in real-time\n• Tracks energy, water, and space usage\n• Helps identify over-utilized or under-utilized facilities\n• Used for resource optimization and planning',
      metrics: '• Facility usage percentage\n• Capacity utilization rates\n• Peak usage times\n• Resource efficiency scores'
    }
  }

  const handleChartClick = (chartKey: string) => {
    setSelectedChartInfo(chartInfo[chartKey as keyof typeof chartInfo])
  }

  const generateReport = async (reportType: string) => {
    setGeneratingReport(reportType)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      let reportContent = ''
      
      if (reportType === 'tourism-impact' && data.economicImpact) {
        reportContent = `TOURISM IMPACT ASSESSMENT AND DATA ANALYTICS SYSTEM
Generated: ${new Date().toLocaleDateString()}

=====================================
Tourism Impact Assessment Report
=====================================

1. EXECUTIVE SUMMARY
------------------
Total Revenue: ₱${(data.economicImpact.total_revenue / 1000000).toFixed(1)}M
Total Transactions: ${data.economicImpact.total_transactions.toLocaleString()}
Estimated Jobs Created: ${data.economicImpact.estimated_jobs.toLocaleString()}
Average Transaction Value: ₱${data.economicImpact.avg_transaction_value.toLocaleString()}

2. REVENUE BREAKDOWN
--------------------
Shop Sales: ₱${(data.economicImpact.revenue_by_category.shop_sales / 1000000).toFixed(2)}M
Tour Bookings: ₱${(data.economicImpact.revenue_by_category.tour_bookings / 1000000).toFixed(2)}M

3. SOCIAL IMPACT
----------------
Community Satisfaction: ${data.socialImpact?.community_satisfaction || 0}%
Local Engagement Rate: ${data.socialImpact?.local_engagement_rate || 0}%
Cultural Preservation Score: ${data.socialImpact?.cultural_preservation_score || 0}/100

4. ENVIRONMENTAL IMPACT
----------------------
Carbon Footprint: ${data.environmentalImpact?.carbon_footprint || 0} kg CO₂
Energy Efficiency: ${data.environmentalImpact?.energy_efficiency || 0}%
Sustainability Score: ${data.environmentalImpact?.sustainability_score || 0}/100

=====================================
End of Tourism Impact Assessment
=====================================
        `.trim()
      } else if (reportType === 'full') {
        const totalRevenue = data.economicImpact?.total_revenue || 0
        const totalTransactions = data.economicImpact?.total_transactions || 0
        const estimatedJobs = data.economicImpact?.estimated_jobs || 0
        
        reportContent = `CONNECT-DAET ANALYTICS REPORT
Generated: ${new Date().toLocaleDateString()}

=====================================
Tourism Impact Assessment & Data Analytics
=====================================

1. ECONOMIC IMPACT
------------------
Total Revenue: ₱${(totalRevenue / 1000000).toFixed(1)}M
Total Transactions: ${totalTransactions.toLocaleString()}
Estimated Jobs Created: ${estimatedJobs.toLocaleString()}

2. SOCIAL IMPACT
----------------
Community Satisfaction: ${data.socialImpact?.community_satisfaction || 0}%
Local Engagement Rate: ${data.socialImpact?.local_engagement_rate || 0}%
Cultural Preservation Score: ${data.socialImpact?.cultural_preservation_score || 0}/100
Total Feedback: ${data.socialImpact?.total_feedback_collected?.toLocaleString() || 0}

3. ENVIRONMENTAL IMPACT
----------------------
Carbon Footprint: ${data.environmentalImpact?.carbon_footprint || 0} kg CO₂
Energy Efficiency: ${data.environmentalImpact?.energy_efficiency || 0}%
Water Conservation: ${data.environmentalImpact?.water_conservation || 0}%
Sustainability Score: ${data.environmentalImpact?.sustainability_score || 0}/100

4. VISITOR ANALYTICS
--------------------
Total Visitors: ${data.footTraffic?.reduce((sum, d) => sum + d.visitors, 0).toLocaleString() || 0}
Positive Feedback: ${data.sentiment?.positive || 0}
Negative Feedback: ${data.sentiment?.negative || 0}

=====================================
End of Report
=====================================
        `.trim()
      } else {
        const totalRevenue = data.economicImpact?.total_revenue || 0
        const estimatedJobs = data.economicImpact?.estimated_jobs || 0
        
        reportContent = `CONNECT-DAET QUICK SUMMARY
Generated: ${new Date().toLocaleDateString()}

Total Revenue: ₱${(totalRevenue / 1000000).toFixed(1)}M
Jobs Created: ${estimatedJobs.toLocaleString()}
Sustainability Score: ${data.environmentalImpact?.sustainability_score || 0}/100
Community Satisfaction: ${data.socialImpact?.community_satisfaction || 0}%

=====================================
End of Summary
=====================================
        `.trim()
      }
      
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `connect-daet-${reportType}-report-${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(a)
      a.click()
      
      setTimeout(() => {
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }, 100)
      
      alert('Report generated successfully! Check your downloads.')
      
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setGeneratingReport(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tourism Impact Assessment & Data Analytics
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AI-powered analytics system for monitoring visitor spending, job creation, and resource usage to drive sustainable development decisions
          </p>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold mb-2">₱45.2M</div>
              <div className="text-blue-100">Monthly Revenue</div>
              <div className="text-sm text-blue-200 mt-2">↑ 12% from last month</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold mb-2">8,234</div>
              <div className="text-green-100">Jobs Created</div>
              <div className="text-sm text-green-200 mt-2">↑ 5% from last quarter</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold mb-2">156K</div>
              <div className="text-purple-100">Monthly Visitors</div>
              <div className="text-sm text-purple-200 mt-2">↑ 8% from last month</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold mb-2">92%</div>
              <div className="text-orange-100">Resource Efficiency</div>
              <div className="text-sm text-orange-200 mt-2">↑ 3% improvement</div>
            </CardContent>
          </Card>
        </div>

        {/* Predictive Analytics */}
        {data.predictive && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">AI-Powered Predictions</h2>
            <PredictiveAnalytics data={data.predictive} />
          </div>
        )}

        {/* Sustainability Score */}
        {data.sustainability && (
          <div className="mb-8">
            <SustainabilityScore data={data.sustainability} />
          </div>
        )}

        {/* Economic Impact Dashboard */}
        {data.economicImpact && (
          <Card className="mb-8 bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-800">💰 Economic Impact Assessment</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    ₱{(data.economicImpact.total_revenue / 1000000).toFixed(1)}M
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">Total Transactions</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {data.economicImpact.total_transactions.toLocaleString()}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">Avg Transaction</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    ₱{data.economicImpact.avg_transaction_value.toLocaleString()}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">Estimated Jobs Created</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {data.economicImpact.estimated_jobs}
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 mb-2">Revenue by Category</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Shop Sales</span>
                      <span className="font-semibold text-emerald-600">
                        ₱{(data.economicImpact.revenue_by_category.shop_sales / 1000000).toFixed(2)}M
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Tour Bookings</span>
                      <span className="font-semibold text-emerald-600">
                        ₱{(data.economicImpact.revenue_by_category.tour_bookings / 1000000).toFixed(2)}M
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 mb-2">Last Updated</div>
                  <div className="text-gray-700">
                    {new Date(data.economicImpact.last_updated).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Social Impact Dashboard */}
        {data.socialImpact && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-800">👥 Social Impact Assessment</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">Community Satisfaction</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {data.socialImpact.community_satisfaction}%
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">Local Engagement Rate</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {data.socialImpact.local_engagement_rate}%
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">Cultural Preservation</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {data.socialImpact.cultural_preservation_score}/100
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">Social Inclusion Index</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {data.socialImpact.social_inclusion_index}/100
                  </div>
                </div>
              </div>
              <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600 mb-2">Total Feedback Collected</div>
                <div className="text-2xl font-bold text-blue-600">
                  {data.socialImpact.total_feedback_collected.toLocaleString()} reviews
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Environmental Impact Dashboard */}
        {data.environmentalImpact && (
          <Card className="mb-8 bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-800">🌱 Environmental Impact Assessment</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">Carbon Footprint</div>
                  <div className="text-2xl font-bold text-green-600">
                    {data.environmentalImpact.carbon_footprint} kg CO₂
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">Energy Efficiency</div>
                  <div className="text-2xl font-bold text-green-600">
                    {data.environmentalImpact.energy_efficiency}%
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">Water Conservation</div>
                  <div className="text-2xl font-bold text-green-600">
                    {data.environmentalImpact.water_conservation}%
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">Sustainability Score</div>
                  <div className="text-2xl font-bold text-green-600">
                    {data.environmentalImpact.sustainability_score}/100
                  </div>
                </div>
              </div>
              <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600 mb-2">Waste Management Score</div>
                <div className="text-2xl font-bold text-green-600">
                  {data.environmentalImpact.waste_management_score}/100
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <VisitorSpendingChart data={data.visitorSpending} onChartClick={handleChartClick} />
          <FootTrafficChart data={data.footTraffic} onChartClick={handleChartClick} />
          <RewardsChart data={data.rewards} onChartClick={handleChartClick} />
          <SentimentChart data={data.sentiment} onChartClick={handleChartClick} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <DemographicsChart data={data.demographics} onChartClick={handleChartClick} />
          <ResourceUsageChart data={data.resourceUsage} onChartClick={handleChartClick} />
        </div>

        {/* Report Generation */}
        <Card className="mb-8 bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <h2 className="text-2xl font-semibold text-white">📊 Generate Reports</h2>
            <p className="text-gray-400 text-sm">Create professional analytics reports</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Button 
                  variant="primary"
                  className="w-full mb-2"
                  onClick={() => generateReport('full')}
                  disabled={generatingReport === 'full'}
                >
                  {generatingReport === 'full' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Generating Report...
                    </>
                  ) : (
                    '📊 Generate Full Report'
                  )}
                </Button>
                <p className="text-sm text-gray-400">Complete system analysis</p>
              </div>
              
              <div className="text-center">
                <Button 
                  variant="success"
                  className="w-full mb-2"
                  onClick={() => generateReport('tourism-impact')}
                  disabled={generatingReport === 'tourism-impact'}
                >
                  {generatingReport === 'tourism-impact' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Generating Tourism Impact...
                    </>
                  ) : (
                    '🏖️ Tourism Impact Assessment'
                  )}
                </Button>
                <p className="text-sm text-gray-400">AI-driven tourism analysis</p>
              </div>
              
              <div className="text-center">
                <Button 
                  variant="warning"
                  className="w-full mb-2"
                  onClick={() => generateReport('summary')}
                  disabled={generatingReport === 'summary'}
                >
                  {generatingReport === 'summary' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Generating Summary...
                    </>
                  ) : (
                    '📋 Quick Summary'
                  )}
                </Button>
                <p className="text-sm text-gray-400">Key metrics only</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Source Information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-800">Data Sources & Integration</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Revenue Data</h4>
                <p className="text-gray-600">Shop transactions (Team 7) + Tour bookings (Team 8)</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Foot Traffic</h4>
                <p className="text-gray-600">Museum scans (Team 3) + Experience check-ins (Team 4)</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Sentiment Analysis</h4>
                <p className="text-gray-600">Feedback ratings (Team 9) + Reviews</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Rewards Tracking</h4>
                <p className="text-gray-600">Reward history (Team 11) + Gamification metrics</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Resource Usage</h4>
                <p className="text-gray-600">Facility utilization + Environmental monitoring</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Demographics</h4>
                <p className="text-gray-600">User profiles + Booking data analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Access Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            🔒 Admin-only access • Protected by CONNECT-DAET Security System
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Tourists and regular users cannot access this system.
          </p>
        </div>
      </div>

      {/* Chart Info Modal */}
      {selectedChartInfo && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedChartInfo(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedChartInfo.title}</h2>
                <button 
                  onClick={() => setSelectedChartInfo(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 mb-2">Description</h3>
                  <p className="text-gray-700">{selectedChartInfo.description}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-green-600 mb-2">How It Works</h3>
                  <p className="text-gray-700 whitespace-pre-line">{selectedChartInfo.howItWorks}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-purple-600 mb-2">Key Metrics</h3>
                  <p className="text-gray-700 whitespace-pre-line">{selectedChartInfo.metrics}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button 
                  variant="primary"
                  onClick={() => setSelectedChartInfo(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <AdminOnly>
      <AnalyticsContent />
    </AdminOnly>
  )
}
