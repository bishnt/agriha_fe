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

  // Panel height definitions
  const PEEK_HEIGHT = 140
  const MAX_HEIGHT = windowHeight * 0.7 // 70% of screen height

  const getPanelHeight = () => {
    if (isDragging && startY !== null && currentY !== null) {
      const dragDistance = startY - currentY
      const baseHeight = isOpen ? MAX_HEIGHT : PEEK_HEIGHT
      return Math.max(PEEK_HEIGHT, Math.min(MAX_HEIGHT, baseHeight + dragDistance))
    }
    return isOpen ? MAX_HEIGHT : PEEK_HEIGHT
  }

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
      if (dragDistance > 50) setIsOpen(true)
      else if (dragDistance < -50) setIsOpen(false)
    }

    setStartY(null)
    setCurrentY(null)
    setIsDragging(false)
  }

  const togglePanel = () => setIsOpen(!isOpen)

  return (
    <div
      ref={panelRef}
      className={cn(
        "fixed left-0 right-0 bottom-0 mx-3 z-20 rounded-t-3xl border border-gray-100 bg-[#F8F8FF] shadow-2xl",
        "transition-all duration-300",
        isDragging && "transition-none"
      )}
      style={{
        height: `${getPanelHeight()}px`,
        touchAction: "none",
        maxHeight: MAX_HEIGHT,
      }}
    >
      {/* Handle */}
      <div
        className="h-12 flex items-center justify-center cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
      </div>

      {/* Header */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Explore Properties</h2>
          <Button variant="ghost" size="sm" className="p-1 h-8 w-8" onClick={togglePanel}>
            <ChevronUp className={cn("h-5 w-5 transition-transform", isOpen ? "rotate-180" : "")} />
          </Button>
        </div>

        {/* Search Row */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by city, neighborhood..."
              className="pl-9 bg-gray-50 border-gray-200 h-10 rounded-xl"
            />
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10 bg-white border-gray-200 rounded-xl">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-10 w-10 bg-white border-gray-200 rounded-xl">
            <MapPin className="h-4 w-4" />
          </Button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {["For Sale", "For Rent", "Price", "Beds & Baths", "Home Type", "More Filters"].map(label => (
            <Button
              key={label}
              variant="outline"
              size="sm"
              className="flex-shrink-0 h-8 rounded-full bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="overflow-y-auto px-1" style={{ maxHeight: `${getPanelHeight() - 200}px` }}>
        {children}
      </div>
    </div>
  )
}
