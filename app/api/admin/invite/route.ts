import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "admin" ? user : null;
}

// POST /api/admin/invite — invite a new member by email
export async function POST(request: NextRequest) {
  const admin = await assertAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, full_name } = await request.json();
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const adminSupabase = await createAdminClient();

  // Invite user — sends magic link email automatically
  const { data, error } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
    data: { full_name: full_name ?? "" },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=/member`,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Set role to member in profiles (trigger will have created it)
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .upsert({ id: data.user.id, role: "member", full_name: full_name ?? "" });

  return NextResponse.json({ ok: true, user: data.user });
}

// DELETE /api/admin/invite?id=xxx — revoke member access
export async function DELETE(request: NextRequest) {
  const admin = await assertAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const adminSupabase = await createAdminClient();
  const { error } = await adminSupabase.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
