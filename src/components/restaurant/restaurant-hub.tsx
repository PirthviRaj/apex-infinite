"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, Users } from "lucide-react";
import { getModule } from "@/lib/modules";
import { ModuleHeader } from "@/components/modules/module-header";
import { GlassCard } from "@/components/ui/glass-card";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { CheckoutModal } from "@/components/checkout/checkout-modal";
import { BookingReceipt } from "@/components/checkout/booking-receipt";
import type { ModuleBookingResult } from "@/lib/booking-server";
import { cn } from "@/lib/utils";

const RESTAURANTS = [
  { id: "nova", name: "Nova Omakase", cuisine: "Japanese", area: "Downtown", slots: ["6:30 PM", "7:15 PM", "8:45 PM"], seats: 4, live: true, deposit: 20, image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80" },
  { id: "ember", name: "Ember Steakhouse", cuisine: "Grill", area: "Midtown", slots: ["5:00 PM", "6:00 PM", "9:00 PM"], seats: 2, live: true, deposit: 25, image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80" },
  { id: "petal", name: "Petal Garden", cuisine: "Vegan", area: "Arts District", slots: ["12:30 PM", "1:45 PM"], seats: 6, live: false, deposit: 15, image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80" },
  { id: "azure", name: "Azure Rooftop", cuisine: "Mediterranean", area: "Harbor", slots: ["7:00 PM", "8:30 PM", "10:00 PM"], seats: 3, live: true, deposit: 22, image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80" },
];

type PendingBooking = {
  restaurantId: string;
  slot: string;
};

export function RestaurantHub() {
  const mod = getModule("restaurant")!;
  const [party, setParty] = useState(2);
  const [pending, setPending] = useState<PendingBooking | null>(null);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ModuleBookingResult | null>(null);

  const restaurant = pending
    ? RESTAURANTS.find((r) => r.id === pending.restaurantId)
    : null;
  const amount = restaurant ? restaurant.deposit * party : 0;

  return (
    <div className="px-4 pb-28 pt-16 lg:px-8 lg:pt-8">
      <ModuleHeader module={mod} eyebrow="Restaurant Hub · Reservations">
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
            <Users className="h-4 w-4 text-pink-400" />
            Party
            <input
              type="number"
              min={1}
              max={12}
              value={party}
              onChange={(e) => setParty(Number(e.target.value))}
              className="w-12 bg-transparent text-center outline-none"
            />
          </label>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-300">
            Deposit required · name & phone at checkout
          </span>
        </div>
      </ModuleHeader>

      {receipt && <div className="mb-6"><BookingReceipt booking={receipt} subtitle="Table reservation" /></div>}

      <div className="grid gap-4 md:grid-cols-2">
        {RESTAURANTS.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard className="overflow-hidden" glow={mod.glow} trail={r.live}>
              <div className="relative h-40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.image} alt={r.name} className="h-full w-full object-cover" />
                <span
                  className={cn(
                    "absolute right-3 top-3 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] backdrop-blur",
                    r.live
                      ? "border-emerald-400/50 bg-emerald-400/20 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.45)]"
                      : "border-zinc-500/40 bg-black/50 text-zinc-400"
                  )}
                >
                  {r.live ? "Live open" : "Waitlist"}
                </span>
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <h3 className="font-display text-xl font-semibold">{r.name}</h3>
                  <p className="mt-1 flex flex-wrap gap-3 text-xs text-zinc-500">
                    <span>{r.cuisine}</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{r.area}</span>
                    <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{r.seats} tables</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.slots.map((slot) => {
                    const id = `${r.id}-${slot}`;
                    const active = confirmed === id;
                    return (
                      <MagneticButton
                        key={slot}
                        type="button"
                        variant={active ? "gold" : "secondary"}
                        className="!rounded-xl !px-3 !py-2 text-xs"
                        strength={0.15}
                        onClick={() => setPending({ restaurantId: r.id, slot })}
                      >
                        <Clock className="h-3 w-3" />
                        {active ? `Booked ${slot}` : slot}
                      </MagneticButton>
                    );
                  })}
                </div>
                {confirmed?.startsWith(r.id) && (
                  <p className="text-sm text-pink-300">
                    Table for {party} confirmed at {r.name} · {confirmed.split("-").slice(1).join("-")}
                  </p>
                )}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {restaurant && pending && (
        <CheckoutModal
          open
          onClose={() => setPending(null)}
          mode="booking"
          amount={amount}
          title={`${restaurant.name} · ${pending.slot} · party of ${party}`}
          confirmLabel="Pay deposit & reserve table"
          booking={{
            moduleId: "restaurant",
            resourceType: "table",
            resourceId: `${restaurant.id}-${pending.slot}`,
            title: `${restaurant.name} · ${pending.slot}`,
            amountCents: amount * 100,
            meta: {
              restaurant: restaurant.name,
              cuisine: restaurant.cuisine,
              area: restaurant.area,
              party,
              slot: pending.slot,
              depositPerGuest: restaurant.deposit,
            },
          }}
          onSuccess={(result) => {
            setReceipt(result);
            setConfirmed(`${restaurant.id}-${pending.slot}`);
            setPending(null);
          }}
        />
      )}
    </div>
  );
}

