"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, Receipt, Send, Wallet } from "lucide-react";
import { getModule } from "@/lib/modules";
import { ModuleHeader } from "@/components/modules/module-header";
import { GlassCard } from "@/components/ui/glass-card";
import { MagneticButton } from "@/components/ui/magnetic-button";

const BILLS = [
  { id: "power", name: "Electricity", due: "$84.20" },
  { id: "net", name: "Fiber Internet", due: "$59.00" },
  { id: "water", name: "Water Utility", due: "$27.45" },
];

export function ApexPay() {
  const mod = getModule("pay")!;
  const [balance, setBalance] = useState(2840.55);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("50");
  const [note, setNote] = useState("Apex P2P");
  const [history, setHistory] = useState([
    { id: "1", label: "Received from Mira", amount: +120, type: "in" as const },
    { id: "2", label: "Coffee split", amount: -18.5, type: "out" as const },
    { id: "3", label: "Paycheck float", amount: +2100, type: "in" as const },
  ]);
  const [toast, setToast] = useState("");

  const transfer = () => {
    const value = Number(amount);
    if (!recipient.trim() || !value || value <= 0 || value > balance) {
      setToast("Enter a valid recipient and amount.");
      return;
    }
    setBalance((b) => b - value);
    setHistory((h) => [{ id: String(Date.now()), label: `Sent to ${recipient}`, amount: -value, type: "out" }, ...h]);
    setToast(`Sent $${value.toFixed(2)} to ${recipient}`);
    setRecipient("");
  };

  const payBill = (name: string, due: string) => {
    const value = Number(due.replace("$", ""));
    if (value > balance) {
      setToast("Insufficient wallet balance.");
      return;
    }
    setBalance((b) => b - value);
    setHistory((h) => [{ id: String(Date.now()), label: `Bill · ${name}`, amount: -value, type: "out" }, ...h]);
    setToast(`Paid ${name} ${due}`);
  };

  return (
    <div className="px-4 pb-28 pt-16 lg:px-8 lg:pt-8">
      <ModuleHeader module={mod} eyebrow="ApexPay · Digital wallet">
        <p className="mt-3 text-sm text-apex-gold">P2P transfers, bill pay, and a glassmorphic wallet</p>
      </ModuleHeader>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <GlassCard className="relative overflow-hidden p-6" trail glow={mod.glow}>
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-apex-gold/20 blur-3xl" />
          <div className="relative">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-apex-gold">
              <Wallet className="h-4 w-4" /> Available balance
            </p>
            <p className="mt-3 font-display text-5xl font-bold tracking-tight">${balance.toFixed(2)}</p>
            <p className="mt-2 text-sm text-zinc-400">Apex Infinite Wallet · USD</p>
          </div>
        </GlassCard>

        <GlassCard className="space-y-3 p-5" glow={mod.glow} parallax={false}>
          <h2 className="font-display text-lg font-semibold">Send money (P2P)</h2>
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Phone, @handle, or name"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm outline-none focus:border-apex-gold"
          />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            type="number"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm outline-none focus:border-apex-gold"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm outline-none focus:border-apex-gold"
          />
          <MagneticButton type="button" variant="gold" className="w-full" onClick={transfer}>
            <Send className="h-4 w-4" /> Transfer now
          </MagneticButton>
        </GlassCard>

        <GlassCard className="space-y-3 p-5" glow={mod.glow} parallax={false}>
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Receipt className="h-5 w-5 text-apex-gold" /> Bills due
          </h2>
          {BILLS.map((bill) => (
            <div key={bill.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div>
                <p className="font-medium">{bill.name}</p>
                <p className="font-mono text-xs text-zinc-500">{bill.due}</p>
              </div>
              <MagneticButton type="button" variant="secondary" className="!rounded-xl !px-3 !py-2 text-xs" onClick={() => payBill(bill.name, bill.due)}>
                Pay
              </MagneticButton>
            </div>
          ))}
        </GlassCard>

        <GlassCard className="space-y-3 p-5" glow={mod.glow} parallax={false}>
          <h2 className="font-display text-lg font-semibold">Activity</h2>
          {history.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                {item.type === "in" ? (
                  <ArrowDownLeft className="h-4 w-4 text-emerald-400" />
                ) : (
                  <ArrowUpRight className="h-4 w-4 text-rose-400" />
                )}
                <p className="text-sm">{item.label}</p>
              </div>
              <p className={`font-mono text-sm font-semibold ${item.amount > 0 ? "text-emerald-400" : "text-rose-300"}`}>
                {item.amount > 0 ? "+" : ""}${Math.abs(item.amount).toFixed(2)}
              </p>
            </motion.div>
          ))}
          {toast && <p className="text-center text-sm text-apex-gold">{toast}</p>}
        </GlassCard>
      </div>
    </div>
  );
}
