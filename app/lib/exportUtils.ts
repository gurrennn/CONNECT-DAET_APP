// Export utilities for analytics data

export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    alert('No data to export')
    return
  }

  // Get headers from first object
  const headers = Object.keys(data[0])
  const csvHeaders = headers.join(',')

  // Convert data to CSV rows
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header]
      // Handle values with commas, quotes, or newlines
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value ?? ''
    }).join(',')
  )

  const csv = [csvHeaders, ...csvRows].join('\n')
  downloadFile(csv, filename, 'text/csv')
}

export function exportToJSON(data: any, filename: string) {
  const json = JSON.stringify(data, null, 2)
  downloadFile(json, filename, 'application/json')
}

export function exportToExcel(data: any[], filename: string) {
  // Simple Excel export using CSV format with .xlsx extension
  // For production, consider using a library like xlsx or exceljs
  exportToCSV(data, filename.replace('.csv', '.xlsx'))
}

export function exportAllAnalyticsData(data: {
  visitorSpending: any[]
  footTraffic: any[]
  rewards: any[]
  sentiment: any
  demographics: any[]
  resourceUsage: any[]
  economicImpact: any
  socialImpact: any
  environmentalImpact: any
}, format: 'csv' | 'json' | 'xlsx') {
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `connect-daet-analytics-${timestamp}`

  if (format === 'json') {
    exportToJSON(data, `${filename}.json`)
    return
  }

  // For CSV/Excel, create a flat structure
  const flatData = [
    { section: 'Summary', key: 'Export Date', value: new Date().toLocaleString() },
    { section: 'Summary', key: 'Data Points', value: Object.keys(data).length },
    { section: '', key: '', value: '' },
    
    // Economic Impact
    { section: 'Economic Impact', key: 'Total Revenue', value: data.economicImpact?.total_revenue || 0 },
    { section: 'Economic Impact', key: 'Total Transactions', value: data.economicImpact?.total_transactions || 0 },
    { section: 'Economic Impact', key: 'Avg Transaction', value: data.economicImpact?.avg_transaction_value || 0 },
    { section: 'Economic Impact', key: 'Estimated Jobs', value: data.economicImpact?.estimated_jobs || 0 },
    { section: '', key: '', value: '' },
    
    // Social Impact
    { section: 'Social Impact', key: 'Community Satisfaction', value: `${data.socialImpact?.community_satisfaction || 0}%` },
    { section: 'Social Impact', key: 'Local Engagement', value: `${data.socialImpact?.local_engagement_rate || 0}%` },
    { section: 'Social Impact', key: 'Cultural Preservation', value: data.socialImpact?.cultural_preservation_score || 0 },
    { section: 'Social Impact', key: 'Total Feedback', value: data.socialImpact?.total_feedback_collected || 0 },
    { section: '', key: '', value: '' },
    
    // Environmental Impact
    { section: 'Environmental Impact', key: 'Carbon Footprint (kg CO2)', value: data.environmentalImpact?.carbon_footprint || 0 },
    { section: 'Environmental Impact', key: 'Energy Efficiency', value: `${data.environmentalImpact?.energy_efficiency || 0}%` },
    { section: 'Environmental Impact', key: 'Water Conservation', value: `${data.environmentalImpact?.water_conservation || 0}%` },
    { section: 'Environmental Impact', key: 'Sustainability Score', value: data.environmentalImpact?.sustainability_score || 0 },
    { section: '', key: '', value: '' },
    
    // Sentiment
    { section: 'Visitor Sentiment', key: 'Positive', value: data.sentiment?.positive || 0 },
    { section: 'Visitor Sentiment', key: 'Neutral', value: data.sentiment?.neutral || 0 },
    { section: 'Visitor Sentiment', key: 'Negative', value: data.sentiment?.negative || 0 },
  ]

  if (format === 'xlsx') {
    exportToExcel(flatData, `${filename}.xlsx`)
  } else {
    exportToCSV(flatData, `${filename}.csv`)
  }
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// Export chart as image
export function exportChartAsImage(chartId: string, filename: string) {
  const chartElement = document.getElementById(chartId)
  if (!chartElement) {
    alert('Chart not found')
    return
  }

  // For production, use html2canvas or similar library
  alert('Chart image export requires html2canvas library. Install: npm install html2canvas')
}

// Generate PDF report
export function generatePDFReport(data: any) {
  // For production, use jsPDF library
  alert('PDF export requires jsPDF library. Install: npm install jspdf')
}
