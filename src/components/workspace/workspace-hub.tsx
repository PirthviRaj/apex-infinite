"use client";

import { useMemo, useState } from "react";
import { Check, Monitor, Users } from "lucide-react";
import { getModule } from "@/lib/modules";
import { ModuleHeader } from "@/components/modules/module-header";
import { GlassCard } from "@/components/ui/glass-card";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { CheckoutModal } from "@/components/checkout/checkout-modal";
import { BookingReceipt } from "@/components/checkout/booking-receipt";
import type { ModuleBookingResult } from "@/lib/booking-server";
import { cn } from "@/lib/utils";

type Seat = {
  id: string;
  label: string;
  type: "desk" | "meeting" | "focus";
  x: number;
  y: number;
  status: "free" | "busy" | "mine";
};

const SEAT_PRICES: Record<Seat["type"], number> = {
  desk: 25,
  focus: 35,
  meeting: 45,
};

const INITIAL: Seat[] = [
  { id: "a1", label: "A-01", type: "desk", x: 12, y: 18, status: "free" },
  { id: "a2", label: "A-02", type: "desk", x: 28, y: 18, status: "busy" },
  { id: "a3", label: "A-03", type: "desk", x: 44, y: 18, status: "free" },
  { id: "a4", label: "A-04", type: "desk", x: 60, y: 18, status: "free" },
  { id: "b1", label: "B-11", type: "focus", x: 16, y: 48, status: "free" },
  { id: "b2", label: "B-12", type: "focus", x: 32, y: 48, status: "busy" },
  { id: "b3", label: "B-14", type: "desk", x: 52, y: 48, status: "free" },
  { id: "m1", label: "M-01", type: "meeting", x: 78, y: 28, status: "free" },
  { id: "m2", label: "M-02", type: "meeting", x: 78, y: 55, status: "busy" },
  { id: "c1", label: "C-03", type: "desk", x: 20, y: 78, status: "free" },
  { id: "c2", label: "C-04", type: "desk", x: 40, y: 78, status: "free" },
  { id: "c3", label: "C-05", type: "desk", x: 60, y: 78, status: "busy" },
];

export function WorkspaceHub() {
  const mod = getModule("workspace")!;
  const [seats, setSeats] = useState(INITIAL);
  const [selected, setSelected] = useState<string | null>(null);
  const [date, setDate] = useState("2026-09-08");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receipt, setReceipt] = useState<ModuleBookingResult | null>(null);

  const selectedSeat = useMemo(() => seats.find((s) => s.id === selected), [seats, selected]);
  const freeCount = seats.filter((s) => s.status === "free" || s.status === "mine").length;
  const price = selectedSeat ? SEAT_PRICES[selectedSeat.type] : 0;

  const onSuccess = (result: ModuleBookingResult) => {
    if (!selectedSeat) return;
    setSeats((prev) =>
      prev.map((s) =>
        s.id === selectedSeat.id ? { ...s, status: "mine" } : s.status === "mine" ? { ...s, status: "free" } : s
      )
    );
    setReceipt(result);
    setCheckoutOpen(false);
  };

  return (
    <div className="px-4 pb-28 pt-16 lg:px-8 lg:pt-8">
      <ModuleHeader module={mod} eyebrow="WorkSpace Hub · Floor plan">
        <p className="mt-3 text-sm text-apex-gold">{freeCount} seats available today · checkout requires name, phone & payment</p>
      </ModuleHeader>

      {receipt && <div className="mb-6"><BookingReceipt booking={receipt} subtitle={`Seat reserved for ${date}`} /></div>}

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <GlassCard className="p-4 sm:p-6" trail glow={mod.glow} parallax={false}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold">Level 12 · Open Studio</h2>
            <div className="flex flex-wrap gap-3 text-xs text-zinc-400">
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Free</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Busy</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-apex-gold" /> Yours</span>
            </div>
          </div>

          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.08),transparent_40%),linear-gradient(135deg,#0a0a0f,#050508)]">
            <div className="absolute inset-6 rounded-2xl border border-dashed border-white/10" />
            <div className="absolute left-[8%] top-[8%] font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600">North wing</div>
            <div className="absolute bottom-[8%] right-[8%] font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600">Lounge</div>

            {seats.map((seat) => (
              <button
                key={seat.id}
                type="button"
                disabled={seat.status === "busy"}
                onClick={() => setSelected(seat.id)}
                style={{ left: `${seat.x}%`, top: `${seat.y}%` }}
                className={cn(
                  "absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-xl border text-[10px] font-mono transition",
                  seat.status === "free" && "border-emerald-400/40 bg-emerald-400/15 text-emerald-300 hover:scale-110",
                  seat.status === "busy" && "cursor-not-allowed border-rose-500/40 bg-rose-500/20 text-rose-300 opacity-70",
                  seat.status === "mine" && "border-apex-gold/50 bg-apex-gold/20 text-apex-gold shadow-glow-gold",
                  selected === seat.id && "ring-2 ring-white/50 scale-110"
                )}
              >
                {seat.type === "meeting" ? <Users className="h-3.5 w-3.5" /> : <Monitor className="h-3.5 w-3.5" />}
                {seat.label}
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="h-fit space-y-4 p-5" glow={mod.glow} parallax={false}>
          <h3 className="font-display text-lg font-semibold">Book seat</h3>
          <label className="block space-y-1.5">
            <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm outline-none [color-scheme:dark] focus:border-apex-gold"
            />
          </label>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-xs text-zinc-500">Selected</p>
            <p className="font-display text-2xl font-bold">{selectedSeat?.label || "—"}</p>
            <p className="text-xs capitalize text-zinc-400">
              {selectedSeat ? `${selectedSeat.type} seat · $${price}/day` : "Pick a free desk"}
            </p>
          </div>
          <MagneticButton
            type="button"
            variant="gold"
            className="w-full"
            disabled={!selectedSeat || selectedSeat.status === "busy"}
            onClick={() => setCheckoutOpen(true)}
          >
            <Check className="h-4 w-4" /> Confirm desk booking
          </MagneticButton>
        </GlassCard>
      </div>

      {selectedSeat && (
        <CheckoutModal
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          mode="booking"
          amount={price}
          title={`WorkSpace · ${selectedSeat.label} · ${date}`}
          confirmLabel="Pay & reserve seat"
          booking={{
            moduleId: "workspace",
            resourceType: selectedSeat.type,
            resourceId: selectedSeat.id,
            title: `Desk ${selectedSeat.label} · Level 12`,
            amountCents: price * 100,
            startsAt: date,
            meta: { seatLabel: selectedSeat.label, seatType: selectedSeat.type, floor: "Level 12" },
          }}
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
}
