"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ChevronUp, Search, SlidersHorizontal, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import SearchSection from "./SearchSection"
import { Location, Property } from "@/lib/types"

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
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [properties, setProperties] = useState<Property[]>([]); 
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    setWindowHeight(window.innerHeight)
    const handleResize = () => setWindowHeight(window.innerHeight)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Panel height definitions
  const PEEK_HEIGHT = 140
  const MAX_HEIGHT = windowHeight * 0.9

  const getPanelHeight = () => {
    // When search is focused, expand panel to give more space
    if (isSearchFocused) return Math.min(windowHeight * 0.9, windowHeight - 300);
    
    if (isDragging && startY !== null && currentY !== null) {
      const dragDistance = startY - currentY
      const baseHeight = isOpen ? MAX_HEIGHT : PEEK_HEIGHT
      return Math.max(PEEK_HEIGHT, Math.min(MAX_HEIGHT, baseHeight + dragDistance))
    }
    return isOpen ? MAX_HEIGHT : PEEK_HEIGHT
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't start drag if touching the search input
    const target = e.touches[0].target as HTMLElement;
    if (target.closest('input, .search-section')) return;
    
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

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    // Close keyboard on mobile after selection
    if (typeof window !== 'undefined' && window.visualViewport) {
      (document.activeElement as HTMLElement)?.blur();
    }
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    setIsOpen(true); // Auto-expand panel when searching
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
  };

  return (
    <div
      ref={panelRef}
      className={cn(
        "fixed left-0 right-0 bottom-0 mx-3 z-50 rounded-t-3xl border border-gray-100 bg-[#F8F8FF] shadow-2xl",
        "transition-all duration-300 ease-out",
        isDragging && "transition-none"
      )}
      style={{
        height: `${getPanelHeight()}px`,
        touchAction: isSearchFocused ? 'pan-y' : 'none',
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
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1 h-8 w-8" 
            onClick={togglePanel}
            disabled={isSearchFocused}
          >
            <ChevronUp className={cn(
              "h-5 w-5 transition-transform",
              isOpen ? "rotate-180" : "",
              isSearchFocused ? "opacity-50" : ""
            )} />
          </Button>
        </div>

        <div className="relative z-[60]"> {/* Increased z-index for search */}
<SearchSection 
  onLocationSelect={handleLocationSelect} 
  setProperties={setProperties}
  onFocus={handleSearchFocus}
  onBlur={handleSearchBlur}
  className="search-section" // Added class for touch event targeting
/>
        </div>
      </div>

      {/* Scrollable content */}
      <div 
        className="overflow-y-auto px-1" 
        style={{ 
          maxHeight: `${getPanelHeight() - 200}px`,
          // Prevent scrolling when search is focused
          touchAction: isSearchFocused ? 'none' : 'auto'
        }}
      >
        {children}
      </div>
    </div>
  )
}