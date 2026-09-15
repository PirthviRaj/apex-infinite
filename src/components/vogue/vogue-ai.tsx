"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Sparkles, Wand2 } from "lucide-react";
import { getModule } from "@/lib/modules";
import { ModuleHeader } from "@/components/modules/module-header";
import { GlassCard } from "@/components/ui/glass-card";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { CheckoutFlow, type CheckoutResult } from "@/components/checkout/checkout-flow";

const CATALOG = [
  { id: "blazer", name: "Midnight Blazer", price: 220, tags: ["formal", "date", "office"], image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80" },
  { id: "sneaker", name: "Orbit Sneakers", price: 160, tags: ["casual", "street", "travel"], image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80" },
  { id: "dress", name: "Aurora Slip Dress", price: 140, tags: ["date", "evening"], image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80" },
  { id: "denim", name: "Chrome Denim", price: 98, tags: ["casual", "street"], image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80" },
  { id: "watch", name: "Pulse Chrono", price: 310, tags: ["office", "formal"], image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80" },
  { id: "jacket", name: "Storm Shell Jacket", price: 185, tags: ["travel", "casual"], image: "https://images.unsplash.com/photo-1544923246-77307dd628ce?auto=format&fit=crop&w=800&q=80" },
];

export function VogueAi() {
  const mod = getModule("vogue")!;
  const [vibe, setVibe] = useState("date");
  const [cart, setCart] = useState<string[]>([]);
  const [advice, setAdvice] = useState("Tell me the occasion — I’ll style a look from the global catalog.");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [order, setOrder] = useState<CheckoutResult | null>(null);

  const picks = useMemo(() => {
    const ranked = CATALOG.map((item) => ({
      ...item,
      score: item.tags.includes(vibe) ? 2 : item.tags.some((t) => vibe.includes(t)) ? 1 : 0,
    })).sort((a, b) => b.score - a.score);
    return ranked;
  }, [vibe]);

  const styleMe = () => {
    const top = picks.filter((p) => p.score > 0).slice(0, 3);
    setAdvice(
      top.length
        ? `For a ${vibe} vibe: pair ${top.map((t) => t.name).join(" + ")}. Clean silhouette, neon accent optional.`
        : "Try vibes like date, office, travel, or street."
    );
    setCart(top.map((t) => t.id));
  };

  const toggle = (id: string) => {
    setCart((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const total = CATALOG.filter((c) => cart.includes(c.id)).reduce((s, c) => s + c.price, 0);

  return (
    <div className="px-4 pb-28 pt-16 lg:px-8 lg:pt-8">
      <ModuleHeader module={mod} eyebrow="Vogue AI · Personal stylist">
        <p className="mt-3 text-sm text-purple-300">Global shopping with an AI stylist that builds outfits for your vibe</p>
      </ModuleHeader>

      <GlassCard className="mb-6 space-y-4 p-5" trail glow={mod.glow} parallax={false}>
        <div className="flex flex-wrap items-center gap-3">
          <Wand2 className="h-5 w-5 text-purple-300" />
          <p className="text-sm text-zinc-300">Occasion / vibe</p>
          {["date", "office", "travel", "street", "evening"].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVibe(v)}
              className={`rounded-full border px-3 py-1.5 text-xs capitalize ${
                vibe === v ? "border-purple-400/50 bg-purple-400/20 text-purple-200" : "border-white/10 text-zinc-400"
              }`}
            >
              {v}
            </button>
          ))}
          <MagneticButton type="button" className="!rounded-xl !px-4 !py-2 text-xs" onClick={styleMe}>
            <Sparkles className="h-3.5 w-3.5" /> Style me
          </MagneticButton>
        </div>
        <p className="text-sm text-purple-200">{advice}</p>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {picks.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <GlassCard className={`overflow-hidden ${cart.includes(item.id) ? "border-purple-400/40" : ""}`} glow={mod.glow}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt={item.name} className="h-44 w-full object-cover" />
              <div className="space-y-3 p-4">
                <div>
                  <h3 className="font-display text-lg font-semibold">{item.name}</h3>
                  <p className="font-mono text-sm text-apex-gold">${item.price}</p>
                </div>
                <MagneticButton
                  type="button"
                  variant={cart.includes(item.id) ? "gold" : "secondary"}
                  className="w-full !rounded-xl !py-2 text-xs"
                  onClick={() => toggle(item.id)}
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  {cart.includes(item.id) ? "In look" : "Add to look"}
                </MagneticButton>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <GlassCard className="mt-6 flex flex-wrap items-center justify-between gap-3 p-5" glow={mod.glow} parallax={false}>
        <p className="text-sm text-zinc-300">Look total · {cart.length} pieces</p>
        <p className="font-mono text-2xl font-bold">${total}</p>
        <MagneticButton type="button" disabled={!cart.length} onClick={() => setCheckoutOpen(true)}>
          Checkout look
        </MagneticButton>
      </GlassCard>

      {order && (
        <p className="mt-4 text-center text-sm text-purple-300">
          Order placed for {order.personal.fullName} · shipping to {order.address?.city} · paid via {order.payment.method}
        </p>
      )}

      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-5" trail glow={mod.glow} parallax={false}>
            <CheckoutFlow
              mode="shipping"
              amount={total}
              title="Vogue checkout"
              confirmLabel="Place order & pay"
              onCancel={() => setCheckoutOpen(false)}
              onComplete={(result) => {
                setOrder(result);
                setCheckoutOpen(false);
                setCart([]);
              }}
            />
          </GlassCard>
        </div>
      )}
    </div>
  );
}
