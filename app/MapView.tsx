"use client";

import { useEffect, useRef } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

type MapLocation = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string | null;
};

type MapViewProps = {
  apiKey?: string;
  locations: MapLocation[];
};

const FALLBACK_CENTER = { lat: 33.749, lng: -84.388 };

export default function MapView({ apiKey, locations }: MapViewProps) {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const mapRef = useRef<google.maps.Map | null>(null);
  useEffect(() => {
    if (!apiKey || !mapNodeRef.current) {
      return;
    }

    let cancelled = false;
    setOptions({ key: apiKey, v: "weekly" });

    const loadMap = async () => {
      try {
        await importLibrary("maps");

        if (cancelled || !mapNodeRef.current) {
          return;
        }

        const hasLocations = locations.length > 0;
        const initialCenter = hasLocations
          ? { lat: locations[0].lat, lng: locations[0].lng }
          : FALLBACK_CENTER;

        const map = new google.maps.Map(mapNodeRef.current, {
          center: initialCenter,
          zoom: hasLocations ? 12 : 10,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
        });

        mapRef.current = map;
        const bounds = new google.maps.LatLngBounds();
        const infoWindow = new google.maps.InfoWindow();

        markersRef.current = locations.map((location) => {
          const position = { lat: location.lat, lng: location.lng };
          const marker = new google.maps.Marker({
            position,
            map,
            title: location.name,
          });

          bounds.extend(position);

          marker.addListener("click", () => {
            const wrapper = document.createElement("div");
            const title = document.createElement("div");
            title.textContent = location.name;
            title.style.fontWeight = "600";
            wrapper.appendChild(title);

            if (location.address) {
              const address = document.createElement("div");
              address.textContent = location.address;
              address.style.fontSize = "0.85rem";
              address.style.color = "rgba(36, 31, 26, 0.7)";
              wrapper.appendChild(address);
            }

            infoWindow.setContent(wrapper);
            infoWindow.open({ anchor: marker, map });
          });

          return marker;
        });

        if (locations.length > 1) {
          map.fitBounds(bounds, {
            top: 60,
            right: 60,
            bottom: 60,
            left: 60,
          });
        } else if (locations.length === 1) {
          map.setZoom(13);
          map.setCenter(initialCenter);
        }
      } catch (error) {
        console.error("Failed to load Google Maps", error);
      }
    };

    loadMap();

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
      mapRef.current = null;
    };
  }, [apiKey, locations]);

  if (!apiKey) {
    return (
      <div className="map-fallback">
        Add <code>GOOGLE_MAPS_API_KEY</code> to show the map.
      </div>
    );
  }

  if (locations.length === 0) {
    return <div className="map-fallback">No visits with map data yet.</div>;
  }

  return (
    <div className="map-shell" role="region" aria-label="Visited places map">
      <div className="map-canvas" ref={mapNodeRef} />
    </div>
  );
}
