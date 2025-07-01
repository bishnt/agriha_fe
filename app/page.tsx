"use client"

import { useState } from "react"
import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import PropertyGrid from "@/components/property-grid"
import type { Property, SearchFilters } from "@/lib/types"

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
  imageUrl: "/images/property-interior.jpg",
  description: "Beautiful modern apartment with all amenities",
  amenities: ["Parking", "Security", "Garden"],
}))

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filters, setFilters] = useState<SearchFilters>({})
  const [properties, setProperties] = useState<Property[]>(mockProperties)
  const [loading, setLoading] = useState(false)

  // Uncomment when backend is ready
  // const { data, loading: queryLoading, error } = useQuery(
  //   searchQuery ? SEARCH_PROPERTIES : GET_PROPERTIES,
  //   {
  //     variables: searchQuery
  //       ? { query: searchQuery, limit: 20, offset: 0 }
  //       : { filters, limit: 20, offset: 0 },
  //     skip: false
  //   }
  // );

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSignIn={handleSignIn} onPostProperty={handlePostProperty} />

      <HeroSection onSearch={handleSearch} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PropertyGrid properties={properties} loading={loading} onViewDetails={handleViewDetails} />
      </main>
    </div>
  )
}
