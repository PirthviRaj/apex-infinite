"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  glow?: string;
  trail?: boolean;
  parallax?: boolean;
};

export function GlassCard({
  children,
  className,
  glow = "rgba(168,85,247,0.35)",
  trail = false,
  parallax = true,
}: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(0, { stiffness: 180, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 180, damping: 20 });
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowBg = useMotionTemplate`radial-gradient(420px circle at ${mouseX}px ${mouseY}px, ${glow}, transparent 55%)`;

  return (
    <motion.div
      ref={ref}
      style={
        parallax
          ? { rotateX, rotateY, transformStyle: "preserve-3d" }
          : undefined
      }
      onMouseMove={(e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
        if (!parallax) return;
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        rotateX.set((py - 0.5) * -10);
        rotateY.set((px - 0.5) * 12);
      }}
      onMouseLeave={() => {
        rotateX.set(0);
        rotateY.set(0);
      }}
      className={cn(
        "relative overflow-hidden rounded-3xl glass bg-glass-shine",
        trail && "border-trail",
        className
      )}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: glowBg }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
}
