import type { CheckoutResult } from "@/lib/checkout-types";
import type { ModuleBookingResult } from "@/lib/booking-server";

export type SubmitBookingPayload = {
  moduleId: string;
  resourceType: string;
  resourceId: string;
  title: string;
  amountCents: number;
  startsAt?: string | null;
  endsAt?: string | null;
  meta?: Record<string, unknown>;
  checkout: CheckoutResult;
};

export async function submitBooking(payload: SubmitBookingPayload): Promise<ModuleBookingResult> {
  const res = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "Booking failed.");
  }
  return data.booking as ModuleBookingResult;
}
