// app/explore/SearchSection.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Search, SlidersHorizontal, MapPin, TrendingUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Location, Property } from "@/lib/types"
// import { gql, useLazyQuery } from "@apollo/client"; // Uncomment when backend is ready
import { mockProperties } from "@/lib/mockData1"; // Needed for simulation, remove after backend integration

interface SearchSectionProps {
  onLocationSelect: (location: Location) => void
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
}

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

/*
// Define your GraphQL query for fetching properties with filters
const GET_FILTERED_PROPERTIES = gql`
  query GetFilteredProperties(
    $locationLatitude: Float,
    $locationLongitude: Float,
    $searchQuery: String,
    $propertyType: String, // e.g., "for_sale", "for_rent"
    $minPrice: Float,
    $maxPrice: Float,
    $bedrooms: Int,
    $bathrooms: Int
    // Add other filter variables as needed
  ) {
    properties(
      locationLatitude: $locationLatitude,
      locationLongitude: $locationLongitude,
      searchQuery: $searchQuery,
      propertyType: $propertyType,
      minPrice: $minPrice,
      maxPrice: $maxPrice,
      bedrooms: $bedrooms,
      bathrooms: $bathrooms
    ) {
      id
      title
      address
      price
      priceType
      bedrooms
      bathrooms
      latitude
      longitude
      // Add other fields you expect from your backend
    }
  }
`;
*/

export default function SearchSection({ onLocationSelect, setProperties }: SearchSectionProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [activePropertyType, setActivePropertyType] = useState<"for_sale" | "for_rent" | null>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Initialize GraphQL hook (commented out)
  // const [fetchFilteredProperties, { loading: propertiesLoading, data: propertiesData, error: propertiesError }] = useLazyQuery(GET_FILTERED_PROPERTIES);


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

  /*
  // Effect to trigger backend call when filters change
  useEffect(() => {
    const fetchPropertiesBasedOnFilters = async () => {
      const variables = {
        locationLatitude: selectedLocation?.latitude, // You might need to manage selectedLocation state here or pass it
        locationLongitude: selectedLocation?.longitude,
        searchQuery: debouncedSearchQuery,
        propertyType: activePropertyType,
        // Add other filter states here (minPrice, maxPrice, bedrooms, etc.)
      };
      console.log("Fetching properties with filters:", variables);

      try {
        const { data } = await fetchFilteredProperties({ variables });
        if (data?.properties) {
          setProperties(data.properties);
          console.log("Properties fetched from backend:", data.properties);
        } else {
          setProperties([]);
          console.log("No properties found for applied filters or empty response.");
        }
      } catch (error) {
        console.error("Failed to fetch properties via GraphQL:", error);
        setProperties([]);
      }
    };

    fetchPropertiesBasedOnFilters();
  }, [debouncedSearchQuery, activePropertyType, setProperties]); // Add other filter states here
  */


  const handleLocationClick = async (location: Location) => {
    onLocationSelect(location)
    setSearchQuery(location.description || `${location.name}, ${location.city}`)
    setShowRecommendations(false)

    // --- SIMULATED BACKEND RESPONSE (REMOVE WHEN REAL BACKEND IS READY) ---
    const simulatedProperties = mockProperties.filter(p => {
      if (p.latitude === null || p.longitude === null) return false;
      const distance = Math.sqrt(
        Math.pow(p.latitude - location.latitude, 2) +
        Math.pow(p.longitude - location.longitude, 2)
      );
      return distance < 0.1;
    });
    setProperties(simulatedProperties.length > 0 ? simulatedProperties : []);
    // --- END SIMULATED BACKEND RESPONSE ---
  }

  const handleSearchFocus = () => {
    setShowRecommendations(true)
  }

  const handleSearchBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (resultsRef.current && !resultsRef.current.contains(e.relatedTarget as Node)) {
      setTimeout(() => setShowRecommendations(false), 100);
    }
  }

  const handleResultMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  }

  const handlePropertyTypeFilter = (type: "for_sale" | "for_rent") => {
    setActivePropertyType(prevType => prevType === type ? null : type); // Toggle selection
    // The useEffect listening to activePropertyType will trigger the fetch
  }

  // Generic handler for other filters
  const handleFilterClick = (filterName: string) => {
    console.log(`Filter "${filterName}" clicked`);
    // Here you would update a state variable for this filter,
    // which in turn would trigger the useEffect to call the backend.
    // E.g., setMinPrice(someValue); setMaxPrice(anotherValue);
    // For now, it just logs.
    /*
    // Example backend call (uncomment and adapt when backend is ready)
    // fetchFilteredProperties({ variables: { // ...currentFilters, [filterName]: newValue } });
    */
  }


  return (
    // Outer floating container with rounded corners and shadow
    // Padding p-6 is retained for overall height
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 mx-auto max-w-[calc(100%-32px)] md:max-w-7xl relative z-[1000] mt-4">
      {/* Centered flex container for all filter options and search bar */}
      <div className="flex items-center justify-center gap-2">
          {/* Search Bar */}
          {/*
            - Removed `w-full` from the parent div of the search input.
            - Added `flex-[2]` to the search input's container. This makes it take up twice as much
              space as a flex item with `flex-[1]`.
            - The other buttons implicitly have `flex-shrink-0` and a content-based width,
              so the search input will expand to take the remaining space, weighted at 2 parts.
              If you want the buttons to also have a flex basis, you could give them `flex-[0.5]` or `flex-[1]`
              depending on how much space you want them to occupy relative to the search bar.
            - `flex-[2]` is a TailwindCSS shorthand for `flex-grow: 2; flex-shrink: 1; flex-basis: 0%;`.
              This effectively tells the search input to grow at twice the rate of other
              `flex-grow` items, and its initial size is 0 before growth.
              Since other items have `flex-shrink-0`, they won't shrink, and the search box
              will primarily take up the remaining space.
              This approach gives a good approximation of 40% when there are multiple other
              flex items taking up space. For a more precise 40%, you might need to use
              explicit `w-[40%]` on the search container if you're willing to manage overflow
              or wrapping for the filter buttons, but a flex-based approach is generally more robust.
          */}
          <div className="relative flex-[2]"> {/* Changed from `flex-grow w-full` to `flex-[2]` */}
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              ref={searchInputRef}
              placeholder="Search by city, neighborhood, or landmark..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowRecommendations(true)
              }}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              // Default border to blue
              className="pl-9 h-10 bg-gray-50 border-2 border-[#002B6D] rounded-xl text-sm w-full
                         focus:ring-1 focus:ring-[#002B6D] transition-all duration-200"
            />
            {showRecommendations && (searchQuery.length >= 3 || searchResults.length > 0 || searchQuery === "") && (
              <div
                ref={resultsRef}
                className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-xl shadow-lg z-[1001] max-h-80 overflow-y-auto"
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
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-start"
                        onClick={() => handleLocationClick(location)}
                        onMouseDown={handleResultMouseDown}
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
                ) : loading /* || propertiesLoading */ ? (
                  <div className="flex items-center justify-center p-4 text-gray-500">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((location) => (
                    <div
                      key={location.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-start"
                      onClick={() => handleLocationClick(location)}
                      onMouseDown={handleResultMouseDown}
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
                  ))
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

          {/* Filter Pills - all on the same line */}
          <Button
            variant={activePropertyType === "for_sale" ? "default" : "outline"}
            size="sm"
            onClick={() => handlePropertyTypeFilter("for_sale")}
            className={`h-9 rounded-full text-sm flex-shrink-0 px-4 transition-colors duration-200 border-2
                        ${activePropertyType === "for_sale" ? "bg-[#002B6D] text-white border-[#002B6D]" : "bg-white border-gray-200 text-gray-700 hover:border-[#002B6D] hover:text-[#002B6D]"}`}
          >
            For Sale
          </Button>
          <Button
            variant={activePropertyType === "for_rent" ? "default" : "outline"}
            size="sm"
            onClick={() => handlePropertyTypeFilter("for_rent")}
            className={`h-9 rounded-full text-sm flex-shrink-0 px-4 transition-colors duration-200 border-2
                        ${activePropertyType === "for_rent" ? "bg-[#002B6D] text-white border-[#002B6D]" : "bg-white border-gray-200 text-gray-700 hover:border-[#002B6D] hover:text-[#002B6D]"}`}
          >
            For Rent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterClick("Price Range")}
            className="flex-shrink-0 h-9 rounded-full bg-white border-2 border-gray-200 text-gray-700
                       hover:border-[#002B6D] hover:text-[#002B6D] transition-colors duration-200 px-4"
          >
            Price Range
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterClick("Beds & Baths")}
            className="flex-shrink-0 h-9 rounded-full bg-white border-2 border-gray-200 text-gray-700
                       hover:border-[#002B6D] hover:text-[#002B6D] transition-colors duration-200 px-4"
          >
            Beds & Baths
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterClick("Home Type")}
            className="flex-shrink-0 h-9 rounded-full bg-white border-2 border-gray-200 text-gray-700
                       hover:border-[#002B6D] hover:text-[#002B6D] transition-colors duration-200 px-4"
          >
            Home Type
          </Button>
          {/* Main Filters button with icon */}
          <Button
            variant="outline"
            className="h-10 px-4 bg-white border-2 border-gray-200 rounded-xl flex-shrink-0 text-gray-700
                       hover:border-[#002B6D] hover:text-[#002B6D] transition-colors duration-200"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
      </div>
    </div>
  )
}