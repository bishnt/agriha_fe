"use client"

import { useState, useEffect, useRef } from "react"
import PropertyCard from "./property-card"
import type { Property } from "@/lib/types"

type SortOption = "relevant" | "recently-posted" | "most-popular"

interface PropertyGridProps {
  properties: Property[]
  loading?: boolean
  onViewDetails?: (propertyId: string) => void
  onLoadMore?: () => void
  hasMore?: boolean
  onSortChange?: (sortOrder: SortOption) => void
}

export default function PropertyGrid({
  properties,
  loading = false,
  onViewDetails,
  onLoadMore,
  hasMore = false,
  onSortChange,
}: PropertyGridProps) {
  const [mounted, setMounted] = useState(false)
  const [activeSort, setActiveSort] = useState<SortOption>("relevant")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);


  const handleSortClick = (sortOption: SortOption) => {
    setActiveSort(sortOption)
    setIsDropdownOpen(false);
    if (onSortChange) {
      onSortChange(sortOption)
    }
  }

  const sortedProperties = [...properties].sort((a, b) => {
    switch (activeSort) {
      case "recently-posted":
        // Assuming 'createdAt' or a similar date field exists on your Property type
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "most-popular":
        // Assuming 'views' or 'likes' or similar metric exists
        return (b.views || 0) - (a.views || 0)
      case "relevant":
      default:
        return 0
    }
  })

  if (!mounted || (loading && properties.length === 0)) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-t-lg"></div>
            <div className="bg-white p-4 rounded-b-lg border border-t-0">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (mounted && properties.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
        <p className="text-gray-600">Try adjusting your search criteria</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Sort Dropdown */}
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <div>
          <button
            type="button"
            // Removed bg, px, py, shadow, ring, hover:bg classes
            className="inline-flex justify-center items-center gap-x-1.5 text-sm font-semibold text-gray-900"
            id="menu-button"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
              <span className="capitalize">{activeSort.replace('-', ' ')}</span>
            <svg className="-mr-1 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {isDropdownOpen && (
          <div
            className="absolute left-0 z-10 mt-2 w-48 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="menu-button"
            tabIndex={-1}
          >
            <div className="py-1" role="none">
              <button
                onClick={() => handleSortClick("relevant")}
                className={`block px-4 py-2 text-sm w-full text-left ${activeSort === "relevant" ? "bg-gray-100 text-[#002B6D]" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"}`}
                role="menuitem"
                tabIndex={-1}
                id="menu-item-0"
              >
                Relevant
              </button>
              <button
                onClick={() => handleSortClick("recently-posted")}
                className={`block px-4 py-2 text-sm w-full text-left ${activeSort === "recently-posted" ? "bg-gray-100 text-[#002B6D]" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"}`}
                role="menuitem"
                tabIndex={-1}
                id="menu-item-1"
              >
                Recently Posted
              </button>
              <button
                onClick={() => handleSortClick("most-popular")}
                className={`block px-4 py-2 text-sm w-full text-left ${activeSort === "most-popular" ? "bg-gray-100 text-[#002B6D]" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"}`}
                role="menuitem"
                tabIndex={-1}
                id="menu-item-2"
              >
                Most Popular
              </button>
            </div>
          </div>
        )}
      </div>
      {/* --- */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {sortedProperties.map((property) => (
          <PropertyCard key={property.id} property={property} onViewDetails={onViewDetails} />
        ))}
      </div>

      {hasMore && (
        <div className="text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="bg-[#002B6D] hover:bg-[#001a4d] text-white px-8 py-3 rounded-md font-medium disabled:opacity-50 transition-colors"
          >
            {loading ? "Loading..." : "Load More Properties"}
          </button>
        </div>
      )}
    </div>
  )
}