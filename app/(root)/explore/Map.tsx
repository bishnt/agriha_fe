// app/components/Map.tsx
"use client"

import { useEffect } from "react"
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

import { Location, Property } from "@/lib/types"
import useActiveProperty from "./useActiveProperty"
import { useIsMobile } from "@/hooks/use-mobile"
import PropertyCard from "@/components/property-card" // Adjust import path as needed

/* ──────────────────────────────────────────────────────────
   Leaflet default marker images (still needed for general markers)
   ────────────────────────────────────────────────────────── */
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

/* ──────────────────────────────────────────────────────────
   Custom Red Marker Icon for Selected Location
   ────────────────────────────────────────────────────────── */
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

/* ──────────────────────────────────────────────────────────
   Custom Popup Component with PropertyCard
   ────────────────────────────────────────────────────────── */
const CustomPopup = ({ property, mobile }: { property: Property; mobile: boolean }) => {
  return (
    <div className={`bg-transparent border-none ${mobile ? "w-[280px]" : "w-[320px]"}`}>
      <div className="p-1">
        <PropertyCard 
          property={property} 
          onViewDetails={(id) => console.log("View details:", id)}
          onToggleLike={(id, isLiked) => console.log("Toggle like:", id, isLiked)}
        />
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────────────── */
const makeMarkerIcon = (active: boolean, mobile: boolean) => {
  const size = mobile ? (active ? 28 : 20) : active ? 32 : 24
  const font = mobile ? (active ? "12px" : "10px") : active ? "14px" : "12px"

  return L.divIcon({
    className: "custom-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `
      <div style="
        background:#002B6D;
        width:${size}px;height:${size}px;
        border-radius:50%;border:2px solid #fff;
        box-shadow:0 2px 8px rgba(0,0,0,.3);
        display:flex;align-items:center;justify-content:center;
        color:#fff;font-weight:bold;font-size:${font};
        transform:${active ? "scale(1.2)" : "scale(1)"};
        transition:transform .2s ease;
      ">$</div>`,
  })
}

/* ──────────────────────────────────────────────────────────
   Fit map to markers once on mount / resize
   ────────────────────────────────────────────────────────── */
const FitBounds = ({ properties }: { properties: Property[] }) => {
  const map = useMap()
  const mobile = useIsMobile()

  useEffect(() => {
    const coords: [number, number][] = properties
      .filter((p: Property) => p.latitude && p.longitude)
      .map((p: Property) => [p.latitude!, p.longitude!] as [number, number])

    if (coords.length) {
      map.fitBounds(L.latLngBounds(coords), {
        maxZoom: mobile ? 12 : 14,
      })
    }
  }, [map, mobile, properties])

  return null
}

/* ──────────────────────────────────────────────────────────
   Respond to selected property / location
   ────────────────────────────────────────────────────────── */
const MapController = ({ loc, properties }: { loc: Location | null; properties: Property[] }) => {
  const map = useMap()
  const [activeId] = useActiveProperty()
  const mobile = useIsMobile()

  // click in list → fly to property
  useEffect(() => {
    if (!activeId) return
    const p = properties.find((m: Property) => m.id === activeId)
    if (p?.latitude && p?.longitude) {
      map.flyTo([p.latitude, p.longitude], mobile ? 14 : 15, { duration: 1 })
    }
  }, [activeId, map, mobile, properties])

  // location selector (e.g. city dropdown)
  useEffect(() => {
    if (!loc) return
    const lat = loc.latitude
    const lon = loc.longitude
    if (typeof lat === 'number' && typeof lon === 'number') {
      map.flyTo([lat, lon], mobile ? 13 : 14, { duration: 1.5 })
    }
  }, [loc, map, mobile])

  return null
}

/* ──────────────────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────────────────── */
interface Props {
  selectedLocation?: Location | null
  properties?: Property[]
}

export default function PropertyMap({ selectedLocation = null, properties = [] }: Props) {
  const [activeId, setActiveId] = useActiveProperty()
  const mobile = useIsMobile()

  const valid: Property[] = properties.filter((p: Property) => p.latitude && p.longitude)

  const onMarkerClick = (id: number) => setActiveId(id)

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 p-2">
      <div className="w-full h-full bg-white rounded-2xl shadow-lg ring-1 ring-black/5 backdrop-blur-sm border border-white/20 overflow-hidden">
        <MapContainer
          center={[27.7, 85.33]}
          zoom={mobile ? 10 : 12}
          className="w-full h-full rounded-2xl"
          zoomControl={false}
          attributionControl={!mobile}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution={
              mobile
                ? ""
                : '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }
          />

          <FitBounds properties={valid} />
          <MapController loc={selectedLocation} properties={valid} />

          {/* Marker for selectedLocation (red indicator) */}
          {selectedLocation && (
            <Marker 
              position={[selectedLocation.latitude, selectedLocation.longitude]} 
              icon={redIcon}
            >
              <Popup maxWidth={mobile ? 300 : 350} minWidth={mobile ? 280 : 320}>
                <div className={`p-2 ${mobile ? "min-w-[180px]" : "min-w-[200px]"}`}>
                  <h3 className={`font-semibold mb-1 ${mobile ? "text-xs" : "text-sm"}`}>
                    {selectedLocation.name}
                  </h3>
                  <p className={`text-gray-600 mb-2 ${mobile ? "text-xs" : "text-xs"}`}>
                    {selectedLocation.description || `${selectedLocation.city}, ${selectedLocation.state}`}
                  </p>
                </div>
                {selectedLocation.propertyCount && (
                  <span className="text-xs text-gray-500 mt-1 block">
                    {selectedLocation.propertyCount} properties
                  </span>
                )}
              </Popup>
            </Marker>
          )}

          {/* Existing markers for mockProperties */}
          {valid.map((p) => (
            <Marker
              key={p.id}
              position={[p.latitude!, p.longitude!]}
              icon={makeMarkerIcon(activeId === p.id, mobile)}
              eventHandlers={{ click: () => onMarkerClick(p.id) }}
            >
              <Popup maxWidth={mobile ? 300 : 350} minWidth={mobile ? 280 : 320}>
                <CustomPopup property={p} mobile={mobile} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}