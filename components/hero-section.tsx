"use client"

import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, MapPin, TrendingUp } from "lucide-react"
import FilterPopup from "@/components/filters"
import { Location, FilterCriteria, HeroSectionProps } from "@/lib/types"

// Popular locations data
const popularLocations: Location[] = [
  {
    id: "thamel-1", name: "Thamel", city: "Kathmandu", state: "Bagmati", country: "Nepal",
    latitude: 27.7155, longitude: 85.3113, description: "Tourist hub with boutique hotels & nightlife",
    propertyCount: 240, type: "Neighborhood"
  },
  {
    id: "bouddha-1", name: "Boudhanath", city: "Kathmandu", state: "Bagmati", country: "Nepal",
    latitude: 27.7198, longitude: 85.3629, description: "Peaceful area surrounding Boudhanath Stupa",
    propertyCount: 180, type: "Landmark"
  },
  {
    id: "pulchowk-1", name: "Pulchowk", city: "Lalitpur", state: "Bagmati", country: "Nepal",
    latitude: 27.675, longitude: 85.317, description: "Lalitpur's commercial & educational center",
    propertyCount: 95, type: "Neighborhood"
  },
  {
    id: "pashupati-1", name: "Pashupatinath Temple", city: "Kathmandu", state: "Bagmati", country: "Nepal",
    latitude: 27.7107, longitude: 85.3475, description: "Historic Hindu temple complex",
    propertyCount: 50, type: "Landmark"
  },
];

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function HeroSection({
  onSearch,
  onApplyFilters,
  heroImage = "/images/hero-building.png",
}: HeroSectionProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSearchType, setActiveSearchType] = useState<'mobile' | 'desktop' | 'hero' | null>(null);
  
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const desktopSearchInputRef = useRef<HTMLInputElement>(null);
  const heroSearchInputRef = useRef<HTMLInputElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

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

  // Scroll effect for sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      if (heroSectionRef.current) {
        const heroBottom = heroSectionRef.current.offsetTop + heroSectionRef.current.offsetHeight;
        setIsScrolled(window.scrollY > heroBottom - 100);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Search results effect
  useEffect(() => {
    const fetchNominatimData = async () => {
      if (debouncedSearchQuery.length < 3) {
        setSearchResults([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const nominatimApiUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            debouncedSearchQuery,
          )}&format=json&limit=10&addressdetails=1&viewbox=85.25,27.65,85.45,27.75&bounded=1&countrycodes=np`;

        const response = await fetch(nominatimApiUrl);
        const data = await response.json();

        const formattedResults: Location[] = data.map((item: any) => ({
          id: item.osm_id.toString(),
          name: item.name || item.display_name.split(',')[0],
          city: item.address.city || item.address.town || item.address.village || '',
          state: item.address.state || '',
          country: item.address.country || '',
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          description: item.display_name,
          propertyCount: 0,
          type: item.type,
        }));
        setSearchResults(formattedResults);
      } catch (error) {
        console.error("Error fetching Nominatim data:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    if (debouncedSearchQuery) {
      fetchNominatimData();
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isMobileContainer = mobileContainerRef.current?.contains(target);
      const isDesktopContainer = desktopContainerRef.current?.contains(target);
      const isHeroContainer = heroContainerRef.current?.contains(target);
      
      if (!isMobileContainer && !isDesktopContainer && !isHeroContainer) {
        setActiveSearchType(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLocationClick = (location: Location) => {
    const query = location.description || `${location.name}, ${location.city}`;
    setSearchQuery(query);
    setActiveSearchType(null);
    // Redirect to explore page with search query
    router.push(`/explore?search=${encodeURIComponent(query)}`);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("search") as string;
    
    if (query.trim()) {
      setActiveSearchType(null);
      onSearch?.(query);
      // Redirect to explore page with search query
      router.push(`/explore?search=${encodeURIComponent(query)}`);
    }
  };

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSearchFocus = (searchType: 'mobile' | 'desktop' | 'hero') => {
    setActiveSearchType(searchType);
  };

  const handleApplyFilters = (filters: FilterCriteria) => {
    console.log("Applying filters:", filters);
    onApplyFilters?.(filters);
  };

  const SearchInput = ({ searchType }: { searchType: 'mobile' | 'desktop' | 'hero' }) => {
    const inputRef = searchType === 'mobile' ? mobileSearchInputRef : 
                    searchType === 'desktop' ? desktopSearchInputRef : heroSearchInputRef;
    const containerRef = searchType === 'mobile' ? mobileContainerRef : 
                        searchType === 'desktop' ? desktopContainerRef : heroContainerRef;
    const showRecommendations = activeSearchType === searchType;
    
    return (
      <div ref={containerRef} className="relative w-full">
        <Input
          ref={inputRef}
          name="search"
          type="text"
          placeholder="Search by location, landmarks"
          value={searchQuery}
          onChange={(e) => handleSearchInputChange(e.target.value)}
          onFocus={() => handleSearchFocus(searchType)}
          className={searchType === 'mobile' 
            ? "w-full h-auto text-base border-0 focus:ring-0 bg-transparent pr-8 placeholder:text-gray-500 placeholder:text-sm shadow-none"
            : searchType === 'desktop'
            ? "h-12 pl-4 pr-4 text-base border-0 rounded-lg focus:ring-2 focus:ring-[#002B6D] focus:border-transparent bg-transparent placeholder:text-gray-500 shadow-none"
            : "h-12 pl-4 pr-4 text-base border-0 rounded-lg focus:ring-2 focus:ring-[#002B6D] focus:border-transparent bg-transparent placeholder:text-gray-500 shadow-none"
          }
        />
        
        {showRecommendations && (
          <div
            className={`absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-xl shadow-lg max-h-80 overflow-y-auto ${
              searchType === 'hero' ? 'z-[9999]' : 'z-[1001]'
            }`}
          >
            {searchQuery === "" ? (
              <div className="p-4">
                <div className="flex items-center gap-2 text-gray-700 font-medium text-sm mb-3">
                  <TrendingUp className="h-4 w-4" />
                  Popular Locations
                </div>
                {popularLocations.map((location) => (
                  <div
                    key={location.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-start transition-colors duration-150"
                    onClick={() => handleLocationClick(location)}
                  >
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1 mr-2" />
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm leading-tight">
                        {location.name}
                      </h4>
                      <p className="text-xs text-gray-600 leading-tight">
                        {location.description || `${location.city}, ${location.city}`}
                      </p>
                      {location.propertyCount && (
                        <span className="text-xs text-gray-500 mt-1 block">
                          {location.propertyCount} properties
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center p-4 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="p-2">
                {searchResults.map((location) => (
                  <div
                    key={location.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors duration-150 flex items-start"
                    onClick={() => handleLocationClick(location)}
                  >
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1 mr-2" />
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm leading-tight">
                        {location.name}
                      </h4>
                      <p className="text-xs text-gray-600 leading-tight">
                        {location.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              searchQuery.length >= 3 && (
                <div className="p-4 text-gray-500 text-sm">
                  No results found for "{searchQuery}"
                </div>
              )
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Sticky Search Bar and Filter Button */}
      <div className="lg:hidden sticky top-0 left-0 right-0 z-50 bg-white p-4 shadow-md">
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="flex-grow">
            <div className="w-full bg-white rounded-lg shadow-[0px_1px_4px_0px_rgba(12,12,13,0.05)] shadow-[0px_1px_4px_0px_rgba(12,12,13,0.10)] flex items-center">
              <div className="relative flex-grow">
                <SearchInput searchType="mobile" />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#002B6D] hover:bg-[#001a4d] text-white rounded-full w-6 h-6 flex items-center justify-center p-0"
                >
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.25 11.25L8.625 8.625M10.5 5.75C10.5 8.375 8.375 10.5 5.75 10.5C3.125 10.5 1 8.375 1 5.75C1 3.125 3.125 1 5.75 1C8.375 1 10.5 3.125 10.5 5.75Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
              </div>
            </div>
          </form>
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
                <SearchInput searchType="desktop" />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#002B6D] hover:bg-[#001a4d] text-white rounded-full w-6 h-6 flex items-center justify-center p-0"
                >
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.25 11.25L8.625 8.625M10.5 5.75C10.5 8.375 8.375 10.5 5.75 10.5C3.125 10.5 1 8.375 1 5.75C1 3.125 3.125 1 5.75 1C8.375 1 10.5 3.125 10.5 5.75Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
              </div>
            </div>
          </form>
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
                <div className="w-full px-3 py-3 bg-white rounded-lg shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] inline-flex justify-center items-center gap-6">
                  <div
                    data-show-icon="False"
                    data-state="Enabled"
                    data-style="Filled"
                    className="w-[484px] bg-white rounded-lg overflow-hidden outline outline-2 outline-offset-[-1px] outline-sky-900 inline-flex flex-col justify-center items-center gap-2"
                  >
                    <SearchInput searchType="hero" />
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
            <div className="relative rounded-[32px] overflow-hidden w-[90vw] max-w-[650px] aspect-[16/9] top-1/2 left-[50%] -translate-y-1/2 -translate-x-1/2">
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