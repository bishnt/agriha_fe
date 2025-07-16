"use client"

import dynamic from "next/dynamic"
import PropertyList from "./PropertyList"
import { ActivePropertyProvider } from "./useActiveProperty"

const LeafletMap = dynamic(() => import("./Map"), { ssr: false })

export default function ExploreClient() {
  return (
    <ActivePropertyProvider>
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] h-[calc(100vh-64px)]">
        {/* Map */}
        <LeafletMap />
        {/* Cards */}
        <PropertyList />
      </div>
    </ActivePropertyProvider>
  )
}
