"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Plane, Star, Users } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { CheckoutModal } from "@/components/checkout/checkout-modal";
import { BookingReceipt } from "@/components/checkout/booking-receipt";
import type { ModuleBookingResult } from "@/lib/booking-server";

const DESTINATIONS = [
  {
    id: "tokyo",
    city: "Tokyo",
    country: "Japan",
    price: 842,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
    tag: "Neon nights",
  },
  {
    id: "dubai",
    city: "Dubai",
    country: "UAE",
    price: 619,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
    tag: "Gold coast",
  },
  {
    id: "paris",
    city: "Paris",
    country: "France",
    price: 498,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    tag: "Romance + style",
  },
  {
    id: "bali",
    city: "Bali",
    country: "Indonesia",
    price: 712,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
    tag: "Zen escape",
  },
];

const FLIGHTS = [
  { id: "af1", from: "JFK", to: "NRT", airline: "Apex Air", time: "14h 20m", price: 842, seats: 6 },
  { id: "af2", from: "LAX", to: "DXB", airline: "Infinite Jets", time: "15h 05m", price: 619, seats: 3 },
  { id: "af3", from: "ORD", to: "CDG", airline: "Pulse Airways", time: "8h 40m", price: 498, seats: 11 },
];

type CheckoutTarget =
  | { kind: "destination"; id: string }
  | { kind: "flight"; id: string }
  | null;

export function TravelSuite({ initialTo }: { initialTo?: string }) {
  const [from, setFrom] = useState("New York (JFK)");
  const [to, setTo] = useState(initialTo || "Tokyo (NRT)");
  const [travelDate, setTravelDate] = useState("2026-09-20");
  const [guests, setGuests] = useState(2);
  const [selected, setSelected] = useState<string | null>(null);
  const [checkoutTarget, setCheckoutTarget] = useState<CheckoutTarget>(null);
  const [bookedFlight, setBookedFlight] = useState<string | null>(null);
  const [bookedDestination, setBookedDestination] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ModuleBookingResult | null>(null);
  const [intentBanner, setIntentBanner] = useState(Boolean(initialTo));

  useEffect(() => {
    if (initialTo) {
      setTo(initialTo);
      setIntentBanner(true);
      const match = DESTINATIONS.find(
        (d) => d.city.toLowerCase() === initialTo.toLowerCase()
      );
      if (match) setSelected(match.id);
    }
  }, [initialTo]);

  const dest = checkoutTarget?.kind === "destination"
    ? DESTINATIONS.find((d) => d.id === checkoutTarget.id)
    : null;
  const flight = checkoutTarget?.kind === "flight"
    ? FLIGHTS.find((f) => f.id === checkoutTarget.id)
    : null;

  return (
    <div className="px-4 pb-28 pt-16 lg:px-8 lg:pt-8">
      <div className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-apex-purple">
          Module 01 · Live
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-5xl">Travel Suite</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Real-time flight & hotel search with 3D virtual gallery cards. Select a destination or book a flight — name, phone & payment required.
        </p>
        {intentBanner && initialTo && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-apex-cyan/30 bg-apex-cyan/10 px-3 py-1.5 text-xs text-apex-cyan"
          >
            Omnibar routed you here · destination prefilled: {initialTo}
          </motion.div>
        )}
      </div>

      {receipt && <div className="mb-6"><BookingReceipt booking={receipt} subtitle="Travel Suite" /></div>}

      <GlassCard className="mb-8 p-5" trail glow="rgba(168,85,247,0.35)">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="space-y-1.5">
            <span className="flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
              <MapPin className="h-3 w-3" /> From
            </span>
            <input
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm outline-none focus:border-apex-purple"
            />
          </label>
          <label className="space-y-1.5">
            <span className="flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
              <Plane className="h-3 w-3" /> To
            </span>
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm outline-none focus:border-apex-cyan"
            />
          </label>
          <label className="space-y-1.5">
            <span className="flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
              <Calendar className="h-3 w-3" /> Dates
            </span>
            <input
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm outline-none focus:border-apex-gold [color-scheme:dark]"
            />
          </label>
          <label className="space-y-1.5">
            <span className="flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
              <Users className="h-3 w-3" /> Guests
            </span>
            <input
              type="number"
              min={1}
              max={8}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm outline-none focus:border-apex-purple"
            />
          </label>
        </div>
      </GlassCard>

      <h2 className="mb-4 font-display text-xl font-semibold">3D Destination Gallery</h2>
      <div className="mb-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4" style={{ perspective: 1200 }}>
        {DESTINATIONS.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <GlassCard className="group h-full overflow-hidden" glow="rgba(34,211,238,0.3)" trail>
              <div className="relative h-44 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={d.image}
                  alt={d.city}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] backdrop-blur">
                  {d.tag}
                </span>
                {bookedDestination === d.id && (
                  <span className="absolute right-3 top-3 rounded-full border border-emerald-400/40 bg-emerald-400/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-200">
                    Booked ✓
                  </span>
                )}
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-lg font-semibold">{d.city}</h3>
                    <p className="text-xs text-zinc-500">{d.country}</p>
                  </div>
                  <div className="flex items-center gap-1 text-apex-gold">
                    <Star className="h-3.5 w-3.5 fill-apex-gold" />
                    <span className="text-xs font-medium">{d.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm text-apex-cyan">
                    from <span className="text-lg font-bold text-white">${d.price}</span>
                  </p>
                  <MagneticButton
                    type="button"
                    className="!rounded-xl !px-3 !py-2 text-xs"
                    strength={0.2}
                    variant={selected === d.id ? "gold" : "primary"}
                    onClick={() => {
                      setTo(`${d.city} (${d.country})`);
                      setSelected(d.id);
                      setCheckoutTarget({ kind: "destination", id: d.id });
                    }}
                  >
                    {bookedDestination === d.id ? "Booked ✓" : selected === d.id ? "Selected" : "Select"}
                  </MagneticButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <h2 className="mb-4 font-display text-xl font-semibold">Live Flight Results</h2>
      <div className="space-y-3">
        {FLIGHTS.map((f) => (
          <GlassCard key={f.id} className="p-4" parallax={false}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-apex-purple/20 text-apex-purple">
                  <Plane className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold">
                    {f.from} → {f.to}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {f.airline} · {f.time} · {f.seats} seats left
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-mono text-xl font-bold text-apex-gold">${f.price}</p>
                <MagneticButton
                  type="button"
                  variant={bookedFlight === f.id ? "gold" : "primary"}
                  onClick={() => {
                    if (bookedFlight === f.id) return;
                    setCheckoutTarget({ kind: "flight", id: f.id });
                  }}
                >
                  {bookedFlight === f.id ? "Booked ✓" : "Book flight"}
                </MagneticButton>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {(selected || bookedFlight || bookedDestination) && !receipt && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-2xl border border-apex-cyan/30 bg-apex-cyan/10 px-4 py-3 text-sm text-apex-cyan"
        >
          {selected
            ? `Destination locked: ${DESTINATIONS.find((d) => d.id === selected)?.city}. Complete checkout with your details & payment.`
            : "Complete checkout to confirm your travel booking."}
        </motion.div>
      )}

      {dest && (
        <CheckoutModal
          open
          onClose={() => setCheckoutTarget(null)}
          mode="booking"
          amount={dest.price * guests}
          title={`Package · ${dest.city} · ${guests} guest${guests > 1 ? "s" : ""}`}
          confirmLabel="Confirm destination booking"
          booking={{
            moduleId: "travel",
            resourceType: "destination",
            resourceId: dest.id,
            title: `${dest.city} travel package`,
            amountCents: dest.price * guests * 100,
            startsAt: travelDate,
            meta: { from, to, guests, city: dest.city, country: dest.country },
          }}
          onSuccess={(result) => {
            setReceipt(result);
            setBookedDestination(dest.id);
            setCheckoutTarget(null);
          }}
        />
      )}

      {flight && (
        <CheckoutModal
          open
          onClose={() => setCheckoutTarget(null)}
          mode="booking"
          amount={flight.price * guests}
          title={`Flight · ${flight.from} → ${flight.to}`}
          confirmLabel="Confirm flight & pay"
          booking={{
            moduleId: "travel",
            resourceType: "flight",
            resourceId: flight.id,
            title: `${flight.from} → ${flight.to} · ${flight.airline}`,
            amountCents: flight.price * guests * 100,
            startsAt: travelDate,
            meta: { from: flight.from, to: flight.to, airline: flight.airline, guests },
          }}
          onSuccess={(result) => {
            setReceipt(result);
            setBookedFlight(flight.id);
            setCheckoutTarget(null);
          }}
        />
      )}
    </div>
  );
}

