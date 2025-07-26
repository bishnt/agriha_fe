// app/agent/dashboard/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@apollo/client";
import PropertyCard from "@/components/PropertyCard";
import { Property, FilterCriteria } from "@/lib/types"; // Adjusted import path to match the new structure
import { mockProperties } from "@/lib/mockData";
import {
  GET_AGENT_PROPERTIES_QUERY,
  DELETE_PROPERTY_MUTATION,
  UPDATE_PROPERTY_MUTATION,
} from "@/lib/graphql";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Filter,
  Grid,
  List,
  Search,
  PencilLine,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import FilterPopup from "@/components/filters";

type SortOption = "relevant" | "recently-posted" | "most-popular";

const AgentDashboard = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid"); // Default to desktop grid

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeSort, setActiveSort] = useState<SortOption>("relevant");

  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false); // State for sort dropdown
  const sortDropdownRef = useRef<HTMLDivElement>(null); // Ref for sort dropdown

  // Filter criteria state
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({
    distanceRadius: 0,
    minPrice: 0,
    maxPrice: 1000000,
    bedrooms: 0,
    bathrooms: 0,
    minArea: 0,
    maxArea: 10000,
    isAttached: false,
    type: [],
  });

  /** -----------------------------
   * GraphQL — Queries & Mutations
   * ----------------------------*/
  const {
    data: queryData,
    loading: queryLoading,
    error: queryError,
    refetch,
  } = useQuery(GET_AGENT_PROPERTIES_QUERY, {
    variables: { agentId: "current-agent-id" }, // Replace with dynamic agent ID
    onCompleted: (data) => {
      if (data?.agentProperties) {
        setProperties(data.agentProperties);
      } else {
        setProperties(mockProperties); // Fallback to mock data
      }
    },
    onError: (err) => {
      console.error("Error fetching agent properties:", err);
      setProperties(mockProperties); // Fallback to mock data on error
    },
  });

  const [deleteProperty, { loading: deleteLoading }] = useMutation(
    DELETE_PROPERTY_MUTATION,
    {
      update(cache, { data }) {
        if (data?.deleteProperty?.id) {
          cache.modify({
            fields: {
              agentProperties(existingRefs = [], { readField }) {
                return existingRefs.filter(
                  (ref: any) => readField("id", ref) !== data.deleteProperty.id
                );
              },
            },
          });
          setProperties((prev) =>
            prev.filter((p) => p.id !== data.deleteProperty.id)
          );
        }
      },
      onCompleted: () => {
        toast.success("Property deleted successfully");
      },
      onError: () => {
        toast.error("Failed to delete property. Please try again.");
      },
    }
  );

  /** -----------------------------
   * Handlers
   * ----------------------------*/
  const handleEdit = (property: Property) => {
    // Redirect to edit page with property ID
    window.location.href = `/agent/editProperty/${property.id}`;
  };

  const handleDelete = async (id: number) => {
    const proceed = window.confirm(
      "Are you sure you want to delete this listing? This cannot be undone."
    );
    if (!proceed) return;

    try {
      await deleteProperty({ variables: { id } });
    } catch (err) {
      // Error is handled by onError in useMutation
    }
  };

  const handleSortChange = useCallback((sortOption: SortOption) => {
    setActiveSort(sortOption);
    setIsSortDropdownOpen(false); // Close dropdown on selection
  }, []);

  // Handle filter application
  const handleApplyFilters = (filters: FilterCriteria) => {
    setFilterCriteria(filters);
    setIsFilterOpen(false);
  };

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };

    if (isSortDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSortDropdownOpen]);

  /** -----------------------------
   * Filtering & Search
   * ----------------------------*/
  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatusFilter =
      filterStatus === "all" || property.status === filterStatus;

    // Apply advanced filters
    const matchesPriceFilter = 
      property.price >= filterCriteria.minPrice && 
      property.price <= filterCriteria.maxPrice;

    const matchesBedroomFilter = 
      filterCriteria.bedrooms === 0 || property.bedrooms >= filterCriteria.bedrooms;

    const matchesBathroomFilter = 
      filterCriteria.bathrooms === 0 || property.bathrooms >= filterCriteria.bathrooms;

    const matchesAreaFilter = 
      (!property.area || property.area >= filterCriteria.minArea) && 
      (!property.area || property.area <= filterCriteria.maxArea);

    const matchesTypeFilter = 
      filterCriteria.type.length === 0 || 
      filterCriteria.type.includes(property.propertyType);

    const matchesAttachedFilter = 
      !filterCriteria.isAttached || property.isAttached === filterCriteria.isAttached;

    return matchesSearch && 
           matchesStatusFilter && 
           matchesPriceFilter && 
           matchesBedroomFilter && 
           matchesBathroomFilter && 
           matchesAreaFilter && 
           matchesTypeFilter && 
           matchesAttachedFilter;
  });

  const sortedAndFilteredProperties = [...filteredProperties].sort((a, b) => {
    switch (activeSort) {
      case "recently-posted":
        return (new Date(b.createdAt || 0).getTime() || 0) - (new Date(a.createdAt || 0).getTime() || 0);
      case "most-popular":
        return (b.views || 0) - (a.views || 0);
      case "relevant":
      default:
        return 0;
    }
  });


  /** -----------------------------
   * Render
   * ----------------------------*/
  // Main container classes for the property cards.
  const propertiesContainerClasses =
    viewMode === "grid"
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" // Desktop: multi-column grid (Image 3 style cards)
      : "space-y-4"; // Desktop: single-column stack (Image 1 style cards)

  // Skeleton classes should also reflect the view mode
  const skeletonCardLayoutClass = viewMode === "list" ? 'flex flex-row' : 'flex flex-col md:flex-row lg:flex-col';
  const skeletonImageWidthClass = viewMode === "list" ? 'w-2/5' : 'w-full md:w-2/5 lg:w-full';
  const skeletonImageHeightClass = viewMode === 'list' ? 'h-auto' : 'h-48';
  const skeletonContentWidthClass = viewMode === "list" ? 'w-3/5' : 'w-full md:w-3/5 lg:w-full';


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Manage Your Property Listings
              </h1>
              <p className="text-gray-600">
                Efficiently oversee and update your property portfolio.
              </p>
            </div>
            <div className="mt-4 lg:mt-0">
              <Link href="/agent/listProperty">
                <Button size="lg">
                  <Plus className="h-5 w-5 mr-2" /> Add New Property
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by city, neighborhood, address, or property name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002b6d] focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002b6d] focus:border-transparent text-sm"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="rented">Rented</option>
                <option value="sold">Sold</option>
                <option value="pending">Pending</option>
              </select>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsFilterOpen(true)}
              >
                <Filter className="h-4 w-4 mr-2" /> More Filters
              </Button>

              {/* View toggle */}
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${
                    viewMode === "grid"
                      ? "bg-[#002b6d] text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  title="Grid View"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${
                    viewMode === "list"
                      ? "bg-[#002b6d] text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Count and Sort */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {sortedAndFilteredProperties.length} of {properties.length} properties
          </p>

          {/* Sort Dropdown - Moved here */}
          <div className="relative inline-block text-left" ref={sortDropdownRef}>
            <div>
              <button
                type="button"
                className="inline-flex justify-center items-center gap-x-1.5 text-sm font-semibold text-gray-900"
                id="menu-button"
                aria-expanded={isSortDropdownOpen}
                aria-haspopup="true"
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              >
                  <span className="capitalize">{activeSort.replace('-', ' ')}</span>
                <svg className="-mr-1 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {isSortDropdownOpen && (
              <div
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="menu-button"
                tabIndex={-1}
              >
                <div className="py-1" role="none">
                  <button
                    onClick={() => handleSortChange("relevant")}
                    className={`block px-4 py-2 text-sm w-full text-left ${activeSort === "relevant" ? "bg-gray-100 text-[#002B6D]" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"}`}
                    role="menuitem"
                    tabIndex={-1}
                    id="menu-item-0"
                  >
                    Relevant
                  </button>
                  <button
                    onClick={() => handleSortChange("recently-posted")}
                    className={`block px-4 py-2 text-sm w-full text-left ${activeSort === "recently-posted" ? "bg-gray-100 text-[#002B6D]" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"}`}
                    role="menuitem"
                    tabIndex={-1}
                    id="menu-item-1"
                  >
                    Recently Posted
                  </button>
                  <button
                    onClick={() => handleSortChange("most-popular")}
                    className={`block px-4 py-2 text-sm w-full text-left ${activeSort === "most-popular" ? "bg-gray-100 text-[#002B6D]" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"}`}
                    role="menuitem"
                    tabIndex={-1}
                    id="menu-item-2"
                  >
                    Most Popular
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* End Sort Dropdown */}
        </div>


        {/* Property Listings */}
        {queryLoading && sortedAndFilteredProperties.length === 0 ? (
          <div className={propertiesContainerClasses}>
            {[...Array(viewMode === "list" ? 3 : 6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md h-auto animate-pulse overflow-hidden"
              >
                {/* Skeleton structure mimics PropertyCard's internal responsive behavior */}
                <div className={skeletonCardLayoutClass}>
                  <div className={`relative flex-shrink-0 min-h-[120px] bg-gray-200 ${skeletonImageWidthClass} ${skeletonImageHeightClass}`} />
                  <div className={`p-4 space-y-2 ${skeletonContentWidthClass}`}>
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-6 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {sortedAndFilteredProperties.length > 0 ? (
              <div className={propertiesContainerClasses}>
                {sortedAndFilteredProperties.map((property) => (
                  <div key={property.id} className="relative group">
                    <PropertyCard property={property} isDesktopListView={viewMode === "list"} />
                    {/* CRUD actions overlay */}
                    <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => handleEdit(property)}
                      >
                        <PencilLine className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDelete(property.id)}
                        disabled={deleteLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No properties found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || filterStatus !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "You haven't listed any properties yet."}
                  </p>
                  <Link href="/agent/listProperty">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" /> List Your First Property
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}

        {/* Pagination (placeholder) */}
        {sortedAndFilteredProperties.length > 0 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                Previous
              </button>
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  className={`px-3 py-2 border rounded-lg text-sm ${
                    page === 1
                      ? "bg-[#002b6d] text-white border-[#002b6d]"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Popup */}
      <FilterPopup
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={filterCriteria}
      />
    </div>
  );
};

export default AgentDashboard;