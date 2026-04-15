import { createClient, createAdminClient } from "@/lib/supabase/server";
import { notifyAllMembers } from "@/lib/email";
import { NextResponse, type NextRequest } from "next/server";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "admin" ? user : null;
}

// GET /api/admin/content — list all content
export async function GET() {
  const user = await assertAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/admin/content — create newsletter or music entry, then email all members
export async function POST(request: NextRequest) {
  const user = await assertAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { type, title, description, file_url, external_url, notify = true } = body;

  if (!type || !title) return NextResponse.json({ error: "type and title required" }, { status: 400 });

  const supabase = await createClient();

  // Save content
  const { data, error } = await supabase
    .from("content")
    .insert({ type, title, description, file_url, external_url, created_by: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Email all members in the background (don't await — respond fast)
  if (notify) {
    const adminClient = await createAdminClient();
    const { data: { users } } = await adminClient.auth.admin.listUsers();

    // Get all member profiles (exclude admin)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, role");

    const memberIds = new Set(
      (profiles ?? []).filter((p) => p.role === "member").map((p) => p.id)
    );

    const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

    const members = users
      .filter((u) => u.email && memberIds.has(u.id))
      .map((u) => ({ email: u.email!, full_name: profileMap[u.id]?.full_name ?? null }));

    // Fire and forget — don't block the response
    notifyAllMembers(members, { type, title, description, external_url })
      .then(({ sent, failed }) => console.log(`Email notifications: ${sent} sent, ${failed} failed`))
      .catch((err) => console.error("Email notification error:", err));
  }

  return NextResponse.json({ ...data, notify_queued: notify }, { status: 201 });
}

// DELETE /api/admin/content?id=xxx
export async function DELETE(request: NextRequest) {
  const user = await assertAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const supabase = await createClient();
  const { error } = await supabase.from("content").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
