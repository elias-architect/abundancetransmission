import type { Metadata } from "next";
import VaultContent from "./content";

export const metadata: Metadata = {
  title: "Vault",
  description: "The Evolutionary Vault — transparent fund tracking and steward contributions.",
};

export default function VaultPage() {
  return <VaultContent />;
}
