"use client"

import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define the Property interface as provided by the user
export interface Property {
  id: string;
  title: string;
  location: string;
  currency: string;
  price: number;
  priceType: string; // e.g., "per month"
  bedrooms: number;
  bathrooms: number;
  area: number;
  areaUnit: string; // e.g., "m2"
  isAttached: boolean; // for bathroom
  isLiked: boolean;
  type: string; // Add this new property, e.g., "Room", "Apartment", "House"
  createdAt: Date;
  views: number;
}

// Define the FilterCriteria interface for the popup
interface FilterCriteria {
  distanceRadius: number;
  minPrice: number;
  maxPrice: number;
  bedrooms: number;
  bathrooms: number;
  minArea: number;
  maxArea: number;
  isAttached: boolean;
  type: string[]; // Array to allow multiple types to be selected
}

interface HeroSectionProps {
  onSearch?: (query: string) => void;
  onApplyFilters?: (filters: FilterCriteria) => void; // New prop for applying filters
  heroImage?: string;
  title?: string;
  subtitle?: string;
}

// FilterPopup Component
interface FilterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterCriteria) => void;
  initialFilters: FilterCriteria;
}

const FilterPopup: React.FC<FilterPopupProps> = ({ isOpen, onClose, onApplyFilters, initialFilters }) => {
  const [filters, setFilters] = useState<FilterCriteria>(initialFilters);

  // Reset filters to initial state or default values
  const resetFilters = () => {
    setFilters({
      distanceRadius: 0,
      minPrice: 0,
      maxPrice: 10000,
      bedrooms: 0,
      bathrooms: 0,
      minArea: 0,
      maxArea: 1000,
      isAttached: false,
      type: [],
    });
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleTypeChange = (type: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      type: checked ? [...prev.type, type] : prev.type.filter(t => t !== type)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] w-[90%] rounded-lg p-6 max-h-[90vh] overflow-y-auto">
        {/* Removed DialogHeader and DialogTitle for a cleaner look */}
        <div className="grid gap-6 py-6"> {/* Increased gap for better spacing */}
          {/* Distance Radius */}
          <div className="flex flex-col gap-2"> {/* Changed to flex-col for better stacking on mobile */}
            <Label htmlFor="distance" className="text-base font-medium text-gray-700">Distance Radius (km)</Label>
            <Input
              id="distance"
              type="number"
              value={filters.distanceRadius}
              onChange={(e) => setFilters({ ...filters, distanceRadius: Number(e.target.value) })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-[#002B6D] focus:border-transparent"
              placeholder="e.g., 5"
            />
          </div>

          {/* Price Range */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="priceRange" className="text-base font-medium text-gray-700">Price Range</Label>
            <div className="flex items-center gap-3"> {/* Increased gap */}
              <Input
                id="minPrice"
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
                className="w-1/2 rounded-md border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-[#002B6D] focus:border-transparent"
              />
              <span className="text-gray-500 font-semibold">-</span>
              <Input
                id="maxPrice"
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                className="w-1/2 rounded-md border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-[#002B6D] focus:border-transparent"
              />
            </div>
          </div>

          {/* Bedrooms */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="bedrooms" className="text-base font-medium text-gray-700">Bedrooms</Label>
            <Input
              id="bedrooms"
              type="number"
              value={filters.bedrooms}
              onChange={(e) => setFilters({ ...filters, bedrooms: Number(e.target.value) })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-[#002B6D] focus:border-transparent"
              placeholder="e.g., 3"
            />
          </div>

          {/* Bathrooms */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="bathrooms" className="text-base font-medium text-gray-700">Bathrooms</Label>
            <Input
              id="bathrooms"
              type="number"
              value={filters.bathrooms}
              onChange={(e) => setFilters({ ...filters, bathrooms: Number(e.target.value) })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-[#002B6D] focus:border-transparent"
              placeholder="e.g., 2"
            />
          </div>

          {/* Area Range */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="areaRange" className="text-base font-medium text-gray-700">Area ($\m^2$)</Label>
            <div className="flex items-center gap-3">
              <Input
                id="minArea"
                type="number"
                placeholder="Min Area"
                value={filters.minArea}
                onChange={(e) => setFilters({ ...filters, minArea: Number(e.target.value) })}
                className="w-1/2 rounded-md border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-[#002B6D] focus:border-transparent"
              />
              <span className="text-gray-500 font-semibold">-</span>
              <Input
                id="maxArea"
                type="number"
                placeholder="Max Area"
                value={filters.maxArea}
                onChange={(e) => setFilters({ ...filters, maxArea: Number(e.target.value) })}
                className="w-1/2 rounded-md border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-[#002B6D] focus:border-transparent"
              />
            </div>
          </div>

          {/* Is Attached Bathroom */}
          <div className="flex items-center space-x-3 pt-2"> {/* Increased space-x */}
            <Checkbox
              id="isAttached"
              checked={filters.isAttached}
              onCheckedChange={(checked) => setFilters({ ...filters, isAttached: Boolean(checked) })}
              className="w-5 h-5 rounded-md border-gray-400 data-[state=checked]:bg-[#002B6D] data-[state=checked]:text-white"
            />
            <Label htmlFor="isAttached" className="text-base font-medium text-gray-700">Attached Bathroom</Label>
          </div>

          {/* Property Type */}
          <div className="flex flex-col gap-2">
            <Label className="text-base font-medium text-gray-700">Property Type</Label>
            <div className="flex flex-wrap gap-x-6 gap-y-3"> {/* Increased gaps */}
              {['Room', 'Apartment', 'House'].map((type) => (
                <div key={type} className="flex items-center space-x-3">
                  <Checkbox
                    id={`type-${type}`}
                    checked={filters.type.includes(type)}
                    onCheckedChange={(checked) => handleTypeChange(type, Boolean(checked))}
                    className="w-5 h-5 rounded-md border-gray-400 data-[state=checked]:bg-[#002B6D] data-[state=checked]:text-white"
                  />
                  <Label htmlFor={`type-${type}`} className="text-base font-medium text-gray-700">{type}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-between gap-3 pt-4 border-t border-gray-200"> {/* Added border-t for separation */}
          <Button
            type="button"
            onClick={resetFilters}
            className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg px-6 py-3 text-base font-semibold shadow-sm"
          >
            Reset
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            className="flex-1 bg-[#002B6D] hover:bg-[#001a4d] text-white rounded-lg px-6 py-3 text-base font-semibold shadow-md"
          >
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};


export default function HeroSection({
  onSearch,
  onApplyFilters,
  heroImage = "/images/hero-building.png",
}: HeroSectionProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const heroSectionRef = useRef<HTMLDivElement>(null);

  // Initial filter state
  const initialFilterState: FilterCriteria = {
    distanceRadius: 0,
    minPrice: 0,
    maxPrice: 10000,
    bedrooms: 0,
    bathrooms: 0,
    minArea: 0,
    maxArea: 1000,
    isAttached: false,
    type: [],
  };

  useEffect(() => {
    const handleScroll = () => {
      if (heroSectionRef.current) {
        // Determine scroll position relative to the hero section's bottom
        const heroBottom = heroSectionRef.current.offsetTop + heroSectionRef.current.offsetHeight;
        setIsScrolled(window.scrollY > heroBottom - 100); // Adjust 100px for a smoother transition
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("search") as string;
    onSearch?.(query);
  };

  const handleApplyFilters = (filters: FilterCriteria) => {
    console.log("Applying filters:", filters);
    onApplyFilters?.(filters);
  };

  return (
    <>
      {/* Mobile Sticky Search Bar and Filter Button */}
      <div className="lg:hidden sticky top-0 left-0 right-0 z-50 bg-white p-4 shadow-md">
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="flex-grow">
            <div className="w-full bg-white rounded-lg shadow-[0px_1px_4px_0px_rgba(12,12,13,0.05)] shadow-[0px_1px_4px_0px_rgba(12,12,13,0.10)] flex items-center">
              <div className="relative flex-grow">
                <Input
                  name="search"
                  type="text"
                  placeholder="Search by location, landmarks"
                  className="w-full h-auto text-base border-0 focus:ring-0 bg-transparent pr-8 placeholder:text-gray-500 placeholder:text-sm shadow-none"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#002B6D] hover:bg-[#001a4d] text-white rounded-full w-6 h-6 flex items-center justify-center p-0"
                >
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.25 11.25L8.625 8.625M10.5 5.75C10.5 8.375 8.375 10.5 5.75 10.5C3.125 10.5 1 8.375 1 5.75C1 3.125 3.125 1 5.75 1C8.375 1 10.5 3.125 10.5 5.75Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
              </div>
            </div>
          </form>
          {/* Mobile Filter Button */}
          <Button
            type="button"
            onClick={() => setShowFilterPopup(true)}
            className="bg-white text-gray-500 hover:bg-gray-100 rounded-lg px-3 py-1 text-sm font-semibold flex items-center gap-1 shadow-[0px_1px_4px_0px_rgba(12,12,13,0.05)] shadow-[0px_1px_4px_0px_rgba(12,12,13,0.10)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20M7 12H17M10 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Filter
          </Button>
        </div>
      </div>

      {/* Desktop Sticky Navbar with Search and Filter */}
      <nav className={`hidden lg:flex fixed top-0 left-0 right-0 z-50 bg-white shadow-md py-3 transition-all duration-300 ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center w-full">
          <form onSubmit={handleSearch} className="flex-grow max-w-2xl">
            <div className="w-full bg-white rounded-lg shadow-[0px_1px_4px_0px_rgba(12,12,13,0.05)] shadow-[0px_1px_4px_0px_rgba(12,12,13,0.10)] flex items-center">
              <div className="relative flex-grow">
                <Input
                  name="search"
                  type="text"
                  placeholder="Search by location, landmarks"
                  className="w-full h-auto text-base border-0 focus:ring-0 bg-transparent pr-8 placeholder:text-gray-500 shadow-none"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#002B6D] hover:bg-[#001a4d] text-white rounded-full w-6 h-6 flex items-center justify-center p-0"
                >
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.25 11.25L8.625 8.625M10.5 5.75C10.5 8.375 8.375 10.5 5.75 10.5C3.125 10.5 1 8.375 1 5.75C1 3.125 3.125 1 5.75 1C8.375 1 10.5 3.125 10.5 5.75Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
              </div>
            </div>
          </form>
          {/* Desktop Filter Button */}
          <Button
            type="button"
            onClick={() => setShowFilterPopup(true)}
            className="ml-4 bg-white text-gray-500 hover:bg-gray-100 rounded-lg px-3 py-1 text-sm font-semibold flex items-center gap-1 shadow-[0px_1px_4px_0px_rgba(12,12,13,0.05)] shadow-[0px_1px_4px_0px_rgba(12,12,13,0.10)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20M7 12H17M10 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Filter
          </Button>
        </div>
      </nav>

      {/* Original Hero Section (visible on desktop when not scrolled) */}
      <section ref={heroSectionRef} className={`hidden lg:block bg-gray-50 pt-20 pb-24 my-10 overflow-hidden transition-opacity duration-300 ${isScrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-8 relative z-10">
              <div className="space-y-2">
                <h1 className="font-montserrat font-extrabold text-7xl leading-none">
                  <span className="text-[#002B6D]">Find</span>
                  <span className="text-black"> Homes,</span>
                  <br/>
                  <span className="text-black">Far From </span>
                  <span className="text-[#002B6D]">Home</span>
                </h1>
              </div>

              <form onSubmit={handleSearch}>
                <div
                  className="w-full px-3 py-3 bg-white rounded-lg shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] inline-flex justify-center items-center gap-6"
                >
                  <div
                    data-show-icon="False"
                    data-state="Enabled"
                    data-style="Filled"
                    className="w-[484px] bg-white rounded-lg overflow-hidden outline outline-2 outline-offset-[-1px] outline-sky-900 inline-flex flex-col justify-center items-center gap-2"
                  >
                    <Input
                      name="search"
                      type="text"
                      placeholder="Search by location, landmarks"
                      className="h-12 pl-4 pr-4 text-base border-0 rounded-lg focus:ring-2 focus:ring-[#002B6D] focus:border-transparent bg-transparent placeholder:text-gray-500 shadow-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="h-auto bg-[#002B6D] hover:bg-[#001a4d] text-white px-8 py-4 rounded-lg font-bold text-base shadow-none transition-all duration-200 font-raleway"
                  >
                    Search
                  </Button>
                </div>
              </form>
            </div>
            <div
              className="relative rounded-[32px] overflow-hidden w-[90vw] max-w-[720px] aspect-[16/9] top-1/2 left-[39%] -translate-y-1/2 -translate-x-1/2"
            >
              <Image
                src={heroImage || "/placeholder.svg"}
                alt="Modern residential buildings"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filter Popup Component */}
      <FilterPopup
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={initialFilterState}
      />
    </>
  );
}