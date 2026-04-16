import { assertAdmin } from "@/lib/admin-auth";
import { NextResponse, type NextRequest } from "next/server";

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY    = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/admin/tracks/upload
 * Body: { filename: string, mimeType: string }
 *
 * Returns a Supabase signed upload URL so the browser can upload
 * the file directly to Supabase Storage — bypasses Vercel's 4.5 MB body limit.
 */
export async function POST(req: NextRequest) {
  const user = await assertAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { filename, mimeType } = await req.json();
  if (!filename) return NextResponse.json({ error: "filename required" }, { status: 400 });

  const path = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\-_]/g, "-")}`;
  const type = mimeType || "audio/mpeg";

  // Ask Supabase Storage for a signed upload URL (file never touches Vercel)
  const signRes = await fetch(
    `${SB_URL}/storage/v1/object/upload/sign/tracks/${path}`,
    {
      method:  "POST",
      headers: {
        apikey:         KEY,
        Authorization:  `Bearer ${KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ upsert: true }),
    }
  );

  if (!signRes.ok) {
    const err = await signRes.text();
    console.error("Signed URL error:", signRes.status, err);
    return NextResponse.json({ error: `[${signRes.status}] ${err}` }, { status: 500 });
  }

  const { url: signedPath } = await signRes.json();
  // signedPath is relative, e.g. /storage/v1/object/upload/sign/tracks/xxx?token=...
  const signedUrl = `${SB_URL}${signedPath}`;
  const publicUrl = `${SB_URL}/storage/v1/object/public/tracks/${path}`;

  return NextResponse.json({ signedUrl, publicUrl, mimeType: type });
}
