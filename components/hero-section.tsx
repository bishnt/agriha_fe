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
  heroImage = "/images/hero-building.png",
}: HeroSectionProps) {
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = formData.get("search") as string
    onSearch?.(query)
  }

  return (
  <section className="bg-gray-50 pt-20 pb-24 my-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Text and Search */}
          <div className="space-y-8 relative z-10">
            <div className="space-y-2">
                  <h1 className="font-montserrat font-extrabold text-7xl leading-none"> {/* Apply font, size, weight */}
                 <span className="text-[#002B6D]">Find</span> {/* Specific blue color */}
                <span className="text-black"> Homes,</span>
                <br/> {/* Line break */}
                <span className="text-black">Far From </span>
                <span className="text-[#002B6D]">Home</span> {/* Specific blue color */}
              </h1>
            </div>

 <form onSubmit={handleSearch}>
      <div
        className="
          w-full px-3 py-3 bg-white rounded-lg // Changed p-4 to px-4 py-5
          shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
          
          inline-flex justify-center items-center gap-6
        "
      >
        {/* Input Field Container */}
        <div
          data-show-icon="False"
          data-state="Enabled"
          data-style="Filled"
          className="
            w-[484px] bg-white rounded-lg overflow-hidden
            outline outline-2 outline-offset-[-1px] outline-sky-900
            inline-flex flex-col justify-center items-center gap-2
          "
        >
          <Input
            name="search"
            type="text"
            placeholder="Search by location, landmarks"
            className="h-12 pl-4 pr-4 text-base border-0 rounded-lg focus:ring-2 focus:ring-[#002B6D] focus:border-transparent bg-transparent placeholder:text-gray-500 shadow-none" 
          />
        </div>

        {/* Search Button */}
        <Button
          type="submit"
          className="
            h-auto bg-[#002B6D] hover:bg-[#001a4d] text-white
            px-8 py-4 rounded-lg font-bold text-base
            shadow-none transition-all duration-200
            font-raleway
          "
        >
          Search
        </Button>
      </div>
    </form>
          </div>

          {/* Right side - Curved Image */}
 <div
      className="
        absolute
        rounded-[32px]
        overflow-hidden
        w-[720px]
        h-[400px]
        top-[113px]
        right-[222px]
      "
    >
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

  )
}
