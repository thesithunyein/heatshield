"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { PRESET_CITIES } from "@/lib/types";

interface Message { id: string; role: "user" | "assistant"; content: string; timestamp: string; }

const QUICK = ["Is it safe outside?", "Heat risk in Phoenix?", "Find a cool route", "Heat stroke first aid", "Protect my home from heat"];

export default function AdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "w", role: "assistant",
    content: "## Welcome to HeatShield Advisor\n\nAsk me about heat safety, routes, risks, or emergency guidance.\n\n- **Safety assessments** — Is it safe to go outside?\n- **Cool routes** — Find the coolest paths\n- **Risk analysis** — Understand heat risks\n- **Emergency** — Heat stroke first aid\n- **Home protection** — Cooling strategies",
    timestamp: new Date().toISOString(),
  }]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send(text: string) {
    if (!text.trim() || sending) return;
    setMessages((p) => [...p, { id: `u-${Date.now()}`, role: "user", content: text.trim(), timestamp: new Date().toISOString() }]);
    setInput(""); setSending(true);
    try {
      const r = await fetch("/api/advisor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text.trim(), context: { city: PRESET_CITIES[0].name, temperature: 105, riskLevel: "extreme" } }) });
      const d = await r.json();
      setMessages((p) => [...p, { id: `a-${Date.now()}`, role: "assistant", content: d.response || "No response.", timestamp: new Date().toISOString() }]);
    } catch { setMessages((p) => [...p, { id: `e-${Date.now()}`, role: "assistant", content: "Connection error.", timestamp: new Date().toISOString() }]); }
    finally { setSending(false); }
  }

  return (
    <div className="flex h-screen bg-white">
      <Navbar />
      <div className="flex flex-1 flex-col pt-[80px]">
        <div className="flex-1 overflow-y-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto py-6 space-y-5">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 ${m.role === "user" ? "bg-[#111] text-white" : "bg-[#F5F5F7] border border-[#E5E5EA]"}`}>
                  {m.role === "assistant" ? (
                    <div className="space-y-1.5">
                      {m.content.split("\n").map((l, i) => {
                        if (l.startsWith("## ")) return <h2 key={i} className="font-bold text-[#111] text-base sm:text-lg mb-1">{l.replace("## ", "")}</h2>;
                        if (l.startsWith("- ")) return <div key={i} className="flex gap-2 text-xs sm:text-sm text-[#6B6B70]"><span className="text-[#9CA0A6]">·</span><span>{l.replace("- ", "")}</span></div>;
                        if (l.trim() === "") return <div key={i} className="h-1" />;
                        return <p key={i} className="text-xs sm:text-sm text-[#6B6B70] leading-relaxed">{l}</p>;
                      })}
                    </div>
                  ) : <p className="text-xs sm:text-sm leading-relaxed">{m.content}</p>}
                </div>
              </div>
            ))}
            {sending && <div className="flex justify-start"><div className="bg-[#F5F5F7] border border-[#E5E5EA] rounded-2xl px-5 py-3.5"><div className="flex gap-1.5"><span className="h-2 w-2 animate-bounce rounded-full bg-[#9CA0A6] [animation-delay:0ms]" /><span className="h-2 w-2 animate-bounce rounded-full bg-[#9CA0A6] [animation-delay:150ms]" /><span className="h-2 w-2 animate-bounce rounded-full bg-[#9CA0A6] [animation-delay:300ms]" /></div></div></div>}
            <div ref={endRef} />
          </div>
        </div>
        {messages.length <= 1 && (
          <div className="px-4 sm:px-6 pb-2"><div className="max-w-3xl mx-auto flex flex-wrap gap-2">
            {QUICK.map((q) => <button key={q} onClick={() => send(q)} className="rounded-full border border-[#E5E5EA] bg-[#F5F5F7] px-3 py-1.5 text-[11px] sm:text-xs text-[#6B6B70] transition-colors hover:border-[#111] hover:text-[#111]">{q}</button>)}
          </div></div>
        )}
        <div className="border-t border-[#E5E5EA] bg-white/80 backdrop-blur-xl px-4 sm:px-6 py-3 sm:py-4">
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="max-w-3xl mx-auto flex items-center gap-3">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about heat safety..." className="flex-1 rounded-xl border border-[#E5E5EA] bg-[#F5F5F7] px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#111] placeholder-[#9CA0A6] outline-none focus:border-[#111] transition-colors min-w-0" disabled={sending} />
            <button type="submit" disabled={!input.trim() || sending} className="shrink-0 rounded-xl bg-[#111] px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-white hover:bg-[#333] disabled:opacity-25 transition-colors">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}
