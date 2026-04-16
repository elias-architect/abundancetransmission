import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BookPdfView from "./pdf-view";

const SB  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function getBook(slug: string) {
  const res = await fetch(
    `${SB}/rest/v1/books?slug=eq.${slug}&select=*&limit=1`,
    { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }, cache: "no-store" }
  );
  const data = await res.json();
  return data[0] ?? null;
}

export default async function BookPdfPage({ params }: { params: Promise<{ slug: string }> }) {
  // Admin only
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profileRes = await fetch(
    `${SB}/rest/v1/profiles?id=eq.${user.id}&select=role&limit=1`,
    { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }, cache: "no-store" }
  );
  const profiles = await profileRes.json();
  if (profiles[0]?.role !== "admin") redirect("/member");

  const { slug } = await params;
  const book = await getBook(slug);
  if (!book) notFound();

  return <BookPdfView book={book} />;
}
