import { assertAdmin } from "@/lib/admin-auth";
import { notifyAdmin } from "@/lib/email";
import { Resend } from "resend";
import { NextResponse, type NextRequest } from "next/server";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "placeholder");
}

// GET — all calibration requests
export async function GET() {
  const user = await assertAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/content?type=eq.calibration&select=id,title,description,calibration_user_id,calibration_status,external_url,created_at&order=created_at.desc`,
    {
      headers: {
        apikey:        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
      cache: "no-store",
    }
  );
  const data = await res.json();
  return NextResponse.json(Array.isArray(data) ? data : []);
}

// POST — deliver a calibration track (paste Suno URL, mark ready, email member)
export async function POST(request: NextRequest) {
  const admin = await assertAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { request_id, external_url, calibration_user_id } = await request.json();
  if (!request_id || !external_url) return NextResponse.json({ error: "request_id and external_url required" }, { status: 400 });

  // Update content row: set external_url + mark as ready + published
  const updateRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/content?id=eq.${request_id}`,
    {
      method: "PATCH",
      headers: {
        apikey:         process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization:  `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        "Content-Type": "application/json",
        Prefer:         "return=representation",
      },
      body: JSON.stringify({
        external_url,
        calibration_status: "ready",
        published:          true,
      }),
    }
  );

  if (!updateRes.ok) return NextResponse.json({ error: "Failed to update" }, { status: 500 });

  // Get member email to notify them
  if (calibration_user_id && process.env.RESEND_API_KEY) {
    const userRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${calibration_user_id}`,
      {
        headers: {
          apikey:        process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        },
      }
    );
    if (userRes.ok) {
      const userData = await userRes.json();
      const memberEmail = userData.email;
      const memberName  = userData.user_metadata?.full_name ?? "Steward";

      if (memberEmail) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://abundancetransmission.com";
        const resend  = getResend();

        await resend.emails.send({
          from:    "Niko · Abundance Transmission <niko@abundancetransmission.com>",
          to:      memberEmail,
          subject: "✦ Your Soul Calibration tracks are ready",
          html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f8f7f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f4;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
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
              <span style="background:#c9a84c18;border:1px solid #c9a84c55;color:#c9a84c;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:4px 10px;border-radius:20px;">Soul Calibration</span>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="background:#0d1b36;padding:40px 36px;">
          <p style="color:#c9a84c;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px 0;">Your frequency is ready</p>
          <h1 style="color:#ffffff;font-size:26px;font-weight:900;margin:0 0 16px 0;line-height:1.3;">Hello ${memberName},<br/>your Soul Calibration tracks are live.</h1>
          <p style="color:#94a3b8;font-size:15px;line-height:1.8;margin:0 0 28px 0;">
            Niko has personally crafted your frequency blueprint. Your calibration tracks are now available in your member portal — listen whenever you need alignment, elevation, or stillness.
          </p>
          <hr style="border:none;border-top:1px solid #1a2640;margin:0 0 28px 0;"/>
          <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;"><tr>
            <td style="padding-right:12px;">
              <a href="${siteUrl}/member" style="display:inline-block;background:#c9a84c;color:#07112b;font-weight:800;font-size:14px;padding:14px 28px;border-radius:10px;text-decoration:none;">
                ✦ Listen Now
              </a>
            </td>
          </tr></table>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="background:#0a1525;border:1px solid #1a2640;border-left:3px solid #c9a84c;border-radius:0 10px 10px 0;padding:16px 20px;">
              <p style="color:#64748b;font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;margin:0 0 6px 0;">How to listen</p>
              <p style="color:#e2e8f0;font-size:14px;line-height:1.7;margin:0;">
                Go to your Member Portal → click the <strong>Soul Calibration</strong> tab → press play on your tracks.
              </p>
            </td></tr>
          </table>
          <p style="color:#475569;font-size:13px;line-height:1.6;margin:24px 0 0 0;border-top:1px solid #1a2640;padding-top:24px;">
            The transmission continues.<br/>
            <span style="color:#c9a84c;font-weight:700;">— Niko</span><br/>
            <span style="font-size:11px;color:#334155;">Pisces ♓ · Feb 27, 1989 · Abundance Transmission</span>
          </p>
        </td></tr>
        <tr><td style="background:#07112b;border-radius:0 0 16px 16px;padding:20px 36px;text-align:center;border-top:1px solid #1a2640;">
          <a href="${siteUrl}" style="color:#475569;font-size:11px;text-decoration:none;">abundancetransmission.com</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
        }).catch(() => {});
      }
    }
  }

  return NextResponse.json({ ok: true });
}
