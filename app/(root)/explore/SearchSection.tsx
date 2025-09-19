"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, SlidersHorizontal, MapPin, TrendingUp, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSearchParams } from "next/navigation"
import FilterPopup from "@/components/filters"
import { Location, SearchSectionProps, FilterCriteria } from "@/lib/types"

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

export default function SearchSection({ onLocationSelect, onFocus, onBlur, className }: SearchSectionProps) {
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

  const handleLocationClick = useCallback((location: Location) => {
    onLocationSelect?.(location)
    setSearchQuery(location.description || `${location.name}, ${location.city}`)
    setShowRecommendations(false)
  }, [onLocationSelect])

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

      const formattedResults: Location[] = data.map((item: {
        osm_id: number;
        name?: string;
        display_name: string;
        address: {
          city?: string;
          town?: string;
          village?: string;
          state?: string;
          country?: string;
        };
        lat: string;
        lon: string;
        type: string;
      }) => ({
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
      
      // Automatically select the first result if this is from URL param
      if (formattedResults.length > 0 && searchParams.get('search')) {
        handleLocationClick(formattedResults[0])
      }
    } catch (error) {
      console.error("Error fetching Nominatim data:", error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }, [searchParams, handleLocationClick])

  // Set search query from URL params on mount and trigger search
  useEffect(() => {
    const searchParam = searchParams.get('search')
    if (searchParam) {
      setSearchQuery(searchParam)
      fetchNominatimData(searchParam)
    }
  }, [searchParams, fetchNominatimData])

  useEffect(() => {
    if (debouncedSearchQuery && !searchParams.get('search')) {
      fetchNominatimData(debouncedSearchQuery)
    } else if (!debouncedSearchQuery) {
      setSearchResults([])
    }
  }, [debouncedSearchQuery, fetchNominatimData, searchParams])

  useEffect(() => {
    if (shouldKeepFocus.current && searchInputRef.current) {
      searchInputRef.current.focus()
      shouldKeepFocus.current = false
    }
  }, [searchQuery])

  const handleSearchFocus = useCallback(() => {
    setShowRecommendations(true)
    onFocus?.()
  }, [onFocus])

  const handleSearchBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (resultsRef.current && !resultsRef.current.contains(e.relatedTarget as Node)) {
      setTimeout(() => setShowRecommendations(false), 100)
    }
    onBlur?.()
  }, [onBlur])


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
   <div className={`bg-white rounded-xl shadow-lg p-4 mb-4 w-full mx-auto relative z-[1000] ${className ?? ""}`}>
  {/* Search Input - Full width on mobile */}
  <div className="relative w-full mb-3">
    <div className="relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
      <Input
        ref={searchInputRef}
        placeholder="Search location..."
        value={searchQuery}
        onChange={handleSearchChange}
        onFocus={handleSearchFocus}
        onBlur={handleSearchBlur}
        className="pl-9 h-10 bg-gray-50 border-2 border-[#002B6D] rounded-lg text-sm w-full"
      />
      {searchQuery && (
        <X 
          className="absolute right-3 top-3 h-4 w-4 text-gray-500 cursor-pointer"
          onClick={() => setSearchQuery("")}
        />
      )}
    </div>

    {/* Search Results Dropdown */}
    {showRecommendations && (
      <div
        ref={resultsRef}
        className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[1001] max-h-[60vh] overflow-y-auto"
      >
        {searchQuery === "" ? (
          <div className="p-3">
            <div className="flex items-center gap-2 text-gray-700 font-medium text-sm mb-2">
              <TrendingUp className="h-4 w-4" />
              Popular Locations
            </div>
            {popularLocations.map((location) => (
              <div
                key={location.id}
                className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-start"
                onClick={() => handleLocationClick(location)}
              >
                <MapPin className="h-4 w-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-medium text-gray-800 text-sm truncate">
                    {location.name}
                  </h4>
                  <p className="text-xs text-gray-600 truncate">
                    {location.description || `${location.city}`}
                  </p>
                  {location.propertyCount && (
                    <span className="text-xs text-gray-500">
                      {location.propertyCount} properties
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center p-3 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Searching...
          </div>
        ) : searchResults.length > 0 ? (
          searchResults.map((location) => (
            <div
              key={location.id}
              className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-start"
              onClick={() => handleLocationClick(location)}
            >
              <MapPin className="h-4 w-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="font-medium text-gray-800 text-sm truncate">
                  {location.name}
                </h4>
                <p className="text-xs text-gray-600 truncate">
                  {location.description}
                </p>
              </div>
            </div>
          ))
        ) : (
          searchQuery.length >= 3 && (
            <div className="p-3 text-gray-500 text-sm">
              No results for &quot;{searchQuery}&quot;
            </div>
          )
        )}
      </div>
    )}
  </div>

  {/* Filter Buttons - Horizontal scroll on mobile */}
  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
    <Button
      variant={activePropertyType === "for_sale" ? "default" : "outline"}
      size="sm"
      onClick={() => handlePropertyTypeFilter("for_sale")}
      className="min-w-[80px] rounded-full text-xs h-8 border-2"
    >
      For Sale
    </Button>
    <Button
      variant={activePropertyType === "for_rent" ? "default" : "outline"}
      size="sm"
      onClick={() => handlePropertyTypeFilter("for_rent")}
      className="min-w-[80px] rounded-full text-xs h-8 border-2"
    >
      For Rent
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={() => handleFilterClick("Price Range")}
      className="min-w-[70px] rounded-full text-xs h-8 border-2"
    >
      Price
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={() => handleFilterClick("Beds & Baths")}
      className="min-w-[60px] rounded-full text-xs h-8 border-2"
    >
      Beds
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={() => handleFilterClick("Home Type")}
      className="min-w-[60px] rounded-full text-xs h-8 border-2"
    >
      Type
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowFilterPopup(true)}
      className="min-w-[70px] rounded-full text-xs h-8 border-2 flex items-center gap-1"
    >
      <SlidersHorizontal className="h-3 w-3" />
      More
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