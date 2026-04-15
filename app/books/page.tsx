import type { Metadata } from "next";
import BooksContent from "./content";

export const metadata: Metadata = {
  title: "Books",
  description: "The Stillness Edge Vol.1 and the Abundance Transmission book series.",
};

export default function BooksPage() {
  return <BooksContent />;
}
