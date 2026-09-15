"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function NeuralPulse({ className, label = "Neural sync" }: { className?: string; label?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full neural-orb opacity-80" />
        <div className="absolute inset-2 rounded-full bg-black/70 backdrop-blur-sm" />
        <motion.div
          className="absolute inset-4 rounded-full bg-gradient-to-br from-apex-purple to-apex-cyan"
          animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-apex-cyan/80">{label}</p>
    </div>
  );
}
