"use client"

import type React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface HeroSectionProps {
  onSearch?: (query: string) => void
  heroImage?: string
  title?: string
  subtitle?: string
}

export default function HeroSection({
  onSearch,
  heroImage = "/images/hero-building.jpg",
  title = "Find Homes,",
  subtitle = "Far From Home",
}: HeroSectionProps) {
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = formData.get("search") as string
    onSearch?.(query)
  }

  return (
    <section className="bg-gray-50 py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Text and Search */}
          <div className="space-y-8 relative z-10">
            <div className="space-y-2">
              <h1 className="text-5xl lg:text-6xl font-black text-[#1a1a1a] leading-[1.1] tracking-tight">{title}</h1>
              <h2 className="text-5xl lg:text-6xl font-black text-[#002B6D] leading-[1.1] tracking-tight relative">
                Far From Hom<span className="relative z-20">e</span>
              </h2>
            </div>

            {/* Search Bar with Dropdown Styling */}
            <form onSubmit={handleSearch} className="relative">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-2 flex gap-2">
                <div className="relative flex-1">
                  <Input
                    name="search"
                    type="text"
                    placeholder="Search by location, landmarks"
                    className="h-12 pl-4 pr-4 text-base border-0 rounded-lg focus:ring-2 focus:ring-[#002B6D] focus:border-transparent bg-transparent placeholder:text-gray-500 shadow-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-12 bg-[#002B6D] hover:bg-[#001a4d] text-white px-8 rounded-lg font-semibold shadow-sm transition-all duration-200"
                >
                  Search
                </Button>
              </div>
            </form>
          </div>

          {/* Right side - Curved Image */}
          <div className="relative lg:ml-8">
            <div className="relative w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl">
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
      </div>
    </section>
  )
}
