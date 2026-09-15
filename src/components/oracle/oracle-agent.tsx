"use client";

import { FormEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Minimize2, Send, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { detectIntent } from "@/lib/intent";
import { MagneticButton } from "@/components/ui/magnetic-button";

type Message = { role: "user" | "oracle"; text: string };

export function OracleAgent() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "oracle",
      text: "I am Oracle — wired to the same Omnibar brain. Ask me to book travel, order food, pay a bill, or jump to any module.",
    },
  ]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setThinking(true);

    const intent = detectIntent(text);
    setTimeout(() => {
      setThinking(false);
      if (intent) {
        const entities = Object.entries(intent.entities)
          .map(([k, v]) => `${k} ${v}`)
          .join(", ");
        setMessages((m) => [
          ...m,
          {
            role: "oracle",
            text: `Intent locked (${Math.round(intent.confidence * 100)}%): ${intent.label}.${
              entities ? ` Captured ${entities}.` : ""
            } Opening ${intent.module.name}…`,
          },
        ]);
        const href =
          intent.entities.place && intent.module.id === "travel"
            ? `${intent.module.href}?to=${encodeURIComponent(intent.entities.place)}`
            : intent.module.href;
        setTimeout(() => router.push(href), 700);
      } else {
        setMessages((m) => [
          ...m,
          {
            role: "oracle",
            text: "No clear module match. Try: “Book a flight to Tokyo”, “Order sushi”, “Pay electricity bill”, or “Hire a plumber”.",
          },
        ]);
      }
    }, 450);
  };

  return (
    <>
      <motion.button
        type="button"
        className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full border border-apex-purple/50 bg-black/80 shadow-glow backdrop-blur-xl"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            "0 0 20px rgba(168,85,247,0.35)",
            "0 0 40px rgba(34,211,238,0.35)",
            "0 0 20px rgba(168,85,247,0.35)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        onClick={() => setOpen(true)}
      >
        <Bot className="h-7 w-7 text-apex-cyan" />
        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-apex-gold animate-neural-pulse" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="fixed bottom-6 right-6 z-50 flex h-[min(640px,78vh)] w-[min(420px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-3xl border border-apex-purple/40 bg-black/90 shadow-neural backdrop-blur-2xl border-trail"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-apex-purple to-apex-cyan">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display font-semibold">Oracle AI</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-apex-cyan">
                    Shared intent engine
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  className="rounded-xl p-2 text-zinc-400 hover:text-white"
                  onClick={() => setOpen(false)}
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="rounded-xl p-2 text-zinc-400 hover:text-white"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="apex-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={`${msg.role}-${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "ml-auto bg-apex-purple/30 text-white"
                      : "mr-auto border border-white/10 bg-white/[0.04] text-zinc-200"
                  }`}
                >
                  {msg.text}
                </motion.div>
              ))}
              {thinking && (
                <div className="mr-auto rounded-2xl border border-apex-cyan/20 bg-apex-cyan/5 px-3.5 py-2 text-xs text-apex-cyan">
                  Scanning modules…
                </div>
              )}
            </div>

            <form onSubmit={submit} className="border-t border-white/10 p-3">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 focus-within:border-apex-cyan/50 focus-within:shadow-glow-cyan">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Oracle to book or navigate…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-600"
                />
                <MagneticButton type="submit" className="!rounded-xl !px-3 !py-2" strength={0.2}>
                  <Send className="h-4 w-4" />
                </MagneticButton>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
