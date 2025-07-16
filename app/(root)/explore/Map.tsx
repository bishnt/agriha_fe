"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { mockProperties } from "@/lib/mockData1"
import useActiveProperty from "./useActiveProperty"

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

// Custom marker icons
const createCustomIcon = (isActive: boolean) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: ${isActive ? "#001B4D" : "#002B6D"};
        width: ${isActive ? "32px" : "24px"};
        height: ${isActive ? "32px" : "24px"};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${isActive ? "14px" : "12px"};
        transform: ${isActive ? "scale(1.3)" : "scale(1)"};
        transition: all 0.2s ease;
      ">
        $
      </div>
    `,
    iconSize: [isActive ? 32 : 24, isActive ? 32 : 24],
    iconAnchor: [isActive ? 16 : 12, isActive ? 16 : 12],
  })
}

function FitBounds() {
  const map = useMap()

  useEffect(() => {
    const validProperties = mockProperties.filter((p) => p.latitude && p.longitude)
    if (validProperties.length > 0) {
      const coordsArray = validProperties.map((p) => [p.latitude!, p.longitude!] as [number, number])
      const bounds = L.latLngBounds(coordsArray)
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }, [map])

  return null
}

function MapController() {
  const map = useMap()
  const [activeId] = useActiveProperty()

  useEffect(() => {
    if (activeId) {
      const property = mockProperties.find((p) => p.id === activeId)
      if (property && property.latitude && property.longitude) {
        map.flyTo([property.latitude, property.longitude], 15, {
          duration: 1,
        })
      }
    }
  }, [activeId, map])

  return null
}

export default function Map() {
  const [activeId, setActiveId] = useActiveProperty()

  const handleMarkerClick = (propertyId: number) => {
    setActiveId(propertyId)
  }

  const validProperties = mockProperties.filter((p) => p.latitude && p.longitude)

  return (
    <div className="h-full w-full">
      <MapContainer center={[40.7589, -73.9851]} zoom={12} className="h-full w-full" zoomControl={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds />
        <MapController />

        {validProperties.map((property) => (
          <Marker
            key={property.id}
            position={[property.latitude!, property.longitude!]}
            icon={createCustomIcon(activeId === property.id)}
            eventHandlers={{
              click: () => handleMarkerClick(property.id),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-sm mb-1">{property.title}</h3>
                <p className="text-xs text-gray-600 mb-2">{property.address}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#002B6D]">
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
