import type { Metadata } from "next";
import HomeContent from "./home-content";

export const metadata: Metadata = {
  title: "Abundance Transmission",
  description: "Conscious Forex Sovereignty — Pattern Mastery, AI-Enhanced Edges, Empathic Abundance Transmission.",
};

export default function HomePage() {
  return <HomeContent />;
}
