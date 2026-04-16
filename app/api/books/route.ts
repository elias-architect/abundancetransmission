import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Public — only published books
export async function GET() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/books?status=eq.published&order=published_at.desc&select=id,slug,title,tagline,author_agent,author_name,description,cover_image_url,price,published_at`,
    {
      headers: {
        apikey:        SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      next: { revalidate: 60 },
    }
  );
  const data = await res.json();
  return NextResponse.json(Array.isArray(data) ? data : []);
}
