import { assertAdmin } from "@/lib/admin-auth";
import { notifyAdmin } from "@/lib/email";
import { NextResponse, type NextRequest } from "next/server";

export async function GET() {
  const user = await assertAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/settings?select=key,value`,
    {
      headers: {
        apikey:        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
      cache: "no-store",
    }
  );
  const rows = await res.json();
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return NextResponse.json(map);
}

export async function POST(request: NextRequest) {
  const user = await assertAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const rows = Object.entries(body).map(([key, value]) => ({
    key, value, updated_at: new Date().toISOString()
  }));

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/settings`,
    {
      method: "POST",
      headers: {
        apikey:         process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization:  `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        "Content-Type": "application/json",
        Prefer:         "resolution=merge-duplicates",
      },
      body: JSON.stringify(rows),
    }
  );

  if (!res.ok) return NextResponse.json({ error: "Failed to save" }, { status: 500 });

  // Confirmation email — fire and forget
  const keys = Object.keys(body);
  if (keys.includes("cc_password")) {
    notifyAdmin(
      "Command Center Password Updated",
      `The Command Center access password was changed.\n\nChanged by: ${user.email}`
    ).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
