"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, MapPin, TrendingUp, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Location } from "@/lib/types"

const popularLocations: Location[] = [

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
  
  const debouncedSearchQuery = useDebounce(value, 500)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

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
      results: "absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-xl shadow-lg z-[1001] max-h-80 overflow-y-auto"
    },
    hero: {
      container: "relative w-full",
      input: "h-12 pl-4 pr-4 text-base border-0 rounded-lg focus:ring-2 focus:ring-[#002B6D] focus:border-transparent bg-transparent placeholder:text-gray-500 shadow-none",
      results: "absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-xl shadow-lg max-h-80 overflow-y-auto z-[1001] mt-1"
    },
    sticky: {
      container: "relative w-full",
      input: "w-full h-auto text-base border-0 focus:ring-0 bg-transparent pr-8 placeholder:text-gray-500 placeholder:text-sm shadow-none",
      results: "absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-xl shadow-lg max-h-80 overflow-y-auto z-[1001]"
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
            value.length >= 3 && (
              <div className="p-4 text-gray-500 text-sm">
                No results found for "{value}"
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}