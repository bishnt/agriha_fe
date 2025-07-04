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
    <>
      <div className="lg:hidden sticky top-0 left-0 right-0 z-50 bg-white p-4">
        <form onSubmit={handleSearch}>
          <div className="w-full px-4 py-2 bg-white rounded-lg shadow-[0px_1px_4px_0px_rgba(12,12,13,0.05)] shadow-[0px_1px_4px_0px_rgba(12,12,13,0.10)] flex items-center">
            <div className="relative flex-grow">
              <Input
                name="search"
                type="text"
                placeholder="Search by location, landmarks"
                className="w-full h-auto text-base border-0 focus:ring-0 bg-transparent pr-8 placeholder:text-gray-500 placeholder:text-sm shadow-none"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#002B6D] hover:bg-[#001a4d] text-white rounded-full w-6 h-6 flex items-center justify-center p-0"
              >
                <svg width="8" height="8" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.25 11.25L8.625 8.625M10.5 5.75C10.5 8.375 8.375 10.5 5.75 10.5C3.125 10.5 1 8.375 1 5.75C1 3.125 3.125 1 5.75 1C8.375 1 10.5 3.125 10.5 5.75Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Button>
            </div>
          </div>
        </form>
      </div>

      <section className="hidden lg:block bg-gray-50 pt-20 pb-24 my-10 overflow-hidden">
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

              <form onSubmit={handleSearch}>
                <div
                  className="
                    w-full px-3 py-3 bg-white rounded-lg
                    shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
                    inline-flex justify-center items-center gap-6
                  "
                >
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

            <div
              className=" absolute
    rounded-[32px]
    overflow-hidden
    w-[720px] h-[400px]
    lg:w-[720px] lg:h-[400px]
    md:w-[500px] md:h-[300px]
    sm:w-[300px] sm:h-[200px]
    top-[113px] right-[222px]
    lg:top-[113px] lg:right-[222px]
    md:top-[80px] md:right-[20px]
    sm:top-[60px] sm:right-[10px]
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
    </>
  )
}