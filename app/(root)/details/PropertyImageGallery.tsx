import React, { useState } from 'react';
import { PropertyImage } from '@/data/mockPropertyData';

interface PropertyImageGalleryProps {
  images: PropertyImage[];
}

const PropertyImageGallery: React.FC<PropertyImageGalleryProps> = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const mainImage = images[selectedImage];
  const otherImages = images.slice(1);

  return (
    <div className="grid grid-cols-2 gap-2 h-96">
      {/* Main image */}
      <div className="relative rounded-lg overflow-hidden">
        <img
          src={mainImage?.url}
          alt={mainImage?.alt}
          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
          onClick={() => setSelectedImage(0)}
        />
      </div>
      
      {/* Secondary images grid */}
      <div className="grid grid-cols-1 gap-2">
        {otherImages.slice(0, 2).map((image, index) => (
          <div key={image.id} className="relative rounded-lg overflow-hidden h-48">
            <img
              src={image.url}
              alt={image.alt}
              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
              onClick={() => setSelectedImage(index + 1)}
            />
          </div>
        ))}
        
        {/* Show more button on last image */}
        {images.length > 3 && (
          <div className="relative rounded-lg overflow-hidden h-48">
            <img
              src={otherImages[2]?.url}
              alt={otherImages[2]?.alt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white text-lg font-semibold">
                +{images.length - 3}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyImageGallery;