import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  const { name, email, product, pairs } = await req.json();

  if (!email || !product) {
    return NextResponse.json({ error: "Email and product required" }, { status: 400 });
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/automation_waitlist`, {
    method:  "POST",
    headers: {
      apikey:          SERVICE_KEY,
      Authorization:   `Bearer ${SERVICE_KEY}`,
      "Content-Type":  "application/json",
      Prefer:          "return=minimal",
    },
    body: JSON.stringify({ name, email, product, pairs }),
  });

  if (!res.ok) {
    const err = await res.text();
    // Duplicate email — treat as success
    if (err.includes("duplicate") || err.includes("unique")) {
      return NextResponse.json({ ok: true, already: true });
    }
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
