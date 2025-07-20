"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import SearchBox from "@/components/SearchBox"
import FilterPopup from "@/components/filters"
import { Location, FilterCriteria, HeroSectionProps } from "@/lib/types"

export default function HeroSection({
  onSearch,
  onApplyFilters = () => {},
  heroImage = "/images/hero-building.png",
}: HeroSectionProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showFilterPopup, setShowFilterPopup] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  const heroSectionRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
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

  useEffect(() => {
    const handleScroll = () => {
      if (heroSectionRef.current) {
        const heroBottom = heroSectionRef.current.offsetTop + heroSectionRef.current.offsetHeight
        setIsScrolled(window.scrollY > heroBottom - 100)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearchSubmit = useCallback((query: string) => {
    if (query.trim()) {
      onSearch?.(query)
      router.push(`/explore?search=${encodeURIComponent(query)}`)
    }
  }, [onSearch, router])

  const handleLocationSelect = useCallback((location: Location) => {
    const query = location.description || `${location.name}, ${location.city}`
    setSearchQuery(query)
    handleSearchSubmit(query)
  }, [handleSearchSubmit])

  return (
    <>
      {/* Mobile Sticky Search Bar */}
      <div className="lg:hidden sticky top-0 left-0 right-0 z-50 bg-white p-4 shadow-md">
        <div className="flex items-center gap-2">
          <div className="flex-grow">
            <SearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              onLocationSelect={handleLocationSelect}
              variant="sticky"
              placeholder="Search locations..."
            />
          </div>
          <Button
            type="button"
            onClick={() => setShowFilterPopup(true)}
            className="bg-white text-gray-500 hover:bg-gray-100 rounded-lg px-3 py-1 text-sm font-semibold flex items-center gap-1 shadow"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20M7 12H17M10 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Filter
          </Button>
        </div>
      </div>

      {/* Desktop Sticky Navbar */}
<nav className={`hidden lg:flex fixed top-0 left-0 right-0 z-50 bg-white shadow-md py-3 transition-all duration-300 ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center w-full">
    <div className="flex-grow max-w-2xl mr-4">
      <SearchBox
        value={searchQuery}
        onChange={setSearchQuery}
        onLocationSelect={handleLocationSelect}
        variant="sticky"
        placeholder="Search locations..."
        className="w-full"  // Ensure SearchBox takes full width
      />
    </div>
    <Button
      type="button"
      onClick={() => setShowFilterPopup(true)}
      className="bg-white text-gray-500 hover:bg-gray-100 rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2 shadow whitespace-nowrap"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 6H20M7 12H17M10 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Filter
    </Button>
  </div>
</nav>

      {/* Hero Section */}
      <section ref={heroSectionRef} className={`hidden lg:block bg-gray-50 pt-20 pb-24 my-10 overflow-hidden transition-opacity duration-300 ${isScrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-8 relative z-10">
              <div className="space-y-2">
                <h1 className="font-montserrat font-extrabold text-7xl leading-none">
                  <span className="text-[#002B6D]">Find</span>
                  <span className="text-black"> Homes,</span>
                  <br/>
                  <span className="text-black">Far From </span>
                  <span className="text-[#002B6D]">Home</span>
                </h1>
              </div>

<div className="relative">
  <div className="w-full px-3 py-3 bg-white rounded-lg shadow-lg inline-flex justify-center items-center gap-6">
    <div className="w-[484px] bg-white rounded-lg outline outline-2 outline-offset-[-1px] outline-sky-900 z-50">
      <SearchBox
        value={searchQuery}
        onChange={setSearchQuery}
        onLocationSelect={handleLocationSelect}
        variant="hero"
        showIcon={false}
        className="relative"
        inputClassName="h-12 pl-4 pr-4 text-base border-0 focus:ring-2 focus:ring-[#002B6D] focus:border-transparent bg-transparent placeholder:text-gray-500"
      />
    </div>
    <Button
      type="button"
      onClick={() => handleSearchSubmit(searchQuery)}
      className="h-auto bg-[#002B6D] hover:bg-[#001a4d] text-white px-8 py-4 rounded-lg font-bold text-base"
    >
      Search
    </Button>
  </div>
</div>
</div>
            <div className="relative rounded-[32px] overflow-hidden w-[90vw] max-w-[650px] aspect-[16/9] top-1/2 left-[50%] -translate-y-1/2 -translate-x-1/2">
              <Image
                src={heroImage || "/placeholder.svg"}
                alt="Modern residential buildings"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <FilterPopup
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        onApplyFilters={onApplyFilters}
        initialFilters={initialFilterState}
      />
    </>
  )
}