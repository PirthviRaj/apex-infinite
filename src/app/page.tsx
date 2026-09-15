import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "Apex Infinite — Universal AI Super-OS",
  description:
    "Cinematic Super-App with Travel, Food, WorkSpace, Glide, Events, Wellness, ApexPay, Vogue, TaskMaster, and AI Rizz — one identity, one orbit.",
};

export default function HomePage() {
  return <LandingPage />;
}
