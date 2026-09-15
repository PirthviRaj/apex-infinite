"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
  strength?: number;
  variant?: "primary" | "secondary" | "ghost" | "gold";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
};

export function MagneticButton({
  children,
  className,
  strength = 0.35,
  variant = "primary",
  type = "button",
  disabled,
  onClick,
  "aria-label": ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 280, damping: 18 });
  const springY = useSpring(y, { stiffness: 280, damping: 18 });

  const variants = {
    primary:
      "bg-gradient-to-r from-apex-purple via-fuchsia-500 to-apex-cyan text-white shadow-glow border border-white/10",
    secondary:
      "glass text-white hover:border-apex-cyan/40 hover:shadow-glow-cyan",
    ghost: "bg-transparent text-zinc-300 hover:text-white hover:bg-white/5",
    gold: "bg-gradient-to-r from-amber-500 to-apex-gold text-black shadow-glow-gold border border-amber-300/30",
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      onMouseMove={(e) => {
        if (disabled || !ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left - rect.width / 2;
        const offsetY = e.clientY - rect.top - rect.height / 2;
        x.set(offsetX * strength);
        y.set(offsetY * strength);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
    >
      {children}
    </motion.button>
  );
}
