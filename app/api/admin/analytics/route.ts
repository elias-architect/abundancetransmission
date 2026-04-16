import { createAdminClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/admin-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await assertAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminClient = await createAdminClient();

  // All users
  const { data: { users } } = await adminClient.auth.admin.listUsers();

  // Profiles (service role to bypass RLS)
  const profilesRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?select=id,role,full_name,created_at`,
    {
      headers: {
        apikey:        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
      cache: "no-store",
    }
  );
  const profiles = await profilesRes.json();
  const profileMap = Object.fromEntries((profiles ?? []).map((p: { id: string }) => [p.id, p]));

  // Content stats
  const contentRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/content?select=id,type,title,created_at&order=created_at.desc`,
    {
      headers: {
        apikey:        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
      cache: "no-store",
    }
  );
  const content = await contentRes.json();

  // Downloads
  const downloadsRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/downloads?select=content_id,user_id,downloaded_at`,
    {
      headers: {
        apikey:        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
      cache: "no-store",
    }
  );
  const downloads = await downloadsRes.json();

  // Events
  const eventsRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/events?select=type,user_id,content_id,created_at&order=created_at.desc&limit=100`,
    {
      headers: {
        apikey:        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
      cache: "no-store",
    }
  );
  const events = await eventsRes.json();

  // Member list with activity
  const members = users
    .filter((u) => (profileMap[u.id] as { role?: string })?.role !== "admin")
    .map((u) => {
      const userDownloads = (Array.isArray(downloads) ? downloads : []).filter((d: { user_id: string }) => d.user_id === u.id);
      const userEvents    = (Array.isArray(events)    ? events    : []).filter((e: { user_id: string }) => e.user_id === u.id);
      return {
        id:          u.id,
        email:       u.email,
        full_name:   (profileMap[u.id] as { full_name?: string | null })?.full_name ?? null,
        joined:      u.created_at,
        last_sign_in: u.last_sign_in_at,
        downloads:   userDownloads.length,
        plays:       userEvents.filter((e: { type: string }) => e.type === "music_play").length,
      };
    });

  // Top content by downloads
  const downloadCounts: Record<string, number> = {};
  for (const d of (Array.isArray(downloads) ? downloads : [])) {
    downloadCounts[d.content_id] = (downloadCounts[d.content_id] ?? 0) + 1;
  }
  const topContent = (Array.isArray(content) ? content : [])
    .map((c: { id: string }) => ({ ...c, downloads: downloadCounts[c.id] ?? 0 }))
    .sort((a: { downloads: number }, b: { downloads: number }) => b.downloads - a.downloads)
    .slice(0, 5);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  return NextResponse.json({
    stats: {
      total_members:   members.length,
      active_members:  members.filter((m) => m.last_sign_in && m.last_sign_in > thirtyDaysAgo).length,
      total_content:   (Array.isArray(content) ? content : []).length,
      newsletters:     (Array.isArray(content) ? content : []).filter((c: { type: string }) => c.type === "newsletter").length,
      music:           (Array.isArray(content) ? content : []).filter((c: { type: string }) => c.type === "music").length,
      total_downloads: (Array.isArray(downloads) ? downloads : []).length,
    },
    members,
    top_content:    topContent,
    recent_events:  (Array.isArray(events) ? events : []).slice(0, 20),
  });
}
