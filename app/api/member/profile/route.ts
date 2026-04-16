import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";

const SB  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://abundancetransmission.com";

function getResend() { return new Resend(process.env.RESEND_API_KEY ?? "placeholder"); }

/** Generates a unique personal Command Center code: e.g. KRB-742 */
function generateCCPassword(): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I or O (look like 1/0)
  const digits  = "123456789";
  const l = () => letters[Math.floor(Math.random() * letters.length)];
  const d = () => digits[Math.floor(Math.random() * digits.length)];
  return `${l()}${l()}${l()}-${d()}${d()}${d()}`;
}

// ── Welcome email sent after profile is saved ────────────────────────────────
function welcomeCompleteHTML(name: string, email: string, dob: string | null, location: string | null, ccPassword: string): string {
  const displayName = name || "Steward";
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#060d1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060d1e;padding:48px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(180deg,#07112b 0%,#050d1f 100%);border-radius:20px 20px 0 0;padding:36px 40px 28px;border-bottom:1px solid #1a2640;text-align:center;">
          <div style="display:inline-block;width:52px;height:52px;background:linear-gradient(135deg,#c9a84c,#92610a);border-radius:14px;text-align:center;line-height:52px;font-size:24px;font-weight:900;color:#07112b;margin-bottom:20px;">A</div>
          <div style="color:#ffffff;font-size:16px;font-weight:700;margin-bottom:4px;">Abundance Transmission</div>
          <div style="color:#475569;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Member Portal · Active</div>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#07112b;padding:36px 40px;">

          <div style="border-left:3px solid #c9a84c;padding:20px 0 20px 24px;margin-bottom:28px;">
            <div style="color:#c9a84c;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:10px;">You are in.</div>
            <h1 style="color:#ffffff;font-size:26px;font-weight:900;margin:0 0 10px;line-height:1.25;">Welcome, ${displayName}.</h1>
            <p style="color:#64748b;font-size:14px;margin:0;line-height:1.7;">Your profile has been saved. Here is a summary of what we received.</p>
          </div>

          <!-- Profile summary -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td style="background:#0a1525;border:1px solid #1a2640;border-left:3px solid #c9a84c;border-radius:0 10px 10px 0;padding:16px 20px;">
              <div style="color:#64748b;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px;">Your Profile</div>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr><td style="padding:4px 0;color:#94a3b8;font-size:13px;"><span style="color:#475569;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-right:12px;">Name</span>${name || "Not provided"}</td></tr>
                <tr><td style="padding:4px 0;color:#94a3b8;font-size:13px;"><span style="color:#475569;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-right:12px;">Date of Birth</span>${dob || "Not provided"}</td></tr>
                <tr><td style="padding:4px 0;color:#94a3b8;font-size:13px;"><span style="color:#475569;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-right:12px;">Location</span>${location || "Not provided"}</td></tr>
                <tr><td style="padding:4px 0;color:#94a3b8;font-size:13px;"><span style="color:#475569;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-right:12px;">Email</span>${email}</td></tr>
              </table>
            </td></tr>
          </table>

          <!-- Privacy note -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td style="background:#0a1525;border:1px solid #1a2640;border-left:3px solid #2dd4bf;border-radius:0 10px 10px 0;padding:16px 20px;">
              <div style="color:#2dd4bf;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;">Your Privacy</div>
              <p style="color:#94a3b8;font-size:13px;line-height:1.7;margin:0;">We have no intention of selling or sharing your private information. The sole purpose of your birth data is to help us create personalized Soul Calibration music that resonates with your frequency — so you can become more sovereign and free.</p>
            </td></tr>
          </table>

          <!-- Command Center Access Code -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td style="background:linear-gradient(135deg,#0a1525,#07112b);border:1px solid #c9a84c33;border-left:3px solid #c9a84c;border-radius:0 12px 12px 0;padding:20px 24px;">
              <div style="color:#c9a84c;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:10px;">Your Personal Command Center Code</div>
              <div style="color:#ffffff;font-size:28px;font-weight:900;letter-spacing:6px;margin-bottom:8px;font-family:monospace;">${ccPassword}</div>
              <p style="color:#64748b;font-size:12px;line-height:1.6;margin:0;">This code is yours alone — it unlocks your personal Command Center. Do not share it. You can always find it in your Member Portal under Account settings.</p>
            </td></tr>
          </table>

          <!-- CTA -->
          <div style="text-align:center;margin-bottom:28px;">
            <a href="${SITE}/command-center"
               style="display:inline-block;background:linear-gradient(90deg,#c9a84c,#e8c96a,#c9a84c);color:#07112b;font-weight:900;font-size:14px;padding:16px 40px;border-radius:12px;text-decoration:none;margin-bottom:12px;">
              Enter Command Center →
            </a>
            <br/>
            <a href="${SITE}/member"
               style="display:inline-block;color:#475569;font-size:13px;text-decoration:none;margin-top:10px;">
              Or go to your Member Portal →
            </a>
          </div>

          <!-- Signature -->
          <div style="border-top:1px solid #1a2640;padding-top:24px;">
            <p style="color:#475569;font-size:13px;line-height:1.7;margin:0;">
              The transmission continues.<br/>
              <span style="color:#c9a84c;font-weight:700;">— Niko</span><br/>
              <span style="font-size:11px;color:#334155;">Pisces ♓ · Feb 27, 1989</span>
            </p>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#050810;border-radius:0 0 20px 20px;padding:20px 40px;border-top:1px solid #0f1f3a;text-align:center;">
          <p style="color:#1e3a5f;font-size:11px;margin:0;line-height:1.8;">
            Your information is visible and editable anytime in your Member Portal.<br/>
            <a href="${SITE}/member" style="color:#334155;text-decoration:none;">abundancetransmission.com/member</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

// ── GET — fetch current profile ───────────────────────────────────────────────
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdmin(SB, KEY, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: profile } = await admin.from("profiles").select("*").eq("id", user.id).single();
  return NextResponse.json(profile ?? {});
}

// ── PATCH — update profile + optionally mark onboarding complete ──────────────
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    full_name, date_of_birth, birth_location, ancestry,
    newsletter_subscribed, onboarding_complete,
  } = body;

  const updates: Record<string, unknown> = {};
  if (full_name            !== undefined) updates.full_name             = full_name;
  if (date_of_birth        !== undefined) updates.date_of_birth         = date_of_birth;
  if (birth_location       !== undefined) updates.birth_location        = birth_location;
  if (ancestry             !== undefined) updates.ancestry              = ancestry;
  if (newsletter_subscribed !== undefined) updates.newsletter_subscribed = newsletter_subscribed;
  if (onboarding_complete  !== undefined) updates.onboarding_complete   = onboarding_complete;

  const admin = createAdmin(SB, KEY, { auth: { autoRefreshToken: false, persistSession: false } });

  // If completing onboarding, generate a personal CC password if not already set
  if (onboarding_complete === true) {
    const { data: existing } = await admin.from("profiles").select("cc_password").eq("id", user.id).single();
    if (!existing?.cc_password) {
      updates.cc_password = generateCCPassword();
    }
  }

  const { error } = await admin.from("profiles").update(updates).eq("id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send welcome email when onboarding is completed for the first time
  if (onboarding_complete === true && process.env.RESEND_API_KEY) {
    const { data: profile } = await admin.from("profiles").select("*").eq("id", user.id).single();
    const ccCode = profile?.cc_password ?? (updates.cc_password as string) ?? "—";
    const resend = getResend();
    await resend.emails.send({
      from:    "Niko · Abundance Transmission <niko@abundancetransmission.com>",
      to:      user.email!,
      replyTo: "niko@abundancetransmission.com",
      subject: "You are in — Abundance Transmission",
      headers: {
        "List-Unsubscribe": `<mailto:unsubscribe@abundancetransmission.com>, <${SITE}/member>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      html: welcomeCompleteHTML(
        profile?.full_name ?? "",
        user.email!,
        profile?.date_of_birth ?? null,
        profile?.birth_location ?? null,
        ccCode,
      ),
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
