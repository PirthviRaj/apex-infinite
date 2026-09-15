"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Car, MapPin, Navigation, Timer } from "lucide-react";
import { getModule } from "@/lib/modules";
import { ModuleHeader } from "@/components/modules/module-header";
import { GlassCard } from "@/components/ui/glass-card";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { CheckoutFlow, type CheckoutResult } from "@/components/checkout/checkout-flow";

const RIDES = [
  { id: "apex", name: "Apex Go", eta: "3 min", price: 12.4, seats: 4 },
  { id: "xl", name: "Apex XL", eta: "6 min", price: 18.9, seats: 6 },
  { id: "lux", name: "Apex Lux", eta: "8 min", price: 29.5, seats: 3 },
];

const RENTALS = [
  { id: "model3", name: "Volt Sedan", day: 79, image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80" },
  { id: "suv", name: "Horizon SUV", day: 109, image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80" },
];

export function GlideSuite() {
  const mod = getModule("glide")!;
  const [pickup, setPickup] = useState("Apex Tower");
  const [dropoff, setDropoff] = useState("Downtown Hub");
  const [selected, setSelected] = useState("apex");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutInfo, setCheckoutInfo] = useState<CheckoutResult | null>(null);
  const [tracking, setTracking] = useState(false);
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    if (!tracking) return;
    const t = setInterval(() => setProgress((p) => (p >= 96 ? 12 : p + 4)), 700);
    return () => clearInterval(t);
  }, [tracking]);

  const ride = RIDES.find((r) => r.id === selected)!;

  return (
    <div className="px-4 pb-28 pt-16 lg:px-8 lg:pt-8">
      <ModuleHeader module={mod} eyebrow="Apex Glide · Rides & rentals">
        <p className="mt-3 text-sm text-emerald-300">Live map tracking simulation · pick a ride or rent a car</p>
      </ModuleHeader>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard className="space-y-4 p-5" trail glow={mod.glow} parallax={false}>
          <h2 className="font-display text-xl font-semibold">Request a ride</h2>
          <label className="block space-y-1.5">
            <span className="flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-zinc-500"><MapPin className="h-3 w-3" /> Pickup</span>
            <input value={pickup} onChange={(e) => setPickup(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm outline-none focus:border-emerald-400" />
          </label>
          <label className="block space-y-1.5">
            <span className="flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-zinc-500"><Navigation className="h-3 w-3" /> Dropoff</span>
            <input value={dropoff} onChange={(e) => setDropoff(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm outline-none focus:border-emerald-400" />
          </label>
          <div className="space-y-2">
            {RIDES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelected(r.id)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                  selected === r.id ? "border-emerald-400/50 bg-emerald-400/10" : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Car className="h-5 w-5 text-emerald-300" />
                  <div>
                    <p className="font-medium">{r.name}</p>
                    <p className="text-xs text-zinc-500">{r.seats} seats · ETA {r.eta}</p>
                  </div>
                </div>
                <p className="font-mono font-bold">${r.price.toFixed(2)}</p>
              </button>
            ))}
          </div>
          <MagneticButton type="button" className="w-full" onClick={() => setCheckoutOpen(true)}>
            <Timer className="h-4 w-4" /> Continue to checkout · {ride.name}
          </MagneticButton>
          {checkoutInfo && tracking && (
            <p className="text-center text-xs text-emerald-300">
              Paid by {checkoutInfo.personal.fullName} · {checkoutInfo.payment.method}
            </p>
          )}
        </GlassCard>

        <GlassCard className="overflow-hidden p-0" glow={mod.glow} parallax={false}>
          <div className="relative h-72 bg-[radial-gradient(circle_at_30%_40%,rgba(52,211,153,0.2),transparent_45%),linear-gradient(160deg,#07140f,#050508)]">
            <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
            <motion.div
              className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-apex-cyan shadow-glow-cyan"
              animate={{ left: `${18 + progress * 0.6}%`, top: `${60 - progress * 0.25}%` }}
              transition={{ ease: "linear", duration: 0.6 }}
            />
            <div className="absolute left-[18%] top-[60%] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
            <div className="absolute right-[18%] top-[28%] h-3 w-3 translate-x-1/2 -translate-y-1/2 rounded-full bg-apex-gold" />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-black/60 p-3 backdrop-blur">
              {tracking ? (
                <p className="text-sm text-emerald-300">Driver en route · {pickup} → {dropoff} · {Math.max(1, Math.round((100 - progress) / 12))} min</p>
              ) : (
                <p className="text-sm text-zinc-400">Map preview ready — confirm a ride to start live tracking</p>
              )}
            </div>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            {RENTALS.map((car) => (
              <div key={car.id} className="overflow-hidden rounded-2xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={car.image} alt={car.name} className="h-28 w-full object-cover" />
                <div className="flex items-center justify-between p-3">
                  <div>
                    <p className="font-medium">{car.name}</p>
                    <p className="font-mono text-xs text-zinc-500">${car.day}/day</p>
                  </div>
                  <MagneticButton type="button" variant="secondary" className="!rounded-xl !px-3 !py-2 text-xs" strength={0.15}>
                    Rent
                  </MagneticButton>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-5" trail glow={mod.glow} parallax={false}>
            <CheckoutFlow
              mode="ride"
              amount={ride.price}
              title={`Ride checkout · ${pickup} → ${dropoff}`}
              confirmLabel="Confirm ride & pay"
              onCancel={() => setCheckoutOpen(false)}
              onComplete={(result) => {
                setCheckoutInfo(result);
                setCheckoutOpen(false);
                setTracking(true);
                setProgress(12);
              }}
            />
          </GlassCard>
        </div>
      )}
    </div>
  );
}
