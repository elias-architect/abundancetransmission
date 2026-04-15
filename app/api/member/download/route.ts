import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

// GET /api/member/download?content_id=xxx — returns signed URL for PDF download
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contentId = new URL(request.url).searchParams.get("content_id");
  if (!contentId) return NextResponse.json({ error: "content_id required" }, { status: 400 });

  // Get the content entry
  const { data: content, error: contentError } = await supabase
    .from("content")
    .select("file_url, type, title")
    .eq("id", contentId)
    .eq("published", true)
    .single();

  if (contentError || !content) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!content.file_url) return NextResponse.json({ error: "No file attached" }, { status: 404 });

  // Record download (ignore duplicate key on upsert)
  await supabase.from("downloads").upsert(
    { user_id: user.id, content_id: contentId },
    { onConflict: "user_id,content_id" }
  );

  // Generate signed URL (valid 60 seconds)
  const path = content.file_url.replace(/.*\/newsletters\//, "");
  const { data: signed, error: signError } = await supabase.storage
    .from("newsletters")
    .createSignedUrl(path, 60);

  if (signError || !signed) return NextResponse.json({ error: "Could not generate download link" }, { status: 500 });

  return NextResponse.json({ url: signed.signedUrl, title: content.title });
}
