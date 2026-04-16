import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

const SB  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const HDR = { apikey: KEY, Authorization: `Bearer ${KEY}` };

/** GET — returns the logged-in member's personal CC code (generates one if missing) */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profileRes = await fetch(
    `${SB}/rest/v1/profiles?id=eq.${user.id}&select=cc_password&limit=1`,
    { headers: HDR, cache: "no-store" }
  );
  const rows = await profileRes.json();
  let code = rows[0]?.cc_password ?? null;

  // Generate on demand if missing (e.g. users who joined before this feature)
  if (!code) {
    const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const digits  = "123456789";
    const l = () => letters[Math.floor(Math.random() * letters.length)];
    const d = () => digits[Math.floor(Math.random() * digits.length)];
    code = `${l()}${l()}${l()}-${d()}${d()}${d()}`;
    await fetch(`${SB}/rest/v1/profiles?id=eq.${user.id}`, {
      method:  "PATCH",
      headers: { ...HDR, "Content-Type": "application/json", Prefer: "return=minimal" },
      body:    JSON.stringify({ cc_password: code }),
    });
  }

  return NextResponse.json({ code });
}

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  if (!password) return NextResponse.json({ ok: false });

  // 1. Check against personal cc_password in profiles (primary)
  const profileRes = await fetch(
    `${SB}/rest/v1/profiles?cc_password=eq.${encodeURIComponent(password)}&select=id,full_name&limit=1`,
    { headers: HDR, cache: "no-store" }
  );
  if (profileRes.ok) {
    const profiles = await profileRes.json();
    if (Array.isArray(profiles) && profiles.length > 0) {
      const profile = profiles[0];
      return NextResponse.json({
        ok:   true,
        name: profile.full_name ?? null,
        personal: true,
      });
    }
  }

  // 2. Fallback — check global cc_password in settings table (legacy / admin-set)
  const settingsRes = await fetch(
    `${SB}/rest/v1/settings?key=eq.cc_password&select=value&limit=1`,
    { headers: HDR, cache: "no-store" }
  );
  if (settingsRes.ok) {
    const rows = await settingsRes.json();
    const stored = rows[0]?.value ?? "Enigma369!";
    if (password === stored) {
      return NextResponse.json({ ok: true, name: null, personal: false });
    }
  }

  return NextResponse.json({ ok: false });
}
