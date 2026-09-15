"use client";

import { useState } from "react";
import { Copy, MessageCircle, Search } from "lucide-react";
import { getModule } from "@/lib/modules";
import { ModuleHeader } from "@/components/modules/module-header";
import { GlassCard } from "@/components/ui/glass-card";
import { MagneticButton } from "@/components/ui/magnetic-button";

function buildRizz(prompt: string) {
  const clean = prompt.trim() || "someone interesting";
  return [
    `Hey — your energy just rewired my whole timeline. Tell me the story behind ${clean}?`,
    `Not gonna play it cool: that was elite. Coffee this week, or are we keeping the mystery?`,
    `Quick question with no wrong answer — ${clean}: spontaneous adventure or curated night in?`,
  ];
}

function buildSeo(topic: string) {
  const t = topic.trim() || "your product";
  return {
    title: `${t}: The 2026 Playbook for Faster Growth`,
    meta: `Discover how ${t} wins attention with clear offers, intent-matched content, and conversion-first UX.`,
    outline: [
      `H1: Why ${t} matters right now`,
      "H2: Search intent map (informational → transactional)",
      "H2: Hook formulas that stop the scroll",
      "H2: On-page SEO checklist",
      "H2: CTA ladder for one-click conversion",
    ],
    draft: `${t} isn’t competing on noise anymore — it’s competing on clarity. Lead with the outcome, prove it in 3 beats, then route the reader to a single decisive action.`,
  };
}

export function RizzSeo() {
  const mod = getModule("rizz")!;
  const [tab, setTab] = useState<"rizz" | "seo">("rizz");
  const [rizzPrompt, setRizzPrompt] = useState("their travel photos");
  const [seoTopic, setSeoTopic] = useState("Apex Infinite Super-OS");
  const [rizzOut, setRizzOut] = useState<string[]>([]);
  const [seoOut, setSeoOut] = useState<ReturnType<typeof buildSeo> | null>(null);
  const [copied, setCopied] = useState("");

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied("Copied ✓");
    setTimeout(() => setCopied(""), 1200);
  };

  return (
    <div className="px-4 pb-28 pt-16 lg:px-8 lg:pt-8">
      <ModuleHeader module={mod} eyebrow="Social Rizz & SEO · AI writing">
        <p className="mt-3 text-sm text-fuchsia-300">Conversation advice + SEO content — each tool stays in its lane</p>
      </ModuleHeader>

      <div className="mb-6 flex rounded-2xl border border-white/10 bg-white/[0.03] p-1">
        <button
          type="button"
          onClick={() => setTab("rizz")}
          className={`flex-1 rounded-xl py-2.5 text-sm font-semibold ${tab === "rizz" ? "bg-fuchsia-500/25 text-white" : "text-zinc-400"}`}
        >
          Social Rizz
        </button>
        <button
          type="button"
          onClick={() => setTab("seo")}
          className={`flex-1 rounded-xl py-2.5 text-sm font-semibold ${tab === "seo" ? "bg-fuchsia-500/25 text-white" : "text-zinc-400"}`}
        >
          SEO Writer
        </button>
      </div>

      {tab === "rizz" ? (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <GlassCard className="space-y-4 p-5" trail glow={mod.glow} parallax={false}>
            <div className="flex items-center gap-2 text-fuchsia-300">
              <MessageCircle className="h-5 w-5" />
              <h2 className="font-display text-lg font-semibold">Conversation coach</h2>
            </div>
            <textarea
              value={rizzPrompt}
              onChange={(e) => setRizzPrompt(e.target.value)}
              rows={4}
              placeholder="What are you replying to?"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm outline-none focus:border-fuchsia-400"
            />
            <MagneticButton type="button" className="w-full" onClick={() => setRizzOut(buildRizz(rizzPrompt))}>
              Generate reply options
            </MagneticButton>
          </GlassCard>
          <div className="space-y-3">
            {rizzOut.length === 0 && (
              <GlassCard className="p-5 text-sm text-zinc-500" parallax={false}>Your rizz lines will land here.</GlassCard>
            )}
            {rizzOut.map((line, i) => (
              <GlassCard key={i} className="space-y-3 p-5" glow={mod.glow} parallax={false}>
                <p className="text-sm leading-relaxed text-zinc-200">{line}</p>
                <MagneticButton type="button" variant="secondary" className="!rounded-xl !px-3 !py-2 text-xs" onClick={() => copy(line)}>
                  <Copy className="h-3.5 w-3.5" /> Copy
                </MagneticButton>
              </GlassCard>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <GlassCard className="space-y-4 p-5" trail glow={mod.glow} parallax={false}>
            <div className="flex items-center gap-2 text-fuchsia-300">
              <Search className="h-5 w-5" />
              <h2 className="font-display text-lg font-semibold">SEO content studio</h2>
            </div>
            <input
              value={seoTopic}
              onChange={(e) => setSeoTopic(e.target.value)}
              placeholder="Topic / keyword"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm outline-none focus:border-fuchsia-400"
            />
            <MagneticButton type="button" className="w-full" onClick={() => setSeoOut(buildSeo(seoTopic))}>
              Generate SEO pack
            </MagneticButton>
          </GlassCard>
          <GlassCard className="space-y-4 p-5" glow={mod.glow} parallax={false}>
            {!seoOut ? (
              <p className="text-sm text-zinc-500">Title, meta, outline, and draft appear here.</p>
            ) : (
              <>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">Title</p>
                  <p className="font-display text-xl font-semibold">{seoOut.title}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">Meta</p>
                  <p className="text-sm text-zinc-300">{seoOut.meta}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">Outline</p>
                  <ul className="mt-1 space-y-1 text-sm text-zinc-400">
                    {seoOut.outline.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">Draft</p>
                  <p className="text-sm leading-relaxed text-zinc-200">{seoOut.draft}</p>
                </div>
                <MagneticButton
                  type="button"
                  variant="secondary"
                  className="!rounded-xl !px-3 !py-2 text-xs"
                  onClick={() => copy(`${seoOut.title}\n\n${seoOut.meta}\n\n${seoOut.draft}`)}
                >
                  <Copy className="h-3.5 w-3.5" /> Copy pack
                </MagneticButton>
              </>
            )}
          </GlassCard>
        </div>
      )}
      {copied && <p className="mt-4 text-center text-sm text-fuchsia-300">{copied}</p>}
    </div>
  );
}
