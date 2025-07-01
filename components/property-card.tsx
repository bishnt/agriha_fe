"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bed, Bath, Square, Home } from "lucide-react"
import type { Property } from "@/lib/types"

interface PropertyCardProps {
  property: Property
  onViewDetails?: (propertyId: string) => void
}

export default function PropertyCard({ property, onViewDetails }: PropertyCardProps) {
  const handleViewDetails = () => {
    onViewDetails?.(property.id)
  }

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 rounded-lg">
      <div className="relative h-48">
        <Image src={property.imageUrl || "/placeholder.svg"} alt={property.title} fill className="object-cover" />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-md text-sm font-medium text-gray-800 shadow-sm">
          {property.location}
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        <div className="space-y-1">
          <div className="text-xl font-bold text-gray-900 tracking-tight">
            {property.currency}. {property.price.toLocaleString()}
            <span className="text-sm font-normal text-gray-600 ml-1">{property.priceType}</span>
          </div>
          <div className="text-gray-800 font-medium text-sm">
            {property.bedrooms} Bedroom, {property.bathrooms} Bathroom
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <Square className="w-3.5 h-3.5" />
            <span className="font-medium">
              {property.area} {property.areaUnit}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span className="font-medium">Room</span>
          </div>
          <div className="flex items-center gap-1">
            <Bed className="w-3.5 h-3.5" />
            <span className="font-medium">{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-3.5 h-3.5" />
            <span className="font-medium">{property.isAttached ? "Attached" : "Shared"}</span>
          </div>
        </div>

        <Button
          onClick={handleViewDetails}
          variant="outline"
          className="w-full border-[#002B6D] text-[#002B6D] hover:bg-[#002B6D] hover:text-white bg-transparent font-semibold text-sm py-2.5 rounded-lg transition-all duration-200"
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  )
}
