"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bed, 
  Bath, 
  Square, 
  Home, 
  MapPin, 
  Calendar,
  Star,
  Heart,
  Share2,
  Phone,
  Mail,
  Building,
  Wifi,
  Car,
  Snowflake,
  Shield,
  Zap
} from "lucide-react";
import { Property, Review } from "@/lib/types";
import PropertyMap from "@/app/(root)/property/[id]/PropertyMap";
import ReviewSection from "@/app/(root)/property/[id]/ReviewSection";
import ContactForm from "@/app/(root)/property/[id]/ContactForm";

interface PropertyDetailsClientProps {
  property: Property;
  reviews: Review[];
  averageRating: number;
}

export default function PropertyDetailsClient({ 
  property, 
  reviews, 
  averageRating 
}: PropertyDetailsClientProps) {
  const [isLiked, setIsLiked] = useState(property.isLiked);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Mock additional images for demo - in real app, these would come from backend
  const propertyImages = [
    property.imageUrl || "/images/property-interior.jpg",
    "/images/hero-building.png",
    "/images/property-interior.jpg"
  ];

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: Implement like functionality with backend
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };

  const getPropertyStatus = () => {
    if (property.isForRent) return "FOR RENT";
    if (property.isForSale) return "FOR SALE";
    return property.status?.toUpperCase() || "AVAILABLE";
  };

  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return <Wifi className="w-4 h-4" />;
    if (amenityLower.includes('parking') || amenityLower.includes('garage')) return <Car className="w-4 h-4" />;
    if (amenityLower.includes('ac') || amenityLower.includes('air')) return <Snowflake className="w-4 h-4" />;
    if (amenityLower.includes('security') || amenityLower.includes('guard')) return <Shield className="w-4 h-4" />;
    if (amenityLower.includes('power') || amenityLower.includes('backup')) return <Zap className="w-4 h-4" />;
    return <Home className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Images */}
      <div className="relative h-[60vh] md:h-[70vh] bg-gray-900">
        <Image
          src={propertyImages[currentImageIndex]}
          alt={property.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Image Navigation */}
        {propertyImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {propertyImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-6 right-6">
          <Badge className="bg-[#002B6D] text-white px-4 py-2 text-sm font-semibold">
            {getPropertyStatus()}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-6 left-6 flex gap-2">
          <Button
            onClick={handleLike}
            variant="secondary"
            size="icon"
            className="bg-white/90 hover:bg-white"
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </Button>
          <Button
            onClick={handleShare}
            variant="secondary"
            size="icon"
            className="bg-white/90 hover:bg-white"
          >
            <Share2 className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      {property.title}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin className="w-5 h-5" />
                      <span className="text-lg">{property.address}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Listed {property.createdAt.toLocaleDateString()}</span>
                      </div>
                      {averageRating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{averageRating.toFixed(1)} ({reviews.length} reviews)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#002B6D]">
                      NRs. {property.price.toLocaleString()}
                    </div>
                    {property.priceType && (
                      <div className="text-gray-600">{property.priceType}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Features */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#002B6D]/10 rounded-lg">
                      <Bed className="w-6 h-6 text-[#002B6D]" />
                    </div>
                    <div>
                      <div className="font-semibold">{property.bedrooms}</div>
                      <div className="text-sm text-gray-600">Bedrooms</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#002B6D]/10 rounded-lg">
                      <Bath className="w-6 h-6 text-[#002B6D]" />
                    </div>
                    <div>
                      <div className="font-semibold">{property.bathrooms}</div>
                      <div className="text-sm text-gray-600">Bathrooms</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#002B6D]/10 rounded-lg">
                      <Square className="w-6 h-6 text-[#002B6D]" />
                    </div>
                    <div>
                      <div className="font-semibold">{property.area} {property.areaUnit}</div>
                      <div className="text-sm text-gray-600">Area</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#002B6D]/10 rounded-lg">
                      <Building className="w-6 h-6 text-[#002B6D]" />
                    </div>
                    <div>
                      <div className="font-semibold">Floor {property.floor}</div>
                      <div className="text-sm text-gray-600">Level</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for Details */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Property Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {property.description || "No description available for this property."}
                    </p>
                    
                    <Separator className="my-6" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Property Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Property Type:</span>
                            <span className="font-medium">{property.propertyType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Furnishing:</span>
                            <span className="font-medium">{property.furnishing || "Not specified"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Kitchen:</span>
                            <span className="font-medium">{property.kitchen}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Bathroom Type:</span>
                            <span className="font-medium">{property.isAttached ? "Attached" : "Shared"}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">Location Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">City:</span>
                            <span className="font-medium">{property.city}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">State:</span>
                            <span className="font-medium">{property.state}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Country:</span>
                            <span className="font-medium">{property.country}</span>
                          </div>
                          {property.landmark && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Landmark:</span>
                              <span className="font-medium">{property.landmark}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="amenities" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Amenities & Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {property.ammenities && property.ammenities.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {property.ammenities.map((amenity, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="p-2 bg-[#002B6D]/10 rounded-lg">
                              {getAmenityIcon(amenity)}
                            </div>
                            <span className="font-medium">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No specific amenities listed for this property.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="location" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Location & Map</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] rounded-lg overflow-hidden">
                      <PropertyMap property={property} />
                    </div>
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Address</h4>
                      <p className="text-gray-700">{property.address}</p>
                      {property.landmark && (
                        <p className="text-sm text-gray-600 mt-1">Near {property.landmark}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <ReviewSection 
                  reviews={reviews} 
                  averageRating={averageRating}
                  propertyId={property.id.toString()}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Contact & Actions */}
          <div className="space-y-6">
            {/* Contact Form */}
            <ContactForm property={property} />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-[#002B6D] hover:bg-[#002B6D]/90">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Agent
                </Button>
                <Button variant="outline" className="w-full border-[#002B6D] text-[#002B6D] hover:bg-[#002B6D] hover:text-white">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="w-full">
                  Schedule Visit
                </Button>
              </CardContent>
            </Card>

            {/* Property Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Property Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Views</span>
                  <span className="font-semibold">{property.views || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Listed</span>
                  <span className="font-semibold">{property.createdAt.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <Badge variant={property.isActive ? "default" : "secondary"}>
                    {property.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {property.isFeatured && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Featured</span>
                    <Badge className="bg-yellow-500">Featured</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
