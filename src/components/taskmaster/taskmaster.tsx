"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, MapPinned, Wrench } from "lucide-react";
import { getModule } from "@/lib/modules";
import { ModuleHeader } from "@/components/modules/module-header";
import { GlassCard } from "@/components/ui/glass-card";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { CheckoutFlow, type CheckoutResult } from "@/components/checkout/checkout-flow";

const PROS = [
  { id: "plumb", name: "Noah Rivera", job: "Plumber", rating: 4.9, eta: "35 min", price: 79, verified: true },
  { id: "clean", name: "Ava Brooks", job: "Cleaner", rating: 4.8, eta: "50 min", price: 65, verified: true },
  { id: "elec", name: "Kai Mensah", job: "Electrician", rating: 4.7, eta: "40 min", price: 95, verified: true },
  { id: "hand", name: "Sofia Lane", job: "Handyman", rating: 4.9, eta: "55 min", price: 72, verified: false },
];

export function TaskMaster() {
  const mod = getModule("taskmaster")!;
  const [job, setJob] = useState("Leak under sink");
  const [checkoutPro, setCheckoutPro] = useState<string | null>(null);
  const [booked, setBooked] = useState<string | null>(null);
  const [booking, setBooking] = useState<CheckoutResult | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!booked) return;
    setProgress(8);
    const t = setInterval(() => setProgress((p) => (p >= 100 ? 100 : p + 6)), 800);
    return () => clearInterval(t);
  }, [booked]);

  const pro = PROS.find((p) => p.id === booked);
  const pending = PROS.find((p) => p.id === checkoutPro);

  return (
    <div className="px-4 pb-28 pt-16 lg:px-8 lg:pt-8">
      <ModuleHeader module={mod} eyebrow="TaskMaster · Home services">
        <p className="mt-3 text-sm text-sky-300">
          Book pro → personal + service address + payment → live tracking
        </p>
      </ModuleHeader>

      <GlassCard className="mb-6 space-y-3 p-5" glow={mod.glow} parallax={false}>
        <label className="block space-y-1.5">
          <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">What do you need?</span>
          <input
            value={job}
            onChange={(e) => setJob(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm outline-none focus:border-sky-400"
          />
        </label>
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-2">
        {PROS.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard className="space-y-4 p-5" glow={mod.glow} trail={p.verified}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                  <p className="text-sm text-zinc-400">{p.job} · ETA {p.eta}</p>
                </div>
                {p.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/30 bg-sky-400/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-sky-300">
                    <BadgeCheck className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="font-mono text-lg font-bold">${p.price}</p>
                <p className="text-sm text-apex-gold">★ {p.rating}</p>
              </div>
              <MagneticButton
                type="button"
                className="w-full"
                variant={booked === p.id ? "gold" : "primary"}
                onClick={() => {
                  if (booked === p.id) return;
                  setCheckoutPro(p.id);
                }}
              >
                <Wrench className="h-4 w-4" />
                {booked === p.id ? "Pro dispatched" : `Book for “${job.slice(0, 24)}${job.length > 24 ? "…" : ""}”`}
              </MagneticButton>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {pro && booking && (
        <GlassCard className="mt-6 space-y-3 p-5" trail glow={mod.glow} parallax={false}>
          <div className="flex items-center gap-2 text-sky-300">
            <MapPinned className="h-5 w-5" />
            <h3 className="font-display text-lg font-semibold">Live tracking · {pro.name}</h3>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-apex-cyan" animate={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-zinc-400">
            {progress < 100 ? `${pro.name} is en route for: ${job}` : `${pro.name} arrived · job ready to start`}
          </p>
          <p className="text-xs text-zinc-500">
            Service address: {booking.address?.line1}, {booking.address?.city} · contact {booking.personal.phone} · paid via{" "}
            {booking.payment.method}
          </p>
        </GlassCard>
      )}

      {checkoutPro && pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-5" trail glow={mod.glow} parallax={false}>
            <CheckoutFlow
              mode="delivery"
              amount={pending.price}
              title={`Book ${pending.name}`}
              confirmLabel="Confirm booking & pay"
              onCancel={() => setCheckoutPro(null)}
              onComplete={(result) => {
                setBooking(result);
                setBooked(checkoutPro);
                setCheckoutPro(null);
              }}
            />
          </GlassCard>
        </div>
      )}
    </div>
  );
}
