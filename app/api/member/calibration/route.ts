import { createClient } from "@/lib/supabase/server";
import { notifyAdmin } from "@/lib/email";
import { NextResponse, type NextRequest } from "next/server";

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// GET — fetch birth profile + calibration tracks for this member
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Birth profile
  const profileRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/birth_profiles?user_id=eq.${user.id}&limit=1`,
    {
      headers: {
        apikey:        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
      cache: "no-store",
    }
  );
  const profileRows = await profileRes.json();
  const birthProfile = profileRows[0] ?? null;

  // Calibration tracks for this user (approved ones visible to member)
  const tracksRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/content?type=eq.calibration&calibration_user_id=eq.${user.id}&select=id,title,description,external_url,calibration_status,created_at&order=created_at.desc`,
    {
      headers: {
        apikey:        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
      cache: "no-store",
    }
  );
  const tracks = await tracksRes.json();

  return NextResponse.json({
    birth_profile: birthProfile,
    tracks: Array.isArray(tracks) ? tracks : [],
  });
}

// POST — save birth profile + request calibration
export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { dob, birth_time, birth_place, birth_notes, request_generation } = body;

  // Upsert birth profile
  const upsertRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/birth_profiles`,
    {
      method: "POST",
      headers: {
        apikey:         process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization:  `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        "Content-Type": "application/json",
        Prefer:         "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        user_id:     user.id,
        dob:         dob || null,
        birth_time:  birth_time || null,
        birth_place: birth_place || null,
        birth_notes: birth_notes || null,
        updated_at:  new Date().toISOString(),
      }),
    }
  );

  if (!upsertRes.ok) {
    return NextResponse.json({ error: "Failed to save birth profile" }, { status: 500 });
  }

  // If member clicked "Generate", create a pending calibration request
  if (request_generation) {
    const title = `Soul Calibration — ${user.email}`;
    await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/content`,
      {
        method: "POST",
        headers: {
          apikey:         process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization:  `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
          "Content-Type": "application/json",
          Prefer:         "return=minimal",
        },
        body: JSON.stringify({
          type:                   "calibration",
          title,
          description:            `DOB: ${dob || "—"} | Time: ${birth_time || "—"} | Place: ${birth_place || "—"}${birth_notes ? ` | Notes: ${birth_notes}` : ""}`,
          published:              false,
          calibration_user_id:    user.id,
          calibration_status:     "pending",
          created_by:             user.id,
        }),
      }
    );

    // Notify admin
    notifyAdmin(
      `Soul Calibration Request — ${user.email}`,
      `A member has requested a Soul Calibration.\n\nEmail: ${user.email}\nDOB: ${dob || "—"}\nBirth Time: ${birth_time || "—"}\nBirth Place: ${birth_place || "—"}\nNotes: ${birth_notes || "—"}\n\nGo to /dash → Calibration tab to create and post their tracks.`
    ).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
