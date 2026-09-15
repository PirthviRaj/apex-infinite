"use client";

import type { ReactNode } from "react";
import type { ApexModule } from "@/lib/modules";

export function ModuleHeader({
  module,
  children,
  eyebrow,
}: {
  module: ApexModule;
  children?: ReactNode;
  eyebrow?: string;
}) {
  const Icon = module.icon;
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10"
          style={{ color: module.accent, boxShadow: `0 0 24px ${module.glow}` }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.4em]" style={{ color: module.accent }}>
          {eyebrow || module.name}
        </p>
      </div>
      <h1 className="font-display text-3xl font-bold sm:text-5xl">{module.name}</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">{module.tagline}</p>
      {children}
    </div>
  );
}
