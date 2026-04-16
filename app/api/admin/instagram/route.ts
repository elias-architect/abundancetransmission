import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const IG_TOKEN   = process.env.INSTAGRAM_ACCESS_TOKEN!;
const IG_ACCOUNT = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID!;
const BASE       = "https://graph.facebook.com/v25.0";

export async function GET() {
  // Auth check — admin only
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Fetch recent 12 posts with basic fields
    const mediaRes = await fetch(
      `${BASE}/${IG_ACCOUNT}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,permalink&limit=12&access_token=${IG_TOKEN}`,
      { next: { revalidate: 300 } }
    );
    const mediaData = await mediaRes.json();

    if (!mediaRes.ok || mediaData.error) {
      return NextResponse.json({ error: mediaData.error?.message ?? "Instagram API error" }, { status: 500 });
    }

    const posts = mediaData.data ?? [];

    // Fetch insights for each post (reach, impressions, saved)
    const postsWithInsights = await Promise.all(
      posts.map(async (post: Record<string, unknown>) => {
        try {
          const insightsRes = await fetch(
            `${BASE}/${post.id}/insights?metric=reach,impressions,saved&access_token=${IG_TOKEN}`
          );
          const insightsData = await insightsRes.json();
          const metrics: Record<string, number> = {};
          for (const m of insightsData.data ?? []) {
            metrics[m.name] = m.values?.[0]?.value ?? m.value ?? 0;
          }
          return { ...post, ...metrics };
        } catch {
          return post;
        }
      })
    );

    // Account summary
    const accountRes = await fetch(
      `${BASE}/${IG_ACCOUNT}?fields=followers_count,media_count&access_token=${IG_TOKEN}`
    );
    const accountData = accountRes.ok ? await accountRes.json() : {};

    return NextResponse.json({
      posts:          postsWithInsights,
      followers_count: accountData.followers_count ?? 0,
      media_count:     accountData.media_count ?? 0,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
