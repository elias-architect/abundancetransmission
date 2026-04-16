import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/tracks?active=eq.true&order=sort_order.asc,created_at.asc&select=id,title,artist,audio_url,cover_url`,
    {
      headers: {
        apikey:        SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      // Revalidate every 5 minutes so new tracks appear without redeploy
      next: { revalidate: 300 },
    }
  );

  if (!res.ok) {
    return NextResponse.json({ tracks: [] });
  }

  const tracks = await res.json();
  return NextResponse.json({ tracks: Array.isArray(tracks) ? tracks : [] });
}
