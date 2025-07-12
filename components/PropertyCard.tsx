'use client';

import React from 'react';
import { Property } from '@/types/property';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Bed, Bath, Square, Home } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const formatPrice = (price: number) => {
    if (price >= 100000) {
      return `Rs. ${(price / 100000).toFixed(1)}L`;
    } else if (price >= 1000) {
      return `Rs. ${(price / 1000).toFixed(0)}K`;
    }
    return `Rs. ${price.toLocaleString()}`;
  };

  const getPriceLabel = () => {
    if (property.isForRent && property.isForSale) {
      return 'per-month / for sale';
    } else if (property.isForRent) {
      return 'per-month';
    } else if (property.isForSale) {
      return '';
    }
    return '';
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100">
      {/* Property Image */}
      <div className="relative h-48 bg-gray-200">
        {property.imageUrl ? (
          <img
            src={property.imageUrl}
            alt={property.propertyName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Location Badge */}
        <div className="absolute bottom-3 left-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>{property.city}, {property.state}</span>
          </div>
        </div>

        {/* Featured Badge */}
        {property.isFeatured && (
          <div className="absolute top-3 left-3 bg-[#002b6d] text-white px-2 py-1 rounded text-xs font-medium">
            Featured
          </div>
        )}

        {/* Heart Icon */}
        <button className="absolute top-3 right-3 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all">
          <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
        </button>
      </div>

      {/* Property Details */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {property.propertyName}
        </h3>

        {/* Price */}
        <div className="mb-3">
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(property.price)}
            </span>
            {getPriceLabel() && (
              <span className="text-sm text-gray-600">{getPriceLabel()}</span>
            )}
          </div>
        </div>

        {/* Property Features */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
          {property.area && (
            <div className="flex items-center space-x-1">
              <Square className="h-4 w-4" />
              <span>{property.area}m²</span>
            </div>
          )}
          
          {property.bedrooms > 0 && (
            <div className="flex items-center space-x-1">
              <Bed className="h-4 w-4" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          
          {property.bathrooms > 0 && (
            <div className="flex items-center space-x-1">
              <Bath className="h-4 w-4" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          
          {property.furnishing && (
            <div className="flex items-center space-x-1">
              <Home className="h-4 w-4" />
              <span>{property.furnishing}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1" size="sm">
            View Details
          </Button>
          <Button variant="ghost" size="icon" className="shrink-0">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;