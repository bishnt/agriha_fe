'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PropertyFormData, Property } from '@/lib/types';
import { UPDATE_PROPERTY_MUTATION } from '@/lib/graphql';
import { ArrowLeft, Save, MapPin, DollarSign, Home, Image as ImageIcon, Check, XCircle } from 'lucide-react';
import { 
  Wifi, AirVent, Car, Dumbbell, ShieldCheck, Monitor, Droplets, BatteryFull,
  Trees, Layout, Bone, Shirt, Microwave, Tv, Sun, Network, Gamepad2
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Fuse from 'fuse.js';
import { toast } from 'sonner';
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// These imports tell Next.js to bundle the images
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for default Leaflet icons
// Ensure this runs only client-side
if (typeof window !== 'undefined') {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x.src,
    iconUrl: markerIcon.src,
    shadowUrl: markerShadow.src,
  });
};

// Dynamic imports for map components
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// Amenities with icons
const AMENITIES = [
  { name: 'WiFi', icon: <Wifi className="h-5 w-5" /> },
  { name: 'Air Conditioning', icon: <AirVent className="h-5 w-5" /> },
  { name: 'Parking', icon: <Car className="h-5 w-5" /> },
  { name: 'Swimming Pool' },
  { name: 'Gym', icon: <Dumbbell className="h-5 w-5" /> },
  { name: 'Security', icon: <ShieldCheck className="h-5 w-5" /> },
  { name: 'CCTV', icon: <Monitor className="h-5 w-5" /> },
  { name: 'Elevator' },
  { name: 'Water Supply', icon: <Droplets className="h-5 w-5" /> },
  { name: 'Backup Electricity', icon: <BatteryFull className="h-5 w-5" /> },
  { name: 'Garden', icon: <Trees className="h-5 w-5" /> },
  { name: 'Balcony', icon: <Layout className="h-5 w-5" /> },
  { name: 'Pet Friendly', icon: <Bone className="h-5 w-5" /> },
  { name: 'Laundry', icon: <Shirt className="h-5 w-5" /> },
  { name: 'Kitchen Appliances', icon: <Microwave className="h-5 w-5" /> },
  { name: 'TV', icon: <Tv className="h-5 w-5" /> },
  { name: 'Heating', icon: <Sun className="h-5 w-5" /> },
  { name: 'Internet', icon: <Network className="h-5 w-5" /> },
  { name: 'Playground', icon: <Gamepad2 className="h-5 w-5" /> }
];

const propertyTypes = [
  'Hostel', 'Flat', 'Room', 'Apartment', 'Villa', 'House', 'Studio', 'Penthouse',
  'Commercial', 'Office', 'Shop', 'Land', 'Warehouse'
];

const furnishingOptions = [
  'Unfurnished', 'Semi-furnished', 'Fully Furnished', 'Luxury Furnished', 'Attached'
];

const nepalProvinces = [
  'Koshi Province', 'Madhesh Province', 'Bagmati Province', 'Gandaki Province',
  'Lumbini Province', 'Karnali Province', 'Sudurpashchim Province'
];

interface EditPropertyClientProps {
  property: Property;
}

const EditPropertyClient = ({ property }: EditPropertyClientProps) => {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  // Use the provided property for initial state
  const propertyToEdit = property;

  const [formData, setFormData] = useState<PropertyFormData>({
    propertyName: propertyToEdit?.propertyName || '',
    propertyType: property.propertyType || 'Apartment',
    description: property.description || '',
    price: property.price || 0,
    isForRent: property.isForRent || false,
    isForSale: property.isForSale || true,
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    kitchen: property.kitchen || 0,
    floor: property.floor || 0,
    furnishing: property.furnishing || '',
    area: property.area || 0,
    city: property.city || '',
    state: property.state || '',
    country: property.country || 'Nepal',
    address: property.address || '',
    landmark: property.landmark || '',
    latitude: property.latitude || 0,
    longitude: property.longitude || 0,
    status: property.status || 'available',
    isActive: property.isActive !== undefined ? property.isActive : true,
    isFeatured: property.isFeatured || false,
    photos: [],
    amenities: property.ammenities || []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>([]);
  const [amenitiesSearch, setAmenitiesSearch] = useState('');
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(
    propertyToEdit?.latitude && propertyToEdit?.longitude 
      ? [propertyToEdit.latitude, propertyToEdit.longitude] 
      : null
  );
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [tempMarkerPosition, setTempMarkerPosition] = useState<[number, number] | null>(null);

  // Refs for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apollo Client mutation for updating property
  const [updateProperty, { loading: mutationLoading }] = useMutation(UPDATE_PROPERTY_MUTATION, {
    onCompleted: (data) => {
      if (data?.updateProperty) {
        toast.success('Property updated successfully!');
        router.push('/agent/dashboard');
      }
    },
    onError: (error) => {
      console.error('Error updating property:', error);
      toast.error('Error updating property. Please try again.');
    }
  });

  // Filter amenities based on search
  const filteredAmenities = AMENITIES.filter(amenity =>
    amenity.name.toLowerCase().includes(amenitiesSearch.toLowerCase())
  );

  const visibleAmenities = showAllAmenities 
    ? filteredAmenities 
    : filteredAmenities.slice(0, 8);

  // Toggle amenity selection
  const toggleAmenity = (amenityName: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities?.includes(amenityName)
        ? prev.amenities.filter(a => a !== amenityName)
        : [...(prev.amenities || []), amenityName]
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : type === 'number'
          ? parseFloat(value) || 0
          : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name as keyof typeof prev]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.propertyName.trim()) {
      newErrors.propertyName = 'Property name is required';
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.isForRent && !formData.isForSale) {
      newErrors.listingType = 'Please select if property is for rent or sale';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please correct the errors in the form.');
      return;
    }

    try {
      await updateProperty({
        variables: {
          id: parseInt(propertyId),
          input: {
            ...formData,
            photos: formData.photos // This needs to be an array of image URLs after actual upload
          }
        }
      });
    } catch (error) {
      console.error('Error updating property:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/agent/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Edit Property</h1>
          <p className="text-sm md:text-base text-gray-600">
            Update your property details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center space-x-2 mb-4 md:mb-6">
              <Home className="h-5 w-5 text-[#002b6d]" />
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="md:col-span-2">
                <label htmlFor="propertyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Property Name *
                </label>
                <Input
                  id="propertyName"
                  name="propertyName"
                  value={formData.propertyName}
                  onChange={handleInputChange}
                  placeholder="e.g., Luxury Apartment in Downtown"
                  className={errors.propertyName ? 'border-red-500' : ''}
                />
                {errors.propertyName && (
                  <p className="text-red-500 text-sm mt-1">{errors.propertyName}</p>
                )}
              </div>

              <div>
                <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type *
                </label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#002b6d] focus:border-transparent"
                >
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="furnishing" className="block text-sm font-medium text-gray-700 mb-2">
                  Furnishing
                </label>
                <select
                  id="furnishing"
                  name="furnishing"
                  value={formData.furnishing}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#002b6d] focus:border-transparent"
                >
                  <option value="">Select furnishing</option>
                  {furnishingOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your property..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Pricing & Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center space-x-2 mb-4 md:mb-6">
              <DollarSign className="h-5 w-5 text-[#002b6d]" />
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Pricing & Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price (Rs.) *
                </label>
                <Input
                  id="price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  className={errors.price ? 'border-red-500' : ''}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>

              <div>
                <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
                  Area (sq. m)
                </label>
                <Input
                  id="area"
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="Enter area in square meters"
                />
              </div>

              <div>
                <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <Input
                  id="bedrooms"
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  placeholder="Number of bedrooms"
                />
              </div>

              <div>
                <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <Input
                  id="bathrooms"
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  placeholder="Number of bathrooms"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Listing Type *
                </label>
                <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isForSale"
                      checked={formData.isForSale}
                      onChange={() => handleCheckboxChange('isForSale')}
                      className="h-4 w-4 text-[#002b6d] border-gray-300 rounded focus:ring-[#002b6d]"
                    />
                    <label htmlFor="isForSale" className="ml-2 text-sm text-gray-700">
                      For Sale
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isForRent"
                      checked={formData.isForRent}
                      onChange={() => handleCheckboxChange('isForRent')}
                      className="h-4 w-4 text-[#002b6d] border-gray-300 rounded focus:ring-[#002b6d]"
                    />
                    <label htmlFor="isForRent" className="ml-2 text-sm text-gray-700">
                      For Rent
                    </label>
                  </div>
                </div>
                {errors.listingType && (
                  <p className="text-red-500 text-sm mt-1">{errors.listingType}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center space-x-2 mb-4 md:mb-6">
              <MapPin className="h-5 w-5 text-[#002b6d]" />
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Location</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Enter city"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#002b6d] focus:border-transparent ${errors.state ? 'border-red-500' : ''}`}
                >
                  <option value="">Select Province</option>
                  {nepalProvinces.map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter full address"
                  rows={3}
                  className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="submit"
              disabled={mutationLoading}
              className="flex-1 sm:flex-none bg-[#002b6d] hover:bg-[#001a4d] text-white font-semibold py-3 px-8"
            >
              <Save className="h-5 w-5 mr-2" />
              {mutationLoading ? 'Updating Property...' : 'Update Property'}
            </Button>
            <Link href="/agent/dashboard" className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full py-3 px-8">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPropertyClient;
