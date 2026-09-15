"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Brain,
  Command,
  CornerDownLeft,
  Sparkles,
} from "lucide-react";
import {
  detectIntent,
  getOmnibarSuggestions,
  rankIntents,
  type DetectedIntent,
} from "@/lib/intent";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { cn } from "@/lib/utils";

type OmnibarProps = {
  className?: string;
  autoFocus?: boolean;
};

export function Omnibar({ className, autoFocus }: OmnibarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [routing, setRouting] = useState(false);
  const [status, setStatus] = useState("Neural Omnibar ready — describe what you want.");

  const intent = useMemo(() => detectIntent(query), [query]);
  const ranked = useMemo(() => rankIntents(query, 4), [query]);
  const suggestions = useMemo(() => getOmnibarSuggestions(query), [query]);

  const options: Array<{ type: "intent" | "suggestion"; intent?: DetectedIntent; text: string }> =
    useMemo(() => {
      if (ranked.length > 0) {
        return ranked.map((item) => ({
          type: "intent" as const,
          intent: item,
          text: item.label,
        }));
      }
      return suggestions.map((text) => ({ type: "suggestion" as const, text }));
    }, [ranked, suggestions]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const execute = (target?: DetectedIntent | null, suggestion?: string) => {
    const resolved =
      target ||
      intent ||
      (suggestion ? detectIntent(suggestion) : null) ||
      (query ? detectIntent(query) : null);

    if (!resolved) {
      setStatus("No module match — try “Book flight”, “Order sushi”, or “Pay bill”.");
      setOpen(true);
      return;
    }

    setRouting(true);
    const entityBits = Object.entries(resolved.entities)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" · ");
    setStatus(
      `Intent locked (${Math.round(resolved.confidence * 100)}%) → ${resolved.label}${
        entityBits ? ` · ${entityBits}` : ""
      }`
    );

    const href =
      resolved.entities.place && resolved.module.id === "travel"
        ? `${resolved.module.href}?to=${encodeURIComponent(resolved.entities.place)}`
        : resolved.module.href;

    setTimeout(() => {
      router.push(href);
      setRouting(false);
      setOpen(false);
    }, 550);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const selected = options[activeIndex];
    if (selected?.type === "intent" && selected.intent) {
      execute(selected.intent);
      return;
    }
    if (selected?.type === "suggestion") {
      setQuery(selected.text);
      execute(detectIntent(selected.text), selected.text);
      return;
    }
    execute(intent);
  };

  return (
    <div className={cn("relative z-30", className)}>
      <form onSubmit={onSubmit}>
        <div
          className={cn(
            "border-trail rounded-[28px] p-[1px] transition",
            open && "shadow-glow",
            routing && "animate-neural-pulse"
          )}
        >
          <div className="flex items-center gap-3 rounded-[27px] bg-black/85 px-4 py-3.5 backdrop-blur-2xl sm:px-5 sm:py-4">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-apex-purple/40 to-apex-cyan/30">
              <Brain className={cn("h-5 w-5 text-apex-cyan", routing && "animate-pulse")} />
              {intent && (
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-apex-gold shadow-glow-gold" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <input
                ref={inputRef}
                autoFocus={autoFocus}
                value={query}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 160)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                  setStatus("Scanning intent across 10 modules…");
                }}
                onKeyDown={(e) => {
                  if (!open || options.length === 0) return;
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActiveIndex((i) => (i + 1) % options.length);
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActiveIndex((i) => (i - 1 + options.length) % options.length);
                  }
                  if (e.key === "Escape") {
                    setOpen(false);
                    inputRef.current?.blur();
                  }
                }}
                placeholder="Omnibar — book flights, order food, pay bills, find a desk…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-600 sm:text-base"
              />
              <AnimatePresence mode="wait">
                {intent ? (
                  <motion.p
                    key={intent.label}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.22em] text-apex-cyan"
                  >
                    Detected · {intent.module.name} · {Math.round(intent.confidence * 100)}% ·{" "}
                    {intent.action}
                  </motion.p>
                ) : (
                  <motion.p
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600"
                  >
                    Press Ctrl/⌘ K · live intent routing
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <kbd className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[10px] text-zinc-500">
                <Command className="h-3 w-3" />K
              </kbd>
            </div>

            <MagneticButton
              type="submit"
              className="!rounded-2xl !px-4 !py-2.5"
              strength={0.25}
              disabled={routing}
            >
              {routing ? "Routing…" : "Go"}
              <CornerDownLeft className="h-3.5 w-3.5" />
            </MagneticButton>
          </div>
        </div>
      </form>

      <p className="mt-2 px-2 font-mono text-[11px] text-zinc-500">{status}</p>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="absolute left-0 right-0 top-[calc(100%-0.25rem)] z-40 overflow-hidden rounded-3xl border border-white/10 bg-black/95 shadow-neural backdrop-blur-2xl"
          >
            <div className="border-b border-white/5 px-4 py-3">
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                <Sparkles className="h-3.5 w-3.5 text-apex-purple" />
                {ranked.length > 0 ? "Intent matches" : "Try these intents"}
              </p>
            </div>
            <ul className="max-h-72 overflow-y-auto p-2">
              {options.map((option, index) => {
                const Icon = option.intent?.module.icon;
                const active = index === activeIndex;
                return (
                  <li key={`${option.type}-${option.text}-${index}`}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        if (option.type === "intent" && option.intent) {
                          setQuery(option.intent.query || query);
                          execute(option.intent);
                        } else {
                          setQuery(option.text);
                          execute(detectIntent(option.text), option.text);
                        }
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition",
                        active ? "bg-apex-purple/20 text-white" : "text-zinc-400 hover:bg-white/[0.03]"
                      )}
                    >
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10"
                        style={
                          option.intent
                            ? {
                                color: option.intent.module.accent,
                                boxShadow: `0 0 18px ${option.intent.module.glow}`,
                              }
                            : undefined
                        }
                      >
                        {Icon ? <Icon className="h-4 w-4" /> : <Brain className="h-4 w-4 text-apex-cyan" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-white">
                          {option.text}
                        </span>
                        {option.intent && (
                          <span className="block truncate text-xs text-zinc-500">
                            {option.intent.module.tagline} · {Math.round(option.intent.confidence * 100)}%
                            confidence
                          </span>
                        )}
                      </span>
                      <ArrowRight className={cn("h-4 w-4", active ? "opacity-100" : "opacity-30")} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
