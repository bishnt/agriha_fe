"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Property } from "@/lib/types";

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom property marker icon
const propertyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface PropertyMapProps {
  property: Property;
}

export default function PropertyMap({ property }: PropertyMapProps) {
  // Default to Kathmandu if no coordinates
  const defaultLat = 27.7172;
  const defaultLng = 85.3240;
  
  const lat = property.latitude || defaultLat;
  const lng = property.longitude || defaultLng;

  return (
    <div className="w-full h-full">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        className="w-full h-full rounded-lg"
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        <Marker position={[lat, lng]} icon={propertyIcon}>
          <Popup maxWidth={300} minWidth={250}>
            <div className="p-2">
              <h3 className="font-semibold text-sm mb-1">{property.title}</h3>
              <p className="text-xs text-gray-600 mb-2">{property.address}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#002B6D]">
                  NRs. {property.price.toLocaleString()}
                </span>
                <span className="text-gray-500">
                  {property.bedrooms} bed • {property.bathrooms} bath
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
