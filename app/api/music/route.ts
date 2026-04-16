import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/content?type=eq.music&published=eq.true&select=id,title,description,external_url,created_at&order=created_at.desc&limit=6`,
    {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
      next: { revalidate: 60 },
    }
  );
  const data = await res.json();
  return NextResponse.json(Array.isArray(data) ? data : []);
}
