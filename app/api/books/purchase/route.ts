import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";

const SB   = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://abundancetransmission.com";
const HDR  = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

function getResend() { return new Resend(process.env.RESEND_API_KEY ?? "placeholder"); }

function purchaseEmailHTML(name: string, email: string, book: {
  title: string; slug: string; tagline: string | null;
  author_name: string | null; author_agent: string; pdf_url: string | null;
}): string {
  const displayName = name || "Steward";
  const readUrl     = `${SITE}/member`;
  const pdfBlock    = book.pdf_url ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="background:#0a1525;border:1px solid #c9a84c33;border-left:3px solid #c9a84c;border-radius:0 12px 12px 0;padding:20px 24px;">
        <div style="color:#c9a84c;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">Your PDF is Ready</div>
        <a href="${book.pdf_url}" style="display:inline-block;background:linear-gradient(90deg,#c9a84c,#e8c96a);color:#07112b;font-weight:900;font-size:14px;padding:14px 32px;border-radius:10px;text-decoration:none;">
          Download ${book.title} →
        </a>
        <p style="color:#64748b;font-size:11px;margin:10px 0 0;line-height:1.6;">This link is for your personal use. Please do not share it.</p>
      </td></tr>
    </table>` : `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="background:#0a1525;border:1px solid #1a2640;border-left:3px solid #2dd4bf;border-radius:0 12px 12px 0;padding:16px 20px;">
        <div style="color:#2dd4bf;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">How to Access</div>
        <p style="color:#94a3b8;font-size:13px;line-height:1.7;margin:0;">Your full book is available in your Member Portal. Sign in or create a free account using this email address — your purchase is automatically linked.</p>
      </td></tr>
    </table>`;

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
          <div style="color:#475569;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Order Confirmed</div>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#07112b;padding:36px 40px;">

          <div style="border-left:3px solid #c9a84c;padding:20px 0 20px 24px;margin-bottom:28px;">
            <div style="color:#c9a84c;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:10px;">Thank You</div>
            <h1 style="color:#ffffff;font-size:26px;font-weight:900;margin:0 0 10px;line-height:1.25;">Your copy of ${book.title} is confirmed.</h1>
            <p style="color:#64748b;font-size:14px;margin:0;line-height:1.7;">Welcome, ${displayName}. Your purchase has been received and your access is now active.</p>
          </div>

          <!-- Order summary -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td style="background:#0a1525;border:1px solid #1a2640;border-radius:12px;padding:16px 20px;">
              <div style="color:#64748b;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px;">Order Details</div>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr><td style="padding:4px 0;color:#94a3b8;font-size:13px;"><span style="color:#475569;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-right:12px;">Book</span>${book.title}</td></tr>
                <tr><td style="padding:4px 0;color:#94a3b8;font-size:13px;"><span style="color:#475569;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-right:12px;">Author</span>${book.author_name ?? book.author_agent}</td></tr>
                <tr><td style="padding:4px 0;color:#94a3b8;font-size:13px;"><span style="color:#475569;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-right:12px;">Email</span>${email}</td></tr>
                <tr><td style="padding:4px 0;color:#94a3b8;font-size:13px;"><span style="color:#475569;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-right:12px;">Format</span>PDF · Instant Access</td></tr>
              </table>
            </td></tr>
          </table>

          ${pdfBlock}

          <!-- Member portal CTA -->
          <div style="text-align:center;margin-bottom:28px;">
            <a href="${readUrl}"
               style="display:inline-block;background:linear-gradient(90deg,#c9a84c,#e8c96a,#c9a84c);color:#07112b;font-weight:900;font-size:14px;padding:16px 40px;border-radius:12px;text-decoration:none;">
              Go to My Member Library →
            </a>
            <p style="color:#475569;font-size:12px;margin-top:10px;">Your purchased book will appear in your Books tab.</p>
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
            Questions? Reply to this email or contact <a href="mailto:niko@abundancetransmission.com" style="color:#334155;">niko@abundancetransmission.com</a><br/>
            <a href="${SITE}" style="color:#334155;text-decoration:none;">abundancetransmission.com</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function POST(req: NextRequest) {
  const { book_slug, email, full_name } = await req.json();
  if (!book_slug || !email) {
    return NextResponse.json({ error: "book_slug and email are required" }, { status: 400 });
  }

  // Fetch the book
  const bookRes = await fetch(
    `${SB}/rest/v1/books?slug=eq.${book_slug}&status=eq.published&select=id,title,slug,tagline,author_agent,author_name,price,pdf_url&limit=1`,
    { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }, cache: "no-store" }
  );
  const books = await bookRes.json();
  const book  = books[0];
  if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  // Check for existing purchase (same email + book)
  const dupeRes = await fetch(
    `${SB}/rest/v1/book_purchases?email=eq.${encodeURIComponent(email)}&book_id=eq.${book.id}&select=id&limit=1`,
    { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }, cache: "no-store" }
  );
  const dupes = await dupeRes.json();
  // Allow re-purchase if already exists — just re-send the email (grace for retries)

  // Find user_id if a member account exists with this email
  let user_id: string | null = null;
  const userRes = await fetch(
    `${SB}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=id&limit=1`,
    { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }, cache: "no-store" }
  );
  // profiles table might not have email column — look up via auth
  const authRes = await fetch(
    `${SB}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
    { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }, cache: "no-store" }
  );
  if (authRes.ok) {
    const authData = await authRes.json();
    if (authData.users?.length > 0) user_id = authData.users[0].id;
  }

  // Insert purchase record (upsert by email+book_id)
  if (!dupes || dupes.length === 0) {
    await fetch(`${SB}/rest/v1/book_purchases`, {
      method:  "POST",
      headers: { ...HDR, Prefer: "return=minimal" },
      body: JSON.stringify({
        book_id:   book.id,
        user_id:   user_id ?? null,
        email:     email.trim().toLowerCase(),
        full_name: full_name?.trim() || null,
        amount:    book.price,
        status:    "completed",
      }),
    });
  }

  // Send confirmation email to buyer
  if (process.env.RESEND_API_KEY) {
    const resend = getResend();
    await resend.emails.send({
      from:    "Niko · Abundance Transmission <niko@abundancetransmission.com>",
      to:      email.trim(),
      replyTo: "niko@abundancetransmission.com",
      subject: `Your copy of ${book.title} — Abundance Transmission`,
      headers: {
        "List-Unsubscribe": `<mailto:unsubscribe@abundancetransmission.com>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      html: purchaseEmailHTML(full_name ?? "", email, book),
    }).catch((err) => console.error("Purchase email error:", err));

    // Notify admin
    resend.emails.send({
      from:    "Abundance Transmission <niko@abundancetransmission.com>",
      to:      "niko@abundancetransmission.com",
      subject: `New book purchase: ${book.title}`,
      html: `<p><b>${full_name || "Anonymous"}</b> (${email}) purchased <b>${book.title}</b> for $${book.price}.</p>`,
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
