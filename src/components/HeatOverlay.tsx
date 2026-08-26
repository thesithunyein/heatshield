"use client";

import { useEffect, useRef } from "react";

interface HeatPoint {
  lat: number;
  lng: number;
  temp: number;
}

interface Props {
  points: HeatPoint[];
  minTemp: number;
  maxTemp: number;
}

function tempToColor(temp: number, min: number, max: number): string {
  const t = Math.max(0, Math.min(1, (temp - min) / (max - min)));
  // Blue → Cyan → Green → Yellow → Orange → Red
  if (t < 0.2) return `rgba(0, 100, 255, ${0.3 + t * 0.5})`;
  if (t < 0.4) return `rgba(0, 200, 200, ${0.3 + t * 0.5})`;
  if (t < 0.6) return `rgba(100, 200, 0, ${0.3 + t * 0.5})`;
  if (t < 0.8) return `rgba(255, 180, 0, ${0.3 + t * 0.5})`;
  return `rgba(255, 50, 0, ${0.4 + t * 0.4})`;
}

export default function HeatOverlay({ points, minTemp, maxTemp }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || points.length === 0) return;

    // Import Leaflet dynamically
    import("leaflet").then((L) => {
      if (!canvasRef.current) return;

      // Create a custom pane for the overlay
      const container = canvasRef.current;
      container.innerHTML = "";

      // Create circle markers for each heat point
      points.forEach((point) => {
        const color = tempToColor(point.temp, minTemp, maxTemp);
        const div = document.createElement("div");
        div.style.cssText = `
          position: absolute;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: ${color};
          transform: translate(-50%, -50%);
          pointer-events: none;
          filter: blur(8px);
        `;
        container.appendChild(div);
      });
    });
  }, [points, minTemp, maxTemp]);

  return <div ref={canvasRef} className="absolute inset-0 z-[300] pointer-events-none" />;
}
