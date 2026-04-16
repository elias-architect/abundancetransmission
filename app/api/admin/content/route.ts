import { createAdminClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/admin-auth";
import { notifyAllMembers, notifyAdmin } from "@/lib/email";
import { NextResponse, type NextRequest } from "next/server";

// GET /api/admin/content — list all content
export async function GET() {
  const user = await assertAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/content?select=*&order=created_at.desc`,
    {
      headers: {
        apikey:        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
      cache: "no-store",
    }
  );
  const data = await res.json();
  return NextResponse.json(Array.isArray(data) ? data : []);
}

// POST /api/admin/content — create content, email members
export async function POST(request: NextRequest) {
  const user = await assertAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { type, title, description, file_url, external_url, body_html, video_url, notify = true } = body;

  if (!type || !title) return NextResponse.json({ error: "type and title required" }, { status: 400 });

  const insertRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/content`,
    {
      method: "POST",
      headers: {
        apikey:         process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization:  `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        "Content-Type": "application/json",
        Prefer:         "return=representation",
      },
      body: JSON.stringify({
        type, title, description, file_url, external_url,
        body_html: body_html ?? null,
        video_url: video_url ?? null,
        created_by: user.id,
        published: true,
      }),
    }
  );

  if (!insertRes.ok) {
    const err = await insertRes.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }

  const rows = await insertRes.json();
  const data = Array.isArray(rows) ? rows[0] : rows;

  const typeLabels: Record<string, string> = {
    newsletter: "Newsletter",
    music:      "Music",
    video:      "Video",
  };

  // Admin confirmation email — fire and forget
  notifyAdmin(
    `${typeLabels[type] ?? type} Published: "${title}"`,
    `Type: ${typeLabels[type] ?? type}\nTitle: ${title}\n${description ? `Description: ${description}\n` : ""}${external_url ? `URL: ${external_url}\n` : ""}${file_url ? `File: ${file_url}\n` : ""}\nPosted by: ${user.email}`
  ).catch(() => {});

  // Member notification emails — fire and forget
  if (notify) {
    const adminClient = await createAdminClient();
    const { data: { users } } = await adminClient.auth.admin.listUsers();

    const profilesRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?select=id,full_name,role`,
      {
        headers: {
          apikey:        process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        },
        cache: "no-store",
      }
    );
    const profiles = await profilesRes.json();
    const memberIds = new Set((profiles ?? []).filter((p: { role: string }) => p.role === "member").map((p: { id: string }) => p.id));
    const profileMap = Object.fromEntries((profiles ?? []).map((p: { id: string; full_name: string | null }) => [p.id, p]));

    const members = users
      .filter((u) => u.email && memberIds.has(u.id))
      .map((u) => ({ email: u.email!, full_name: (profileMap[u.id] as { full_name: string | null })?.full_name ?? null }));

    notifyAllMembers(members, { type, title, description, external_url })
      .then(({ sent, failed }) => console.log(`Member emails: ${sent} sent, ${failed} failed`))
      .catch((err) => console.error("Member email error:", err));
  }

  return NextResponse.json({ ...data, notify_queued: notify }, { status: 201 });
}

// DELETE /api/admin/content?id=xxx
export async function DELETE(request: NextRequest) {
  const user = await assertAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/content?id=eq.${id}`,
    {
      method: "DELETE",
      headers: {
        apikey:        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
    }
  );

  if (!res.ok) return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
