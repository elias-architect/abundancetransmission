"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";

type Chapter = { title: string; content?: string };

type Book = {
  title: string;
  tagline: string | null;
  description: string | null;
  author_agent: string;
  author_name: string | null;
  cover_image_url: string | null;
  price: number;
  chapters: Chapter[];
  preview_chapter_content: string | null;
  transformation_summary: string | null;
};

export default function BookPdfView({ book }: { book: Book }) {
  const chapters: Chapter[] = Array.isArray(book.chapters) ? book.chapters : [];
  const authorName = book.author_name ?? book.author_agent;

  useEffect(() => {
    document.title = `${book.title} — Abundance Transmission`;
  }, [book.title]);

  return (
    <>
      {/* Print button — hidden when printing */}
      <div className="no-print fixed bottom-6 right-6 z-50">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-deep shadow-2xl hover:opacity-90 transition-all"
          style={{ background: "linear-gradient(90deg,#f59e0b,#fde68a)" }}
        >
          <Printer size={15} /> Save as PDF
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Inter:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #050810;
          color: #e2e8f0;
          font-family: 'Inter', -apple-system, sans-serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .book-page {
          width: 794px;        /* A4 width at 96dpi */
          margin: 0 auto;
          background: #050810;
        }

        /* ── Cover page ── */
        .cover {
          width: 794px;
          height: 1123px;      /* A4 height */
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          background: linear-gradient(160deg, #07112b 0%, #050810 60%);
          page-break-after: always;
        }

        .cover-bg-glow {
          position: absolute;
          top: -100px;
          right: -100px;
          width: 500px;
          height: 500px;
          background: radial-gradient(ellipse, rgba(201,168,76,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .cover-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 72px 80px;
        }

        .cover-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: auto;
        }

        .cover-brand-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #c9a84c, #92610a);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 18px;
          color: #07112b;
          font-family: 'Inter', sans-serif;
        }

        .cover-brand-name {
          color: #64748b;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .cover-main {
          margin-bottom: 48px;
        }

        .cover-agent {
          color: #c9a84c;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 24px;
        }

        .cover-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 64px;
          font-weight: 900;
          color: #ffffff;
          line-height: 1.1;
          margin-bottom: 20px;
          max-width: 560px;
        }

        .cover-tagline {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 18px;
          font-style: italic;
          color: #94a3b8;
          line-height: 1.6;
          max-width: 480px;
        }

        .cover-divider {
          width: 80px;
          height: 2px;
          background: linear-gradient(90deg, #c9a84c, transparent);
          margin-bottom: 40px;
        }

        .cover-footer {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding-top: 32px;
          border-top: 1px solid #1a2640;
        }

        .cover-footer-left { color: #475569; font-size: 12px; line-height: 1.6; }
        .cover-footer-price {
          font-size: 28px;
          font-weight: 900;
          color: #c9a84c;
          font-family: 'Inter', sans-serif;
        }

        /* ── Chapter pages ── */
        .chapter-page {
          width: 794px;
          min-height: 1123px;
          padding: 80px 96px;
          page-break-before: always;
          background: #050810;
        }

        .chapter-number {
          color: #1a2640;
          font-size: 120px;
          font-weight: 900;
          font-family: 'Playfair Display', serif;
          line-height: 1;
          margin-bottom: -24px;
          display: block;
        }

        .chapter-label {
          color: #c9a84c;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .chapter-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 36px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.2;
          margin-bottom: 40px;
          padding-bottom: 32px;
          border-bottom: 1px solid #1a2640;
        }

        .chapter-body {
          font-size: 15px;
          line-height: 1.9;
          color: #94a3b8;
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 400;
        }

        .chapter-body p {
          margin-bottom: 20px;
          text-align: justify;
          hyphens: auto;
        }

        .chapter-body h2 {
          font-family: 'Inter', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #e2e8f0;
          letter-spacing: 0.5px;
          margin: 40px 0 16px;
        }

        .chapter-body blockquote {
          border-left: 3px solid #c9a84c;
          padding: 16px 24px;
          margin: 32px 0;
          background: #0a1525;
          border-radius: 0 8px 8px 0;
          font-style: italic;
          color: #e2e8f0;
          font-size: 16px;
        }

        /* ── Description page (if no chapters with content) ── */
        .description-page {
          width: 794px;
          min-height: 1123px;
          padding: 80px 96px;
          page-break-before: always;
          background: #050810;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .description-badge {
          color: #c9a84c;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 24px;
        }

        .description-heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 36px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.3;
          margin-bottom: 32px;
          max-width: 560px;
        }

        .description-body p {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 15px;
          line-height: 1.9;
          color: #94a3b8;
          margin-bottom: 20px;
          text-align: justify;
        }

        /* ── Back page ── */
        .back-page {
          width: 794px;
          height: 1123px;
          background: linear-gradient(160deg, #07112b 0%, #050810 100%);
          page-break-before: always;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .back-glow {
          position: absolute;
          bottom: -100px;
          left: 50%;
          transform: translateX(-50%);
          width: 400px;
          height: 400px;
          background: radial-gradient(ellipse, rgba(201,168,76,0.10) 0%, transparent 70%);
          pointer-events: none;
        }

        .back-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #c9a84c, #92610a);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 28px;
          color: #07112b;
          font-family: 'Inter', sans-serif;
          margin-bottom: 32px;
        }

        .back-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 28px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 16px;
        }

        .back-sub {
          font-size: 14px;
          color: #64748b;
          line-height: 1.7;
          max-width: 400px;
          margin-bottom: 40px;
        }

        .back-url {
          color: #c9a84c;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .back-divider {
          width: 60px;
          height: 1px;
          background: #1a2640;
          margin: 32px auto;
        }

        .back-legal {
          color: #1a2640;
          font-size: 11px;
          line-height: 1.6;
          max-width: 480px;
        }

        /* ── Print media ── */
        @media print {
          .no-print { display: none !important; }
          body { background: #050810; }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>

      <div className="book-page">

        {/* ── Cover Page ── */}
        <div className="cover">
          <div className="cover-bg-glow" />
          <div className="cover-content">

            {/* Brand */}
            <div className="cover-brand">
              <div className="cover-brand-icon">A</div>
              <span className="cover-brand-name">Abundance Transmission</span>
            </div>

            {/* Main */}
            <div className="cover-main">
              <div className="cover-agent">{authorName} · A Council Transmission</div>
              <h1 className="cover-title">{book.title}</h1>
              {book.tagline && <p className="cover-tagline">{book.tagline}</p>}
            </div>

            {/* Divider + footer */}
            <div>
              <div className="cover-divider" />
              <div className="cover-footer">
                <div className="cover-footer-left">
                  abundancetransmission.com<br />
                  <span style={{ color: "#334155", fontSize: "11px" }}>PDF Edition · Personal Use Only</span>
                </div>
                {book.price > 0 && (
                  <div className="cover-footer-price">${Number(book.price).toFixed(0)}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Chapter Pages ── */}
        {chapters.length > 0 ? (
          chapters.map((ch, idx) => {
            // Decide content source: chapter.content, or preview for chapter 1
            const content = ch.content ?? (idx === 0 ? book.preview_chapter_content : null);

            return (
              <div key={idx} className="chapter-page">
                <span className="chapter-number">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="chapter-label">Chapter {idx + 1}</div>
                <h2 className="chapter-title">{ch.title}</h2>
                {content ? (
                  <div className="chapter-body">
                    {content.split("\n\n").map((para, i) => {
                      if (para.startsWith("#")) {
                        return <h2 key={i}>{para.replace(/^#+\s*/, "")}</h2>;
                      }
                      if (para.startsWith(">")) {
                        return <blockquote key={i}>{para.replace(/^>\s*/, "")}</blockquote>;
                      }
                      return <p key={i}>{para}</p>;
                    })}
                  </div>
                ) : (
                  <div className="chapter-body">
                    <p style={{ color: "#334155", fontStyle: "italic" }}>
                      Chapter content not yet available in the database. Add content to the chapters JSON array in Supabase to populate this section.
                    </p>
                  </div>
                )}
              </div>
            );
          })
        ) : book.description ? (
          /* Fallback: description as body content */
          <div className="description-page">
            <div className="description-badge">The Transmission</div>
            <h2 className="description-heading">{book.title}</h2>
            <div className="description-body">
              {(book.transformation_summary ?? book.description).split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        ) : null}

        {/* ── Back Cover ── */}
        <div className="back-page">
          <div className="back-glow" />
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div className="back-icon">A</div>
            <div className="back-title">Abundance Transmission</div>
            <p className="back-sub">
              A platform for sovereign minds. Music, writing, and strategy tools for those who know something deeper is available.
            </p>
            <div className="back-url">abundancetransmission.com</div>
            <div className="back-divider" />
            <p className="back-legal">
              This PDF is licensed for personal use only. Reproduction, distribution, or resale without written permission is prohibited. © {new Date().getFullYear()} Abundance Transmission. All rights reserved.
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
