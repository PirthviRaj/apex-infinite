"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Infinity,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { MODULES } from "@/lib/modules";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    clearSession();
    router.push("/gateway");
  };

  const Nav = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn("flex h-full flex-col", mobile ? "p-4" : "p-3")}>
      <div className="mb-6 flex items-center justify-between gap-2 px-2 pt-2">
        <Link href="/app" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-apex-purple to-apex-cyan shadow-glow">
            <Infinity className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="font-display text-lg font-bold leading-none tracking-tight">Apex</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-apex-cyan">Infinite</p>
            </div>
          )}
        </Link>
        {!mobile && (
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="rounded-xl border border-white/10 p-2 text-zinc-400 hover:text-white"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      <nav className="apex-scrollbar flex-1 space-y-1 overflow-y-auto pr-1">
        <SidebarLink
          href="/app"
          label="Command Center"
          active={pathname === "/"}
          collapsed={collapsed && !mobile}
          onNavigate={() => setMobileOpen(false)}
          icon={<LayoutDashboard className="h-4 w-4" />}
        />
        <p
          className={cn(
            "px-3 pb-1 pt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600",
            collapsed && !mobile && "text-center"
          )}
        >
          {collapsed && !mobile ? "•••" : "Modules"}
        </p>
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <SidebarLink
              key={mod.id}
              href={mod.href}
              label={mod.name}
              active={pathname.startsWith(mod.href)}
              collapsed={collapsed && !mobile}
              accent={mod.accent}
              onNavigate={() => setMobileOpen(false)}
              icon={<Icon className="h-4 w-4" />}
            />
          );
        })}
      </nav>

      <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
        {user && !collapsed && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate font-mono text-[11px] text-zinc-500">
              {user.email || user.username || user.phone || "Apex member"}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={logout}
          className={cn(
            "flex w-full items-center gap-3 rounded-2xl border border-white/10 px-3 py-2.5 text-sm text-zinc-400 transition hover:border-rose-500/40 hover:text-rose-300",
            collapsed && !mobile && "justify-center"
          )}
        >
          <LogOut className="h-4 w-4" />
          {(!collapsed || mobile) && "Sign out"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 border-r border-white/10 bg-black/80 backdrop-blur-2xl transition-all duration-300 lg:block",
          collapsed ? "w-[88px]" : "w-[280px]"
        )}
      >
        <Nav />
      </aside>

      <button
        type="button"
        className="fixed left-4 top-4 z-50 rounded-2xl border border-white/10 bg-black/70 p-2.5 text-white backdrop-blur-xl lg:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 z-50 h-full w-[300px] border-r border-white/10 bg-black lg:hidden"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
            >
              <button
                type="button"
                className="absolute right-3 top-3 rounded-xl border border-white/10 p-2 text-zinc-400"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
              <Nav mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarLink({
  href,
  label,
  icon,
  active,
  collapsed,
  accent,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  collapsed: boolean;
  accent?: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition",
        active
          ? "bg-white/[0.06] text-white"
          : "text-zinc-400 hover:bg-white/[0.03] hover:text-white",
        collapsed && "justify-center px-2"
      )}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-2xl border border-apex-purple/40 shadow-glow"
          style={{ boxShadow: accent ? `0 0 24px ${accent}33` : undefined }}
        />
      )}
      <span
        className="relative z-10 flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]"
        style={active && accent ? { color: accent, borderColor: `${accent}55` } : undefined}
      >
        {icon}
      </span>
      {!collapsed && <span className="relative z-10 truncate font-medium">{label}</span>}
    </Link>
  );
}
