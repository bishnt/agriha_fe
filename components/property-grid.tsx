// components/PropertyGrid.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import PropertyCard from "./property-card" // PropertyCard is still imported for its internal rendering logic
import type { Property } from "@/lib/types" // Corrected path

type SortOption = "relevant" | "recently-posted" | "most-popular"

interface PropertyGridProps {
  properties: Property[]
  loading?: boolean
  onViewDetails?: (propertyId: string) => void
  onLoadMore?: () => void
  hasMore?: boolean
  onSortChange?: (sortOrder: SortOption) => void
  children?: React.ReactNode;
  viewMode?: "grid" | "list"; // Prop for view mode (controls desktop layout)
}

export default function PropertyGrid({
  properties,
  loading = false,
  onViewDetails,
  onLoadMore,
  hasMore = false,
  onSortChange,
  children,
  viewMode = "grid", // Default to desktop grid (Image 2)
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
        return (new Date(b.createdAt || 0).getTime() || 0) - (new Date(a.createdAt || 0).getTime() || 0);
      case "most-popular":
        return (b.views || 0) - (a.views || 0);
      case "relevant":
      default:
        return 0;
    }
  });

  // This class controls the overall layout of the cards container within PropertyGrid
  const gridOrListClasses =
    viewMode === "grid"
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" // Mobile 1-col, Desktop Grid (Image 2)
      : "space-y-4"; // Mobile 1-col (due to PropertyCard), Desktop List (Image 1, full width)

  if (!mounted || (loading && properties.length === 0)) {
    // Skeletons need to reflect the view mode
    return (
      <div className={gridOrListClasses}>
        {[...Array(viewMode === "list" ? 3 : 6)].map((_, index) => (
          <div key={index} className="animate-pulse bg-white rounded-lg shadow-md overflow-hidden">
            {/* Skeleton structure mimics PropertyCard's internal responsiveness */}
            <div className="flex flex-row md:block"> {/* This dictates mobile list / desktop grid for skeletons */}
              <div className="relative w-2/5 flex-shrink-0 min-h-[120px] bg-gray-200 md:w-full md:h-48" />
              <div className="p-4 w-3/5 space-y-2 md:w-full">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-6 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (mounted && properties.length === 0 && !loading && !children) {
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

      {/* Apply the determined grid/list classes */}
      <div className={gridOrListClasses}>
        {/* Render children if provided (from AgentDashboard), otherwise render PropertyCards directly */}
        {children || sortedProperties.map((property) => (
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