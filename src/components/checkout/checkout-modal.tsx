"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { CheckoutFlow, type CheckoutMode, type CheckoutResult } from "@/components/checkout/checkout-flow";
import { submitBooking, type SubmitBookingPayload } from "@/lib/submit-booking";
import type { ModuleBookingResult } from "@/lib/booking-server";
import { useAuthStore } from "@/store/auth-store";

type CheckoutModalProps = {
  open: boolean;
  onClose: () => void;
  mode: CheckoutMode;
  amount: number;
  title: string;
  confirmLabel?: string;
  booking: Omit<SubmitBookingPayload, "checkout">;
  onSuccess: (result: ModuleBookingResult, checkout: CheckoutResult) => void;
};

export function CheckoutModal({
  open,
  onClose,
  mode,
  amount,
  title,
  confirmLabel = "Confirm & pay",
  booking,
  onSuccess,
}: CheckoutModalProps) {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const initialPersonal = {
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  };

  const handleComplete = async (checkout: CheckoutResult) => {
    setLoading(true);
    setError("");
    try {
      const result = await submitBooking({ ...booking, checkout });
      onSuccess(result, checkout);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <GlassCard className="w-full max-w-md p-5" trail glow="rgba(168,85,247,0.35)" parallax={false}>
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-apex-cyan" />
            <p className="text-sm text-zinc-400">Processing payment & saving booking…</p>
          </div>
        ) : (
          <>
            <CheckoutFlow
              mode={mode}
              amount={amount}
              title={title}
              confirmLabel={confirmLabel}
              initialPersonal={initialPersonal}
              onCancel={onClose}
              onComplete={handleComplete}
            />
            {error && <p className="mt-3 text-center text-sm text-rose-400">{error}</p>}
          </>
        )}
      </GlassCard>
    </div>
  );
}
