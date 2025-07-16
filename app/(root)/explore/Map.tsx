"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { mockProperties } from "@/lib/mockData1"
import useActiveProperty from "./useActiveProperty"
import { useIsMobile } from "@/hooks/use-mobile"

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

// Custom marker icons
const createCustomIcon = (isActive: boolean, isMobile: boolean) => {
  const size = isMobile ? (isActive ? 28 : 20) : isActive ? 32 : 24
  const fontSize = isMobile ? (isActive ? "12px" : "10px") : isActive ? "14px" : "12px"

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: ${isActive ? "#001B4D" : "#002B6D"};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${fontSize};
        transform: ${isActive ? "scale(1.2)" : "scale(1)"};
        transition: all 0.2s ease;
      ">
        $
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function FitBounds() {
  const map = useMap()
  const isMobile = useIsMobile()

  useEffect(() => {
    const validProperties = mockProperties.filter((p) => p.latitude && p.longitude)
    if (validProperties.length > 0) {
      const coordsArray = validProperties.map((p) => [p.latitude!, p.longitude!] as [number, number])
      const bounds = L.latLngBounds(coordsArray)

      // More generous padding for mobile, especially bottom padding for the panel
      const padding = isMobile
        ? [20, 20, 200, 20] // top, right, bottom, left - extra bottom padding for mobile panel
        : [40, 40, 40, 40]

      map.fitBounds(bounds, {
        
        maxZoom: isMobile ? 12 : 14, // Lower max zoom on mobile for better overview
      })
    }
  }, [map, isMobile])

  return null
}

function MapController() {
  const map = useMap()
  const [activeId] = useActiveProperty()
  const isMobile = useIsMobile()

  useEffect(() => {
    if (activeId) {
      const property = mockProperties.find((p) => p.id === activeId)
      if (property && property.latitude && property.longitude) {
        const zoomLevel = isMobile ? 14 : 15
        map.flyTo([property.latitude, property.longitude], zoomLevel, {
          duration: 1,
        })
      }
    }
  }, [activeId, map, isMobile])

  return null
}

export default function Map() {
  const [activeId, setActiveId] = useActiveProperty()
  const isMobile = useIsMobile()

  const handleMarkerClick = (propertyId: number) => {
    setActiveId(propertyId)
  }

  const validProperties = mockProperties.filter((p) => p.latitude && p.longitude)

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[40.7589, -73.9851]}
        zoom={isMobile ? 10 : 12}
        className="h-full w-full"
        zoomControl={true}
        attributionControl={!isMobile} // Hide attribution on mobile for cleaner look
      >
        <TileLayer
          attribution={
            isMobile ? "" : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds />
        <MapController />

        {validProperties.map((property) => (
          <Marker
            key={property.id}
            position={[property.latitude!, property.longitude!]}
            icon={createCustomIcon(activeId === property.id, isMobile)}
            eventHandlers={{
              click: () => handleMarkerClick(property.id),
            }}
          >
            <Popup>
              <div className={`p-2 ${isMobile ? "min-w-[180px]" : "min-w-[200px]"}`}>
                <h3 className={`font-semibold mb-1 ${isMobile ? "text-xs" : "text-sm"}`}>{property.title}</h3>
                <p className={`text-gray-600 mb-2 ${isMobile ? "text-xs" : "text-xs"}`}>{property.address}</p>
                <div className="flex justify-between items-center">
                  <span className={`font-bold text-[#002B6D] ${isMobile ? "text-sm" : "text-base"}`}>
                    ${property.price.toLocaleString()}
                    {property.priceType !== "total" && (
                      <span className="text-xs font-normal">/{property.priceType.replace("per ", "")}</span>
                    )}
                  </span>
                  <span className="text-xs text-gray-500">
                    {property.bedrooms > 0 ? `${property.bedrooms}bd ` : ""}
                    {property.bathrooms}ba
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
