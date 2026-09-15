"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  Clock3,
  Flame,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { MODULES } from "@/lib/modules";
import { GlassCard } from "@/components/ui/glass-card";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Omnibar } from "@/components/dashboard/omnibar";
import { useAuthStore } from "@/store/auth-store";

const PULSE = [
  { label: "Tokyo flights", meta: "12 booked · 2m ago", tone: "#a855f7" },
  { label: "Sushi fly-to-cart", meta: "38 orders live", tone: "#22d3ee" },
  { label: "Desk B-14 claimed", meta: "Workspace Hub", tone: "#fbbf24" },
  { label: "ApexPay P2P", meta: "$240 transferred", tone: "#34d399" },
];

const QUICK = [
  { label: "Fly tonight", href: "/modules/travel", hint: "Travel" },
  { label: "Feed me", href: "/modules/food", hint: "Food" },
  { label: "Split a bill", href: "/modules/pay", hint: "Pay" },
  { label: "Style drop", href: "/modules/vogue", hint: "Vogue" },
];

export function DashboardHome() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const modules = useMemo(() => MODULES, []);

  const hero = modules[0];
  const secondary = modules.slice(1, 3);
  const rest = modules.slice(3);

  return (
    <div className="px-4 pb-28 pt-16 lg:px-8 lg:pt-8">
      <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-apex-cyan">
            Command Center · Step 2
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-apex-purple via-fuchsia-300 to-apex-cyan bg-clip-text text-transparent">
              {user?.name?.split(" ")[0] || "Voyager"}
            </span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-400">
            The Omnibar is The Brain — type natural language, watch intent lock, then convert in one click.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <MagneticButton variant="secondary" onClick={() => router.push("/modules/pay")}>
            <TrendingUp className="h-4 w-4" />
            ApexPay
          </MagneticButton>
          <MagneticButton variant="gold" onClick={() => router.push("/modules/travel")}>
            <Zap className="h-4 w-4" />
            Launch Travel
          </MagneticButton>
        </div>
      </header>

      <Omnibar className="mb-8" />

      <div className="mb-8 flex gap-3 overflow-x-auto pb-1 apex-scrollbar">
        {QUICK.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 transition hover:border-apex-purple/40 hover:text-white"
          >
            <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.2em] text-apex-cyan">
              {item.hint}
            </span>
            {item.label}
          </Link>
        ))}
      </div>

      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold tracking-tight">Service Lattice</h2>
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-600">
          4-column bento · {modules.length} modules
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 xl:grid-rows-[auto_auto_auto]">
        {/* Hero tile */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 xl:col-span-2 xl:row-span-2"
        >
          <Link href={hero.href} className="group block h-full">
            <GlassCard
              className="relative h-full min-h-[320px] overflow-hidden p-6 sm:p-7"
              glow={hero.glow}
              trail
            >
              <div className="pointer-events-none absolute -right-10 top-0 h-56 w-56 rounded-full bg-apex-purple/20 blur-3xl transition group-hover:bg-apex-purple/35" />
              <div className="relative flex h-full flex-col justify-between gap-8">
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10"
                    style={{ color: hero.accent, boxShadow: `0 0 30px ${hero.glow}` }}
                  >
                    <hero.icon className="h-7 w-7" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300">
                    <Flame className="h-3 w-3" /> Live demo
                  </span>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-apex-purple">
                    Featured module
                  </p>
                  <h3 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    {hero.name}
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-zinc-400">
                    3D destination gallery, live flight cards, and one-click booking — the conversion
                    engine starts here.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {["Flights", "Hotels", "3D Cards", "One-Click"].map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-zinc-300"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm text-white">
                    Enter Travel Suite <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </GlassCard>
          </Link>
        </motion.div>

        {/* Live pulse panel */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="xl:col-span-2"
        >
          <GlassCard className="h-full min-h-[160px] p-5" glow="rgba(34,211,238,0.25)" parallax={false}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-apex-cyan" />
                <h3 className="font-display text-lg font-semibold">Network Pulse</h3>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                Live feed
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {PULSE.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.05 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full animate-neural-pulse"
                      style={{ background: item.tone, boxShadow: `0 0 12px ${item.tone}` }}
                    />
                    <p className="text-sm font-medium text-white">{item.label}</p>
                  </div>
                  <p className="mt-1 pl-4 text-xs text-zinc-500">{item.meta}</p>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Secondary modules */}
        {secondary.map((mod, index) => {
          const Icon = mod.icon;
          return (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.04 }}
            >
              <Link href={mod.href} className="group block h-full">
                <GlassCard
                  className="h-full min-h-[170px] p-5"
                  glow={mod.glow}
                >
                  <div className="flex h-full flex-col justify-between gap-6">
                    <div className="flex items-start justify-between">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10"
                        style={{ color: mod.accent, boxShadow: `0 0 24px ${mod.glow}` }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <StatusBadge status={mod.status} accent={mod.accent} />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-semibold">{mod.name}</h3>
                      <p className="mt-1 text-sm text-zinc-400">{mod.tagline}</p>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          );
        })}

        {/* Remaining modules */}
        {rest.map((mod, index) => {
          const Icon = mod.icon;
          return (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 + index * 0.03 }}
            >
              <Link href={mod.href} className="group block h-full">
                <GlassCard className="h-full min-h-[150px] p-5" glow={mod.glow}>
                  <div className="flex h-full flex-col justify-between gap-5">
                    <div className="flex items-start justify-between">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10"
                        style={{ color: mod.accent, boxShadow: `0 0 20px ${mod.glow}` }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <StatusBadge status={mod.status} accent={mod.accent} />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold leading-tight">{mod.name}</h3>
                      <p className="mt-1 text-xs text-zinc-500">{mod.tagline}</p>
                      <div className="mt-3 inline-flex items-center gap-1 text-[11px] text-zinc-400 opacity-0 transition group-hover:opacity-100">
                        Open <ArrowUpRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          );
        })}

        {/* Retention / conversion strip */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-2 xl:col-span-4"
        >
          <GlassCard
            className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
            glow="rgba(251,191,36,0.25)"
            trail
            parallax={false}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-apex-gold/15 text-apex-gold">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">Conversion Lattice Active</h3>
                <p className="text-sm text-zinc-400">
                  Omnibar intent → module → one-click booking. Every tile is a retention hook.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Avg intent</p>
                <p className="font-display text-xl font-bold text-apex-cyan">0.8s</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Modules</p>
                <p className="font-display text-xl font-bold text-apex-purple">{modules.length}</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-zinc-400">
                <Clock3 className="h-3.5 w-3.5 text-apex-gold" />
                Always-on Oracle in the corner
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  accent,
}: {
  status: "live" | "beta" | "soon";
  accent: string;
}) {
  return (
    <span
      className="rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em]"
      style={{ borderColor: `${accent}55`, color: accent }}
    >
      {status}
    </span>
  );
}
