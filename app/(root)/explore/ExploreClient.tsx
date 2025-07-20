// app/explore/ExploreClient.tsx
"use client"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import PropertyList from "./PropertyList"
import MobilePanel from "./MobilePanel"
import SearchSectionComponent from "./SearchSection"
import { ActivePropertyProvider } from "./useActiveProperty"
import { useIsMobile } from "@/hooks/use-mobile"
import { mockProperties } from "@/lib/mockData1"
import { Location, Property } from "@/lib/types"

// Define MapProps locally to match your Map component
interface MapProps {
  selectedLocation?: Location | null
}

// Explicitly type the dynamic import for Map
const PropertyMap = dynamic<MapProps>(() => import("./Map").then(mod => mod.default), { ssr: false });

export default function ExploreClient() {
  const isMobile = useIsMobile()
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [properties, setProperties] = useState<Property[]>(mockProperties);

  useEffect(() => {
    setIsPanelOpen(false)
  }, [isMobile])

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
  }

  return (
    <ActivePropertyProvider>
      {isMobile ? (
        <div className="relative h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 to-slate-100 p-4">
          <div className="absolute inset-4 z-0 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5">
            <PropertyMap selectedLocation={selectedLocation} />
          </div>
          <MobilePanel isOpen={isPanelOpen} setIsOpen={setIsPanelOpen}>
            <PropertyList />
          </MobilePanel>
        </div>
      ) : (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 to-slate-100">
          {/* Modern rounded SearchSection */}
          <div className="p-4 pb-2">
            
              <SearchSectionComponent 
                onLocationSelect={handleLocationSelect} 
                setProperties={setProperties} 
              />
            
          </div>
          
          <div className="flex-1 flex px-4 gap-4">
            {/* Map container with modern styling */}
            <div className="w-[65%] h-full">
              <PropertyMap selectedLocation={selectedLocation} />
            </div>
            
            {/* PropertyList container with modern styling */}
            <div className="flex-1 h-full">
              <PropertyList />
            </div>
          </div>
        </div>
      )}
    </ActivePropertyProvider>
  )
}