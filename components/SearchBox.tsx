"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, MapPin, TrendingUp, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Location } from "@/lib/types"
import Fuse from "fuse.js"

const popularLocations: Location[] = [
  {
    id: "1",
    name: "Thamel",
    city: "Kathmandu",
    state: "Bagmati",
    country: "Nepal",
    latitude: 27.7172,
    longitude: 85.3140,
    description: "Thamel, Kathmandu",
    propertyCount: 120,
    type: "neighborhood"
  },
  {
    id: "2",
    name: "Durbar Marg",
    city: "Kathmandu",
    state: "Bagmati",
    country: "Nepal",
    latitude: 27.7128,
    longitude: 85.3166,
    description: "Durbar Marg, Kathmandu",
    propertyCount: 85,
    type: "neighborhood"
  },
  {
    id: "3",
    name: "Boudhanath Stupa",
    city: "Kathmandu",
    state: "Bagmati",
    country: "Nepal",
    latitude: 27.7218,
    longitude: 85.3621,
    description: "Boudhanath Stupa, Kathmandu",
    propertyCount: 45,
    type: "landmark"
  },
  {
    id: "4",
    name: "Patan Durbar Square",
    city: "Lalitpur",
    state: "Bagmati",
    country: "Nepal",
    latitude: 27.6736,
    longitude: 85.3244,
    description: "Patan Durbar Square, Lalitpur",
    propertyCount: 60,
    type: "landmark"
  },
  {
    id: "5",
    name: "Swayambhunath",
    city: "Kathmandu",
    state: "Bagmati",
    country: "Nepal",
    latitude: 27.7151,
    longitude: 85.2906,
    description: "Swayambhunath Temple, Kathmandu",
    propertyCount: 30,
    type: "landmark"
  },
  {
    id: "6",
    name: "Pashupatinath Temple",
    city: "Kathmandu",
    state: "Bagmati",
    country: "Nepal",
    latitude: 27.7109,
    longitude: 85.3484,
    description: "Pashupatinath Temple, Kathmandu",
    propertyCount: 25,
    type: "landmark"
  },
  {
    id: "7",
    name: "New Road",
    city: "Kathmandu",
    state: "Bagmati",
    country: "Nepal",
    latitude: 27.7068,
    longitude: 85.3146,
    description: "New Road, Kathmandu",
    propertyCount: 75,
    type: "neighborhood"
  },
  {
    id: "8",
    name: "Jawalakhel",
    city: "Lalitpur",
    state: "Bagmati",
    country: "Nepal",
    latitude: 27.6747,
    longitude: 85.3113,
    description: "Jawalakhel, Lalitpur",
    propertyCount: 50,
    type: "neighborhood"
  },
  {
    id: "9",
    name: "Bhaktapur Durbar Square",
    city: "Bhaktapur",
    state: "Bagmati",
    country: "Nepal",
    latitude: 27.6710,
    longitude: 85.4296,
    description: "Bhaktapur Durbar Square, Bhaktapur",
    propertyCount: 40,
    type: "landmark"
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

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
  onLocationSelect: (location: Location) => void
  placeholder?: string
  className?: string
  inputClassName?: string
  showIcon?: boolean
  variant?: 'default' | 'hero' | 'sticky'
}

export default function SearchBox({
  value,
  onChange,
  onLocationSelect,
  placeholder = "Search by city, neighborhood, or landmark...",
  className = "",
  inputClassName = "",
  showIcon = true,
  variant = 'default'
}: SearchBoxProps) {
  const [searchResults, setSearchResults] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [localLocations, setLocalLocations] = useState<Location[]>([])
  
  const debouncedSearchQuery = useDebounce(value, 500)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const fuseRef = useRef<Fuse<Location> | null>(null)

  // Initialize Fuse.js with local locations
  useEffect(() => {
    if (localLocations.length > 0) {
      const options = {
        keys: [
          'name',
          'city',
          'state',
          'country',
          'description'
        ],
        includeScore: true,
        threshold: 0.4,
        minMatchCharLength: 2,
        ignoreLocation: true,
        shouldSort: true,
      }
      fuseRef.current = new Fuse(localLocations, options)
    }
  }, [localLocations])

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

      interface NominatimResponse {
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
      }

      const formattedResults: Location[] = (data as NominatimResponse[]).map((item: NominatimResponse) => ({
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
      
      // Update local locations for fuzzy search
      setLocalLocations(prev => [...prev, ...formattedResults])
      
      // Initial results from API
      setSearchResults(formattedResults)
    } catch (error: unknown) {
      console.error("Error fetching Nominatim data:", error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Perform fuzzy search when localLocations is populated
  useEffect(() => {
    if (debouncedSearchQuery && fuseRef.current) {
      const results = fuseRef.current.search(debouncedSearchQuery)
      const filteredResults = results.map(result => result.item)
      setSearchResults(filteredResults)
    } else if (debouncedSearchQuery) {
      // Fallback to API search if no local data
      fetchNominatimData(debouncedSearchQuery)
    } else {
      setSearchResults([])
    }
  }, [debouncedSearchQuery, fetchNominatimData])

  const handleLocationClick = useCallback((location: Location) => {
    onChange(location.description || `${location.name}, ${location.city}`)
    onLocationSelect(location)
    setShowRecommendations(false)
  }, [onChange, onLocationSelect])

  const handleSearchFocus = useCallback(() => {
    setShowRecommendations(true)
  }, [])

  const handleSearchBlur = useCallback(() => {
    setTimeout(() => {
      if (resultsRef.current && !resultsRef.current.contains(document.activeElement)) {
        setShowRecommendations(false)
      }
    }, 200)
  }, [])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    setShowRecommendations(true)
  }, [onChange])

  const handleResultMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
  }, [])

  // Variant-specific styles
  const variantStyles = {
    default: {
      container: "relative",
      input: "pl-9 h-10 bg-gray-50 border-2 border-[#002B6D] rounded-xl text-sm w-full focus:ring-1 focus:ring-[#002B6D]",
      results: "absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-[1001] max-w-full overflow-hidden"
    },
    hero: {
      container: "relative w-full",
      input: "h-12 pl-10 pr-4 text-base border-0 rounded-lg focus:ring-2 focus:ring-[#002B6D] focus:border-transparent bg-transparent placeholder:text-gray-500 shadow-none",
      results: "absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-[1001] mt-1 max-w-full overflow-hidden"
    },
    sticky: {
      container: "relative w-full",
      input: "w-full h-auto text-base border-0 focus:ring-0 bg-transparent pr-8 placeholder:text-gray-500 placeholder:text-sm shadow-none",
      results: "absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-[1001] max-w-full overflow-hidden"
    }
  }

  return (
    <div className={`${variantStyles[variant].container} ${className}`}>
      {showIcon && (
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
      )}
      <Input
        ref={searchInputRef}
        placeholder={placeholder}
        value={value}
        onChange={handleSearchChange}
        onFocus={handleSearchFocus}
        onBlur={handleSearchBlur}
        className={`${variantStyles[variant].input} ${inputClassName}`}
      />
      {showRecommendations && (value.length >= 3 || searchResults.length > 0 || value === "") && (
        <div
          ref={resultsRef}
          className={variantStyles[variant].results}
          onMouseDown={handleResultMouseDown}
        >
          {value === "" ? (
            <div className="p-3">
              <div className="flex items-center gap-2 text-gray-700 font-medium text-xs mb-2">
                <TrendingUp className="h-3 w-3" />
                Popular Locations
              </div>
              {popularLocations.slice(0, 2).map((location) => (
                <div
                  key={location.id}
                  className="p-2 hover:bg-[#002B6D]/5 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center transition-all duration-200"
                  onClick={() => handleLocationClick(location)}
                >
                  <MapPin className="h-3 w-3 text-[#002B6D] flex-shrink-0 mr-2" />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-gray-800 text-xs leading-tight truncate">
                      {location.name}
                    </h4>
                    <p className="text-xs text-gray-600 leading-tight truncate">
                      {location.description || `${location.city}, ${location.city}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center p-3 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-xs">Searching...</span>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.slice(0, 2).map((location) => (
              <div
                key={location.id}
                className="p-2 hover:bg-[#002B6D]/5 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center transition-all duration-200"
                onClick={() => handleLocationClick(location)}
              >
                <MapPin className="h-3 w-3 text-[#002B6D] flex-shrink-0 mr-2" />
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-gray-800 text-xs leading-tight truncate">
                    {location.name}
                  </h4>
                  <p className="text-xs text-gray-600 leading-tight truncate">
                    {location.description}
                  </p>
                </div>
              </div>
            ))
          ) : (
            value.length >= 3 && (
              <div className="p-3 text-gray-500 text-xs">
                No results found for &quot;{value}&quot;
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}