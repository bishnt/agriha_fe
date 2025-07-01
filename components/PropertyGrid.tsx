"use client";
import { useState, useEffect } from "react";
import PropertyCard from "./PropertyCard";

// Mock data type
interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  imageUrl: string;
}

// Mock data
const mockProperties: Property[] = [
  {
    id: "1",
    title: "Cozy Studio Apartment",
    price: 15000,
    location: "Thamel, Kathmandu",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=250&fit=crop"
  },
  {
    id: "2",
    title: "Modern 2BHK Flat",
    price: 25000,
    location: "Lalitpur, Patan",
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=250&fit=crop"
  },
  {
    id: "3",
    title: "Single Room Near College",
    price: 8000,
    location: "Baneshwor, Kathmandu",
    imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=250&fit=crop"
  },
  {
    id: "4",
    title: "Luxury Apartment",
    price: 35000,
    location: "Durbarmarg, Kathmandu",
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=250&fit=crop"
  },
  {
    id: "5",
    title: "Shared Room",
    price: 6000,
    location: "Kirtipur, Kathmandu",
    imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=250&fit=crop"
  },
  {
    id: "6",
    title: "Family House",
    price: 45000,
    location: "Bhaktapur",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=250&fit=crop"
  }
];

// Mock hook to simulate GraphQL query
function useMockPropertiesQuery() {
  const [data, setData] = useState<{ properties: Property[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      try {
        setData({ properties: mockProperties });
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return { data, loading, error };
}

export default function PropertyGrid() {
  const { data, loading, error } = useMockPropertiesQuery();
  
  if (loading) {
    return (
      <section className="py-10 px-6">
        <div className="container-mobile">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (error) {
    return (
      <section className="py-10 px-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-mobile bg-blue-500 text-white hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 px-6">
              <div className="container-mobile">
        <h2 className="text-2xl font-bold mb-6 text-center">Available Properties</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.properties.map((property) => (
            <PropertyCard
              key={property.id}
              title={property.title}
              price={`NRS. ${property.price.toLocaleString()} / month`}
              location={property.location}
              imageUrl={property.imageUrl}
            />
          ))}
        </div>
      </div>
    </section>
  );
}