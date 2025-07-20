"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChevronUp, Search, SlidersHorizontal, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface MobilePanelProps {
  children: React.ReactNode
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export default function MobilePanel({ children, isOpen, setIsOpen }: MobilePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [startY, setStartY] = useState<number | null>(null)
  const [currentY, setCurrentY] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [windowHeight, setWindowHeight] = useState(0)

  useEffect(() => {
    setWindowHeight(window.innerHeight)
    const handleResize = () => setWindowHeight(window.innerHeight)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Panel heights
  const PEEK_HEIGHT = 140 // Height when collapsed
  const HALF_HEIGHT = windowHeight * 0.5
  const FULL_HEIGHT = windowHeight - 64 - 24 // Full height minus navbar and padding

  // Calculate current panel height based on drag
  const getPanelHeight = () => {
    if (isDragging && startY !== null && currentY !== null) {
      const dragDistance = startY - currentY
      const baseHeight = isOpen ? HALF_HEIGHT : PEEK_HEIGHT
      return Math.max(PEEK_HEIGHT, Math.min(FULL_HEIGHT, baseHeight + dragDistance))
    }
    return isOpen ? HALF_HEIGHT : PEEK_HEIGHT
  }

  // Handle touch events for dragging
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      setCurrentY(e.touches[0].clientY)
    }
  }

  const handleTouchEnd = () => {
    if (isDragging && startY !== null && currentY !== null) {
      const dragDistance = startY - currentY

      // Determine if panel should open, close, or go full screen
      if (dragDistance > 50) {
        // Dragged up significantly
        setIsOpen(true)
      } else if (dragDistance < -50) {
        // Dragged down significantly
        setIsOpen(false)
      }
    }

    // Reset drag state
    setStartY(null)
    setCurrentY(null)
    setIsDragging(false)
  }

  // Toggle panel state
  const togglePanel = () => {
    setIsOpen(!isOpen)
  }

  return (
   <div
  ref={panelRef}
  className={cn(
    // layout & position
    "absolute inset-x-3 bottom-3",
    // look & feel
    "rounded-t-3xl border border-gray-100 bg-[#F8F8FF] shadow-2xl z-20",
    // motion
    "transition-all duration-300",
    // disable transitions while dragging
    isDragging && "transition-none",
  )}

      style={{
        height: `${getPanelHeight()}px`,
        touchAction: "none",
      }}
    >
      {/* Handle for dragging */}
      <div
        className="h-12 flex items-center justify-center cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
      </div>

      {/* Panel header */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Explore Properties</h2>
          <Button variant="ghost" size="sm" className="p-1 h-8 w-8" onClick={togglePanel}>
            <ChevronUp className={cn("h-5 w-5 transition-transform", isOpen ? "transform rotate-180" : "")} />
          </Button>
        </div>

        {/* Search and filters */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by city, neighborhood..."
              className="pl-9 bg-gray-50 border-gray-200 h-10 rounded-xl"
            />
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10 flex-shrink-0 bg-white border-gray-200 rounded-xl">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-10 w-10 flex-shrink-0 bg-white border-gray-200 rounded-xl">
            <MapPin className="h-4 w-4" />
          </Button>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 h-8 rounded-full bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            For Sale
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 h-8 rounded-full bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            For Rent
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 h-8 rounded-full bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Price
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 h-8 rounded-full bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Beds & Baths
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 h-8 rounded-full bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Home Type
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 h-8 rounded-full bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            More Filters
          </Button>
        </div>
      </div>

      {/* Panel content */}
      <div className="overflow-y-auto h-[calc(100%-140px)] px-1">{children}</div>
    </div>
  )
}