"use client";

import { useState, useEffect } from "react";
import type { Property } from "@/lib/types";
import HeroSection from "@/components/hero-section";
import PropertyGrid from "@/components/property-grid";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface HomePageClientProps {
  initialProperties: Property[];
}

export default function HomePageClient({ initialProperties }: HomePageClientProps) {
  const {} = useAuth();
  const [mounted, setMounted] = useState(false);
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Initialize with server-side data only
    setProperties(initialProperties);
  }, [initialProperties]);

  const handleViewDetails = (propertyId: string) => {
    router.push(`/property/${propertyId}`);
  };


  const handleSearch = (query: string) => {
    setLoading(true);

    setTimeout(() => {
      if (query.trim()) {
        const filtered = initialProperties.filter(
          (property) =>
            property.address?.toLowerCase().includes(query.toLowerCase()) ||
            property.propertyName?.toLowerCase().includes(query.toLowerCase()) ||
            property.city?.toLowerCase().includes(query.toLowerCase())
        );
        setProperties(filtered);
      } else {
        setProperties(initialProperties);
      }
      setLoading(false);
    }, 500);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#002B6D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading AGRIHA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection 
        onSearch={handleSearch}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <PropertyGrid
          properties={properties}
          loading={loading}
          onViewDetails={handleViewDetails}
        />
      </main>
    </div>
  );
}
