import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const HEADERS = {
  apikey:        SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
  Prefer:        "return=representation",
};

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=role&limit=1`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
  );
  const rows = await res.json();
  return rows[0]?.role === "admin" ? user : null;
}

// GET — list all books (admin sees all statuses)
export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/books?order=created_at.desc&select=*`,
    { headers: HEADERS }
  );
  const data = await res.json();
  return NextResponse.json(Array.isArray(data) ? data : []);
}

// POST — create or update a book
export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...fields } = body;

  if (id) {
    // Update
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/books?id=eq.${id}`,
      { method: "PATCH", headers: HEADERS, body: JSON.stringify(fields) }
    );
    const data = await res.json();
    return res.ok ? NextResponse.json(data) : NextResponse.json({ error: "Update failed" }, { status: 500 });
  } else {
    // Create
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/books`,
      { method: "POST", headers: HEADERS, body: JSON.stringify(fields) }
    );
    const data = await res.json();
    return res.ok ? NextResponse.json(data) : NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}

// PATCH — approve/reject/publish
export async function PATCH(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "Missing id or status" }, { status: 400 });

  const extra = status === "published" ? { published_at: new Date().toISOString() } : {};
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/books?id=eq.${id}`,
    { method: "PATCH", headers: HEADERS, body: JSON.stringify({ status, ...extra }) }
  );
  return res.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Failed" }, { status: 500 });
}

// DELETE
export async function DELETE(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/books?id=eq.${id}`,
    { method: "DELETE", headers: HEADERS }
  );
  return res.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Failed" }, { status: 500 });
}
