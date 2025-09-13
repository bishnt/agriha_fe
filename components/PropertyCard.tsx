// components/PropertyCard.tsx
"use client"

import Image from "next/image"
import React from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bed, Bath, Square, Home, Heart, MapPin } from "lucide-react"
import type { Property } from "@/lib/types"

interface PropertyCardProps {
  property: Property;
  onViewDetails?: (propertyId: string) => void;
  onToggleLike?: (propertyId: string, isLiked: boolean) => void;
  isDesktopListView?: boolean; // True when desktop is in "list" mode (Image 1 style)
  isActive?: boolean; // Indicates if the card is active/selected
}

export default function PropertyCard({ property, onViewDetails, onToggleLike, isDesktopListView = false, isActive = false }: PropertyCardProps) {

  const handleCardClick = () => {
    onViewDetails?.(property.id.toString());
  }

  const handleViewDetails = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click when clicking button
    onViewDetails?.(property.id.toString());
  }

  const handleLikeClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click when clicking heart
    onToggleLike?.(property.id.toString(), !property.isLiked);
  };

  // Determine property status
  const getPropertyStatus = () => {
    if (property.isForRent) return "FOR RENT";
    if (property.isForSale) return "FOR SALE";
    return property.status?.toUpperCase() || "AVAILABLE";
  };

  return (
    <Card 
      className={`overflow-hidden shadow-sm transition-all duration-200 border border-gray-200 rounded-lg cursor-pointer ${isActive ? 'ring-2 ring-[#002B6D]' : 'hover:shadow-lg'}`}
      onClick={handleCardClick}
    >
      {/*
        Main card inner layout:
        - Mobile: Always flex-row (image left, details right)
        - Desktop Grid (isDesktopListView=false): flex-col (image top, details below)
        - Desktop List (isDesktopListView=true): flex-row (image left, details right, full width)
      */}
      <div className={`
        ${isDesktopListView ? 'flex flex-row' : 'flex flex-col md:flex-row lg:flex-col'}
      `}>
        {/* Image Wrapper */}
        <div className={`
          relative flex-shrink-0 min-h-[120px]
          ${isDesktopListView
            ? 'w-2/5 h-auto' // Desktop List: Image takes 2/5 width
            : 'w-full h-48 md:w-2/5 md:h-auto lg:w-full lg:h-48' // Mobile/Desktop Grid: Mobile image 2/5, Desktop Grid image w-full h-48. MD breakpoint is for switching to list for narrow desktop only.
          }
        `}>
          <Image
            src={property.imageUrl || "/images/property.interior.jpg"}
            alt={property.title}
            fill
            className="object-cover"
          />
          {/* Status Badge - Top Right */}
          <div className="absolute top-2 right-2 bg-gray-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
            {getPropertyStatus()}
          </div>
          {/* Price Overlay - Bottom Left */}
          <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md shadow-lg">
            <div className="text-sm font-bold text-gray-900">
              NRs. {property.price.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">
              {property.priceType}
            </div>
          </div>
        </div>

        {/* CardContent */}
        <CardContent className={`
          py-3 px-4 flex flex-col justify-between
          ${isDesktopListView
            ? 'w-3/5' // Desktop List: Content takes 3/5 width
            : 'w-full md:w-3/5 lg:w-full md:p-4' // Mobile/Desktop Grid: Content takes w-full, then 3/5 on narrow desktop, then w-full on larger desktop
          }
        `}>
          <div>
            {/* Property Title - Single line with ellipsis */}
            <h3 className="text-base font-semibold text-gray-900 leading-tight mb-2 md:text-xl md:font-bold truncate" title={property.title}>
              {property.title}
            </h3>

            {/* Location */}
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="truncate">{property.address}</span>
            </div>

            {/* Details layout */}
            <div className={`
              grid grid-cols-2 gap-y-2 items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-100
              ${isDesktopListView
                ? '' // No extra classes needed for desktop list view
                : 'md:flex md:items-center md:justify-between' // Desktop Grid: flex row for details
              }
            `}>
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

          {/* Buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleViewDetails}
              className="flex-grow bg-[#002B6D] text-white hover:bg-transparent hover:text-[#002B6D] hover:border-[#002B6D] border-[#002B6D] font-semibold text-sm py-2.5 rounded-lg transition-all duration-200"
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
