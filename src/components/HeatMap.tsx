"use client";

import { useEffect, useRef } from "react";
import type { City } from "@/lib/types";

interface Props {
  city: City;
  temperature?: number;
}

export default function HeatMap({ city, temperature = 100 }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Dynamic import to avoid SSR issues with Leaflet
    Promise.all([
      import("leaflet"),
    ]).then(([L]) => {
      if (mapInstance.current) return;
      if (!mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [city.latitude, city.longitude],
        zoom: 11,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Temperature color based on heat
      const getMarkerColor = (temp: number) => {
        if (temp >= 110) return "#111";
        if (temp >= 100) return "#333";
        if (temp >= 90) return "#666";
        return "#999";
      };

      const color = getMarkerColor(temperature);

      // Custom marker with temperature
      const icon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;">
            <div style="width:56px;height:56px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:#fff;font-family:monospace;font-weight:700;font-size:14px;box-shadow:0 4px 20px rgba(0,0,0,0.25);">
              ${Math.round(temperature)}°
            </div>
            <div style="position:absolute;bottom:-6px;width:12px;height:12px;background:${color};border-radius:50%;opacity:0.3;filter:blur(4px);"></div>
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
        fillOpacity: 0.06,
        weight: 1,
        opacity: 0.15,
      }).addTo(map);

      mapInstance.current = map;
    });

    return () => {
      if (mapInstance.current && typeof (mapInstance.current as { remove?: () => void }).remove === "function") {
        (mapInstance.current as { remove: () => void }).remove();
        mapInstance.current = null;
      }
    };
  }, [city.latitude, city.longitude, city.name, temperature]);

  return (
    <div className="relative w-full h-64 sm:h-72 md:h-80 rounded-2xl overflow-hidden border border-[#E5E5EA]">
      <div ref={mapRef} className="absolute inset-0 w-full h-full" />
      {/* City label overlay */}
      <div className="absolute top-3 left-3 z-[400] bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm border border-[#E5E5EA]">
        <span className="text-xs font-semibold text-[#111]">{city.name}</span>
        <span className="text-[10px] text-[#9CA0A6] ml-1.5">{city.country}</span>
      </div>
    </div>
  );
}
