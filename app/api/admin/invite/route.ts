import { createAdminClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/admin-auth";
import { notifyAdmin } from "@/lib/email";
import { NextResponse, type NextRequest } from "next/server";

// POST /api/admin/invite — invite a new member by email
export async function POST(request: NextRequest) {
  const admin = await assertAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, full_name } = await request.json();
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const adminSupabase = await createAdminClient();

  const { data, error } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
    data: { full_name: full_name ?? "" },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=/member`,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Set role to member in profiles
  const profileRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles`,
    {
      method: "POST",
      headers: {
        apikey:         process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization:  `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        "Content-Type": "application/json",
        Prefer:         "resolution=merge-duplicates",
      },
      body: JSON.stringify({ id: data.user.id, role: "member", full_name: full_name ?? "" }),
    }
  );

  if (!profileRes.ok) console.error("Profile upsert failed:", await profileRes.text());

  // Admin confirmation email — fire and forget
  notifyAdmin(
    `Member Invited: ${email}`,
    `A new member was invited to Abundance Transmission.\n\nEmail: ${email}\nName: ${full_name ?? "—"}\n\nThey will receive a magic link to set up their account.\n\nInvited by: ${admin.email}`
  ).catch(() => {});

  return NextResponse.json({ ok: true, user: data.user });
}

// DELETE /api/admin/invite?id=xxx — revoke member access
export async function DELETE(request: NextRequest) {
  const admin = await assertAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Get member email before deleting for the confirmation email
  const profileRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?id=eq.${id}&select=full_name&limit=1`,
    {
      headers: {
        apikey:        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
      cache: "no-store",
    }
  );
  const profileRows = await profileRes.json();
  const memberName = profileRows[0]?.full_name ?? "Unknown";

  const adminSupabase = await createAdminClient();
  const { error } = await adminSupabase.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Admin confirmation email — fire and forget
  notifyAdmin(
    `Member Access Revoked`,
    `A member's access has been revoked.\n\nName: ${memberName}\nUser ID: ${id}\n\nRevoked by: ${admin.email}`
  ).catch(() => {});

  return NextResponse.json({ ok: true });
}
