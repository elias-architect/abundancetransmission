import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "placeholder");
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://abundancetransmission.com";

function welcomeHTML(email: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f8f7f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f4;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#07112b;border-radius:16px 16px 0 0;padding:28px 36px;border-bottom:1px solid #1a2640;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td>
              <table cellpadding="0" cellspacing="0"><tr>
                <td style="width:36px;height:36px;background:linear-gradient(135deg,#c9a84c,#92610a);border-radius:8px;text-align:center;vertical-align:middle;">
                  <span style="color:#07112b;font-weight:900;font-size:18px;line-height:36px;">A</span>
                </td>
                <td style="padding-left:12px;color:#fff;font-weight:700;font-size:15px;">Abundance Transmission</td>
              </tr></table>
            </td>
            <td align="right">
              <span style="background:#c9a84c18;border:1px solid #c9a84c55;color:#c9a84c;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:4px 10px;border-radius:20px;">Early Access · Accès anticipé</span>
            </td>
          </tr></table>
        </td></tr>

        <!-- Hero -->
        <tr><td style="background:#0d1b36;padding:40px 36px 28px 36px;">
          <p style="color:#c9a84c;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px 0;">The transmission has found you</p>
          <h1 style="color:#ffffff;font-size:28px;font-weight:900;margin:0 0 20px 0;line-height:1.3;">
            You are now a Steward<br/>of Abundance Transmission
          </h1>
          <p style="color:#94a3b8;font-size:15px;line-height:1.8;margin:0 0 16px 0;">
            Welcome. You have joined a private frequency — a space where pattern mastery, AI edges, and empathic abundance converge into something real.
          </p>
          <p style="color:#94a3b8;font-size:15px;line-height:1.8;margin:0 0 28px 0;">
            Early stewards receive direct access to the Command Center, exclusive transmissions, and tools designed to align your mind with abundance at every level.
          </p>

          <hr style="border:none;border-top:1px solid #1a2640;margin:0 0 28px 0;"/>

          <!-- FR -->
          <p style="color:#c9a84c;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px 0;">La transmission vous a trouvé</p>
          <p style="color:#64748b;font-size:14px;line-height:1.8;margin:0 0 28px 0;">
            Bienvenue. Vous avez rejoint une fréquence privée — un espace où la maîtrise des patterns, les avantages de l'IA et l'abondance empathique convergent vers quelque chose de réel. Les premiers gardiens reçoivent un accès direct au Command Center et aux transmissions exclusives.
          </p>

          <hr style="border:none;border-top:1px solid #1a2640;margin:0 0 28px 0;"/>
        </td></tr>

        <!-- What's coming -->
        <tr><td style="background:#0d1b36;padding:0 36px 32px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="background:#0a1525;border:1px solid #1a2640;border-left:3px solid #c9a84c;border-radius:0 10px 10px 0;padding:16px 20px;margin-bottom:12px;">
              <p style="color:#64748b;font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;margin:0 0 8px 0;">What you will receive · Ce que vous recevrez</p>
              <table width="100%" cellpadding="0" cellspacing="4">
                <tr><td style="color:#e2e8f0;font-size:14px;padding:3px 0;">✦ Exclusive newsletters &amp; transmissions</td></tr>
                <tr><td style="color:#e2e8f0;font-size:14px;padding:3px 0;">✦ Command Center trading system access</td></tr>
                <tr><td style="color:#e2e8f0;font-size:14px;padding:3px 0;">✦ Original music calibration tracks</td></tr>
                <tr><td style="color:#e2e8f0;font-size:14px;padding:3px 0;">✦ Soul Calibration frequency sessions</td></tr>
                <tr><td style="color:#e2e8f0;font-size:14px;padding:3px 0;">✦ AI tools &amp; pattern mastery resources</td></tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <!-- CTA -->
        <tr><td style="background:#0d1b36;padding:0 36px 36px 36px;text-align:center;">
          <a href="${SITE_URL}" style="display:inline-block;background:#c9a84c;color:#07112b;font-weight:800;font-size:15px;padding:16px 40px;border-radius:12px;text-decoration:none;letter-spacing:0.3px;">
            ✦ Enter the Transmission
          </a>
          <p style="color:#475569;font-size:12px;margin:16px 0 0 0;">
            We will be in touch soon with your full access details.
          </p>
        </td></tr>

        <!-- Signature -->
        <tr><td style="background:#0d1b36;padding:0 36px 36px 36px;border-top:1px solid #1a2640;">
          <p style="color:#475569;font-size:13px;line-height:1.6;margin:24px 0 0 0;">
            The transmission continues.<br/>
            <span style="color:#c9a84c;font-weight:700;">— Niko</span><br/>
            <span style="font-size:11px;color:#334155;">Pisces ♓ · Feb 27, 1989 · Abundance Transmission</span>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#07112b;border-radius:0 0 16px 16px;padding:20px 36px;text-align:center;border-top:1px solid #1a2640;">
          <p style="color:#334155;font-size:11px;margin:0;line-height:1.8;">
            You signed up for early access at Abundance Transmission.<br/>
            Vous vous êtes inscrit pour un accès anticipé à Abundance Transmission.<br/>
            <a href="${SITE_URL}" style="color:#475569;">abundancetransmission.com</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  // Save to waitlist
  const saveRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/waitlist`,
    {
      method: "POST",
      headers: {
        apikey:         process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization:  `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        "Content-Type": "application/json",
        Prefer:         "resolution=ignore-duplicates",
      },
      body: JSON.stringify({ email }),
    }
  );

  // Send welcome email
  if (process.env.RESEND_API_KEY) {
    const resend = getResend();
    await resend.emails.send({
      from:    "Niko · Abundance Transmission <niko@abundancetransmission.com>",
      to:      email,
      replyTo: "niko@abundancetransmission.com",
      subject: "You are now a Steward — Abundance Transmission",
      headers: {
        "List-Unsubscribe": `<mailto:unsubscribe@abundancetransmission.com>, <${SITE_URL}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      html:    welcomeHTML(email),
    }).catch((err) => console.error("Welcome email error:", err));

    // Notify Niko
    await resend.emails.send({
      from:    "Abundance Transmission <niko@abundancetransmission.com>",
      to:      "niko@abundancetransmission.com",
      subject: `[New Steward] ${email} joined the waitlist`,
      html:    `<p style="font-family:sans-serif;"><strong>${email}</strong> just joined the Abundance Transmission early access list.</p>`,
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
