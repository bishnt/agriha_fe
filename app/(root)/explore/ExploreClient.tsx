// app/explore/ExploreClient.tsx
"use client"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import PropertyList from "./PropertyList"
import MobilePanel from "./MobilePanel"
import SearchSectionComponent from "./SearchSection"
import { ActivePropertyProvider } from "./useActiveProperty"
import { useIsMobile } from "@/hooks/use-mobile"
import { Location, Property } from "@/lib/types"

interface MapProps {
  selectedLocation?: Location | null
  properties?: Property[]
}

const PropertyMap = dynamic<MapProps>(() => import("./Map").then(mod => mod.default), { ssr: false });

interface ExploreClientProps {
  initialProperties: Property[]
}

export default function ExploreClient({ initialProperties }: ExploreClientProps) {
  const isMobile = useIsMobile()
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [properties, setProperties] = useState<Property[]>(initialProperties)
  const [originalProperties] = useState<Property[]>(initialProperties) // Keep original for filtering

  useEffect(() => {
    setIsPanelOpen(false)
  }, [isMobile])

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
  }

  return (
    <ActivePropertyProvider>
      {isMobile ? (
        <div className="relative h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="absolute inset-0 z-0">
            <PropertyMap selectedLocation={selectedLocation} properties={properties} />
          </div>
          
          <MobilePanel 
            isOpen={isPanelOpen} 
            setIsOpen={setIsPanelOpen}
            // Bubble location selection from mobile search to map
            onLocationSelect={handleLocationSelect}
            setProperties={setProperties}
            originalProperties={originalProperties}
          >
            <div className="h-full flex flex-col">
              <PropertyList />
            </div>
          </MobilePanel>
        </div>
      ) : (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 to-slate-100">
          {/* Search section */}
          <div className="p-4 pb-2">
            <SearchSectionComponent 
              onLocationSelect={handleLocationSelect} 
              setProperties={setProperties}
              originalProperties={originalProperties}
            />
          </div>
          
          {/* Main content area - changed width ratios here */}
          <div className="flex-1 flex overflow-hidden px-4 pb-4 gap-4">
            {/* Map container - now 60% width */}
            <div className="w-[60%] h-full rounded-2xl overflow-hidden shadow-lg">
              <PropertyMap selectedLocation={selectedLocation} properties={properties} />
            </div>
            
            {/* PropertyList container - now 40% width */}
            <div className="w-[40%] h-full overflow-hidden">
              <PropertyList />
            </div>
          </div>
        </div>
      )}
    </ActivePropertyProvider>
  )
}