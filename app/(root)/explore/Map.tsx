/* app/components/Map.tsx */
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

import { mockProperties } from "@/lib/mockData1"
import { Location } from "@/lib/mockLocations"
import useActiveProperty from "./useActiveProperty"
import { useIsMobile } from "@/hooks/use-mobile"

/* ──────────────────────────────────────────────────────────
   Leaflet default marker images
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
const FitBounds = () => {
  const map = useMap()
  const mobile = useIsMobile()

  useEffect(() => {
    const coords = mockProperties
      .filter((p) => p.latitude && p.longitude)
      .map((p) => [p.latitude!, p.longitude!] as [number, number])

    if (coords.length) {
      map.fitBounds(L.latLngBounds(coords), {
        // padding: mobile ? [20, 20, 200, 20] : [40, 40, 40, 40],
        maxZoom: mobile ? 12 : 14,
      })
    }
  }, [map, mobile])

  return null
}

/* ──────────────────────────────────────────────────────────
   Respond to selected property / location
   ────────────────────────────────────────────────────────── */
const MapController = ({ loc }: { loc: Location | null }) => {
  const map = useMap()
  const [activeId] = useActiveProperty()
  const mobile = useIsMobile()

  // click in list → fly to property
  useEffect(() => {
    if (!activeId) return
    const p = mockProperties.find((m) => m.id === activeId)
    if (p?.latitude && p?.longitude) {
      map.flyTo([p.latitude, p.longitude], mobile ? 14 : 15, { duration: 1 })
    }
  }, [activeId, map, mobile])

  // location selector (e.g. city dropdown)
  useEffect(() => {
    if (!loc) return
    map.flyTo([loc.latitude, loc.longitude], mobile ? 13 : 14, { duration: 1.5 })
  }, [loc, map, mobile])

  return null
}

/* ──────────────────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────────────────── */
interface Props {
  selectedLocation?: Location | null
}

export default function PropertyMap({ selectedLocation = null }: Props) {
  const [activeId, setActiveId] = useActiveProperty()
  const mobile = useIsMobile()

  const valid = mockProperties.filter((p) => p.latitude && p.longitude)

  const onMarkerClick = (id: number) => setActiveId(id)

  return (
    // **Key change:** h-screen guarantees a bounded height
    <div className="w-full h-screen">
      <MapContainer
        center={[27.7, 85.33]} /* Kathmandu fallback */
        zoom={mobile ? 10 : 12}
        className="w-full h-full"
        zoomControl
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

        <FitBounds />
        <MapController loc={selectedLocation} />

        {valid.map((p) => (
          <Marker
            key={p.id}
            position={[p.latitude!, p.longitude!]}
            icon={makeMarkerIcon(activeId === p.id, mobile)}
            eventHandlers={{ click: () => onMarkerClick(p.id) }}
          >
            <Popup>
              <div className={`p-2 ${mobile ? "min-w-[180px]" : "min-w-[200px]"}`}>
                <h3 className={`font-semibold mb-1 ${mobile ? "text-xs" : "text-sm"}`}>
                  {p.title}
                </h3>
                <p className={`text-gray-600 mb-2 ${mobile ? "text-xs" : "text-xs"}`}>
                  {p.address}
                </p>
                <div className="flex justify-between items-center">
                  <span
                    className={`font-bold text-[#002B6D] ${
                      mobile ? "text-sm" : "text-base"
                    }`}
                  >
                    ${p.price.toLocaleString()}
                    {p.priceType !== "total" && (
                      <span className="text-xs font-normal">
                        /{p.priceType.replace("per ", "")}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-gray-500">
                    {p.bedrooms > 0 ? `${p.bedrooms}bd ` : ""}
                    {p.bathrooms}ba
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
