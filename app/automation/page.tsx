import type { Metadata } from "next";
import AutomationClient from "./client";

export const metadata: Metadata = {
  title: "Enigma 369 Automation — Abundance Transmission",
  description: "The Enigma 369 edge, fully automated. TradingView signals and hands-free execution on XAUUSD, Nasdaq, GBPUSD and more.",
};

export default function AutomationPage() {
  return <AutomationClient />;
}
