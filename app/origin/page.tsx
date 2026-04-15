import type { Metadata } from "next";
import OriginContent from "./content";

export const metadata: Metadata = {
  title: "Origin",
  description: "Where it all began — the Turkey 2025 story and the 2360€ transmission.",
};

export default function OriginPage() {
  return <OriginContent />;
}
