'use client'

import { Card, CardContent, CardHeader } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { useState } from 'react'

interface Anomaly {
  id: string
  date: string
  metric: string
  expectedValue: number
  actualValue: number
  deviation: number
  severity: 'low' | 'medium' | 'high'
  description: string
  possibleCause?: string
}

interface AnomalyDetectorProps {
  anomalies: Anomaly[]
}

export function AnomalyDetector({ anomalies }: AnomalyDetectorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const getSeverityColor = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'high':
        return 'border-red-500 bg-red-50'
      case 'medium':
        return 'border-yellow-500 bg-yellow-50'
      case 'low':
        return 'border-blue-500 bg-blue-50'
    }
  }

  const getSeverityBadge = (severity: Anomaly['severity']) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    }
    return (
      <span className={`text-xs font-semibold px-2 py-1 rounded ${colors[severity]}`}>
        {severity.toUpperCase()}
      </span>
    )
  }

  const formatValue = (value: number, metric: string) => {
    if (metric.toLowerCase().includes('revenue') || metric.toLowerCase().includes('spending')) {
      return `₱${value.toLocaleString()}`
    }
    return value.toLocaleString()
  }

  if (anomalies.length === 0) {
    return (
      <Card className="mb-8 border-green-200">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-gray-800">🔍 Anomaly Detection</h2>
          <p className="text-sm text-gray-600">Monitoring for unusual patterns</p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-gray-600">No anomalies detected. All metrics are within expected ranges.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-8 border-orange-200">
      <CardHeader>
        <h2 className="text-2xl font-semibold text-gray-800">🔍 Anomaly Detection</h2>
        <p className="text-sm text-gray-600">
          {anomalies.length} unusual pattern{anomalies.length > 1 ? 's' : ''} detected
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {anomalies.map((anomaly) => (
            <div
              key={anomaly.id}
              className={`border-l-4 rounded-lg p-4 ${getSeverityColor(anomaly.severity)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">⚠️</span>
                    <h3 className="font-semibold text-gray-900">{anomaly.metric}</h3>
                    {getSeverityBadge(anomaly.severity)}
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{anomaly.description}</p>
                  <div className="flex items-center gap-4 text-sm mb-2">
                    <span className="text-gray-600">
                      Date: <span className="font-medium">{new Date(anomaly.date).toLocaleDateString()}</span>
                    </span>
                    <span className="text-gray-600">
                      Expected: <span className="font-medium">{formatValue(anomaly.expectedValue, anomaly.metric)}</span>
                    </span>
                    <span className="text-gray-600">
                      Actual: <span className="font-medium">{formatValue(anomaly.actualValue, anomaly.metric)}</span>
                    </span>
                    <span className={`font-semibold ${
                      anomaly.deviation > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {anomaly.deviation > 0 ? '+' : ''}{anomaly.deviation.toFixed(0)}%
                    </span>
                  </div>
                  {anomaly.possibleCause && expandedId === anomaly.id && (
                    <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                      <p className="text-sm">
                        <span className="font-semibold">Possible Cause:</span> {anomaly.possibleCause}
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setExpandedId(expandedId === anomaly.id ? null : anomaly.id)}
                >
                  {expandedId === anomaly.id ? 'Less' : 'Details'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
