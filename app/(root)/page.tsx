"use client";

import { useState, useEffect } from "react";
import type { Property, SearchFilters } from "@/lib/types";
import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import PropertyGrid from "@/components/property-grid";
import MobileNavBar from "@/components/MobileNavBar";
import { useRouter } from "next/navigation";
import { mockProperties } from "@/lib/mockData"; // ✅ Import from external file

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Set initial properties after mount to avoid hydration mismatch
    setProperties(mockProperties);
  }, []);

  const handleViewDetails = (propertyId: string) => {
    window.location.href = `/property/${propertyId}`;
  };

  const handleSignIn = () => {
    router.push("/auth/signin");
  };

  const handlePostProperty = () => {
    console.log("Post property clicked");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setLoading(true);

    setTimeout(() => {
      if (query.trim()) {
        const filtered = mockProperties.filter(
          (property) =>
            property.address.toLowerCase().includes(query.toLowerCase()) ||
            property.title.toLowerCase().includes(query.toLowerCase()),
        );
        setProperties(filtered);
      } else {
        setProperties(mockProperties);
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
      <HeroSection onSearch={handleSearch} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PropertyGrid
          properties={properties}
          loading={loading}
          onViewDetails={handleViewDetails}
        />
      </main>
    </div>
  );
}
