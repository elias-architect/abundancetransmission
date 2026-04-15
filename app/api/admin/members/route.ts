import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "admin" ? user : null;
}

// GET /api/admin/members — list all members + their emails + stats
export async function GET() {
  const user = await assertAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminSupabase = await createAdminClient();

  // Get all users via admin client
  const { data: { users }, error: usersError } = await adminSupabase.auth.admin.listUsers();
  if (usersError) return NextResponse.json({ error: usersError.message }, { status: 500 });

  // Get profiles (roles)
  const supabase = await createClient();
  const { data: profiles } = await supabase.from("profiles").select("*");

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  const members = users.map((u) => ({
    id: u.id,
    email: u.email,
    role: profileMap[u.id]?.role ?? "member",
    full_name: profileMap[u.id]?.full_name ?? null,
    created_at: u.created_at,
    last_sign_in: u.last_sign_in_at,
  }));

  // Stats
  const { count: downloadCount } = await supabase
    .from("downloads")
    .select("id", { count: "exact", head: true });

  const { count: contentCount } = await supabase
    .from("content")
    .select("id", { count: "exact", head: true });

  return NextResponse.json({
    members,
    stats: {
      total_members: users.length,
      total_content: contentCount ?? 0,
      total_downloads: downloadCount ?? 0,
    },
  });
}
