"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Brain, ShieldCheck, Zap } from "lucide-react";
import { MODULES } from "@/lib/modules";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";
import { OrbitalVisual, Starfield } from "@/components/landing/orbital-visual";

const CAPTIONS = [
  {
    title: "One Super-OS. Every life layer.",
    body: "Travel, food, desks, rides, tickets, wellness, wallet, fashion, home services, and AI content — unified under one Apex identity.",
  },
  {
    title: "Omnibar reads intent.",
    body: "Type natural language. Apex detects the module, locks confidence, and routes you to convert in one click.",
  },
  {
    title: "Oracle stays on orbit.",
    body: "A floating AI agent that navigates bookings, payments, and tasks across the lattice without breaking flow.",
  },
];

const WHY = [
  {
    icon: Brain,
    title: "Neural Omnibar",
    text: "Intent detection across all modules with live confidence and entity capture.",
  },
  {
    icon: Zap,
    title: "One-click conversion",
    text: "From discovery to booking/payment without leaving the Apex shell.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Gateway",
    text: "Phone OTP, email/username password, and verified social login — no one-click leaks.",
  },
];

export function LandingPage() {
  return (
    <div id="top" className="min-h-screen bg-black text-white">
      <LandingHeader />

      {/* HERO — brand + headline + one line + CTA + orbital */}
      <section className="relative min-h-screen overflow-hidden pt-20">
        <Starfield />
        <div className="pointer-events-none absolute inset-0 bg-apex-radial" />
        <div className="pointer-events-none absolute -left-32 top-24 h-80 w-80 rounded-full bg-apex-purple/20 blur-[120px]" />
        <div className="pointer-events-none absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-apex-cyan/15 blur-[130px]" />

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-8">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 font-mono text-[11px] uppercase tracking-[0.4em] text-apex-cyan"
            >
              Universal AI Super-OS
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-glow sm:text-6xl lg:text-7xl"
            >
              Apex
              <span className="block bg-gradient-to-r from-apex-purple via-fuchsia-300 to-apex-cyan bg-clip-text text-transparent">
                Infinite
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mt-5 max-w-md text-base text-zinc-400 sm:text-lg"
            >
              Ten modules. One identity. Cinematic retention engineered for every booking, order, and payment.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                href="/gateway"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-apex-purple via-fuchsia-500 to-apex-cyan px-6 py-3.5 text-sm font-semibold shadow-glow"
              >
                Enter the Gateway <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#services"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-6 py-3.5 text-sm text-zinc-300 transition hover:border-apex-cyan/40 hover:text-white"
              >
                Explore services
              </a>
            </motion.div>
          </div>

          <motion.div
            id="orbit"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="relative"
          >
            <OrbitalVisual />
          </motion.div>
        </div>
      </section>

      {/* CAPTIONS */}
      <section id="why" className="relative border-t border-white/5 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-apex-gold">What we provide</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Everything your day needs — in one orbit.
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {CAPTIONS.map((item, i) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.08 }}
                className="border-l border-apex-purple/40 pl-5"
              >
                <h3 className="font-display text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{item.body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="relative border-t border-white/5 py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.06),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-apex-cyan">Service lattice</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-5xl">
                {MODULES.length} modules. Zero dead ends.
              </h2>
            </div>
            <p className="max-w-sm text-sm text-zinc-500">
              Each module ships its own booking/order/payment surface — linked by Omnibar + Oracle.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.03 }}
                  className="group rounded-3xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/20"
                >
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10"
                    style={{ color: mod.accent, boxShadow: `0 0 24px ${mod.glow}` }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">{mod.name}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{mod.tagline}</p>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: mod.accent }}>
                    {mod.status}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY STRIP */}
      <section className="border-t border-white/5 py-20">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 md:grid-cols-3">
          {WHY.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-3xl border border-white/10 bg-black/40 p-6">
                <Icon className="mb-4 h-6 w-6 text-apex-cyan" />
                <h3 className="font-display text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-zinc-500">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-white/5 py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Ready to enter the orbit?
          </h2>
          <p className="mt-4 text-zinc-400">
            Secure Gateway unlocks Command Center, Omnibar, Oracle, and every module.
          </p>
          <Link
            href="/gateway"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-apex-purple to-apex-cyan px-8 py-4 text-sm font-semibold shadow-glow"
          >
            Open Apex Gateway <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
