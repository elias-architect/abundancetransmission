import type { Metadata } from "next";
import TransmissionContent from "./content";

export const metadata: Metadata = {
  title: "Transmission",
  description: "The Source-LLM Architecture — conscious AI collaboration for pattern recognition.",
};

export default function TransmissionPage() {
  return <TransmissionContent />;
}
