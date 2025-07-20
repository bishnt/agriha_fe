// app/explore/PropertyList.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { mockProperties } from "@/lib/mockData1";
import PropertyCard from "@/components/property-card";
import useActiveProperty from "./useActiveProperty";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

const TOGGLE_LIKE = gql/* GraphQL */ `
  mutation ToggleLike($id: ID!, $isLiked: Boolean!) {
    toggleLike(id: $id, isLiked: $isLiked)
  }
`;

export default function PropertyList() {
  const [activeId, setActiveId] = useActiveProperty();
  const listRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const isMobile = useIsMobile();

  const [currentPage, setCurrentPage] = useState(1);
  // 3 rows: Mobile = 3 items (3 rows × 1 col), Desktop = 6 items (3 rows × 2 cols)
  const itemsPerPage = isMobile ? 3 : 6;

  const [toggleLike] = useMutation(TOGGLE_LIKE, {
    optimisticResponse: () => ({
      toggleLike: true,
      __typename: "Mutation",
    }),
  });

  const handleToggle = (id: string, isLiked: boolean) =>
    toggleLike({ variables: { id, isLiked: !isLiked } });

  const scrollTo = (id: number) => {
    const el = cardRefs.current[id];
    if (el && listRef.current) {
      // Calculate the position relative to the scrollable container
      const containerRect = listRef.current.getBoundingClientRect();
      const elementRect = el.getBoundingClientRect();
      const scrollTop = listRef.current.scrollTop;
      
      const targetScrollTop = scrollTop + (elementRect.top - containerRect.top) - 20; // 20px offset
      
      listRef.current.scrollTo({
        top: targetScrollTop,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    if (activeId) scrollTo(activeId);
  }, [activeId]);

  const totalPages = Math.ceil(mockProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties = mockProperties.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      // Scroll to top of the scrollable container
      if (listRef.current) {
        listRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      // Scroll to top of the scrollable container
      if (listRef.current) {
        listRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100 p-2">
      <div className="h-full bg-white rounded-2xl shadow-lg ring-1 ring-black/5 backdrop-blur-sm border border-white/20 flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="flex-shrink-0">
          {!isMobile ? (
            <div className="p-6 pb-4 flex items-center justify-between bg-white border-b border-slate-100 rounded-t-2xl">
              <h2 className="text-xl font-semibold text-slate-900">
                {mockProperties.length} Properties Found
              </h2>
              <select className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Sort: Relevant</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
              </select>
            </div>
          ) : (
            <div className="p-4 pb-3 flex items-center justify-between bg-white border-b border-slate-100 rounded-t-2xl">
              <span className="text-sm font-medium text-slate-900">
                {mockProperties.length} properties
              </span>
              <select className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Relevant</option>
                <option>Price: Low to High</option>
                <option>Newest</option>
              </select>
            </div>
          )}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div 
            ref={listRef} 
            className={`h-full overflow-y-auto ${isMobile ? "p-3" : "p-6"}`}
          >
            {/* Cards Grid Layout */}
            <div className={`grid ${isMobile ? "grid-cols-1 gap-3" : "grid-cols-2 gap-6"} min-h-0`}>
              {currentProperties.map((p) => (
                <div
                  key={p.id}
                  ref={(el) => {
                    cardRefs.current[p.id] = el;
                  }}
                >
                  <PropertyCard
                    property={p}
                    onToggleLike={handleToggle}
                  />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 pb-6">
                <Button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-slate-200 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-700 font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
                <Button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-slate-200 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}