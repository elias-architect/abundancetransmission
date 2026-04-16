import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BookReadClient from "./book-read-client";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function getBook(slug: string) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/books?slug=eq.${slug}&status=eq.published&select=*&limit=1`,
    {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
      next: { revalidate: 60 },
    }
  );
  const data = await res.json();
  return data[0] ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBook(slug);
  if (!book) return { title: "Not Found" };
  return {
    title: `Reading: ${book.title}`,
    description: book.tagline ?? undefined,
  };
}

export default async function BookReadPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getBook(slug);
  if (!book) notFound();

  return <BookReadClient book={{ ...book, slug }} />;
}
