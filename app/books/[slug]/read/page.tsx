import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function getBook(slug: string) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/books?slug=eq.${slug}&status=eq.published&select=*&limit=1`,
    {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
      next: { revalidate: 60 },
    }
  );
  const data = await res.json();
  return data[0] ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBook(slug);
  if (!book) return { title: "Not Found" };
  return {
    title: `Reading: ${book.title}`,
    description: book.tagline ?? undefined,
  };
}

export default async function BookReadPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getBook(slug);
  if (!book) notFound();

  const chapters = Array.isArray(book.chapters) ? book.chapters : [];
  const preview  = book.preview_chapter_content as string | null;
  const chapterTitle = chapters[0]?.title ?? "Chapter One";

  return (
    <div className="min-h-screen bg-deep">
      {/* Top bar */}
      <div className="sticky top-16 z-40 border-b border-border/40 bg-deep/95 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <Link href={`/books/${slug}`}
            className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-gold transition-colors">
            <ArrowLeft size={11} /> Back to book
          </Link>
          <span className="text-xs text-slate-600 font-mono hidden sm:block">{book.title}</span>
          <Link href={`/books/${slug}#get-book`}
            className="text-xs font-bold text-gold hover:text-amber-300 transition-colors">
            Get the full book →
          </Link>
        </div>
      </div>

      {/* Reading content */}
      <article className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24">

        {/* Chapter header */}
        <div className="mb-14 text-center space-y-4">
          <div className="text-xs font-bold uppercase tracking-widest text-gold">
            Free Preview · Chapter 1
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            {chapterTitle}
          </h1>
          <div className="w-16 h-px bg-gold/30 mx-auto" />
          <p className="text-sm text-slate-500 italic">{book.title} · {book.author_name ?? book.author_agent}</p>
        </div>

        {/* Body text */}
        {preview ? (
          <div className="prose-reading space-y-6">
            {preview.split("\n\n").map((paragraph: string, i: number) => {
              // Headings: lines starting with # or ALL CAPS short lines
              if (paragraph.startsWith("#")) {
                return (
                  <h2 key={i} className="text-xl font-black text-white mt-12 mb-4 leading-tight">
                    {paragraph.replace(/^#+\s*/, "")}
                  </h2>
                );
              }
              return (
                <p key={i} className="text-base sm:text-lg text-slate-300 leading-loose tracking-wide">
                  {paragraph}
                </p>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-600">
            <BookOpen size={32} className="mx-auto mb-4 opacity-30" />
            <p>Chapter preview not yet available.</p>
          </div>
        )}

        {/* End-of-chapter divider */}
        <div className="my-20 flex items-center gap-4">
          <div className="flex-1 h-px bg-border/60" />
          <div className="w-2 h-2 rounded-full bg-gold/40" />
          <div className="flex-1 h-px bg-border/60" />
        </div>

        {/* ── "Read More" CTA → sales page ── */}
        <div className="rounded-3xl border border-gold/20 bg-navy/60 p-8 sm:p-12 text-center space-y-6"
          style={{ boxShadow: "0 0 60px rgba(245,158,11,0.04)" }}>

          <div className="text-xs font-bold uppercase tracking-widest text-gold mb-2">
            What comes next
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            {chapters.length > 1
              ? `${chapters.length - 1} more chapter${chapters.length > 2 ? "s" : ""} await`
              : "The transmission continues"}
          </h2>

          {chapters.length > 1 && (
            <ul className="text-left space-y-2 max-w-sm mx-auto">
              {chapters.slice(1, 4).map((ch: { title: string }, i: number) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold/50 flex-shrink-0 mt-2" />
                  {ch.title}
                </li>
              ))}
              {chapters.length > 5 && (
                <li className="text-xs text-slate-600 ml-4">
                  + {chapters.length - 4} more chapters
                </li>
              )}
            </ul>
          )}

          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            {book.price > 0
              ? "See what this book will shift in you — and get instant access."
              : "Discover what this transmission will open in you."}
          </p>

          <Link href={`/books/${slug}#get-book`}
            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-sm text-deep hover:opacity-90 transition-all"
            style={{ background: "linear-gradient(90deg, #f59e0b, #fde68a, #f59e0b)" }}>
            Get the Full Book <ArrowRight size={14} />
          </Link>

          <p className="text-xs text-slate-700">
            {book.price > 0 ? `$${Number(book.price).toFixed(2)} · PDF · Instant access` : "Free for all readers"}
          </p>
        </div>
      </article>
    </div>
  );
}
