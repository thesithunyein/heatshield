"use client";

import { useState, useRef, useEffect } from "react";
import { PRESET_CITIES, type City } from "@/lib/types";

interface Props { selectedCity: City | null; onSelect: (city: City) => void; }

export default function CitySelector({ selectedCity, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = PRESET_CITIES.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.country.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition-colors hover:border-white/20">
        <span className="text-white/30 text-sm">◉</span>
        <div>
          <div className="text-sm font-medium text-white">{selectedCity?.name ?? "Select City"}</div>
          {selectedCity && <div className="text-[10px] text-white/30">{selectedCity.country} · {selectedCity.latitude.toFixed(2)}°, {selectedCity.longitude.toFixed(2)}°</div>}
        </div>
        <svg className={`ml-auto h-3.5 w-3.5 text-white/30 transition-transform duration-300 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute top-full right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-white/10 bg-[#111113] shadow-2xl">
          <div className="border-b border-white/5 p-3">
            <input type="text" placeholder="Search cities..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-white/20" autoFocus />
          </div>
          <div className="max-h-72 overflow-y-auto">
            {filtered.map((city) => (
              <button key={city.name} onClick={() => { onSelect(city); setOpen(false); setSearch(""); }} className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03] ${selectedCity?.name === city.name ? "bg-white/[0.03]" : ""}`}>
                <span className="text-white/20 text-sm">◉</span>
                <div><div className="text-sm text-white">{city.name}</div><div className="text-[10px] text-white/25">{city.country}</div></div>
                {selectedCity?.name === city.name && <span className="ml-auto text-white/60 text-xs">✓</span>}
              </button>
            ))}
            {filtered.length === 0 && <div className="px-4 py-6 text-center text-sm text-white/20">No cities found</div>}
          </div>
        </div>
      )}
    </div>
  );
}
