import type { LucideIcon } from "lucide-react";
import {
  Plane,
  UtensilsCrossed,
  Building2,
  ConciergeBell,
  Car,
  Ticket,
  HeartPulse,
  Wallet,
  ShoppingBag,
  Wrench,
  Sparkles,
} from "lucide-react";

export type ModuleId =
  | "travel"
  | "food"
  | "workspace"
  | "restaurant"
  | "glide"
  | "events"
  | "wellness"
  | "pay"
  | "vogue"
  | "taskmaster"
  | "rizz";

export interface ApexModule {
  id: ModuleId;
  name: string;
  tagline: string;
  href: string;
  icon: LucideIcon;
  accent: string;
  glow: string;
  status: "live" | "beta" | "soon";
}

export const MODULES: ApexModule[] = [
  {
    id: "travel",
    name: "Travel Suite",
    tagline: "Flights & hotels in 3D",
    href: "/modules/travel",
    icon: Plane,
    accent: "#a855f7",
    glow: "rgba(168,85,247,0.4)",
    status: "live",
  },
  {
    id: "food",
    name: "Food & Grocery",
    tagline: "Fly-to-cart delivery",
    href: "/modules/food",
    icon: UtensilsCrossed,
    accent: "#22d3ee",
    glow: "rgba(34,211,238,0.4)",
    status: "live",
  },
  {
    id: "workspace",
    name: "WorkSpace Hub",
    tagline: "Book desks on floor plans",
    href: "/modules/workspace",
    icon: Building2,
    accent: "#fbbf24",
    glow: "rgba(251,191,36,0.35)",
    status: "live",
  },
  {
    id: "restaurant",
    name: "Restaurant Hub",
    tagline: "Live table availability",
    href: "/modules/restaurant",
    icon: ConciergeBell,
    accent: "#f472b6",
    glow: "rgba(244,114,182,0.35)",
    status: "live",
  },
  {
    id: "glide",
    name: "Apex Glide",
    tagline: "Rides & rentals live",
    href: "/modules/glide",
    icon: Car,
    accent: "#34d399",
    glow: "rgba(52,211,153,0.35)",
    status: "live",
  },
  {
    id: "events",
    name: "Pulse Events",
    tagline: "Interactive seat maps",
    href: "/modules/events",
    icon: Ticket,
    accent: "#fb7185",
    glow: "rgba(251,113,133,0.35)",
    status: "live",
  },
  {
    id: "wellness",
    name: "ZenFlow Wellness",
    tagline: "Doctors & spa booking",
    href: "/modules/wellness",
    icon: HeartPulse,
    accent: "#2dd4bf",
    glow: "rgba(45,212,191,0.35)",
    status: "live",
  },
  {
    id: "pay",
    name: "ApexPay",
    tagline: "Wallet, P2P & bills",
    href: "/modules/pay",
    icon: Wallet,
    accent: "#fbbf24",
    glow: "rgba(251,191,36,0.4)",
    status: "live",
  },
  {
    id: "vogue",
    name: "Vogue AI",
    tagline: "AI personal stylist",
    href: "/modules/vogue",
    icon: ShoppingBag,
    accent: "#c084fc",
    glow: "rgba(192,132,252,0.4)",
    status: "live",
  },
  {
    id: "taskmaster",
    name: "TaskMaster",
    tagline: "Verified home services",
    href: "/modules/taskmaster",
    icon: Wrench,
    accent: "#67e8f9",
    glow: "rgba(103,232,249,0.35)",
    status: "live",
  },
  {
    id: "rizz",
    name: "Social Rizz & SEO",
    tagline: "Conversation & content AI",
    href: "/modules/rizz",
    icon: Sparkles,
    accent: "#e879f9",
    glow: "rgba(232,121,249,0.4)",
    status: "live",
  },
];

export function getModule(id: ModuleId) {
  return MODULES.find((m) => m.id === id);
}
