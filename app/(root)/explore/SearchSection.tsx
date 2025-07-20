"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, SlidersHorizontal, MapPin, TrendingUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSearchParams } from "next/navigation"
import FilterPopup from "@/components/filters"
import { Location, Property, SearchSectionProps, FilterCriteria } from "@/lib/types"
import { mockProperties } from "@/lib/mockData1"

const popularLocations: Location[] = [
  {
    id: "thamel-1", name: "Thamel", city: "Kathmandu", state: "Bagmati", country: "Nepal",
    latitude: 27.7155, longitude: 85.3113, description: "Tourist hub with boutique hotels & nightlife",
    propertyCount: 240, type: "Neighborhood"
  },
  {
    id: "bouddha-1", name: "Boudhanath", city: "Kathmandu", state: "Bagmati", country: "Nepal",
    latitude: 27.7198, longitude: 85.3629, description: "Peaceful area surrounding Boudhanath Stupa",
    propertyCount: 180, type: "Landmark"
  },
  {
    id: "pulchowk-1", name: "Pulchowk", city: "Lalitpur", state: "Bagmati", country: "Nepal",
    latitude: 27.675, longitude: 85.317, description: "Lalitpur's commercial & educational center",
    propertyCount: 95, type: "Neighborhood"
  },
  {
    id: "pashupati-1", name: "Pashupatinath Temple", city: "Kathmandu", state: "Bagmati", country: "Nepal",
    latitude: 27.7107, longitude: 85.3475, description: "Historic Hindu temple complex",
    propertyCount: 50, type: "Landmark"
  },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function SearchSection({ onLocationSelect, setProperties }: SearchSectionProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [activePropertyType, setActivePropertyType] = useState<"for_sale" | "for_rent" | null>(null)
  const [showFilterPopup, setShowFilterPopup] = useState(false)
  
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const searchParams = useSearchParams()

  const searchInputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const shouldKeepFocus = useRef(false)

  const initialFilterState: FilterCriteria = {
    distanceRadius: 0,
    minPrice: 0,
    maxPrice: 10000,
    bedrooms: 0,
    bathrooms: 0,
    minArea: 0,
    maxArea: 1000,
    isAttached: false,
    type: [],
  }

  // Set search query from URL params on mount
  useEffect(() => {
    const searchParam = searchParams.get('search')
    if (searchParam) {
      setSearchQuery(searchParam)
    }
  }, [searchParams])

  const fetchNominatimData = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSearchResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const nominatimApiUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&limit=10&addressdetails=1&viewbox=85.25,27.65,85.45,27.75&bounded=1&countrycodes=np`

      const response = await fetch(nominatimApiUrl)
      const data = await response.json()

      const formattedResults: Location[] = data.map((item: any) => ({
        id: item.osm_id.toString(),
        name: item.name || item.display_name.split(',')[0],
        city: item.address.city || item.address.town || item.address.village || '',
        state: item.address.state || '',
        country: item.address.country || '',
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        description: item.display_name,
        propertyCount: 0,
        type: item.type,
      }))
      setSearchResults(formattedResults)
    } catch (error) {
      console.error("Error fetching Nominatim data:", error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debouncedSearchQuery) {
      fetchNominatimData(debouncedSearchQuery)
    } else {
      setSearchResults([])
    }
  }, [debouncedSearchQuery, fetchNominatimData])

  useEffect(() => {
    if (shouldKeepFocus.current && searchInputRef.current) {
      searchInputRef.current.focus()
      shouldKeepFocus.current = false
    }
  }, [searchQuery])

  const handleLocationClick = useCallback(async (location: Location) => {
    onLocationSelect(location)
    setSearchQuery(location.description || `${location.name}, ${location.city}`)
    setShowRecommendations(false)

    // Simulated backend response
    const simulatedProperties = mockProperties.filter(p => {
      if (p.latitude === null || p.longitude === null) return false
      const distance = Math.sqrt(
        Math.pow(p.latitude - location.latitude, 2) +
        Math.pow(p.longitude - location.longitude, 2)
      )
      return distance < 0.1
    })
    setProperties(simulatedProperties.length > 0 ? simulatedProperties : [])
  }, [onLocationSelect, setProperties])

  const handleSearchFocus = useCallback(() => {
    setShowRecommendations(true)
  }, [])

  const handleSearchBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (resultsRef.current && !resultsRef.current.contains(e.relatedTarget as Node)) {
      setTimeout(() => setShowRecommendations(false), 100)
    }
  }, [])

  const handleResultMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
  }, [])

  const handlePropertyTypeFilter = useCallback((type: "for_sale" | "for_rent") => {
    setActivePropertyType(prevType => prevType === type ? null : type)
  }, [])

  const handleFilterClick = useCallback((filterName: string) => {
    console.log(`Filter "${filterName}" clicked`)
    setShowFilterPopup(true)
  }, [])

  const handleApplyFilters = useCallback((filters: FilterCriteria) => {
    console.log("Applying filters:", filters)
    setShowFilterPopup(false)
  }, [])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    shouldKeepFocus.current = true
    setSearchQuery(e.target.value)
    setShowRecommendations(true)
  }, [])

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 mx-auto max-w-[calc(100%-32px)] md:max-w-7xl relative z-[1000] mt-4">
      <div className="flex items-center justify-center gap-2">
        <div className="relative flex-[2]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            ref={searchInputRef}
            placeholder="Search by city, neighborhood, or landmark..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            className="pl-9 h-10 bg-gray-50 border-2 border-[#002B6D] rounded-xl text-sm w-full
                       focus:ring-1 focus:ring-[#002B6D] transition-all duration-200"
          />
          {showRecommendations && (searchQuery.length >= 3 || searchResults.length > 0 || searchQuery === "") && (
            <div
              ref={resultsRef}
              className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-xl shadow-lg z-[1001] max-h-80 overflow-y-auto"
              onMouseDown={handleResultMouseDown}
            >
              {searchQuery === "" ? (
                <div className="p-4">
                  <div className="flex items-center gap-2 text-gray-700 font-medium text-sm mb-3">
                    <TrendingUp className="h-4 w-4" />
                    Popular Locations
                  </div>
                  {popularLocations.map((location) => (
                    <div
                      key={location.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-start"
                      onClick={() => handleLocationClick(location)}
                    >
                      <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1 mr-2" />
                      <div>
                        <h4 className="font-medium text-gray-800 text-sm leading-tight">
                          {location.name}
                        </h4>
                        <p className="text-xs text-gray-600 leading-tight">
                          {location.description || `${location.city}, ${location.city}`}
                        </p>
                        {location.propertyCount && (
                          <span className="text-xs text-gray-500 mt-1 block">
                            {location.propertyCount} properties
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center p-4 text-gray-500">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((location) => (
                  <div
                    key={location.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-start"
                    onClick={() => handleLocationClick(location)}
                  >
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1 mr-2" />
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm leading-tight">
                        {location.name}
                      </h4>
                      <p className="text-xs text-gray-600 leading-tight">
                        {location.description}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                searchQuery.length >= 3 && (
                  <div className="p-4 text-gray-500 text-sm">
                    No results found for "{searchQuery}"
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <Button
          variant={activePropertyType === "for_sale" ? "default" : "outline"}
          size="sm"
          onClick={() => handlePropertyTypeFilter("for_sale")}
          className={`h-9 rounded-full text-sm flex-shrink-0 px-4 transition-colors duration-200 border-2
                      ${activePropertyType === "for_sale" ? "bg-[#002B6D] text-white border-[#002B6D]" : "bg-white border-gray-200 text-gray-700 hover:border-[#002B6D] hover:text-[#002B6D]"}`}
        >
          For Sale
        </Button>
        <Button
          variant={activePropertyType === "for_rent" ? "default" : "outline"}
          size="sm"
          onClick={() => handlePropertyTypeFilter("for_rent")}
          className={`h-9 rounded-full text-sm flex-shrink-0 px-4 transition-colors duration-200 border-2
                      ${activePropertyType === "for_rent" ? "bg-[#002B6D] text-white border-[#002B6D]" : "bg-white border-gray-200 text-gray-700 hover:border-[#002B6D] hover:text-[#002B6D]"}`}
        >
          For Rent
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFilterClick("Price Range")}
          className="flex-shrink-0 h-9 rounded-full bg-white border-2 border-gray-200 text-gray-700
                     hover:border-[#002B6D] hover:text-[#002B6D] transition-colors duration-200 px-4"
        >
          Price Range
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFilterClick("Beds & Baths")}
          className="flex-shrink-0 h-9 rounded-full bg-white border-2 border-gray-200 text-gray-700
                     hover:border-[#002B6D] hover:text-[#002B6D] transition-colors duration-200 px-4"
        >
          Beds & Baths
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFilterClick("Home Type")}
          className="flex-shrink-0 h-9 rounded-full bg-white border-2 border-gray-200 text-gray-700
                     hover:border-[#002B6D] hover:text-[#002B6D] transition-colors duration-200 px-4"
        >
          Home Type
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowFilterPopup(true)}
          className="h-10 px-4 bg-white border-2 border-gray-200 rounded-xl flex-shrink-0 text-gray-700
                     hover:border-[#002B6D] hover:text-[#002B6D] transition-colors duration-200"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      <FilterPopup
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={initialFilterState}
      />
    </div>
  )
}