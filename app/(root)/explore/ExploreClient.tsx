"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import PropertyList from "./PropertyList"
import MobilePanel from "./MobilePanel"
import SearchSection from "./SearchSection"
import { ActivePropertyProvider } from "./useActiveProperty"
import { useIsMobile } from "@/hooks/use-mobile"
import type { Location } from "@/lib/mockLocations"

const LeafletMap = dynamic(() => import("./Map"), { ssr: false })

export default function ExploreClient() {
  const isMobile = useIsMobile()
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  // Reset panel state when switching between mobile and desktop
  useEffect(() => {
    setIsPanelOpen(false)
  }, [isMobile])

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
  }

  return (
    <ActivePropertyProvider>
      {isMobile ? (
        <div className="relative h-[calc(100vh-64px)] bg-[#F8F8FF] p-3">
          {/* Map with padding and rounded corners on mobile */}
          <div className="absolute inset-3 z-0 rounded-2xl overflow-hidden shadow-lg">
            <LeafletMap selectedLocation={selectedLocation} />
          </div>

          {/* Mobile slide-up panel */}
          <MobilePanel isOpen={isPanelOpen} setIsOpen={setIsPanelOpen}>
            <PropertyList />
          </MobilePanel>
        </div>
      ) : (
        // Desktop layout with search section
  <div
    className="
      h-[calc(100vh-64px)] flex flex-col
      mx-auto max-w-7xl px-4   /* ← margin‑auto centers, px-4 = 1rem side padding */
    "
  >
    {/* Search / Filters section */}
    <SearchSection onLocationSelect={handleLocationSelect} />

    {/* Map + Property list */}
    <div className="flex-1 grid grid-cols-[2fr_1fr] gap-4">
      {/* अब दुबै घटकमाथि wrapper‑को padding लागू हुन्छ */}
      <LeafletMap selectedLocation={selectedLocation} />

      {/* list छुट्टै scroll हुन चाहिँ overflow‑y दिइराख्नुस् */}
      <div className="overflow-y-auto">
        <PropertyList />
      </div>
    </div>
  </div>
      )}
    </ActivePropertyProvider>
  )
}