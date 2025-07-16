"use client"

import { useState } from "react"
import { Search, SlidersHorizontal, MapPin, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { mockLocations, type Location } from "@/lib/mockLocations"

interface SearchSectionProps {
  onLocationSelect: (location: Location) => void
}

export default function SearchSection({ onLocationSelect }: SearchSectionProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showRecommendations, setShowRecommendations] = useState(true)

  // Filter locations based on search query
  const filteredLocations = mockLocations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleLocationClick = (location: Location) => {
    onLocationSelect(location)
    setSearchQuery(`${location.name}, ${location.city}`)
    setShowRecommendations(false)
  }

  const handleSearchFocus = () => {
    setShowRecommendations(true)
  }

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Search Bar and Filters */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by city, neighborhood, or landmark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl"
            />
          </div>

          <Button variant="outline" className="h-12 px-4 bg-white border-gray-200 rounded-xl">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>

          <Button variant="outline" className="h-12 px-4 bg-white border-gray-200 rounded-xl">
            <MapPin className="h-4 w-4 mr-2" />
            Near Me
          </Button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 h-9 rounded-full bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            For Sale
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 h-9 rounded-full bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            For Rent
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 h-9 rounded-full bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Price Range
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 h-9 rounded-full bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Beds & Baths
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 h-9 rounded-full bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Home Type
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 h-9 rounded-full bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            More Filters
          </Button>
        </div>

        {/* Location Recommendations */}
        {showRecommendations && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">Popular Locations</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(searchQuery ? filteredLocations : mockLocations.slice(0, 6)).map((location) => (
                <Card
                  key={location.id}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 border-gray-200"
                  onClick={() => handleLocationClick(location)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{location.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {location.city}, {location.state}
                        </p>
                        {location.description && <p className="text-xs text-gray-500 mb-2">{location.description}</p>}
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {location.propertyCount} properties
                          </span>
                          <span className="text-xs bg-blue-50 text-[#002B6D] px-2 py-1 rounded-full capitalize">
                            {location.type}
                          </span>
                        </div>
                      </div>
                      <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {searchQuery && filteredLocations.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No locations found for "{searchQuery}"</p>
                <p className="text-sm text-gray-400 mt-1">Try searching for a different city or neighborhood</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
