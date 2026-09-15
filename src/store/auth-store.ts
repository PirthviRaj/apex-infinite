"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ApexUser } from "@/lib/auth-server";

type AuthState = {
  user: ApexUser | null;
  token: string | null;
  hydrated: boolean;
  setSession: (user: ApexUser, token: string) => void;
  clearSession: () => void;
  setHydrated: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      hydrated: false,
      setSession: (user, token) => set({ user, token }),
      clearSession: () => set({ user: null, token: null }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "apex-auth-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
      merge: (persisted, current) => {
        const saved = (persisted as Partial<AuthState> | undefined) || {};
        return {
          ...current,
          user: saved.user ?? current.user,
          token: saved.token ?? current.token,
          hydrated: true,
        };
      },
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hydrated: true });
      },
    }
  )
);

export function ensureAuthHydrated() {
  if (typeof window === "undefined") return;

  // Drop legacy key that could pin hydrated:false
  try {
    window.localStorage.removeItem("apex-auth");
  } catch {
    // ignore
  }

  if (useAuthStore.persist.hasHydrated()) {
    useAuthStore.setState({ hydrated: true });
    return;
  }

  const unsub = useAuthStore.persist.onFinishHydration(() => {
    useAuthStore.setState({ hydrated: true });
  });

  void useAuthStore.persist.rehydrate();

  const t = window.setTimeout(() => {
    if (!useAuthStore.getState().hydrated) {
      useAuthStore.setState({ hydrated: true });
    }
  }, 1500);

  return () => {
    unsub();
    window.clearTimeout(t);
  };
}
