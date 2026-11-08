'use client'

import { Button } from '../../../components/ui/Button'

export interface FilterOptions {
  team: string
  location: string
  visitorType: string
}

interface FilterBarProps {
  filters: FilterOptions
  onChange: (filters: FilterOptions) => void
  onReset: () => void
}

export function FilterBar({ filters, onChange, onReset }: FilterBarProps) {
  const teams = [
    'All Teams',
    'Shop (Team 7)',
    'Tours (Team 8)',
    'Museum (Team 3)',
    'Experiences (Team 4)',
    'Feedback (Team 9)',
    'Rewards (Team 11)',
  ]

  const locations = [
    'All Locations',
    'Beach Areas',
    'Downtown',
    'Historical Sites',
    'Museum',
    'Tour Routes',
  ]

  const visitorTypes = [
    'All Visitors',
    'Local Residents',
    'Domestic Tourists',
    'International Tourists',
    'First-time Visitors',
    'Repeat Visitors',
  ]

  const hasActiveFilters = 
    filters.team !== 'All Teams' || 
    filters.location !== 'All Locations' || 
    filters.visitorType !== 'All Visitors'

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
        {hasActiveFilters && (
          <Button size="sm" variant="secondary" onClick={onReset}>
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Team Filter */}
        <div>
          <label htmlFor="team-filter" className="block text-xs font-medium text-gray-600 mb-1">
            Team/Subsystem
          </label>
          <select
            id="team-filter"
            value={filters.team}
            onChange={(e) => onChange({ ...filters, team: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <label htmlFor="location-filter" className="block text-xs font-medium text-gray-600 mb-1">
            Location
          </label>
          <select
            id="location-filter"
            value={filters.location}
            onChange={(e) => onChange({ ...filters, location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Visitor Type Filter */}
        <div>
          <label htmlFor="visitor-filter" className="block text-xs font-medium text-gray-600 mb-1">
            Visitor Type
          </label>
          <select
            id="visitor-filter"
            value={filters.visitorType}
            onChange={(e) => onChange({ ...filters, visitorType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {visitorTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
