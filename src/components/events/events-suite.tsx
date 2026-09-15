"use client";

import { useMemo, useState } from "react";
import { Ticket } from "lucide-react";
import { getModule } from "@/lib/modules";
import { ModuleHeader } from "@/components/modules/module-header";
import { GlassCard } from "@/components/ui/glass-card";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { CheckoutModal } from "@/components/checkout/checkout-modal";
import { BookingReceipt } from "@/components/checkout/booking-receipt";
import type { ModuleBookingResult } from "@/lib/booking-server";
import { cn } from "@/lib/utils";

const EVENTS = [
  { id: "neon", name: "Neon Symphony", type: "Concert", price: 89, image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=900&q=80" },
  { id: "orbit", name: "Orbit Premiere", type: "Movie", price: 18, image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80" },
  { id: "pulse", name: "Pulse Arena Live", type: "Sports", price: 120, image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=900&q=80" },
];

const ROWS = ["A", "B", "C", "D", "E"];
const COLS = 8;

function buildSeats() {
  const taken = new Set(["A3", "A4", "B2", "C5", "D1", "E6", "E7"]);
  return ROWS.flatMap((row) =>
    Array.from({ length: COLS }, (_, i) => {
      const id = `${row}${i + 1}`;
      return { id, status: taken.has(id) ? ("taken" as const) : ("free" as const) };
    })
  );
}

export function EventsSuite() {
  const mod = getModule("events")!;
  const [eventId, setEventId] = useState("neon");
  const [seats, setSeats] = useState(buildSeats);
  const [picked, setPicked] = useState<string[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receipt, setReceipt] = useState<ModuleBookingResult | null>(null);
  const event = EVENTS.find((e) => e.id === eventId)!;
  const total = useMemo(() => picked.length * event.price, [picked, event.price]);

  const toggle = (id: string, status: "free" | "taken") => {
    if (status === "taken") return;
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const onSuccess = (result: ModuleBookingResult) => {
    setSeats((prev) => prev.map((s) => (picked.includes(s.id) ? { ...s, status: "taken" } : s)));
    setReceipt(result);
    setPicked([]);
    setCheckoutOpen(false);
  };

  return (
    <div className="px-4 pb-28 pt-16 lg:px-8 lg:pt-8">
      <ModuleHeader module={mod} eyebrow="Pulse Events · Tickets">
        <p className="mt-3 text-sm text-rose-300">Select seats, then checkout with name, phone & payment</p>
      </ModuleHeader>

      {receipt && <div className="mb-6"><BookingReceipt booking={receipt} subtitle={`${event.name} tickets`} /></div>}

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {EVENTS.map((e) => (
          <button key={e.id} type="button" onClick={() => { setEventId(e.id); setPicked([]); setSeats(buildSeats()); }} className="text-left">
            <GlassCard className={`overflow-hidden ${eventId === e.id ? "border-rose-400/40" : ""}`} glow={mod.glow} parallax={false}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={e.image} alt={e.name} className="h-28 w-full object-cover" />
              <div className="p-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">{e.type}</p>
                <h3 className="font-display text-lg font-semibold">{e.name}</h3>
                <p className="font-mono text-sm text-apex-gold">${e.price}</p>
              </div>
            </GlassCard>
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
        <GlassCard className="p-5" trail glow={mod.glow} parallax={false}>
          <div className="mb-4 text-center">
            <div className="mx-auto mb-4 h-2 w-2/3 rounded-full bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">Stage / Screen</p>
          </div>
          <div className="mx-auto grid max-w-lg gap-2">
            {ROWS.map((row) => (
              <div key={row} className="flex items-center justify-center gap-2">
                <span className="w-4 font-mono text-xs text-zinc-600">{row}</span>
                {seats.filter((s) => s.id.startsWith(row)).map((seat) => {
                  const active = picked.includes(seat.id);
                  return (
                    <button
                      key={seat.id}
                      type="button"
                      disabled={seat.status === "taken"}
                      onClick={() => toggle(seat.id, seat.status)}
                      className={cn(
                        "h-8 w-8 rounded-md border text-[10px] font-mono transition",
                        seat.status === "taken" && "cursor-not-allowed border-zinc-700 bg-zinc-800 text-zinc-600",
                        seat.status === "free" && !active && "border-white/15 bg-white/5 hover:border-rose-300/50",
                        active && "border-rose-400 bg-rose-400/30 text-rose-100 shadow-[0_0_16px_rgba(251,113,133,0.45)]"
                      )}
                    >
                      {seat.id.slice(1)}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="h-fit space-y-4 p-5" glow={mod.glow} parallax={false}>
          <h3 className="font-display text-lg font-semibold">{event.name}</h3>
          <p className="text-sm text-zinc-400">Seats: {picked.length ? picked.join(", ") : "None selected"}</p>
          <p className="font-mono text-2xl font-bold text-apex-gold">${total}</p>
          <MagneticButton type="button" className="w-full" disabled={!picked.length} onClick={() => setCheckoutOpen(true)}>
            <Ticket className="h-4 w-4" /> Buy tickets
          </MagneticButton>
          <p className="text-xs text-zinc-500">Free · Selected · Taken</p>
        </GlassCard>
      </div>

      <CheckoutModal
        open={checkoutOpen && picked.length > 0}
        onClose={() => setCheckoutOpen(false)}
        mode="booking"
        amount={total}
        title={`${event.name} · ${picked.length} ticket${picked.length > 1 ? "s" : ""}`}
        confirmLabel="Pay & issue tickets"
        booking={{
          moduleId: "events",
          resourceType: "ticket",
          resourceId: `${event.id}-${picked.join(",")}`,
          title: `${event.name} · seats ${picked.join(", ")}`,
          amountCents: total * 100,
          meta: { eventId: event.id, eventName: event.name, eventType: event.type, seats: picked },
        }}
        onSuccess={onSuccess}
      />
    </div>
  );
}
