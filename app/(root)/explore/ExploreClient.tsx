"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import PropertyList from "./PropertyList"
import MobilePanel from "./MobilePanel"
import { ActivePropertyProvider } from "./useActiveProperty"
import { useIsMobile } from "@/hooks/use-mobile"

const LeafletMap = dynamic(() => import("./Map"), { ssr: false })

export default function ExploreClient() {
  const isMobile = useIsMobile()
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  // Reset panel state when switching between mobile and desktop
  useEffect(() => {
    setIsPanelOpen(false)
  }, [isMobile])

  return (
    <ActivePropertyProvider>
      {isMobile ? (
        <div className="relative h-[calc(100vh-64px)] bg-[#F8F8FF] p-3">
          {/* Map with padding and rounded corners on mobile */}
          <div className="absolute inset-3 z-0 rounded-2xl overflow-hidden shadow-lg">
            <LeafletMap />
          </div>

          {/* Mobile slide-up panel */}
          <MobilePanel isOpen={isPanelOpen} setIsOpen={setIsPanelOpen}>
            <PropertyList />
          </MobilePanel>
        </div>
      ) : (
        // Desktop layout remains unchanged
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] h-[calc(100vh-64px)]">
          <LeafletMap />
          <PropertyList />
        </div>
      )}
    </ActivePropertyProvider>
  )
}
