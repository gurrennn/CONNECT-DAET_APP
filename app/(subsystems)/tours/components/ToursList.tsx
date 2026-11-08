'use client'

import { Card, CardContent, CardHeader } from "../../../components/ui/Card"
import { Button } from "../../../components/ui/Button"

export default function ToursList() {
  const tours = [
    { id: '1', name: 'Bagasbas Beach Experience', duration: '4 hours', price: 1200, capacity: 20 },
    { id: '2', name: 'Daet Heritage Walk', duration: '3 hours', price: 800, capacity: 15 },
    { id: '3', name: 'Island Hopping Adventure', duration: '8 hours', price: 2500, capacity: 25 },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tours.map(tour => (
        <Card key={tour.id}>
          <CardHeader>
            <h3 className="text-lg font-semibold">{tour.name}</h3>
          </CardHeader>
          <CardContent>
            <p>Duration: {tour.duration}</p>
            <p className="text-2xl font-bold text-blue-600">₱{tour.price}</p>
            <Button variant="primary" className="w-full mt-4" title="Book tour" aria-label={`Book ${tour.name}`}>
              Book Now
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
