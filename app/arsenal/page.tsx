import type { Metadata } from "next";
import ArsenalContent from "./content";

export const metadata: Metadata = {
  title: "Arsenal",
  description: "Pine Script indicators, automation systems, and the Enigma 369 framework.",
};

export default function ArsenalPage() {
  return <ArsenalContent />;
}
