"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Minus, Plus, ShoppingCart, Truck } from "lucide-react";
import { getModule } from "@/lib/modules";
import { ModuleHeader } from "@/components/modules/module-header";
import { GlassCard } from "@/components/ui/glass-card";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { CheckoutFlow, type CheckoutResult } from "@/components/checkout/checkout-flow";

const ITEMS = [
  { id: "sushi", name: "Neon Roll Sushi", tag: "Chef pick", price: 18.5, eta: "22 min", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80" },
  { id: "burger", name: "Apex Smash Burger", tag: "Fast", price: 14.0, eta: "18 min", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80" },
  { id: "grocery", name: "Fresh Grocery Box", tag: "Daily", price: 32.0, eta: "35 min", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80" },
  { id: "salad", name: "Zen Bowl Salad", tag: "Healthy", price: 12.5, eta: "20 min", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80" },
  { id: "pizza", name: "Midnight Pizza", tag: "Hot", price: 16.0, eta: "25 min", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80" },
  { id: "coffee", name: "Cold Brew Pack", tag: "Grocery", price: 9.0, eta: "15 min", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80" },
];

type CartLine = { id: string; qty: number };
type Phase = "cart" | "checkout" | "tracking";

export function FoodSuite() {
  const mod = getModule("food")!;
  const [cart, setCart] = useState<CartLine[]>([]);
  const [flyId, setFlyId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("cart");
  const [checkout, setCheckout] = useState<CheckoutResult | null>(null);

  const add = (id: string) => {
    setFlyId(id);
    setTimeout(() => setFlyId(null), 600);
    setCart((prev) => {
      const hit = prev.find((p) => p.id === id);
      if (hit) return prev.map((p) => (p.id === id ? { ...p, qty: p.qty + 1 } : p));
      return [...prev, { id, qty: 1 }];
    });
    if (phase === "tracking") {
      setPhase("cart");
      setCheckout(null);
    }
  };

  const changeQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qty: p.qty + delta } : p))
        .filter((p) => p.qty > 0)
    );
  };

  const lines = cart.map((c) => ({ ...c, item: ITEMS.find((i) => i.id === c.id)! }));
  const total = lines.reduce((sum, l) => sum + l.item.price * l.qty, 0);
  const count = lines.reduce((sum, l) => sum + l.qty, 0);

  return (
    <div className="px-4 pb-28 pt-16 lg:px-8 lg:pt-8">
      <ModuleHeader module={mod} eyebrow="Food & Grocery · Delivery">
        <p className="mt-3 text-sm text-apex-cyan">
          Cart → personal details → delivery address → payment → live tracking
        </p>
      </ModuleHeader>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <GlassCard className="overflow-hidden" glow={mod.glow}>
                <div className="relative h-36 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-apex-cyan backdrop-blur">
                    {item.tag}
                  </span>
                  <AnimatePresence>
                    {flyId === item.id && (
                      <motion.div
                        className="absolute right-4 top-4 rounded-full bg-apex-cyan px-2 py-1 text-xs font-bold text-black"
                        initial={{ opacity: 1, y: 0, scale: 1 }}
                        animate={{ opacity: 0, y: -40, scale: 0.6 }}
                        exit={{ opacity: 0 }}
                      >
                        +1
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="space-y-3 p-4">
                  <div>
                    <h3 className="font-display text-lg font-semibold">{item.name}</h3>
                    <p className="flex items-center gap-1 text-xs text-zinc-500">
                      <Clock className="h-3 w-3" /> {item.eta}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-lg font-bold text-white">${item.price.toFixed(2)}</p>
                    <MagneticButton type="button" className="!rounded-xl !px-3 !py-2 text-xs" strength={0.2} onClick={() => add(item.id)}>
                      <Plus className="h-3.5 w-3.5" /> Add
                    </MagneticButton>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <GlassCard className="h-fit p-5 xl:sticky xl:top-8" trail glow="rgba(34,211,238,0.3)" parallax={false}>
          {phase === "cart" && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
                  <ShoppingCart className="h-5 w-5 text-apex-cyan" /> Cart
                </h2>
                <span className="rounded-full bg-apex-cyan/20 px-2.5 py-1 font-mono text-xs text-apex-cyan">{count}</span>
              </div>
              {lines.length === 0 ? (
                <p className="text-sm text-zinc-500">Your cart is empty. Add food or groceries.</p>
              ) : (
                <div className="space-y-3">
                  {lines.map((line) => (
                    <div key={line.id} className="flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{line.item.name}</p>
                        <p className="font-mono text-xs text-zinc-500">${line.item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" className="rounded-lg border border-white/10 p-1" onClick={() => changeQty(line.id, -1)}>
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-4 text-center text-sm">{line.qty}</span>
                        <button type="button" className="rounded-lg border border-white/10 p-1" onClick={() => changeQty(line.id, 1)}>
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="text-sm text-zinc-400">Total</span>
                    <span className="font-mono text-xl font-bold">${total.toFixed(2)}</span>
                  </div>
                  <MagneticButton type="button" className="w-full" onClick={() => setPhase("checkout")}>
                    <Truck className="h-4 w-4" /> Proceed to checkout
                  </MagneticButton>
                </div>
              )}
            </>
          )}

          {phase === "checkout" && (
            <CheckoutFlow
              mode="delivery"
              amount={total}
              title="Delivery checkout"
              confirmLabel="Place order & pay"
              onCancel={() => setPhase("cart")}
              onComplete={(result) => {
                setCheckout(result);
                setPhase("tracking");
              }}
            />
          )}

          {phase === "tracking" && checkout && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3">
                <p className="font-semibold text-emerald-300">Order confirmed</p>
                <p className="mt-1 text-xs text-emerald-200/80">Rider assigned · ETA 24 min</p>
              </div>
              <div className="space-y-2 text-sm text-zinc-400">
                <p>
                  <span className="text-zinc-500">Deliver to: </span>
                  {checkout.address?.line1}, {checkout.address?.city} {checkout.address?.zip}
                </p>
                <p>
                  <span className="text-zinc-500">Contact: </span>
                  {checkout.personal.fullName} · {checkout.personal.phone}
                </p>
                <p>
                  <span className="text-zinc-500">Paid via: </span>
                  {checkout.payment.method === "card"
                    ? `Card •••• ${checkout.payment.cardLast4}`
                    : checkout.payment.method === "apexpay"
                      ? "ApexPay Wallet"
                      : "Cash on delivery"}
                </p>
                <p className="font-mono text-lg text-white">${total.toFixed(2)}</p>
              </div>
              <MagneticButton
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setCart([]);
                  setCheckout(null);
                  setPhase("cart");
                }}
              >
                New order
              </MagneticButton>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
