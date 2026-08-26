"use client";

import { useEffect, useRef, useState } from "react";
import type { City } from "@/lib/types";

interface Props {
  city: City;
  temperature?: number;
}

interface HeatPoint {
  lat: number;
  lng: number;
  temp: number;
}

function tempToColor(temp: number, min: number, max: number): string {
  const t = Math.max(0, Math.min(1, (temp - min) / (max - min)));
  if (t < 0.2) return "#3B82F6";
  if (t < 0.4) return "#06B6D4";
  if (t < 0.6) return "#84CC16";
  if (t < 0.8) return "#F59E0B";
  return "#EF4444";
}

export default function HeatMap({ city, temperature = 100 }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);
  const heatLayerRef = useRef<unknown[]>([]);
  const [mounted, setMounted] = useState(false);
  const [heatPoints, setHeatPoints] = useState<HeatPoint[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch real heatmap data
  useEffect(() => {
    async function fetchHeatmap() {
      try {
        const today = new Date().toISOString().split("T")[0];
        const currentHour = new Date().getHours();
        const res = await fetch("/api/heatmap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: city.latitude,
            longitude: city.longitude,
            date: today,
            hour: currentHour,
          }),
        });
        const data = await res.json();
        if (data.result?.geojson?.features) {
          const points: HeatPoint[] = data.result.geojson.features
            .filter((f: { geometry?: { type: string; coordinates?: number[] } }) => f.geometry?.type === "Point")
            .map((f: { geometry: { coordinates: number[] }; properties: { temperature: number } }) => ({
              lat: f.geometry.coordinates[1],
              lng: f.geometry.coordinates[0],
              temp: f.properties.temperature,
            }));
          setHeatPoints(points);
        }
      } catch {
        // Silently fail — map still works without heatmap
      }
    }
    fetchHeatmap();
  }, [city.latitude, city.longitude]);

  useEffect(() => {
    if (!mounted || !mapRef.current) return;

    Promise.all([
      import("leaflet/dist/leaflet.css" as string),
      import("leaflet"),
    ]).then(([, L]) => {
      if (mapInstance.current) {
        const map = mapInstance.current as { setView: (center: [number, number], zoom: number) => void; invalidateSize: () => void };
        map.setView([city.latitude, city.longitude], 12);
        setTimeout(() => map.invalidateSize(), 100);
        return;
      }

      if (!mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [city.latitude, city.longitude],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      L.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png", {
        maxZoom: 20,
        attribution: "&copy; Stadia Maps",
      }).addTo(map);

      // Temperature color based on heat
      const getMarkerColor = (temp: number) => {
        if (temp >= 110) return "#EF4444";
        if (temp >= 100) return "#F59E0B";
        if (temp >= 90) return "#84CC16";
        return "#3B82F6";
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
        radius: 5000,
        color: color,
        fillColor: color,
        fillOpacity: 0.06,
        weight: 2,
        opacity: 0.25,
      }).addTo(map);

      mapInstance.current = map;
      setTimeout(() => map.invalidateSize(), 200);
    });

    return () => {
      if (mapInstance.current && typeof (mapInstance.current as { remove?: () => void }).remove === "function") {
        (mapInstance.current as { remove: () => void }).remove();
        mapInstance.current = null;
      }
    };
  }, [mounted, city.latitude, city.longitude, city.name, temperature]);

  // Render heat overlay points on map
  useEffect(() => {
    if (!mapInstance.current || heatPoints.length === 0) return;

    import("leaflet").then((L) => {
      const map = mapInstance.current as { addLayer: (layer: unknown) => void };

      // Clear old heat markers
      heatLayerRef.current.forEach((layer) => {
        (layer as { remove: () => void }).remove();
      });
      heatLayerRef.current = [];

      const temps = heatPoints.map((p) => p.temp);
      const minTemp = Math.min(...temps);
      const maxTemp = Math.max(...temps);

      heatPoints.forEach((point) => {
        const color = tempToColor(point.temp, minTemp, maxTemp);
        const circle = L.circle([point.lat, point.lng], {
          radius: 400,
          color: color,
          fillColor: color,
          fillOpacity: 0.25,
          weight: 0,
          opacity: 0,
        });
        map.addLayer(circle);
        heatLayerRef.current.push(circle);
      });
    });
  }, [heatPoints]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#333]" style={{ height: "clamp(240px, 40vw, 420px)" }}>
      {!mounted && (
        <div className="absolute inset-0 bg-[#111] flex items-center justify-center z-10">
          <div className="text-[#666] text-sm">Loading map...</div>
        </div>
      )}
      <div ref={mapRef} style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }} />
      {/* City label overlay */}
      <div className="absolute top-3 left-3 z-[400] bg-black/70 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/10">
        <span className="text-xs font-semibold text-white">{city.name}</span>
        <span className="text-[10px] text-[#999] ml-1.5 hidden sm:inline">{city.state}</span>
      </div>
      {/* Temperature badge */}
      <div className="absolute top-3 right-3 z-[400] bg-black/70 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/10">
        <span className="text-sm font-bold text-white">{Math.round(temperature)}°F</span>
      </div>
      {/* Heatmap legend */}
      {heatPoints.length > 0 && (
        <div className="absolute bottom-3 left-3 z-[400] bg-black/70 backdrop-blur-md rounded-lg px-3 py-2 border border-white/10">
          <div className="flex items-center gap-1.5">
            <div className="flex h-1.5 w-24 rounded-full overflow-hidden">
              <div className="flex-1 bg-[#3B82F6]" />
              <div className="flex-1 bg-[#06B6D4]" />
              <div className="flex-1 bg-[#84CC16]" />
              <div className="flex-1 bg-[#F59E0B]" />
              <div className="flex-1 bg-[#EF4444]" />
            </div>
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-[7px] text-white/40">Cool</span>
            <span className="text-[7px] text-white/40">Hot</span>
          </div>
        </div>
      )}
    </div>
  );
}
