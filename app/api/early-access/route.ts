import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://abundancetransmission.com";
const SB_URL   = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SB_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getResend() { return new Resend(process.env.RESEND_API_KEY ?? "placeholder"); }
function getAdminClient() { return createSupabaseAdmin(SB_URL, SB_KEY, { auth: { autoRefreshToken: false, persistSession: false } }); }

// ── Branded confirmation email ────────────────────────────────────────────────
function confirmationHTML(confirmUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Confirm Authentication – Abundance Transmission</title>
</head>
<body style="margin:0;padding:0;background:#060d1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060d1e;padding:48px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(180deg,#07112b 0%,#050d1f 100%);border-radius:20px 20px 0 0;padding:36px 40px 28px;border-bottom:1px solid #1a2640;text-align:center;">
          <!-- Logo mark -->
          <div style="display:inline-block;width:52px;height:52px;background:linear-gradient(135deg,#c9a84c,#92610a);border-radius:14px;text-align:center;line-height:52px;font-size:24px;font-weight:900;color:#07112b;margin-bottom:20px;">A</div>
          <div style="color:#ffffff;font-size:16px;font-weight:700;letter-spacing:0.5px;margin-bottom:4px;">Abundance Transmission</div>
          <div style="color:#475569;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Pattern Mastery · AI Edges · Empathic Abundance</div>
        </td></tr>

        <!-- Hero band -->
        <tr><td style="background:#07112b;padding:0 40px;">
          <div style="border-left:3px solid #c9a84c;padding:20px 0 20px 24px;margin:32px 0;">
            <div style="color:#c9a84c;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:10px;">Authentication Request</div>
            <h1 style="color:#ffffff;font-size:28px;font-weight:900;margin:0 0 10px;line-height:1.25;">One step to enter<br/>the transmission.</h1>
            <p style="color:#64748b;font-size:14px;margin:0;line-height:1.7;">Click the button below to confirm your access. This link expires in 24 hours.</p>
          </div>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#07112b;padding:0 40px 36px;">

          <!-- CTA button -->
          <div style="text-align:center;margin-bottom:36px;">
            <a href="${confirmUrl}"
               style="display:inline-block;background:linear-gradient(90deg,#c9a84c,#e8c96a,#c9a84c);color:#07112b;font-weight:900;font-size:15px;padding:18px 48px;border-radius:14px;text-decoration:none;letter-spacing:0.4px;">
              Confirm Your Access →
            </a>
            <p style="color:#334155;font-size:11px;margin:14px 0 0;letter-spacing:0.3px;">
              Button not working? <a href="${confirmUrl}" style="color:#c9a84c;text-decoration:none;">Copy this link</a>
            </p>
          </div>

          <!-- Divider -->
          <div style="height:1px;background:linear-gradient(90deg,transparent,#1a2640,transparent);margin-bottom:32px;"></div>

          <!-- What you get -->
          <div style="margin-bottom:32px;">
            <div style="color:#475569;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">After confirming, you will have access to</div>
            <table cellpadding="0" cellspacing="0" width="100%">
              ${[
                ["✦", "Member Portal", "Exclusive newsletters, transmissions &amp; resources"],
                ["♫", "Soul Music", "Original frequency tracks created for your vibration"],
                ["◎", "Soul Calibration", "Personalized frequency sessions based on your birth data"],
                ["⌘", "Command Center", "Live strategy engine — Enigma 369 in action"],
              ].map(([icon, title, desc]) => `
              <tr><td style="padding:8px 0;">
                <table cellpadding="0" cellspacing="0"><tr>
                  <td style="width:32px;vertical-align:top;padding-top:2px;color:#c9a84c;font-size:14px;">${icon}</td>
                  <td>
                    <div style="color:#e2e8f0;font-size:13px;font-weight:700;">${title}</div>
                    <div style="color:#475569;font-size:12px;margin-top:2px;">${desc}</div>
                  </td>
                </tr></table>
              </td></tr>`).join("")}
            </table>
          </div>

          <!-- Signature -->
          <div style="border-top:1px solid #1a2640;padding-top:24px;">
            <p style="color:#475569;font-size:13px;line-height:1.7;margin:0;">
              The transmission continues.<br/>
              <span style="color:#c9a84c;font-weight:700;">— Niko</span><br/>
              <span style="font-size:11px;color:#334155;">Pisces ♓ · Feb 27, 1989 · Abundance Transmission</span>
            </p>
          </div>

        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#050810;border-radius:0 0 20px 20px;padding:20px 40px;border-top:1px solid #0f1f3a;">
          <p style="color:#1e3a5f;font-size:11px;margin:0;line-height:1.8;text-align:center;">
            You requested access to Abundance Transmission.<br/>
            If this wasn't you, you can safely ignore this email.<br/>
            <a href="${SITE_URL}" style="color:#334155;text-decoration:none;">abundancetransmission.com</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`;
}

// ── POST ──────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const { email } = await request.json();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  // 1. Save to waitlist (ignore duplicates)
  await fetch(`${SB_URL}/rest/v1/waitlist`, {
    method: "POST",
    headers: {
      apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`,
      "Content-Type": "application/json", Prefer: "resolution=ignore-duplicates",
    },
    body: JSON.stringify({ email }),
  }).catch(() => {});

  // 2. Generate a Supabase magic-link so we control the email HTML
  const adminClient = getAdminClient();
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: `${SITE_URL}/api/auth/callback?next=/member` },
  });

  if (linkError || !linkData?.properties?.action_link) {
    console.error("generateLink error:", linkError);
    // Still return ok — user can use Magic Link on /login
    return NextResponse.json({ ok: true, fallback: true });
  }

  const confirmUrl = linkData.properties.action_link;

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: true });
  }

  const resend = getResend();

  // 3. Send branded confirmation email
  await resend.emails.send({
    from:    "Niko · Abundance Transmission <niko@abundancetransmission.com>",
    to:      email,
    replyTo: "niko@abundancetransmission.com",
    subject: "Confirm Authentication – Abundance Transmission",
    headers: {
      "List-Unsubscribe": `<mailto:unsubscribe@abundancetransmission.com>, <${SITE_URL}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    html: confirmationHTML(confirmUrl),
  }).catch((err) => console.error("Confirmation email error:", err));

  // 4. Notify Niko
  await resend.emails.send({
    from:    "Abundance Transmission <niko@abundancetransmission.com>",
    to:      "niko@abundancetransmission.com",
    subject: `[New Signup] ${email}`,
    html:    `<p style="font-family:sans-serif"><strong>${email}</strong> just signed up — confirmation email sent.</p>`,
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
