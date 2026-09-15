"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MODULES } from "@/lib/modules";

export function OrbitalVisual() {
  const reduce = useReducedMotion();
  const ringModules = MODULES.slice(0, 8);

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[560px]"
      aria-hidden
    >
      {/* Core */}
      <motion.div
        className="absolute left-1/2 top-1/2 z-20 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-apex-purple/50 bg-black/80 shadow-glow sm:h-36 sm:w-36"
        animate={reduce ? undefined : { scale: [1, 1.04, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-apex-purple/40 via-transparent to-apex-cyan/30" />
        <div className="relative text-center">
          <p className="font-display text-lg font-bold tracking-tight sm:text-xl">APEX</p>
          <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-apex-cyan">Orbit</p>
        </div>
      </motion.div>

      {/* Rings */}
      <div className="absolute inset-[8%] rounded-full border border-white/10" />
      <div className="absolute inset-[18%] rounded-full border border-apex-purple/20" />
      <motion.div
        className="absolute inset-[28%] rounded-full border border-apex-cyan/25"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
      />

      {/* Orbiting service nodes */}
      <motion.div
        className="absolute inset-0"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
      >
        {ringModules.map((mod, i) => {
          const angle = (i / ringModules.length) * Math.PI * 2 - Math.PI / 2;
          const radius = 42;
          const x = 50 + Math.cos(angle) * radius;
          const y = 50 + Math.sin(angle) * radius;
          const Icon = mod.icon;
          return (
            <div
              key={mod.id}
              className="absolute"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
            >
              <motion.div
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-black/80 backdrop-blur-md sm:h-12 sm:w-12"
                style={{ boxShadow: `0 0 20px ${mod.glow}` }}
                animate={reduce ? undefined : { rotate: -360 }}
                transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: mod.accent }} />
              </motion.div>
            </div>
          );
        })}
      </motion.div>

      {/* Outer pulse */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 55%)",
        }}
        animate={reduce ? undefined : { opacity: [0.4, 0.85, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/** Canvas starfield for atmosphere behind orbit */
export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const stars = Array.from({ length: 80 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.4 + 0.2,
      a: Math.random(),
      s: Math.random() * 0.004 + 0.001,
    }));

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      for (const star of stars) {
        star.a += star.s;
        const alpha = 0.25 + Math.abs(Math.sin(star.a)) * 0.75;
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.arc(star.x * w, star.y * h, star.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
      aria-hidden
    />
  );
}
