"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Infinity, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Services", href: "#services" },
  { label: "Orbit", href: "#orbit" },
  { label: "Why Apex", href: "#why" },
];

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "border-b border-white/10 bg-black/80 backdrop-blur-xl" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-20 sm:px-6">
        <a href="#top" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-apex-purple to-apex-cyan shadow-glow">
            <Infinity className="h-5 w-5 text-white" />
          </span>
          <span>
            <span className="block font-display text-lg font-bold leading-none tracking-tight">Apex</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-apex-cyan">Infinite</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400 transition hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/gateway"
            className="rounded-xl px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-300 transition hover:text-white"
          >
            Login
          </Link>
          <Link
            href="/gateway"
            className="rounded-xl bg-gradient-to-r from-apex-purple to-apex-cyan px-4 py-2.5 text-sm font-semibold text-white shadow-glow"
          >
            Enter Apex
          </Link>
        </div>

        <button
          type="button"
          className="rounded-xl border border-white/10 p-2 text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-black/95 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2 text-sm text-zinc-300"
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/gateway"
              onClick={() => setOpen(false)}
              className="rounded-xl bg-gradient-to-r from-apex-purple to-apex-cyan px-4 py-3 text-center text-sm font-semibold"
            >
              Enter Apex
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
