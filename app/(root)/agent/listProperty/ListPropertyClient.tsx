'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PropertyFormData } from '@/lib/types';
import { useMap, useMapEvents } from 'react-leaflet';
import { CREATE_PROPERTY_MUTATION, GET_AGENT_PROPERTIES_QUERY } from '@/lib/graphql';
import { ArrowLeft, Save, MapPin, DollarSign, Home, Image as ImageIcon, Check, XCircle } from 'lucide-react';
import { 
  Wifi, 
  AirVent, 
  Car, 
  Dumbbell, 
  ShieldCheck, 
  Monitor, 
  Droplets, 
  BatteryFull,
  Trees,
  Layout,
  Bone,
  Shirt,
  Microwave,
  Tv,
  Sun,
  Network,
  Gamepad2
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Fuse from 'fuse.js';
import { User } from '@/lib/auth-types';
import { toast } from 'sonner';
import Image from 'next/image';

import L from "leaflet"
import "leaflet/dist/leaflet.css"

// These imports tell Next.js to bundle the images
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"

// Fix for default Leaflet icons
// Ensure this runs only client-side
if (typeof window !== 'undefined') {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x.src,
    iconUrl: markerIcon.src,
    shadowUrl: markerShadow.src,
  });
}

// Dynamically import the Map components to avoid SSR issues
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

// Nominatim API URL for landmark search
const nominatimApiUrl = 'https://nominatim.openstreetmap.org/search';
// Fallback Nepal cities list
const NEPAL_CITIES = [
  'Kathmandu', 'Pokhara', 'Lalitpur', 'Bhaktapur', 'Biratnagar', 'Birgunj', 
  'Dharan', 'Bharatpur', 'Janakpur', 'Hetauda', 'Nepalgunj', 'Butwal',
  'Dhangadhi', 'Mahendranagar', 'Baglung', 'Gorkha', 'Chitwan', 'Parsa',
  'Morang', 'Sunsari', 'Jhapa', 'Kapilvastu', 'Nawalparasi', 'Rupandehi',
  'Dang', 'Banke', 'Bardiya', 'Kailali', 'Kanchanpur', 'Dadeldhura',
  'Baitadi', 'Darchula', 'Bajhang', 'Bajura', 'Achham', 'Doti', 'Kailali'
];

interface ListPropertyClientProps {
  user: User;
}

export default function ListProperty({ user }: ListPropertyClientProps) {
  // Apollo Client mutation for creating property
  const [createProperty, { loading: mutationLoading }] = useMutation(CREATE_PROPERTY_MUTATION, {
    refetchQueries: [
      {
        query: GET_AGENT_PROPERTIES_QUERY,
        variables: {} // Remove agentId since the query doesn't support it yet
      }
    ],
    onCompleted: (data) => {
      if (data?.createProperty?.success) {
        toast.success('Property listed successfully!');
        window.location.href = '/agent/dashboard';
      } else {
        toast.error(data?.createProperty?.message || 'Error listing property');
      }
    },
    onError: (error) => {
      console.error('Error creating property:', error);
      toast.error('Failed to create property. Please try again.');
    }
  });

  const [formData, setFormData] = useState<PropertyFormData>({
    propertyName: '',
    propertyType: 'Apartment',
    description: '',
    price: 0,
    isForRent: false,
    isForSale: true,
    bedrooms: 0,
    bathrooms: 0,
    kitchen: 0,
    floor: 0,
    furnishing: '',
    area: 0,
    city: '',
    state: '', // Keeping 'state' as per request, will populate with province names
    country: 'Nepal',
    address: '',
    landmark: '',
    latitude: 0,
    longitude: 0,
    status: 'available',
    isActive: true,
    isFeatured: false,
    photos: [], // Initialize with an empty array for multiple images
    amenities: [] // Initialize with an empty array for amenities
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [landmarkSuggestions, setLandmarkSuggestions] = useState<Array<{display_name: string; lat: string; lon: string; address?: {city?: string; town?: string; village?: string; state?: string; country?: string}}>>([]);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showLandmarkSuggestions, setShowLandmarkSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [nepalCities, setNepalCities] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [tempMarkerPosition, setTempMarkerPosition] = useState<[number, number] | null>(null);

  // State for selected file names for display
  // const [selectedFileNames, setSelectedFileNames] = useState<string[]>([]);
  const [amenitiesSearch, setAmenitiesSearch] = useState('');
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  // Refs for managing focus and click-outside for suggestions
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const landmarkInputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input

// Amenities with corresponding icons
const AMENITIES = [
  { name: 'WiFi', icon: <Wifi className="h-5 w-5" /> },
  { name: 'Air Conditioning', icon: <AirVent className="h-5 w-5" /> },
  { name: 'Parking', icon: <Car className="h-5 w-5" /> },
  { name: 'Swimming Pool', },
  { name: 'Gym', icon: <Dumbbell className="h-5 w-5" /> },
  { name: 'Security', icon: <ShieldCheck className="h-5 w-5" /> },
  { name: 'CCTV', icon: <Monitor className="h-5 w-5" /> },
  { name: 'Elevator',  },
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
    'Room', 'Apartment', 'House', 'Villa', 'Studio', 'Duplex', 'Office', 'Land',
    'Flat', 'Hostel', 'Penthouse', 'Commercial', 'Shop', 'Warehouse'  // These map to valid backend enums
  ];

  // Backend enum mappings - FIXED with actual backend PropertyType enum values
  // Valid backend values: APARTMENT, HOUSE, ROOM, VILLA, OFFICE, STUDIO, DUPLEX, LAND
  const propertyTypeEnumMap: Record<string, string> = {
    'Hostel': 'HOUSE',      // Map to HOUSE since HOSTEL doesn't exist
    'Flat': 'APARTMENT',    // Map to APARTMENT since FLAT doesn't exist
    'Room': 'ROOM',         // ✅ Valid
    'Apartment': 'APARTMENT', // ✅ Valid
    'Villa': 'VILLA',       // ✅ Valid
    'House': 'HOUSE',       // ✅ Valid
    'Studio': 'STUDIO',     // ✅ Valid
    'Duplex': 'DUPLEX',     // ✅ Valid
    'Penthouse': 'APARTMENT', // Map to APARTMENT since PENTHOUSE doesn't exist
    'Commercial': 'OFFICE',  // Map to OFFICE since COMMERCIAL doesn't exist
    'Office': 'OFFICE',     // ✅ Valid
    'Shop': 'OFFICE',       // Map to OFFICE since SHOP doesn't exist
    'Land': 'LAND',         // ✅ Valid
    'Warehouse': 'OFFICE'   // Map to OFFICE since WAREHOUSE doesn't exist
  };

  // PropertyStatus enum mapping - FIXED with actual backend values
  // Valid backend values: AVAILABLE, SOLD, RENTED, PENDING
  const statusEnumMap: Record<string, string> = {
    'available': 'AVAILABLE', // ✅ Valid
    'sold': 'SOLD',           // ✅ Valid
    'rented': 'RENTED',       // ✅ Valid
    'pending': 'PENDING',     // ✅ Valid
    'inactive': 'PENDING'     // Map to PENDING since INACTIVE doesn't exist
  };

  const furnishingOptions = [
    'Unfurnished', 'Semi-furnished', 'Fully Furnished', 'Luxury Furnished', 'Attached'
  ];
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

  // Nepal's 7 Provinces (fixed list for 'state' dropdown)
  const nepalProvinces = [
    'Koshi Province', 'Madhesh Province', 'Bagmati Province', 'Gandaki Province',
    'Lumbini Province', 'Karnali Province', 'Sudurpashchim Province'
  ];

  // Initialize Nepal cities with fallback list
  useEffect(() => {
    setNepalCities(NEPAL_CITIES);
  }, []);

  // Custom MapClickHandler component to get map click events
  const MapClickHandler = ({ onClick }: { onClick: (latlng: [number, number]) => void }) => {
    useMapEvents({
      click: (e) => {
        onClick([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
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

  // Function to search landmarks using Nominatim API (for Nepal)
  const searchLandmarks = useCallback(async (query: string) => {
    if (!query.trim()) {
      setLandmarkSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `${nominatimApiUrl}?q=${encodeURIComponent(query)}&countrycodes=np&format=json&addressdetails=1`
      );
      const data = await response.json();

      // Use fuse.js for fuzzy search on the results
      const fuse = new Fuse(data, {
        keys: ['display_name'],
        threshold: 0.4
      });

      const fuzzyResults = fuse.search(query).map(result => result.item);
      setLandmarkSuggestions(fuzzyResults.length > 0 ? fuzzyResults : data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching landmarks:', error);
      setLandmarkSuggestions([]);
    }
  }, []);

  // Debounce the landmark search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.landmark) {
        searchLandmarks(formData.landmark);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [formData.landmark, searchLandmarks]);

  // Handle click outside suggestions dropdowns (both landmark and city)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          landmarkInputRef.current && !landmarkInputRef.current.contains(event.target as Node) &&
          cityInputRef.current && !cityInputRef.current.contains(event.target as Node)) {
        setShowLandmarkSuggestions(false);
        setShowCitySuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to handle landmark selection from suggestions
  const handleLandmarkSelect = (landmark: {display_name: string; lat: string; lon: string; address?: {city?: string; town?: string; village?: string; state?: string; country?: string}}) => {
    setFormData(prev => ({
      ...prev,
      landmark: landmark.display_name,
      latitude: parseFloat(landmark.lat),
      longitude: parseFloat(landmark.lon),
      city: landmark.address?.city || landmark.address?.town || landmark.address?.village || '',
      state: landmark.address?.state || '', // Keeping 'state'
      country: landmark.address?.country || 'Nepal',
      address: landmark.display_name
    }));
    setSelectedLocation([parseFloat(landmark.lat), parseFloat(landmark.lon)]);
    setShowLandmarkSuggestions(false);
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

    // Handle city suggestions
    if (name === 'city') {
      if (value.trim()) {
        // Filter cities that match the input value
        const filtered = nepalCities.filter(city => 
          city.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 10);
        setCitySuggestions(filtered);
        setShowCitySuggestions(true);
      } else {
        setCitySuggestions([]);
        setShowCitySuggestions(false);
      }
    } else {
      setShowCitySuggestions(false);
    }

    // Handle landmark suggestions
    if (name === 'landmark') {
      setShowLandmarkSuggestions(true);
    } else {
      setShowLandmarkSuggestions(false);
    }

    // Clear error for the current field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle city selection from the suggestion dropdown
  const handleCitySelect = (city: string) => {
    setFormData(prev => ({ ...prev, city }));
    setShowCitySuggestions(false);
  };

  // Handle checkbox changes (isForSale, isForRent, isActive, isFeatured)
  const handleCheckboxChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name as keyof PropertyFormData]
    }));
  };

  // Handle multiple photo selection
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const newPhotoUrls = newFiles.map(file => URL.createObjectURL(file));

    // Update formData.photos (File[])
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newFiles],
    }));

    // Update preview URLs separately
    setPhotoPreviews(prev => [...prev, ...newPhotoUrls]);

    // File names are handled by the File objects themselves

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle removing a photo from the preview
  const handleRemovePhoto = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, index) => index !== indexToRemove)
    }));
    setPhotoPreviews(prev => prev.filter((_, index) => index !== indexToRemove));
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
    if (!formData.state.trim()) { // Validate state
      newErrors.state = 'State is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.isForRent && !formData.isForSale) {
      newErrors.listingType = 'Please select if property is for rent or sale';
    }
    if (!formData.latitude || !formData.longitude || formData.latitude === 0 || formData.longitude === 0) {
      newErrors.location = 'Please select a location on the map';
    }
    if (formData.photos.length === 0) {
        newErrors.photos = 'At least one property photo is required.';
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
      // Transform form data to match backend schema
      const transformedInput = {
        // Add required accountId from authenticated user
        accountId: Number(user.id), // Ensure it's a number
        propertyName: formData.propertyName.trim(),
        propertyType: propertyTypeEnumMap[formData.propertyType] || 'APARTMENT',
        description: formData.description?.trim() || '',
        price: Number(formData.price),
        isForRent: Boolean(formData.isForRent),
        isForSale: Boolean(formData.isForSale),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        kitchen: Number(formData.kitchen),
        floor: Number(formData.floor),
        furnishing: formData.furnishing?.trim() || null, // Use null instead of empty string
        area: formData.area ? Number(formData.area) : null,
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        address: formData.address.trim(),
        landmark: formData.landmark?.trim() || null,
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null,
        status: statusEnumMap[formData.status] || 'AVAILABLE',
        isActive: Boolean(formData.isActive),
        isFeatured: Boolean(formData.isFeatured)
        // Note: photos and amenities are excluded as they're not part of CreatePropertyInput
      };


      await createProperty({
        variables: {
          input: transformedInput
        }
      });
    } catch (error) {
      console.error('Error creating property:', error);
      toast.error('Failed to create property. Please try again.');
    }
  };

  // Function to reset location selection
  const resetLocationSelection = () => {
    setIsSelectingLocation(false);
    setTempMarkerPosition(null);
  };

  // Map component that updates view when selectedLocation changes
  const MapViewUpdater = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(center, 16);
    }, [center, map]);
    return null;
  };

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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">List New Property</h1>
          <p className="text-sm md:text-base text-gray-600">
            Add your property details to list it on our platform.
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

          {/* Property Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center space-x-2 mb-4 md:mb-6">
              <Home className="h-5 w-5 text-[#002b6d]" />
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Property Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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

              <div>
                <label htmlFor="kitchen" className="block text-sm font-medium text-gray-700 mb-2">
                  Kitchen
                </label>
                <Input
                  id="kitchen"
                  type="number"
                  name="kitchen"
                  value={formData.kitchen}
                  onChange={handleInputChange}
                  placeholder="Number of kitchens"
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
                  placeholder="Floor number"
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center space-x-2 mb-4 md:mb-6">
              <Check className="h-5 w-5 text-[#002b6d]" />
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Amenities</h2>
            </div>

            <div className="mb-4">
              <Input
                placeholder="Search amenities..."
                value={amenitiesSearch}
                onChange={(e) => setAmenitiesSearch(e.target.value)}
                className="max-w-md"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
              {visibleAmenities.map((amenity) => (
                <div
                  key={amenity.name}
                  onClick={() => toggleAmenity(amenity.name)}
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    formData.amenities?.includes(amenity.name)
                      ? 'border-[#002b6d] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {amenity.icon}
                    <span className="text-sm font-medium">{amenity.name}</span>
                  </div>
                  {formData.amenities?.includes(amenity.name) && (
                    <Check className="h-4 w-4 text-[#002b6d] ml-auto" />
                  )}
                </div>
              ))}
            </div>

            {filteredAmenities.length > 8 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAllAmenities(!showAllAmenities)}
                className="mt-2"
              >
                {showAllAmenities ? 'Show Less' : `Show More (${filteredAmenities.length - 8} more)`}
              </Button>
            )}
          </div>

          {/* Photos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center space-x-2 mb-4 md:mb-6">
              <ImageIcon className="h-5 w-5 text-[#002b6d]" />
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Property Photos</h2>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Add Photos
                </Button>
                {errors.photos && (
                  <p className="text-red-500 text-sm mt-1">{errors.photos}</p>
                )}
              </div>

              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={preview}
                        alt={`Property photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                        width={200}
                        height={128}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Listing Type */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center space-x-2 mb-4 md:mb-6">
              <DollarSign className="h-5 w-5 text-[#002b6d]" />
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Pricing & Listing Type</h2>
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
              <div className="relative">
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <Input
                  ref={cityInputRef}
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
                
                {showCitySuggestions && citySuggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-50 top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg"
                  >
                    {citySuggestions.map((city, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        onClick={() => handleCitySelect(city)}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
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

              <div className="md:col-span-2 relative">
                <label htmlFor="landmark" className="block text-sm font-medium text-gray-700 mb-2">
                  Landmark
                </label>
                <Input
                  ref={landmarkInputRef}
                  id="landmark"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  placeholder="Enter landmark"
                />
                
                {showLandmarkSuggestions && landmarkSuggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-50 top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg"
                  >
                    {landmarkSuggestions.map((landmark, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        onClick={() => handleLandmarkSelect(landmark)}
                      >
                        {landmark.display_name}
                      </button>
                    ))}
                  </div>
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

            {/* Enhanced Map Section */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  📍 Property Location *
                </label>
                <div className="flex space-x-2">
                  {!isSelectingLocation ? (
                    <Button
                      type="button"
                      variant={selectedLocation ? "outline" : "default"}
                      size="sm"
                      onClick={() => setIsSelectingLocation(true)}
                      className={!selectedLocation ? "bg-[#002b6d] hover:bg-[#001a4d] text-white" : ""}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      {selectedLocation ? 'Change Location' : 'Click to Select Location'}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setIsSelectingLocation(false);
                        setTempMarkerPosition(null);
                      }}
                    >
                      Cancel Selection
                    </Button>
                  )}
                  {selectedLocation && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={resetLocationSelection}
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </div>

              {/* Location Status */}
              <div className="mb-3 p-3 rounded-lg border bg-gray-50">
                {!selectedLocation ? (
                  <div className="flex items-center text-amber-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">
                      {isSelectingLocation 
                        ? "Click anywhere on the map to select your property location"
                        : "Please select the property location on the map"}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center text-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">
                      Location selected: {selectedLocation[0].toFixed(6)}, {selectedLocation[1].toFixed(6)}
                    </span>
                  </div>
                )}
                {tempMarkerPosition && (
                  <div className="flex items-center text-[#002b6d] mt-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">
                      Click &quot;Confirm&quot; in the popup to set this as your property location
                    </span>
                  </div>
                )}
              </div>

              {/* Enhanced Map Container */}
              <div className="h-80 w-full rounded-lg overflow-hidden border-2 relative">
                {isSelectingLocation && (
                  <div className="absolute top-2 left-2 bg-[#002b6d] text-white px-3 py-1 rounded-md text-sm font-medium z-[1000] shadow-lg">
                    Click on the map to place a marker
                  </div>
                )}
                <MapContainer
                  center={selectedLocation || [27.7172, 85.3240]} // Default to Kathmandu
                  zoom={selectedLocation ? 16 : 13}
                  style={{ height: '100%', width: '100%' }}
                  className="z-0"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {isSelectingLocation && (
                    <MapClickHandler
                      onClick={(latlng) => setTempMarkerPosition(latlng)}
                    />
                  )}
                  
                  {selectedLocation && (
                    <>
                      <MapViewUpdater center={selectedLocation} />
                      <Marker position={selectedLocation}>
                        <Popup>
                          <div className="text-center">
                            <p className="font-semibold text-green-600">✅ Property Location</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Lat: {selectedLocation[0].toFixed(6)}<br />
                              Lng: {selectedLocation[1].toFixed(6)}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    </>
                  )}
                  
                  {tempMarkerPosition && (
                    <Marker position={tempMarkerPosition}>
                      <Popup>
                        <div className="text-center min-w-32">
                          <p className="font-semibold mb-2">📍 Confirm Location?</p>
                          <p className="text-xs text-gray-600 mb-3">
                            Lat: {tempMarkerPosition[0].toFixed(6)}<br />
                            Lng: {tempMarkerPosition[1].toFixed(6)}
                          </p>
                          <div className="flex space-x-2">
                            <Button size="sm" onClick={confirmLocation} className="bg-[#002b6d] hover:bg-[#001a4d]">
                              ✓ Confirm
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => setTempMarkerPosition(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
              
              {errors.location && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm font-medium flex items-center">
                    <XCircle className="h-4 w-4 mr-2" />
                    {errors.location}
                  </p>
                </div>
              )}
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
              {mutationLoading ? 'Listing Property...' : 'List Property'}
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