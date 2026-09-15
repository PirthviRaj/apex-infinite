"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { ModuleBookingResult } from "@/lib/booking-server";

export function BookingReceipt({ booking, subtitle }: { booking: ModuleBookingResult; subtitle?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200"
    >
      <p className="flex items-center gap-2 font-medium text-emerald-100">
        <CheckCircle2 className="h-4 w-4" /> Booking confirmed · Ref {booking.reference}
      </p>
      <p className="mt-1 text-xs text-emerald-200/80">
        {booking.guestName} · {booking.guestPhone} · {booking.guestEmail}
      </p>
      <p className="mt-1 text-xs text-emerald-200/70">
        Paid ${(booking.amountCents / 100).toFixed(2)} via {booking.paymentMethod}
        {subtitle ? ` · ${subtitle}` : ""}
      </p>
    </motion.div>
  );
}
