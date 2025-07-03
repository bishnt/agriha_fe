"use client"

import { useState, useEffect } from "react"
import PropertyCard from "./property-card"
import type { Property } from "@/lib/types"

interface PropertyGridProps {
  properties: Property[]
  loading?: boolean
  onViewDetails?: (propertyId: string) => void
  onLoadMore?: () => void
  hasMore?: boolean
}

export default function PropertyGrid({
  properties,
  loading = false,
  onViewDetails,
  onLoadMore,
  hasMore = false,
}: PropertyGridProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Show loading skeleton during initial render
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {properties.map((property) => (
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