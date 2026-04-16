import { assertAdmin } from "@/lib/admin-auth";
import { NextResponse, type NextRequest } from "next/server";

const SB  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const HDR  = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

const MAX_TRACKS = 18;

// GET — list all tracks (admin sees inactive too)
export async function GET() {
  const user = await assertAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(
    `${SB}/rest/v1/tracks?order=sort_order.asc,created_at.asc&select=*`,
    { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }, cache: "no-store" }
  );
  const data = await res.json();
  return NextResponse.json(Array.isArray(data) ? data : []);
}

// POST — create a new track
export async function POST(req: NextRequest) {
  const user = await assertAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, artist, audio_url, cover_url } = body;

  if (!title || !audio_url) {
    return NextResponse.json({ error: "title and audio_url required" }, { status: 400 });
  }

  // Count active tracks — enforce max
  const countRes = await fetch(`${SB}/rest/v1/tracks?select=id`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
    cache: "no-store",
  });
  const existing = await countRes.json();
  if (Array.isArray(existing) && existing.length >= MAX_TRACKS) {
    return NextResponse.json({ error: `Maximum ${MAX_TRACKS} tracks reached. Remove one before adding.` }, { status: 400 });
  }

  // Sort order = current max + 1
  const sort_order = Array.isArray(existing) ? existing.length + 1 : 1;

  const insertRes = await fetch(`${SB}/rest/v1/tracks`, {
    method:  "POST",
    headers: { ...HDR, Prefer: "return=representation" },
    body: JSON.stringify({ title, artist: artist || "Abundance Transmission", audio_url, cover_url: cover_url || null, active: true, sort_order }),
  });

  if (!insertRes.ok) {
    const err = await insertRes.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }

  const rows = await insertRes.json();
  return NextResponse.json(Array.isArray(rows) ? rows[0] : rows, { status: 201 });
}

// PATCH — update a track (toggle active, reorder, rename)
export async function PATCH(req: NextRequest) {
  const user = await assertAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const res = await fetch(`${SB}/rest/v1/tracks?id=eq.${id}`, {
    method:  "PATCH",
    headers: { ...HDR, Prefer: "return=minimal" },
    body: JSON.stringify(fields),
  });

  if (!res.ok) return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE — remove a track
export async function DELETE(req: NextRequest) {
  const user = await assertAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const res = await fetch(`${SB}/rest/v1/tracks?id=eq.${id}`, {
    method:  "DELETE",
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });

  if (!res.ok) return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
