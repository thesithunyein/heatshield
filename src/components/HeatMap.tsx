"use client";

import { useEffect, useRef, useState } from "react";
import type { City } from "@/lib/types";

interface Props {
  city: City;
  temperature?: number;
}

interface HeatTile {
  lat: number;
  lng: number;
  avgTemp: number;
  minTemp: number;
  maxTemp: number;
  polygon?: number[][][];
}

function tempToColor(tempC: number): string {
  if (tempC >= 45) return "#DC2626";  // >113°F extreme
  if (tempC >= 40) return "#EF4444";  // >104°F
  if (tempC >= 37) return "#F59E0B";  // >99°F
  if (tempC >= 33) return "#84CC16";  // >91°F
  if (tempC >= 27) return "#06B6D4";  // >80°F
  return "#3B82F6";                    // cool
}

export default function HeatMap({ city, temperature = 100 }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstance = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const heatLayerRef = useRef<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);
  const [heatTiles, setHeatTiles] = useState<HeatTile[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch real heatmap data
  useEffect(() => {
    async function fetchHeatmap() {
      try {
        const res = await fetch("/api/heatmap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: city.latitude,
            longitude: city.longitude,
          }),
        });
        const data = await res.json();

        // Parse GeoJSON FeatureCollection with polygon tiles
        const features = data.map_data?.features ?? data.result?.geojson?.features ?? [];
        const tiles: HeatTile[] = features
          .filter((f: { geometry?: { type: string } }) => f.geometry?.type === "Polygon")
          .map((f: { geometry: { coordinates: number[][][] }; properties: { average_temperature: number; min_temperature: number; max_temperature: number } }) => {
            // Get centroid from polygon
            const coords = f.geometry.coordinates[0];
            const avgLng = coords.reduce((s: number, c: number[]) => s + c[0], 0) / coords.length;
            const avgLat = coords.reduce((s: number, c: number[]) => s + c[1], 0) / coords.length;
            return {
              lat: avgLat,
              lng: avgLng,
              avgTemp: f.properties.average_temperature,
              minTemp: f.properties.min_temperature,
              maxTemp: f.properties.max_temperature,
              polygon: f.geometry.coordinates,
            };
          });

        setHeatTiles(tiles);
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
      // Update existing map
      if (mapInstance.current) {
        const map = mapInstance.current as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        map.setView([city.latitude, city.longitude], 13);
        setTimeout(() => map.invalidateSize(), 100);

        // Update marker
        if (markerRef.current) {
          (markerRef.current as { remove: () => void }).remove();
        }
        const color = tempToColor(temperature - 273.15 > 200 ? 40 : (temperature - 32) * 5 / 9); // rough F to C
        const tempC = (temperature - 32) * 5 / 9;
        const c = tempToColor(tempC);
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:52px;height:52px;border-radius:50%;background:${c};display:flex;align-items:center;justify-content:center;color:#fff;font-family:monospace;font-weight:700;font-size:13px;box-shadow:0 0 20px ${c}88, 0 4px 12px rgba(0,0,0,0.5);">${Math.round(temperature)}°F</div>`,
          iconSize: [52, 52],
          iconAnchor: [26, 26],
        });
        markerRef.current = L.marker([city.latitude, city.longitude], { icon }).addTo(map);
        return;
      }

      if (!mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [city.latitude, city.longitude],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Free OpenStreetMap dark tiles — no auth needed
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      // Temperature color
      const tempC = (temperature - 32) * 5 / 9;
      const c = tempToColor(tempC);

      // Custom marker with temperature
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:52px;height:52px;border-radius:50%;background:${c};display:flex;align-items:center;justify-content:center;color:#fff;font-family:monospace;font-weight:700;font-size:13px;box-shadow:0 0 20px ${c}88, 0 4px 12px rgba(0,0,0,0.5);">${Math.round(temperature)}°F</div>`,
        iconSize: [52, 52],
        iconAnchor: [26, 26],
      });

      markerRef.current = L.marker([city.latitude, city.longitude], { icon }).addTo(map);

      // Heat radius circle
      L.circle([city.latitude, city.longitude], {
        radius: 5000,
        color: c,
        fillColor: c,
        fillOpacity: 0.05,
        weight: 1.5,
        opacity: 0.2,
      }).addTo(map);

      mapInstance.current = map;
      setTimeout(() => map.invalidateSize(), 200);
    });

    return () => {
      if (mapInstance.current && typeof (mapInstance.current as { remove?: () => void }).remove === "function") {
        (mapInstance.current as { remove: () => void }).remove();
        mapInstance.current = null;
        markerRef.current = null;
      }
    };
  }, [mounted, city.latitude, city.longitude, city.name, temperature]);

  // Render heat tiles as colored polygons on map
  useEffect(() => {
    if (!mapInstance.current || heatTiles.length === 0) return;

    import("leaflet").then((L) => {
      const map = mapInstance.current as { addLayer: (layer: unknown) => void };

      // Clear old heat markers
      heatLayerRef.current.forEach((layer) => {
        (layer as { remove: () => void }).remove();
      });
      heatLayerRef.current = [];

      heatTiles.forEach((tile) => {
        const color = tempToColor(tile.avgTemp);
        if (tile.polygon && tile.polygon.length > 0) {
          // Render as polygon
          const latlngs = tile.polygon[0].map((c: number[]) => [c[1], c[0]] as [number, number]);
          const polygon = L.polygon(latlngs, {
            color: color,
            fillColor: color,
            fillOpacity: 0.2,
            weight: 0,
            opacity: 0,
          });
          map.addLayer(polygon);
          heatLayerRef.current.push(polygon);
        } else {
          // Fallback: render as circle
          const circle = L.circle([tile.lat, tile.lng], {
            radius: 200,
            color: color,
            fillColor: color,
            fillOpacity: 0.2,
            weight: 0,
            opacity: 0,
          });
          map.addLayer(circle);
          heatLayerRef.current.push(circle);
        }
      });
    });
  }, [heatTiles]);

  // Convert F to C for the current temperature display
  const tempC = (temperature - 32) * 5 / 9;
  const markerColor = tempToColor(tempC);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/[0.06]" style={{ height: "clamp(240px, 40vw, 420px)" }}>
      {/* CSS to make OSM tiles look dark */}
      <style>{`
        .leaflet-tile-pane { filter: invert(1) hue-rotate(180deg) brightness(0.8) contrast(1.2); }
        .leaflet-control-zoom a { background: rgba(0,0,0,0.7) !important; color: #fff !important; }
      `}</style>
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
      {heatTiles.length > 0 && (
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
