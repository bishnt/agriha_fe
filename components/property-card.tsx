"use client"

import Image from "next/image"
import React from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bed, Bath, Square, Home, Heart } from "lucide-react"
import type { Property } from "@/lib/types"

interface PropertyCardProps {
  property: Property;
  onViewDetails?: (propertyId: string) => void;
  onToggleLike?: (propertyId: string, isLiked: boolean) => void;
}

export default function PropertyCard({ property, onViewDetails, onToggleLike }: PropertyCardProps) {

  const handleViewDetails = () => {
    onViewDetails?.(property.id.toString());
  }

  const handleLikeClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click when clicking heart
    onToggleLike?.(property.id.toString(), !property.isLiked);
  };

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 rounded-lg">
      <div className="flex flex-row md:block"> {/* This enables side-by-side on mobile, stacked on desktop */}
        <div className="relative w-2/5 flex-shrink-0 h-auto min-h-[120px] md:w-full md:h-48">
          <Image
            src={property.imageUrl || "/images/property.interior.jpg"}
            alt={property.title}
            fill
            className="object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-xs font-medium text-gray-800 shadow-sm">
            {property.address}
          </div>
        </div>

        <CardContent className="py-3 px-4 md:p-4 w-3/5 md:w-full flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 leading-tight mb-2 md:text-xl md:font-bold">
              {property.title}
            </h3>

            <div className="text-base font-bold text-gray-800 mb-3 md:text-xl">
              NRs. {property.price.toLocaleString()}
              <span className="text-xs font-normal text-gray-600 ml-1 md:text-sm">{property.priceType}</span>
            </div>

            {/* Mobile / Desktop details layout */}
            <div className="grid grid-cols-2 gap-y-2 items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-100
                    md:flex md:items-center md:justify-between md:text-xs md:pt-2 md:border-t md:border-gray-100">
              <div className="flex items-center gap-1 md:gap-0.5 flex-shrink-0">
                <Square className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-medium text-xs">
                  {property.area}{property.areaUnit}
                </span>
              </div>
              <div className="flex items-center gap-1 md:gap-0.5 flex-shrink-0">
                <Home className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-medium">{property.type}</span>
              </div>
              <div className="flex items-center gap-1 md:gap-0.5 flex-shrink-0">
                <Bed className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-medium">{property.bedrooms}</span>
              </div>
              <div className="flex items-center gap-1 md:gap-0.5 flex-shrink-0">
                <Bath className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-medium text-xs whitespace-nowrap">{property.isAttached ? "Attached" : "Shared"}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4 md:hidden"> {/* Mobile buttons */}
            <Button
              onClick={handleViewDetails}
              variant="outline"
              className="flex-grow border-[#002B6D] text-[#002B6D] hover:bg-[#002B6D] hover:text-white bg-transparent font-semibold text-sm py-2.5 rounded-lg transition-all duration-200"
            >
              View Details
            </Button>

            <Button
              onClick={handleLikeClick}
              variant="outline"
              size="icon"
              className="border-[#002B6D] hover:bg-[#002B6D] group flex-shrink-0" // Added group for hover effects on child
              aria-label={property.isLiked ? "Unlike property" : "Like property"}
            >
              <Heart className={`w-5 h-5 transition-all duration-200 ${property.isLiked ? 'fill-[#002B6D] text-[#002B6D] group-hover:fill-white group-hover:text-white' : 'text-[#002B6D] group-hover:text-white'}`} />
            </Button>
          </div>

          {/* Desktop buttons with heart - now conditionally rendered based on screen size */}
          <div className="hidden md:flex gap-2 mt-4">
            <Button
              onClick={handleViewDetails}
              variant="outline"
              className="flex-grow border-[#002B6D] text-[#002B6D] hover:bg-[#002B6D] hover:text-white bg-transparent font-semibold text-sm py-2.5 rounded-lg transition-all duration-200"
            >
              View Details
            </Button>
            <Button
              onClick={handleLikeClick}
              variant="outline"
              size="icon"
              className="border-[#002B6D] hover:bg-[#002B6D] group flex-shrink-0"
              aria-label={property.isLiked ? "Unlike property" : "Like property"}
            >
              <Heart className={`w-5 h-5 transition-all duration-200 ${property.isLiked ? 'fill-[#002B6D] text-[#002B6D] group-hover:fill-white group-hover:text-white' : 'text-[#002B6D] group-hover:text-white'}`} />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}