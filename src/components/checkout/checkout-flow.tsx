"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Check,
  CreditCard,
  MapPin,
  UserRound,
  Wallet,
  Banknote,
} from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { cn } from "@/lib/utils";

import type { CheckoutResult } from "@/lib/checkout-types";

export type CheckoutMode = "delivery" | "booking" | "ride" | "shipping";
export type { CheckoutResult };

type PersonalDefaults = {
  fullName?: string;
  phone?: string;
  email?: string;
};

type CheckoutFlowProps = {
  mode: CheckoutMode;
  amount: number;
  title?: string;
  confirmLabel?: string;
  initialPersonal?: PersonalDefaults;
  onComplete: (result: CheckoutResult) => void;
  onCancel?: () => void;
};

const fieldClass =
  "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-white outline-none transition focus:border-apex-cyan";

const STEPS_BY_MODE: Record<CheckoutMode, Array<"personal" | "address" | "payment" | "review">> = {
  delivery: ["personal", "address", "payment", "review"],
  shipping: ["personal", "address", "payment", "review"],
  booking: ["personal", "payment", "review"],
  ride: ["personal", "payment", "review"],
};

export function CheckoutFlow({
  mode,
  amount,
  title = "Checkout",
  confirmLabel = "Confirm & pay",
  initialPersonal,
  onComplete,
  onCancel,
}: CheckoutFlowProps) {
  const steps = STEPS_BY_MODE[mode];
  const [index, setIndex] = useState(0);
  const step = steps[index];

  const [fullName, setFullName] = useState(initialPersonal?.fullName || "");
  const [phone, setPhone] = useState(initialPersonal?.phone || "");
  const [email, setEmail] = useState(initialPersonal?.email || "");

  useEffect(() => {
    if (initialPersonal?.fullName) setFullName(initialPersonal.fullName);
    if (initialPersonal?.phone) setPhone(initialPersonal.phone);
    if (initialPersonal?.email) setEmail(initialPersonal.email);
  }, [initialPersonal?.fullName, initialPersonal?.phone, initialPersonal?.email]);
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [notes, setNotes] = useState("");
  const [method, setMethod] = useState<"card" | "apexpay" | "cash">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [error, setError] = useState("");

  const progress = useMemo(() => ((index + 1) / steps.length) * 100, [index, steps.length]);

  const validate = () => {
    if (step === "personal") {
      if (fullName.trim().length < 2) return "Enter your full name.";
      if (phone.replace(/\D/g, "").length < 8) return "Enter a valid phone number.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Enter a valid email.";
    }
    if (step === "address") {
      if (line1.trim().length < 4) return "Enter street address.";
      if (city.trim().length < 2) return "Enter city.";
      if (zip.trim().length < 3) return "Enter ZIP / postal code.";
    }
    if (step === "payment") {
      if (method === "card") {
        const digits = cardNumber.replace(/\s/g, "");
        if (digits.length < 12) return "Enter a valid card number.";
        if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) return "Expiry must be MM/YY.";
        if (cardCvc.trim().length < 3) return "Enter CVC.";
      }
    }
    return "";
  };

  const next = () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    if (index < steps.length - 1) {
      setIndex((i) => i + 1);
      return;
    }
    onComplete({
      personal: { fullName: fullName.trim(), phone: phone.trim(), email: email.trim() },
      address:
        mode === "delivery" || mode === "shipping"
          ? {
              line1: line1.trim(),
              line2: line2.trim(),
              city: city.trim(),
              zip: zip.trim(),
              notes: notes.trim(),
            }
          : undefined,
      payment: {
        method,
        cardLast4: method === "card" ? cardNumber.replace(/\s/g, "").slice(-4) : undefined,
      },
    });
  };

  const back = () => {
    setError("");
    if (index === 0) {
      onCancel?.();
      return;
    }
    setIndex((i) => i - 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <span className="font-mono text-sm text-apex-gold">${amount.toFixed(2)}</span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-apex-purple to-apex-cyan transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex flex-wrap gap-2">
        {steps.map((s, i) => (
          <span
            key={s}
            className={cn(
              "rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em]",
              i === index
                ? "border-apex-cyan/50 text-apex-cyan"
                : i < index
                  ? "border-emerald-400/40 text-emerald-300"
                  : "border-white/10 text-zinc-600"
            )}
          >
            {s}
          </span>
        ))}
      </div>

      {step === "personal" && (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
            <UserRound className="h-3.5 w-3.5" /> Personal details
          </p>
          <input className={fieldClass} placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <input className={fieldClass} placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className={fieldClass} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      )}

      {step === "address" && (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
            <MapPin className="h-3.5 w-3.5" /> Delivery address
          </p>
          <input className={fieldClass} placeholder="Street address" value={line1} onChange={(e) => setLine1(e.target.value)} />
          <input className={fieldClass} placeholder="Apt / suite (optional)" value={line2} onChange={(e) => setLine2(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <input className={fieldClass} placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
            <input className={fieldClass} placeholder="ZIP / Postal" value={zip} onChange={(e) => setZip(e.target.value)} />
          </div>
          <input className={fieldClass} placeholder="Delivery notes (gate code, landmark…)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      )}

      {step === "payment" && (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
            <CreditCard className="h-3.5 w-3.5" /> Payment method
          </p>
          <div className="grid gap-2">
            {(
              [
                { id: "card" as const, label: "Card", icon: CreditCard },
                { id: "apexpay" as const, label: "ApexPay Wallet", icon: Wallet },
                { id: "cash" as const, label: mode === "delivery" || mode === "ride" ? "Cash on delivery" : "Pay at venue", icon: Banknote },
              ] as const
            ).map((opt) => {
              const Icon = opt.icon;
              const active = method === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMethod(opt.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border px-3 py-3 text-left text-sm transition",
                    active ? "border-apex-cyan/50 bg-apex-cyan/10 text-white" : "border-white/10 text-zinc-400"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {opt.label}
                  {active && <Check className="ml-auto h-4 w-4 text-apex-cyan" />}
                </button>
              );
            })}
          </div>
          {method === "card" && (
            <div className="space-y-3 pt-1">
              <input
                className={fieldClass}
                placeholder="Card number"
                inputMode="numeric"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/[^\d\s]/g, ""))}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className={fieldClass}
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                />
                <input
                  className={fieldClass}
                  placeholder="CVC"
                  inputMode="numeric"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                />
              </div>
            </div>
          )}
          {method === "apexpay" && (
            <p className="rounded-2xl border border-apex-gold/30 bg-apex-gold/10 px-3 py-2 text-xs text-apex-gold">
              Will charge ApexPay wallet balance at confirmation.
            </p>
          )}
        </div>
      )}

      {step === "review" && (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">Review order</p>
          <div className="flex items-start gap-2 text-zinc-300">
            <UserRound className="mt-0.5 h-4 w-4 text-apex-cyan" />
            <div>
              <p className="font-medium text-white">{fullName}</p>
              <p className="text-xs text-zinc-500">{phone} · {email}</p>
            </div>
          </div>
          {(mode === "delivery" || mode === "shipping") && (
            <div className="flex items-start gap-2 text-zinc-300">
              <Building2 className="mt-0.5 h-4 w-4 text-apex-purple" />
              <div>
                <p className="font-medium text-white">{line1}{line2 ? `, ${line2}` : ""}</p>
                <p className="text-xs text-zinc-500">
                  {city}, {zip}
                  {notes ? ` · ${notes}` : ""}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-2 text-zinc-300">
            <CreditCard className="mt-0.5 h-4 w-4 text-apex-gold" />
            <p>
              {method === "card" && `Card ending ${cardNumber.replace(/\s/g, "").slice(-4) || "••••"}`}
              {method === "apexpay" && "ApexPay Wallet"}
              {method === "cash" && (mode === "delivery" || mode === "ride" ? "Cash on delivery" : "Pay at venue")}
            </p>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-3">
            <span className="text-zinc-400">Amount due</span>
            <span className="font-mono text-xl font-bold text-white">${amount.toFixed(2)}</span>
          </div>
        </div>
      )}

      {error && <p className="text-center text-sm text-rose-400">{error}</p>}

      <div className="flex gap-2">
        <MagneticButton type="button" variant="secondary" className="flex-1" onClick={back}>
          {index === 0 ? "Cancel" : "Back"}
        </MagneticButton>
        <MagneticButton type="button" className="flex-1" onClick={next}>
          {step === "review" ? confirmLabel : "Continue"}
        </MagneticButton>
      </div>
    </div>
  );
}
