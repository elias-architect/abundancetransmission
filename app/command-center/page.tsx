import type { Metadata } from "next";
import CommandCenterClient from "./client";

export const metadata: Metadata = {
  title: "Command Center",
  description: "Live backtest engine for Enigma 369 and Micro Trend Sniper strategies.",
};

export default function CommandCenterPage() {
  return <CommandCenterClient />;
}
