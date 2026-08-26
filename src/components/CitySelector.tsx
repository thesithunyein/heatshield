"use client";

import { useState, useRef, useEffect } from "react";
import { PRESET_CITIES, type City } from "@/lib/types";

interface CitySelectorProps {
  selectedCity: City | null;
  onSelect: (city: City) => void;
}

export default function CitySelector({ selectedCity, onSelect }: CitySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = PRESET_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-xl border border-[var(--hs-border)] bg-[var(--hs-bg-card)] px-4 py-3 text-left transition-colors hover:border-[var(--hs-border-subtle)] hover:bg-[var(--hs-bg-card-hover)]"
      >
        <span className="text-[var(--hs-text-muted)]">🌍</span>
        <div>
          <div className="text-sm font-medium text-[var(--hs-text-primary)]">
            {selectedCity?.name ?? "Select City"}
          </div>
          {selectedCity && (
            <div className="text-xs text-[var(--hs-text-muted)]">
              {selectedCity.country} · {selectedCity.latitude.toFixed(2)}°, {selectedCity.longitude.toFixed(2)}°
            </div>
          )}
        </div>
        <svg
          className={`ml-auto h-4 w-4 text-[var(--hs-text-muted)] transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-[var(--hs-border)] bg-[var(--hs-bg-elevated)] shadow-xl">
          {/* Search */}
          <div className="border-b border-[var(--hs-border-subtle)] p-3">
            <input
              type="text"
              placeholder="Search cities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg bg-[var(--hs-bg-card)] px-3 py-2 text-sm text-[var(--hs-text-primary)] placeholder-[var(--hs-text-muted)] outline-none focus:ring-1 focus:ring-[var(--hs-accent)]"
              autoFocus
            />
          </div>

          {/* City list */}
          <div className="max-h-72 overflow-y-auto">
            {filtered.map((city) => (
              <button
                key={city.name}
                onClick={() => {
                  onSelect(city);
                  setOpen(false);
                  setSearch("");
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--hs-bg-card)] ${
                  selectedCity?.name === city.name ? "bg-[var(--hs-bg-card)]" : ""
                }`}
              >
                <span className="text-lg">🏙️</span>
                <div>
                  <div className="text-sm font-medium text-[var(--hs-text-primary)]">
                    {city.name}
                  </div>
                  <div className="text-xs text-[var(--hs-text-muted)]">
                    {city.country}
                  </div>
                </div>
                {selectedCity?.name === city.name && (
                  <span className="ml-auto text-[var(--hs-accent)]">✓</span>
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-[var(--hs-text-muted)]">
                No cities found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
