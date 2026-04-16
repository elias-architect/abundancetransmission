import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "placeholder");
}

type ContentType = "newsletter" | "music";

type Member = {
  email: string;
  full_name: string | null;
};

type ContentItem = {
  type: ContentType;
  title: string;
  description: string | null;
  external_url: string | null;
};

function typeLabel(type: ContentType, lang: "en" | "fr") {
  if (lang === "fr") return type === "newsletter" ? "Bulletin" : "Musique";
  return type === "newsletter" ? "Newsletter" : "Music";
}

function generateHTML(member: Member, content: ContentItem): string {
  const name = member.full_name || "Steward";
  const isMusic = content.type === "music";
  const portalEn = `${process.env.NEXT_PUBLIC_SITE_URL}/member?lang=en`;
  const portalFr = `${process.env.NEXT_PUBLIC_SITE_URL}/member?lang=fr`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${content.title}</title>
</head>
<body style="margin:0;padding:0;background:#f8f7f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f4;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#07112b;border-radius:16px 16px 0 0;padding:28px 36px;border-bottom:1px solid #1a2640;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:36px;height:36px;background:linear-gradient(135deg,#c9a84c,#92610a);border-radius:8px;text-align:center;vertical-align:middle;">
                      <span style="color:#07112b;font-weight:900;font-size:18px;line-height:36px;">A</span>
                    </td>
                    <td style="padding-left:12px;color:#fff;font-weight:700;font-size:15px;letter-spacing:0.3px;">
                      Abundance Transmission
                    </td>
                  </tr>
                </table>
              </td>
              <td align="right">
                <span style="background:#c9a84c18;border:1px solid #c9a84c55;color:#c9a84c;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:4px 10px;border-radius:20px;">
                  ${typeLabel(content.type, "en")} · ${typeLabel(content.type, "fr")}
                </span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#0d1b36;padding:36px;">

          <!-- Greeting -->
          <p style="color:#94a3b8;font-size:13px;margin:0 0 24px 0;line-height:1.6;">
            Hello ${name} &nbsp;·&nbsp; Bonjour ${name}
          </p>

          <!-- Title -->
          <h1 style="color:#ffffff;font-size:26px;font-weight:900;margin:0 0 16px 0;line-height:1.3;">
            ${content.title}
          </h1>

          ${content.description ? `
          <!-- Description -->
          <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0 0 28px 0;">
            ${content.description}
          </p>` : ""}

          <!-- Divider -->
          <hr style="border:none;border-top:1px solid #1a2640;margin:0 0 28px 0;" />

          <!-- EN/FR CTA -->
          <p style="color:#64748b;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;margin:0 0 16px 0;">
            Choose your language · Choisissez votre langue
          </p>

          <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="padding-right:12px;">
                <a href="${portalEn}" style="display:inline-block;background:#c9a84c;color:#07112b;font-weight:700;font-size:14px;padding:14px 28px;border-radius:10px;text-decoration:none;letter-spacing:0.3px;">
                  ${isMusic ? "▶ Listen in English" : "📖 Read in English"}
                </a>
              </td>
              <td>
                <a href="${portalFr}" style="display:inline-block;background:transparent;color:#c9a84c;font-weight:700;font-size:14px;padding:13px 28px;border-radius:10px;text-decoration:none;border:1px solid #c9a84c55;letter-spacing:0.3px;">
                  ${isMusic ? "▶ Écouter en Français" : "📖 Lire en Français"}
                </a>
              </td>
            </tr>
          </table>

          <!-- EN block -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
            <tr><td style="background:#0a1525;border:1px solid #1a2640;border-left:3px solid #c9a84c;border-radius:0 10px 10px 0;padding:16px 20px;">
              <p style="color:#64748b;font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;margin:0 0 6px 0;">English</p>
              <p style="color:#e2e8f0;font-size:14px;line-height:1.6;margin:0;">
                ${isMusic
                  ? `A new track has been added to your member portal. Click above to listen.`
                  : `Your latest edition is ready. Click above to read the full ${typeLabel(content.type, "en").toLowerCase()} in your member portal.`
                }
              </p>
            </td></tr>
          </table>

          <!-- FR block -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr><td style="background:#0a1525;border:1px solid #1a2640;border-left:3px solid #2dd4bf;border-radius:0 10px 10px 0;padding:16px 20px;">
              <p style="color:#64748b;font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;margin:0 0 6px 0;">Français</p>
              <p style="color:#e2e8f0;font-size:14px;line-height:1.6;margin:0;">
                ${isMusic
                  ? `Une nouvelle piste a été ajoutée à votre espace membre. Cliquez ci-dessus pour écouter.`
                  : `Votre dernière édition est disponible. Cliquez ci-dessus pour lire le ${typeLabel(content.type, "fr").toLowerCase()} complet dans votre espace membre.`
                }
              </p>
            </td></tr>
          </table>

          <!-- Signature -->
          <p style="color:#475569;font-size:13px;line-height:1.6;margin:0;border-top:1px solid #1a2640;padding-top:24px;">
            The transmission continues.<br/>
            <span style="color:#c9a84c;font-weight:700;">— Niko</span>
            <br/><span style="font-size:11px;color:#334155;">Pisces ♓ · Feb 27, 1989 · Abundance Transmission</span>
          </p>

        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#07112b;border-radius:0 0 16px 16px;padding:20px 36px;text-align:center;border-top:1px solid #1a2640;">
          <p style="color:#334155;font-size:11px;margin:0;line-height:1.8;">
            You received this because you are a steward of Abundance Transmission.<br/>
            Vous recevez ceci en tant que gardien d'Abundance Transmission.<br/>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/member" style="color:#475569;">Manage preferences</a>
            &nbsp;·&nbsp;
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color:#475569;">abundancetransmission.com</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`;
}

export async function notifyAdmin(subject: string, details: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;
  const resend = getResend();
  const now = new Date().toLocaleString("en-CA", { timeZone: "America/Toronto", dateStyle: "full", timeStyle: "short" });

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#07112b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#0d1b36;border-radius:16px;border:1px solid #1a2640;">
        <tr><td style="padding:24px 32px;border-bottom:1px solid #1a2640;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="color:#c9a84c;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Admin Confirmation</td>
            <td align="right" style="color:#334155;font-size:11px;">${now}</td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <h2 style="color:#ffffff;font-size:20px;font-weight:800;margin:0 0 16px 0;">${subject}</h2>
          <div style="background:#0a1525;border:1px solid #1a2640;border-left:3px solid #c9a84c;border-radius:0 10px 10px 0;padding:16px 20px;">
            <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0;white-space:pre-line;">${details}</p>
          </div>
          <p style="color:#334155;font-size:12px;margin:20px 0 0 0;">
            This is an automated confirmation from your Abundance Transmission dashboard.
          </p>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #1a2640;text-align:center;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dash" style="color:#c9a84c;font-size:12px;text-decoration:none;font-weight:700;">
            Open Dashboard →
          </a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  try {
    await resend.emails.send({
      from: "Abundance Transmission <niko@abundancetransmission.com>",
      to:   "niko@abundancetransmission.com",
      subject: `[Dashboard] ${subject}`,
      html,
    });
  } catch (err) {
    console.error("notifyAdmin error:", err);
  }
}

export async function notifyAllMembers(
  members: Member[],
  content: ContentItem
): Promise<{ sent: number; failed: number }> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping email notifications");
    return { sent: 0, failed: 0 };
  }

  const isMusic = content.type === "music";
  const subject = isMusic
    ? `🎵 New music: ${content.title} · Nouvelle musique: ${content.title}`
    : `📖 New newsletter: ${content.title} · Nouveau bulletin: ${content.title}`;

  const resend = getResend();
  const results = await Promise.allSettled(
    members.map((member) =>
      resend.emails.send({
        from: "Niko · Abundance Transmission <niko@abundancetransmission.com>",
        to: member.email,
        subject,
        html: generateHTML(member, content),
      })
    )
  );

  const sent   = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;
  return { sent, failed };
}
