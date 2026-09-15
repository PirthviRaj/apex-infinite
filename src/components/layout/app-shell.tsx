"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "@/components/layout/sidebar";
import { OracleAgent } from "@/components/oracle/oracle-agent";
import { ensureAuthHydrated, useAuthStore } from "@/store/auth-store";

const GATEWAY_URL = "/gateway";

function redirectToGateway() {
  if (typeof window === "undefined") return;
  if (window.location.pathname === GATEWAY_URL) return;
  window.location.replace(GATEWAY_URL);
}

function BootScreen({ message }: { message: string }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        background: "#000",
        color: "#22d3ee",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        padding: 24,
        textAlign: "center",
      }}
    >
      <p
        style={{
          letterSpacing: "0.28em",
          fontSize: 12,
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        {message}
      </p>
      <a
        href={GATEWAY_URL}
        style={{
          display: "inline-block",
          marginTop: 8,
          padding: "14px 28px",
          borderRadius: 16,
          background: "linear-gradient(90deg, #a855f7, #22d3ee)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 14,
          textDecoration: "none",
          letterSpacing: "0.04em",
        }}
      >
        Open Apex Gateway
      </a>
      <button
        type="button"
        onClick={redirectToGateway}
        style={{
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "#fbbf24",
          borderRadius: 12,
          padding: "10px 16px",
          cursor: "pointer",
          fontSize: 12,
        }}
      >
        Force redirect now
      </button>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const redirected = useRef(false);
  const [persistReady, setPersistReady] = useState(false);

  useEffect(() => {
    const unsub = ensureAuthHydrated();
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setPersistReady(true);
      return;
    }

    void useAuthStore.persist.rehydrate();

    const unsub = useAuthStore.persist.onFinishHydration(() => setPersistReady(true));
    const t = window.setTimeout(() => setPersistReady(true), 2000);
    return () => {
      unsub();
      window.clearTimeout(t);
    };
  }, []);

  // Hard redirect — wait for persisted session before sending users to gateway
  useLayoutEffect(() => {
    if (!persistReady) return;
    if (user) {
      redirected.current = false;
      return;
    }
    if (redirected.current) return;
    redirected.current = true;
    redirectToGateway();
  }, [persistReady, user]);

  // Extra safety if layout effect was skipped
  useEffect(() => {
    if (!persistReady || user) return;
    const t = window.setTimeout(redirectToGateway, 400);
    return () => window.clearTimeout(t);
  }, [persistReady, user]);

  if (!persistReady) {
    return <BootScreen message="Loading Apex…" />;
  }

  if (!user) {
    return <BootScreen message="Redirecting to login…" />;
  }

  return (
    <div className="relative flex min-h-screen bg-black text-white">
      <div className="pointer-events-none absolute inset-0 bg-apex-radial opacity-80" />
      <Sidebar />
      <main className="relative z-10 flex min-h-screen min-w-0 flex-1 flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <OracleAgent />
    </div>
  );
}
