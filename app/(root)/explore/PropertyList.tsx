"use client"

import { useRef, useEffect } from "react"
import { gql, useMutation } from "@apollo/client"
import { mockProperties } from "@/lib/mockData1"
import PropertyCard from "@/components/property-card"
import useActiveProperty from "./useActiveProperty"
import { useIsMobile } from "@/hooks/use-mobile"

const TOGGLE_LIKE = gql`
  mutation ToggleLike($id: ID!, $isLiked: Boolean!) {
    toggleLike(id: $id, isLiked: $isLiked)
  }
`

export default function PropertyList() {
  const [activeId, setActiveId] = useActiveProperty()
  const listRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})
  const isMobile = useIsMobile()

  const [toggleLike] = useMutation(TOGGLE_LIKE, {
    optimisticResponse: ({ id, isLiked }) => ({
      toggleLike: true,
      __typename: "Mutation",
    }),
  })

  const handleToggle = (id: string, isLiked: boolean) => {
    toggleLike({ variables: { id, isLiked } })
  }

  const handleCardClick = (propertyId: number) => {
    setActiveId(propertyId)

    // Scroll to the clicked card
    const cardElement = cardRefs.current[propertyId]
    if (cardElement) {
      cardElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }

  // Scroll to active card when activeId changes externally (from map)
  useEffect(() => {
    if (activeId && cardRefs.current[activeId]) {
      const cardElement = cardRefs.current[activeId]
      cardElement?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }, [activeId])

  return (
    <div ref={listRef} className={isMobile ? "" : "overflow-y-auto border-l md:border-l bg-white h-full"}>
      <div className={isMobile ? "p-3" : "p-4"}>
        {!isMobile && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">{mockProperties.length} Properties Found</h2>
            <select className="text-sm border border-gray-300 rounded-md px-3 py-1">
              <option>Sort: Relevant</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest</option>
            </select>
          </div>
        )}

        {isMobile && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">{mockProperties.length} properties</span>
            <select className="text-xs border border-gray-300 rounded-lg px-2 py-1 bg-white">
              <option>Relevant</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest</option>
            </select>
          </div>
        )}

        <div className={isMobile ? "space-y-3" : "space-y-4"}>
          {mockProperties.map((property) => (
            <div
              key={property.id}
              ref={(el) => {
                cardRefs.current[property.id] = el
              }}
            >
              <PropertyCard
                property={property}
                onToggleLike={handleToggle}
                // isActive={activeId === property.id}
                // onClick={() => handleCardClick(property.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

