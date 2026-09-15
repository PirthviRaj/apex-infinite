import Link from "next/link";
import { Infinity } from "lucide-react";
import { MODULES } from "@/lib/modules";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-apex-purple to-apex-cyan">
              <Infinity className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-lg font-bold leading-none">Apex Infinite</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-apex-cyan">
                Universal AI Super-OS
              </p>
            </div>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-zinc-500">
            One identity. Ten modules. Omnibar intent routing, Oracle AI, and one-click conversion
            across travel, food, work, finance, and more.
          </p>
        </div>

        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600">Modules</p>
          <ul className="space-y-2 text-sm text-zinc-400">
            {MODULES.slice(0, 6).map((m) => (
              <li key={m.id}>{m.name}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600">Access</p>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>
              <Link href="/gateway" className="transition hover:text-white">
                Login / Sign Up
              </Link>
            </li>
            <li>
              <Link href="/app" className="transition hover:text-white">
                Command Center
              </Link>
            </li>
            <li>
              <a href="#services" className="transition hover:text-white">
                All services
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Apex Infinite. All rights reserved.</p>
          <p className="font-mono tracking-[0.2em] uppercase">Built for retention · One-click conversion</p>
        </div>
      </div>
    </footer>
  );
}
