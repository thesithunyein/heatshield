"use client";

import { useEffect, useRef, useState } from "react";
import type { City } from "@/lib/types";

interface Props {
  city: City;
  temperature?: number;
}

export default function HeatMap({ city, temperature = 100 }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mapRef.current) return;

    // Dynamic import to avoid SSR issues with Leaflet
    Promise.all([
      import("leaflet/dist/leaflet.css" as string),
      import("leaflet"),
    ]).then(([, L]) => {
      if (mapInstance.current) {
        // If map already exists, just update view
        const map = mapInstance.current as { setView: (center: [number, number], zoom: number) => void; invalidateSize: () => void };
        map.setView([city.latitude, city.longitude], 11);
        setTimeout(() => map.invalidateSize(), 100);
        return;
      }

      if (!mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [city.latitude, city.longitude],
        zoom: 11,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Use dark CartoDB tiles to match the dark dashboard theme
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Temperature color based on heat
      const getMarkerColor = (temp: number) => {
        if (temp >= 110) return "#FF4444";
        if (temp >= 100) return "#FF8844";
        if (temp >= 90) return "#FFAA33";
        return "#44BBFF";
      };

      const color = getMarkerColor(temperature);

      // Custom marker with temperature
      const icon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;">
            <div style="width:56px;height:56px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:#fff;font-family:Inter,monospace;font-weight:700;font-size:14px;box-shadow:0 0 20px ${color}88, 0 4px 16px rgba(0,0,0,0.4);">
              ${Math.round(temperature)}°F
            </div>
          </div>
        `,
        iconSize: [56, 56],
        iconAnchor: [28, 28],
      });

      L.marker([city.latitude, city.longitude], { icon }).addTo(map);

      // Heat radius circle
      L.circle([city.latitude, city.longitude], {
        radius: 8000,
        color: color,
        fillColor: color,
        fillOpacity: 0.08,
        weight: 2,
        opacity: 0.3,
      }).addTo(map);

      mapInstance.current = map;

      // Force map to recalculate size after render
      setTimeout(() => map.invalidateSize(), 200);
    });

    return () => {
      if (mapInstance.current && typeof (mapInstance.current as { remove?: () => void }).remove === "function") {
        (mapInstance.current as { remove: () => void }).remove();
        mapInstance.current = null;
      }
    };
  }, [mounted, city.latitude, city.longitude, city.name, temperature]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#333]" style={{ height: "clamp(220px, 40vw, 400px)" }}>
      {/* Loading state */}
      {!mounted && (
        <div className="absolute inset-0 bg-[#111] flex items-center justify-center z-10">
          <div className="text-[#666] text-sm">Loading map...</div>
        </div>
      )}
      <div
        ref={mapRef}
        style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
      />
      {/* City label overlay */}
      <div className="absolute top-3 left-3 z-[400] bg-black/70 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/10">
        <span className="text-xs font-semibold text-white">{city.name}</span>
        <span className="text-[10px] text-[#999] ml-1.5 hidden sm:inline">{city.country}</span>
      </div>
      {/* Temperature badge */}
      <div className="absolute top-3 right-3 z-[400] bg-black/70 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/10">
        <span className="text-sm font-bold text-white">{Math.round(temperature)}°F</span>
      </div>
    </div>
  );
}
