// app/explore/PropertyList.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import { gql, useMutation } from "@apollo/client";
import PropertyCard, { PropertyCardProps } from "@/components/property-card";
import useActiveProperty from "./useActiveProperty";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { List, Grid } from "lucide-react";

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = isMobile ? 3 : 6;

  const [toggleLike] = useMutation(TOGGLE_LIKE, {
    optimisticResponse: () => ({
      toggleLike: true,
      __typename: "Mutation",
    }),
  });

  const handleToggle: PropertyCardProps['onToggleLike'] = (id: string, isLiked: boolean) =>
    toggleLike({ variables: { id, isLiked: !isLiked } });

  const scrollTo = (id: number) => {
    const el = cardRefs.current[id];
    if (el && listRef.current) {
      const containerRect = listRef.current.getBoundingClientRect();
      const elementRect = el.getBoundingClientRect();
      const scrollTop = listRef.current.scrollTop;
      
      const targetScrollTop = scrollTop + (elementRect.top - containerRect.top) - 20;
      
      listRef.current.scrollTo({
        top: targetScrollTop,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    if (activeId) scrollTo(activeId);
  }, [activeId, viewMode]);

  const totalPages = Math.ceil(0 / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties: any[] = [];

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      if (listRef.current) {
        listRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      if (listRef.current) {
        listRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === "grid" ? "list" : "grid");
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100 p-2">
      <div className="h-full bg-white rounded-2xl shadow-lg ring-1 ring-black/5 backdrop-blur-sm border border-white/20 flex flex-col">
        {/* Fixed Header */}
        <div className="flex-shrink-0">
          {!isMobile ? (
            <div className="p-6 pb-4 flex items-center justify-between bg-white border-b border-slate-100 rounded-t-2xl">
              <h2 className="text-xl font-semibold text-slate-900">
                0 Properties Found
              </h2>
              <div className="flex items-center gap-4">
                <select className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Sort: Relevant</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                </select>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleViewMode}
                  className="flex items-center gap-2"
                >
                  {viewMode === "grid" ? (
                    <>
                      <List className="h-4 w-4" />
                      <span>List View</span>
                    </>
                  ) : (
                    <>
                      <Grid className="h-4 w-4" />
                      <span>Grid View</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 pb-3 flex items-center justify-between bg-white border-b border-slate-100 rounded-t-2xl">
              <span className="text-sm font-medium text-slate-900">
                0 properties
              </span>
              <div className="flex items-center gap-2">
                <select className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Relevant</option>
                  <option>Price: Low to High</option>
                  <option>Newest</option>
                </select>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleViewMode}
                  className="p-2"
                >
                  {viewMode === "grid" ? (
                    <List className="h-4 w-4" />
                  ) : (
                    <Grid className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-hidden">
          <div 
            ref={listRef} 
            className="h-full overflow-y-auto"
          >
            <div className={`${isMobile ? "p-3" : "p-6"}`}>
              {/* Cards Layout - Changes based on view mode */}
              <div className={viewMode === "grid" ? 
                `grid ${isMobile ? "grid-cols-1 gap-4" : "grid-cols-2 gap-6"}` : 
                "space-y-4"}>
                {currentProperties.map((p) => (
                  <div
                    key={p.id}
                    ref={(el) => {
                      cardRefs.current[p.id] = el;
                    }}
                    className={viewMode === "list" ? "w-full" : ""}
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
    </div>
  );
}