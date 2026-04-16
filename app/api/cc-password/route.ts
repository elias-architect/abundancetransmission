import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  if (!password) return NextResponse.json({ ok: false });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/settings?key=eq.cc_password&select=value&limit=1`,
    {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
      cache: "no-store",
    }
  );
  const rows = await res.json();
  const stored = rows[0]?.value ?? "Enigma369!";
  return NextResponse.json({ ok: password === stored });
}
