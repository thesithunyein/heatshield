"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { PRESET_CITIES } from "@/lib/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  "Is it safe to walk outside right now?",
  "What's the heat risk in Phoenix?",
  "Find me a cool route",
  "Heat stroke first aid",
  "How to protect my home from heat?",
];

export default function AdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `## 👋 Welcome to HeatShield Advisor\n\nI'm your AI-powered heat safety assistant. I can help you with:\n\n- **Safety assessments** — Is it safe to go outside?\n- **Cool route planning** — Find the coolest paths\n- **Risk analysis** — Understand heat risks in your area\n- **Emergency guidance** — Heat stroke first aid\n- **Home protection** — Cooling strategies\n\nAsk me anything about urban heat and staying safe.`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || sending) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          context: {
            city: PRESET_CITIES[0].name,
            temperature: 105,
            riskLevel: "extreme",
          },
        }),
      });

      const data = await res.json();

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.response || "Sorry, I couldn't process that. Please try again.",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "⚠️ Connection error. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-[var(--hs-bg)]">
      <Navbar />

      {/* Chat container */}
      <div className="flex flex-1 flex-col pt-16">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3.5 ${
                    msg.role === "user"
                      ? "bg-[var(--hs-accent)] text-white"
                      : "hs-glass-card"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      {msg.content.split("\n").map((line, i) => {
                        if (line.startsWith("## ")) {
                          return (
                            <h2 key={i} className="mb-2 text-lg font-bold">
                              {line.replace("## ", "")}
                            </h2>
                          );
                        }
                        if (line.startsWith("### ")) {
                          return (
                            <h3 key={i} className="mb-1 text-base font-semibold">
                              {line.replace("### ", "")}
                            </h3>
                          );
                        }
                        if (line.startsWith("- ")) {
                          return (
                            <div key={i} className="flex gap-2 text-sm text-[var(--hs-text-secondary)]">
                              <span className="text-[var(--hs-accent)]">•</span>
                              <span>{line.replace("- ", "")}</span>
                            </div>
                          );
                        }
                        if (line.startsWith("**") && line.endsWith("**")) {
                          return (
                            <p key={i} className="text-sm font-bold text-[var(--hs-text-primary)]">
                              {line.replace(/\*\*/g, "")}
                            </p>
                          );
                        }
                        if (line.trim() === "") {
                          return <div key={i} className="h-2" />;
                        }
                        return (
                          <p key={i} className="text-sm text-[var(--hs-text-secondary)]">
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="hs-glass-card px-5 py-3.5">
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--hs-accent)] [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--hs-accent)] [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--hs-accent)] [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEnd} />
          </div>
        </div>

        {/* Quick prompts (show when few messages) */}
        {messages.length <= 1 && (
          <div className="px-6 pb-2">
            <div className="mx-auto flex max-w-3xl flex-wrap gap-2">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="rounded-full border border-[var(--hs-border)] bg-[var(--hs-bg-card)] px-3 py-1.5 text-xs text-[var(--hs-text-secondary)] transition-colors hover:border-[var(--hs-accent)] hover:text-[var(--hs-text-primary)]"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-[var(--hs-border-subtle)] bg-[var(--hs-bg-elevated)] px-6 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="mx-auto flex max-w-3xl items-center gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about heat safety, routes, risks..."
              className="flex-1 rounded-xl border border-[var(--hs-border)] bg-[var(--hs-bg-card)] px-4 py-3 text-sm text-[var(--hs-text-primary)] placeholder-[var(--hs-text-muted)] outline-none focus:border-[var(--hs-accent)] focus:ring-1 focus:ring-[var(--hs-accent)]"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="rounded-xl bg-[var(--hs-accent)] px-5 py-3 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-40"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
