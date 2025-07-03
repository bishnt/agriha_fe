"use client"

import { useState, useEffect } from "react"
import type { Property, SearchFilters } from "@/lib/types"
import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import PropertyGrid from "@/components/property-grid"

// Mock data for development - remove when backend is ready
const mockProperties: Property[] = Array.from({ length: 8 }, (_, index) => ({
  id: `property-${index + 1}`,
  title: `Modern Apartment ${index + 1}`,
  price: 50000,
  currency: "NPRs",
  priceType: "per month",
  location: "Pulchowk, Lalitpur",
  bedrooms: 1,
  bathrooms: 1,
  area: 650,
  areaUnit: "sq ft",
  isAttached: true,
  imageUrl: "/placeholder.svg?height=200&width=300",
  description: "Beautiful modern apartment with all amenities",
  amenities: ["Parking", "Security", "Garden"],
}))

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filters, setFilters] = useState<SearchFilters>({})
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Set initial properties after mount to avoid hydration mismatch
    setProperties(mockProperties)
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      if (query.trim()) {
        const filtered = mockProperties.filter(
          (property) =>
            property.location.toLowerCase().includes(query.toLowerCase()) ||
            property.title.toLowerCase().includes(query.toLowerCase()),
        )
        setProperties(filtered)
      } else {
        setProperties(mockProperties)
      }
      setLoading(false)
    }, 500)
  }

  const handleViewDetails = (propertyId: string) => {
    // Navigate to property details page
    window.location.href = `/property/${propertyId}`
  }

  const handleSignIn = () => {
    // Handle sign in
    console.log("Sign in clicked")
  }

  const handlePostProperty = () => {
    // Handle post property
    console.log("Post property clicked")
  }

  // Show loading state until component is mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#002B6D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading AGRIHA...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSignIn={handleSignIn} onPostProperty={handlePostProperty} />
      <HeroSection onSearch={handleSearch} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PropertyGrid 
          properties={properties} 
          loading={loading} 
          onViewDetails={handleViewDetails} 
        />
      </main>
    </div>
  )
}