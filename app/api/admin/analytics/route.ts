import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "admin" ? user : null;
}

export async function GET() {
  const user = await assertAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();
  const adminClient = await createAdminClient();

  // All users
  const { data: { users } } = await adminClient.auth.admin.listUsers();

  // Profiles
  const { data: profiles } = await supabase.from("profiles").select("id, role, full_name, created_at");
  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  // Content stats
  const { data: content } = await supabase
    .from("content")
    .select("id, type, title, created_at")
    .order("created_at", { ascending: false });

  // Downloads
  const { data: downloads } = await supabase
    .from("downloads")
    .select("content_id, user_id, downloaded_at");

  // Events (activity)
  const { data: events } = await supabase
    .from("events")
    .select("type, user_id, content_id, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  // Member list with activity
  const members = users
    .filter((u) => profileMap[u.id]?.role !== "admin")
    .map((u) => {
      const userDownloads = (downloads ?? []).filter((d) => d.user_id === u.id);
      const userEvents = (events ?? []).filter((e) => e.user_id === u.id);
      return {
        id: u.id,
        email: u.email,
        full_name: profileMap[u.id]?.full_name ?? null,
        joined: u.created_at,
        last_sign_in: u.last_sign_in_at,
        downloads: userDownloads.length,
        plays: userEvents.filter((e) => e.type === "music_play").length,
      };
    });

  // Top content by downloads
  const downloadCounts: Record<string, number> = {};
  for (const d of downloads ?? []) {
    downloadCounts[d.content_id] = (downloadCounts[d.content_id] ?? 0) + 1;
  }
  const topContent = (content ?? [])
    .map((c) => ({ ...c, downloads: downloadCounts[c.id] ?? 0 }))
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 5);

  // 30-day active members
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const activeIds = new Set(
    users.filter((u) => u.last_sign_in_at && u.last_sign_in_at > thirtyDaysAgo).map((u) => u.id)
  );

  return NextResponse.json({
    stats: {
      total_members: members.length,
      active_members: members.filter((m) => m.last_sign_in && m.last_sign_in > thirtyDaysAgo).length,
      total_content: (content ?? []).length,
      newsletters: (content ?? []).filter((c) => c.type === "newsletter").length,
      music: (content ?? []).filter((c) => c.type === "music").length,
      total_downloads: (downloads ?? []).length,
    },
    members,
    top_content: topContent,
    recent_events: (events ?? []).slice(0, 20),
  });
}
