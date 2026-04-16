import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const SB  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const HDR = { apikey: KEY, Authorization: `Bearer ${KEY}` };

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch all published books
  const booksRes = await fetch(
    `${SB}/rest/v1/books?status=eq.published&select=id,slug,title,tagline,author_agent,author_name,description,cover_image_url,price,pdf_url,chapters&order=created_at.asc`,
    { headers: HDR, cache: "no-store" }
  );
  const books = await booksRes.json();
  if (!Array.isArray(books)) return NextResponse.json([]);

  // Fetch purchases for this user (by user_id OR email)
  const purchasesRes = await fetch(
    `${SB}/rest/v1/book_purchases?or=(user_id.eq.${user.id},email.eq.${encodeURIComponent(user.email ?? "")}}&select=book_id&status=eq.completed`,
    { headers: HDR, cache: "no-store" }
  );
  const purchases = purchasesRes.ok ? await purchasesRes.json() : [];
  const purchasedIds = new Set((Array.isArray(purchases) ? purchases : []).map((p: { book_id: string }) => p.book_id));

  // Merge purchased flag
  const merged = books.map((book: Record<string, unknown>) => ({
    ...book,
    purchased: purchasedIds.has(book.id as string),
  }));

  return NextResponse.json(merged);
}
