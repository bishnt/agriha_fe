"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FilterCriteria, FilterPopupProps } from "@/lib/types"

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
      <DialogContent className="sm:max-w-[430px] w-[85%] rounded-xl p-5 max-h-[70vh] overflow-y-auto">
        <div className="grid gap-4 py-4">
          {/* Distance Radius */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="distance" className="text-sm font-medium text-gray-700">Distance Radius (km)</Label>
            <Input
              id="distance"
              type="number"
              value={filters.distanceRadius}
              onChange={(e) => setFilters({ ...filters, distanceRadius: Number(e.target.value) })}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#002B6D] focus:border-transparent"
              placeholder="e.g., 5"
            />
          </div>

          {/* Price Range */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="priceRange" className="text-sm font-medium text-gray-700">Price Range</Label>
            <div className="flex items-center gap-3">
              <Input
                id="minPrice"
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
                className="w-1/2 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#002B6D] focus:border-transparent"
              />
              <span className="text-gray-500 font-semibold">-</span>
              <Input
                id="maxPrice"
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                className="w-1/2 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#002B6D] focus:border-transparent"
              />
            </div>
          </div>

          {/* Bedrooms */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bedrooms" className="text-sm font-medium text-gray-700">Bedrooms</Label>
            <Input
              id="bedrooms"
              type="number"
              value={filters.bedrooms}
              onChange={(e) => setFilters({ ...filters, bedrooms: Number(e.target.value) })}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#002B6D] focus:border-transparent"
              placeholder="e.g., 3"
            />
          </div>

          {/* Bathrooms */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bathrooms" className="text-sm font-medium text-gray-700">Bathrooms</Label>
            <Input
              id="bathrooms"
              type="number"
              value={filters.bathrooms}
              onChange={(e) => setFilters({ ...filters, bathrooms: Number(e.target.value) })}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#002B6D] focus:border-transparent"
              placeholder="e.g., 2"
            />
          </div>

          {/* Area Range */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="areaRange" className="text-sm font-medium text-gray-700">Area (m²)</Label>
            <div className="flex items-center gap-3">
              <Input
                id="minArea"
                type="number"
                placeholder="Min Area"
                value={filters.minArea}
                onChange={(e) => setFilters({ ...filters, minArea: Number(e.target.value) })}
                className="w-1/2 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#002B6D] focus:border-transparent"
              />
              <span className="text-gray-500 font-semibold">-</span>
              <Input
                id="maxArea"
                type="number"
                placeholder="Max Area"
                value={filters.maxArea}
                onChange={(e) => setFilters({ ...filters, maxArea: Number(e.target.value) })}
                className="w-1/2 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#002B6D] focus:border-transparent"
              />
            </div>
          </div>

          {/* Is Attached Bathroom */}
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="isAttached"
              checked={filters.isAttached}
              onCheckedChange={(checked) => setFilters({ ...filters, isAttached: Boolean(checked) })}
              className="w-4 h-4 rounded-md border-gray-400 data-[state=checked]:bg-[#002B6D] data-[state=checked]:text-white"
            />
            <Label htmlFor="isAttached" className="text-sm font-medium text-gray-700">Attached Bathroom</Label>
          </div>

          {/* Property Type */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-gray-700">Property Type</Label>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {['Room', 'Apartment', 'House', 'Villa', 'Studio', 'Penthouse', 'Commercial', 'Office'].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={filters.type.includes(type)}
                    onCheckedChange={(checked) => handleTypeChange(type, Boolean(checked))}
                    className="w-4 h-4 rounded-md border-gray-400 data-[state=checked]:bg-[#002B6D] data-[state=checked]:text-white"
                  />
                  <Label htmlFor={`type-${type}`} className="text-sm font-medium text-gray-700">{type}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-between gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            onClick={resetFilters}
            className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg px-5 py-2.5 text-sm font-semibold shadow-sm"
          >
            Reset
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            className="flex-1 bg-[#002B6D] hover:bg-[#001a4d] text-white rounded-lg px-5 py-2.5 text-sm font-semibold shadow-md"
          >
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilterPopup;