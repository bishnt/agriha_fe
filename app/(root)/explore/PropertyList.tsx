"use client";

import { useRef, useEffect } from "react";
import { gql, useMutation } from "@apollo/client";
import { mockProperties } from "@/lib/mockData1";
import PropertyCard from "@/components/property-card";
import useActiveProperty from "./useActiveProperty";
import { useIsMobile } from "@/hooks/use-mobile";

const TOGGLE_LIKE = gql/* GraphQL */ `
  mutation ToggleLike($id: ID!, $isLiked: Boolean!) {
    toggleLike(id: $id, isLiked: $isLiked)
  }
`;

export default function PropertyList() {
  /* ──────────────────  state / refs  ────────────────── */
  const [activeId, setActiveId] = useActiveProperty();
  const listRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const isMobile = useIsMobile();

  /* ──────────────────  like / unlike  ────────────────── */
  const [toggleLike] = useMutation(TOGGLE_LIKE, {
    optimisticResponse: () => ({
      toggleLike: true,
      __typename: "Mutation",
    }),
  });

  const handleToggle = (id: string, isLiked: boolean) =>
    toggleLike({ variables: { id, isLiked } });

  /* ──────────────────  click / sync with map  ────────────────── */
  const scrollTo = (id: number) => {
    const el = cardRefs.current[id];
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  useEffect(() => {
    if (activeId) scrollTo(activeId);
  }, [activeId]);

  /* ──────────────────  render  ────────────────── */
  return (
    <aside
      ref={listRef}
      /* height fixed to viewport, own scrollbar */
      className={`bg-white h-screen overflow-y-auto ${
        isMobile ? "w-full" : "w-[420px] border-l"
      }`}
    >
      <div className={isMobile ? "p-3" : "p-4"}>
        {/* ───── sticky header ───── */}
        {!isMobile ? (
          <div className="flex items-center justify-between mb-4 sticky top-0 bg-white z-10">
            <h2 className="text-xl font-semibold">
              {mockProperties.length} Properties&nbsp;Found
            </h2>
            <select className="text-sm border rounded-md px-3 py-1">
              <option>Sort: Relevant</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest</option>
            </select>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-3 sticky top-0 bg-white z-10">
            <span className="text-sm font-medium">
              {mockProperties.length}&nbsp;properties
            </span>
            <select className="text-xs border rounded-lg px-2 py-1 bg-white">
              <option>Relevant</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest</option>
            </select>
          </div>
        )}

        {/* ───── cards ───── */}
        <div className={isMobile ? "space-y-3" : "space-y-4"}>
          {mockProperties.map((p) => (
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
      </div>
    </aside>
  );
}

