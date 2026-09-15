"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarPlus, HeartPulse, Sparkles } from "lucide-react";
import { getModule } from "@/lib/modules";
import { ModuleHeader } from "@/components/modules/module-header";
import { GlassCard } from "@/components/ui/glass-card";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { CheckoutModal } from "@/components/checkout/checkout-modal";
import { BookingReceipt } from "@/components/checkout/booking-receipt";
import type { ModuleBookingResult } from "@/lib/booking-server";

const SERVICES = [
  { id: "dr", name: "Dr. Maya Chen", role: "General Physician", slots: ["9:00 AM", "11:30 AM", "3:00 PM"], kind: "Doctor", price: 75, image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80" },
  { id: "spa", name: "Aurora Spa Ritual", role: "90-min recovery massage", slots: ["1:00 PM", "4:30 PM", "6:00 PM"], kind: "Spa", price: 95, image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80" },
  { id: "dent", name: "Dr. Leo Park", role: "Dental checkup", slots: ["10:15 AM", "2:45 PM"], kind: "Doctor", price: 85, image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80" },
  { id: "yoga", name: "ZenFlow Private Yoga", role: "Breath + mobility", slots: ["7:00 AM", "5:30 PM"], kind: "Spa", price: 55, image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80" },
];

type PendingSlot = {
  serviceId: string;
  slot: string;
};

export function WellnessSuite() {
  const mod = getModule("wellness")!;
  const [booked, setBooked] = useState<string | null>(null);
  const [calendar, setCalendar] = useState<"none" | "google" | "apple">("none");
  const [pending, setPending] = useState<PendingSlot | null>(null);
  const [receipt, setReceipt] = useState<ModuleBookingResult | null>(null);

  const service = pending ? SERVICES.find((s) => s.id === pending.serviceId) : null;

  return (
    <div className="px-4 pb-28 pt-16 lg:px-8 lg:pt-8">
      <ModuleHeader module={mod} eyebrow="ZenFlow Wellness · Care & spa">
        <p className="mt-3 text-sm text-teal-300">Book with name, phone & payment · registered to your account</p>
      </ModuleHeader>

      {receipt && <div className="mb-6"><BookingReceipt booking={receipt} subtitle="Wellness appointment" /></div>}

      <GlassCard className="mb-6 flex flex-wrap items-center gap-3 p-4" glow={mod.glow} parallax={false}>
        <HeartPulse className="h-5 w-5 text-teal-300" />
        <p className="text-sm text-zinc-300">Calendar sync:</p>
        <MagneticButton type="button" variant={calendar === "google" ? "primary" : "secondary"} className="!rounded-xl !px-3 !py-2 text-xs" onClick={() => setCalendar("google")}>
          Google Calendar
        </MagneticButton>
        <MagneticButton type="button" variant={calendar === "apple" ? "primary" : "secondary"} className="!rounded-xl !px-3 !py-2 text-xs" onClick={() => setCalendar("apple")}>
          Apple Calendar
        </MagneticButton>
        {calendar !== "none" && (
          <span className="text-xs text-teal-300">Connected to {calendar === "google" ? "Google" : "Apple"} ✓</span>
        )}
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-2">
        {SERVICES.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard className="overflow-hidden" glow={mod.glow}>
              <div className="grid sm:grid-cols-[140px_1fr]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.image} alt={s.name} className="h-40 w-full object-cover sm:h-full" />
                <div className="space-y-3 p-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-teal-400">{s.kind}</p>
                    <h3 className="font-display text-xl font-semibold">{s.name}</h3>
                    <p className="text-sm text-zinc-500">{s.role} · ${s.price}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {s.slots.map((slot) => {
                      const id = `${s.id}-${slot}`;
                      return (
                        <MagneticButton
                          key={slot}
                          type="button"
                          variant={booked === id ? "gold" : "secondary"}
                          className="!rounded-xl !px-3 !py-2 text-xs"
                          strength={0.15}
                          onClick={() => setPending({ serviceId: s.id, slot })}
                        >
                          <CalendarPlus className="h-3 w-3" />
                          {booked === id ? "Booked" : slot}
                        </MagneticButton>
                      );
                    })}
                  </div>
                  {booked?.startsWith(s.id) && (
                    <p className="flex items-center gap-1 text-xs text-teal-300">
                      <Sparkles className="h-3 w-3" />
                      Appointment confirmed{calendar !== "none" ? ` · synced to ${calendar}` : ""}
                    </p>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {service && pending && (
        <CheckoutModal
          open
          onClose={() => setPending(null)}
          mode="booking"
          amount={service.price}
          title={`${service.name} · ${pending.slot}`}
          confirmLabel="Pay & confirm appointment"
          booking={{
            moduleId: "wellness",
            resourceType: service.kind.toLowerCase(),
            resourceId: `${service.id}-${pending.slot}`,
            title: `${service.name} · ${pending.slot}`,
            amountCents: service.price * 100,
            meta: {
              provider: service.name,
              serviceType: service.kind,
              slot: pending.slot,
              calendarSync: calendar !== "none" ? calendar : null,
            },
          }}
          onSuccess={(result) => {
            setReceipt(result);
            setBooked(`${service.id}-${pending.slot}`);
            setPending(null);
          }}
        />
      )}
    </div>
  );
}
