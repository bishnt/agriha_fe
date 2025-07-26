'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PropertyFormData, Property } from '@/lib/types';
import { mockProperties } from '@/lib/mockData';
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
}

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

const EditProperty = () => {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  // Find the property to edit from mock data
  const propertyToEdit = mockProperties.find(p => p.id === parseInt(propertyId));

  const [formData, setFormData] = useState<PropertyFormData>({
    propertyName: propertyToEdit?.propertyName || '',
    propertyType: propertyToEdit?.propertyType || 'Apartment',
    description: propertyToEdit?.description || '',
    price: propertyToEdit?.price || 0,
    isForRent: propertyToEdit?.isForRent || false,
    isForSale: propertyToEdit?.isForSale || true,
    bedrooms: propertyToEdit?.bedrooms || 0,
    bathrooms: propertyToEdit?.bathrooms || 0,
    kitchen: propertyToEdit?.kitchen || 0,
    floor: propertyToEdit?.floor || 0,
    furnishing: propertyToEdit?.furnishing || '',
    area: propertyToEdit?.area || 0,
    city: propertyToEdit?.city || '',
    state: propertyToEdit?.state || '',
    country: propertyToEdit?.country || 'Nepal',
    address: propertyToEdit?.address || '',
    landmark: propertyToEdit?.landmark || '',
    latitude: propertyToEdit?.latitude || 0,
    longitude: propertyToEdit?.longitude || 0,
    status: propertyToEdit?.status || 'available',
    isActive: propertyToEdit?.isActive || true,
    isFeatured: propertyToEdit?.isFeatured || false,
    photos: [],
    amenities: propertyToEdit?.ammenities || []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [amenitiesSearch, setAmenitiesSearch] = useState('');
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(
    propertyToEdit?.latitude && propertyToEdit?.longitude 
      ? [propertyToEdit.latitude, propertyToEdit.longitude] 
      : null
  );
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [tempMarkerPosition, setTempMarkerPosition] = useState<[number, number] | null>(null);

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

  // General input change handler
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

    // Clear error for the current field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name as keyof PropertyFormData]
    }));
  };

  // Function to confirm the selected location from the map
  const confirmLocation = () => {
    if (tempMarkerPosition) {
      setFormData(prev => ({
        ...prev,
        latitude: tempMarkerPosition[0],
        longitude: tempMarkerPosition[1]
      }));
      setSelectedLocation(tempMarkerPosition);
      setIsSelectingLocation(false);
      setTempMarkerPosition(null);
    }
  };

  // Function to reset location selection
  const resetLocationSelection = () => {
    setIsSelectingLocation(false);
    setTempMarkerPosition(null);
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
    if (!formData.latitude || !formData.longitude) {
      newErrors.location = 'Please select a location on the map';
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

  // Custom MapClickHandler component to get map click events
  const MapClickHandler = ({ onClick }: { onClick: (latlng: [number, number]) => void }) => {
    const { useMapEvents } = require('react-leaflet');
    const mapEvents = useMapEvents({
      click: (e: any) => {
        onClick([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  };

  // Map component that updates view when selectedLocation changes
  const MapViewUpdater = ({ center }: { center: [number, number] }) => {
    const { useMap } = require('react-leaflet');
    const map = useMap();
    useEffect(() => {
      if (map) {
        map.setView(center, 16);
      }
    }, [center, map]);
    return null;
  };

  // If property not found, show error
  if (!propertyToEdit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-6">The property you're trying to edit doesn't exist.</p>
          <Link href="/agent/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/agent/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Property</h1>
          <p className="text-gray-600">
            Update your property details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Home className="h-5 w-5 text-[#002b6d]" />
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* Pricing & Listing Type */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <DollarSign className="h-5 w-5 text-[#002b6d]" />
              <h2 className="text-xl font-semibold text-gray-900">Pricing & Listing Type</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Listing Type *
                </label>
                <div className="flex space-x-6">
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

          {/* Property Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Home className="h-5 w-5 text-[#002b6d]" />
              <h2 className="text-xl font-semibold text-gray-900">Property Details</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
                  min="0"
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
                  min="0"
                />
              </div>

              <div>
                <label htmlFor="kitchen" className="block text-sm font-medium text-gray-700 mb-2">
                  Kitchens
                </label>
                <Input
                  id="kitchen"
                  type="number"
                  name="kitchen"
                  value={formData.kitchen}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>

              <div>
                <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-2">
                  Floor
                </label>
                <Input
                  id="floor"
                  type="number"
                  name="floor"
                  value={formData.floor}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="flex items-center text-xl font-semibold text-gray-900 mb-6">
              <Wifi className="h-5 w-5 mr-2 text-[#002b6d]" />
              Amenities
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Amenities
              </label>
              <Input
                type="text"
                placeholder="Search amenities..."
                value={amenitiesSearch}
                onChange={(e) => setAmenitiesSearch(e.target.value)}
                className="mb-4"
              />
              
              {/* Selected amenities as badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.amenities?.map(amenityName => {
                  const amenity = AMENITIES.find(a => a.name === amenityName);
                  return (
                    <div 
                      key={amenityName} 
                      className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {amenity?.icon && <span className="mr-1">{amenity.icon}</span>}
                      {amenityName}
                      <button 
                        type="button" 
                        onClick={() => toggleAmenity(amenityName)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
              
              {/* Amenities options with icons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {visibleAmenities.map(({ name, icon }) => (
                  <div 
                    key={name}
                    onClick={() => toggleAmenity(name)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors flex items-center space-x-2 ${
                      formData.amenities?.includes(name)
                        ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200'
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                    }`}
                  >
                    <div className={`p-2 rounded-md ${
                      formData.amenities?.includes(name) 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {icon}
                    </div>
                    <span className="text-sm font-medium">{name}</span>
                  </div>
                ))}
              </div>

              {/* Show More/Less toggle */}
              {filteredAmenities.length > 8 && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {showAllAmenities ? 'Show Less' : 'Show More...'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <MapPin className="h-5 w-5 text-[#002b6d]" />
              <h2 className="text-xl font-semibold text-gray-900">Location</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Enter country"
                  readOnly
                />
              </div>

              <div>
                <label htmlFor="landmark" className="block text-sm font-medium text-gray-700 mb-2">
                  Landmark
                </label>
                <Input
                  id="landmark"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  placeholder="Enter landmark"
                />
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

              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Property Location on Map *
                  </label>
                  {errors.location && (
                    <p className="text-red-500 text-sm">{errors.location}</p>
                  )}
                  {!isSelectingLocation ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSelectingLocation(true)}
                      className="bg-[#002b6d] text-white hover:bg-[#003c9a] focus:ring-[#002b6d]"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Set Exact Location
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={resetLocationSelection}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={confirmLocation}
                        disabled={!tempMarkerPosition}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Confirm Location
                      </Button>
                    </div>
                  )}
                </div>

                <div className="h-96 rounded-md overflow-hidden border border-gray-300">
                  {/* Ensure MapContainer renders only on client-side to avoid SSR issues with Leaflet */}
                  {typeof window !== 'undefined' && (
                    <MapContainer
                      center={selectedLocation || [27.7172, 85.3240]} // Default to Kathmandu, Nepal
                      zoom={selectedLocation ? 16 : 12}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />

                      {isSelectingLocation && <MapClickHandler onClick={(latlng) => setTempMarkerPosition(latlng)} />}

                      {/* Show the confirmed marker if not in selection mode */}
                      {selectedLocation && !isSelectingLocation && (
                        <Marker position={selectedLocation}>
                          <Popup>Your Property Location</Popup>
                        </Marker>
                      )}

                      {/* Show the temporary marker during selection */}
                      {isSelectingLocation && tempMarkerPosition && (
                        <Marker position={tempMarkerPosition}>
                          <Popup>Selected Location</Popup>
                        </Marker>
                      )}

                      {/* Update map view to selected location if it changes and not in selection mode */}
                      {selectedLocation && !isSelectingLocation && (
                        <MapViewUpdater center={selectedLocation} />
                      )}
                    </MapContainer>
                  )}
                </div>

                {errors.location && (
                  <p className="text-red-500 text-sm mt-2">{errors.location}</p>
                )}

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <Input
                      id="latitude"
                      type="number"
                      step="0.000001"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      readOnly
                      placeholder="Automatically set by map"
                    />
                  </div>
                  <div>
                    <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.000001"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      readOnly
                      placeholder="Automatically set by map"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Settings</h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={() => handleCheckboxChange('isActive')}
                  className="h-4 w-4 text-[#002b6d] border-gray-300 rounded focus:ring-[#002b6d]"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Make property active immediately
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFeatured"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={() => handleCheckboxChange('isFeatured')}
                  className="h-4 w-4 text-[#002b6d] border-gray-300 rounded focus:ring-[#002b6d]"
                />
                <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-700">
                  Feature this property (additional charges may apply)
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link href="/agent/dashboard">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={mutationLoading} size="lg">
              {mutationLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating Property...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Property
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;
