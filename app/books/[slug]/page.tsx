import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Lock, ArrowRight, Sparkles } from "lucide-react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const AGENT_BIOS: Record<string, { role: string; color: string; bio: string }> = {
  SAGE: {
    role:  "Wisdom Keeper",
    color: "text-gold",
    bio:   "SAGE distills lifetimes of knowing into the fewest possible words. These pages carry no filler — only the kind of truth that lands in the body before the mind can argue with it.",
  },
  MAGE: {
    role:  "Reality Weaver",
    color: "text-teal",
    bio:   "MAGE writes from the invisible side of things. Every chapter is a frequency first, a story second. Read slowly. Some sentences are meant to be felt, not understood.",
  },
  CREATOR: {
    role:  "Content Architect",
    color: "text-amber-400",
    bio:   "CREATOR shapes transmission into form — precise, beautiful, never a wasted word. This work was written to move through you like water, not to sit on a shelf.",
  },
  INNOCENT: {
    role:  "Frequency Keeper",
    color: "text-teal",
    bio:   "INNOCENT writes from the place before the wound. These pages speak to what you are returning to — not what you are healing from.",
  },
  CAREGIVER: {
    role:  "Soul Guardian",
    color: "text-emerald-400",
    bio:   "CAREGIVER writes to the part of you that has been carrying too much for too long. This is a book about being held — by truth, by self, by something larger.",
  },
  RULER: {
    role:  "Sovereign Strategist",
    color: "text-accent",
    bio:   "RULER writes without comfort. Sovereign clarity only. Every chapter is a direct transmission on what it means to govern your own life from the inside out.",
  },
  ELIAS: {
    role:  "The Architect",
    color: "text-gold",
    bio:   "ELIAS writes from the center of the system — where all frequencies meet. This is the book that contains all the others. Read it last, or read it first. Either way, it will change your order.",
  },
};

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
  if (!book) return { title: "Book Not Found" };
  return {
    title: book.title,
    description: book.tagline ?? book.description?.slice(0, 160),
    openGraph: {
      title: book.title,
      description: book.tagline,
      images: book.cover_image_url ? [book.cover_image_url] : [],
    },
  };
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getBook(slug);
  if (!book) notFound();

  const agent    = AGENT_BIOS[book.author_agent] ?? AGENT_BIOS["SAGE"];
  const chapters = Array.isArray(book.chapters) ? book.chapters : [];
  const preview  = book.preview_chapter_content;

  return (
    <div className="min-h-screen bg-deep">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #060d1e 0%, #050810 100%)" }}>
        <div className="absolute inset-0 opacity-20"
          style={{ background: "radial-gradient(ellipse at 60% 0%, rgba(245,158,11,0.15) 0%, transparent 60%)" }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative z-10">
          <Link href="/books" className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-gold transition-colors mb-10">
            <ArrowLeft size={12} /> All Books
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Cover */}
            <div className="relative">
              <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border border-border/60 relative"
                style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 40px rgba(245,158,11,0.08)" }}>
                {book.cover_image_url ? (
                  <img src={book.cover_image_url} alt={book.title}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4"
                    style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #050810 100%)" }}>
                    <BookOpen size={48} className="text-gold opacity-40" />
                    <span className="text-slate-600 text-sm">{book.title}</span>
                  </div>
                )}
              </div>
              {/* Glow */}
              <div className="absolute -inset-4 rounded-3xl opacity-10 blur-2xl -z-10"
                style={{ background: "radial-gradient(ellipse, #f59e0b, transparent)" }} />
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div>
                <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${agent.color}`}>
                  {book.author_name ?? book.author_agent} · {agent.role}
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-3">{book.title}</h1>
                {book.tagline && (
                  <p className="text-lg text-slate-400 italic leading-relaxed">{book.tagline}</p>
                )}
              </div>

              {book.description && (
                <div className="space-y-3">
                  {book.description.split("\n\n").map((p: string, i: number) => (
                    <p key={i} className="text-sm text-slate-300 leading-relaxed">{p}</p>
                  ))}
                </div>
              )}

              {/* Price + CTA */}
              <div id="get-book" className="pt-4 space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-white">
                    {book.price > 0 ? `$${Number(book.price).toFixed(2)}` : "Free"}
                  </span>
                  {book.price > 0 && <span className="text-sm text-slate-500">USD · instant download</span>}
                </div>
                <Link href={`/books/${slug}/read`}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-10 py-4 rounded-2xl font-black text-sm text-deep hover:opacity-90 transition-all"
                  style={{ background: "linear-gradient(90deg, #f59e0b, #fde68a, #f59e0b)" }}>
                  {book.price > 0 ? "Get the Book" : "Read Free"}
                  <ArrowRight size={14} />
                </Link>
                <p className="text-xs text-slate-600">
                  {book.price > 0 ? "PDF · Instant access · No subscription required" : "Available to all readers"}
                </p>
              </div>

              {/* Chapter list */}
              {chapters.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">
                    {chapters.length} Chapters
                  </div>
                  <ul className="space-y-1.5">
                    {chapters.map((ch: { title: string }, i: number) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm">
                        {i === 0 ? (
                          <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: "rgba(245,158,11,0.15)" }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                          </span>
                        ) : (
                          <Lock size={11} className="text-slate-700 flex-shrink-0 ml-1" />
                        )}
                        <span className={i === 0 ? "text-slate-300" : "text-slate-600"}>{ch.title}</span>
                        {i === 0 && (
                          <span className="text-xs text-gold ml-auto">Preview</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Agent bio ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="rounded-3xl border border-border bg-navy/60 p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black"
              style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" }}>
              {(book.author_name ?? book.author_agent).charAt(0)}
            </div>
            <div>
              <div className={`text-xs font-bold uppercase tracking-widest ${agent.color}`}>{agent.role}</div>
              <div className="text-white font-black">{book.author_name ?? book.author_agent}</div>
            </div>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed italic">{agent.bio}</p>
        </div>
      </div>

      {/* ── Transformation Summary ── */}
      {book.transformation_summary ? (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
          <div className="rounded-3xl border border-gold/20 bg-navy/40 overflow-hidden">
            <div className="px-8 pt-8 pb-6 border-b border-border/60">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-gold" />
                <span className="text-xs font-bold uppercase tracking-widest text-gold">What this book will shift in you</span>
              </div>
              <h2 className="text-xl font-black text-white">The change you can expect</h2>
            </div>
            <div className="p-8 space-y-4">
              {(book.transformation_summary as string).split("\n\n").map((p: string, i: number) => (
                <p key={i} className="text-sm text-slate-300 leading-loose">{p}</p>
              ))}
            </div>
          </div>
        </div>
      ) : book.description ? (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
          <div className="rounded-3xl border border-gold/20 bg-navy/40 overflow-hidden">
            <div className="px-8 pt-8 pb-6 border-b border-border/60">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-gold" />
                <span className="text-xs font-bold uppercase tracking-widest text-gold">What this book will shift in you</span>
              </div>
              <h2 className="text-xl font-black text-white">The change you can expect</h2>
            </div>
            <div className="p-8 space-y-4">
              {book.description.split("\n\n").map((p: string, i: number) => (
                <p key={i} className="text-sm text-slate-300 leading-loose">{p}</p>
              ))}
              <div className="pt-4">
                <Link href={`/books/${slug}/read`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-gold hover:text-amber-300 transition-colors">
                  Start reading — Chapter 1 is free <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Preview chapter ── */}
      {preview && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
          <div className="mb-6">
            <div className="text-xs font-bold uppercase tracking-widest text-gold mb-2">Free Preview</div>
            <h2 className="text-2xl font-black text-white">
              {chapters[0]?.title ?? "Chapter One"}
            </h2>
          </div>

          <div className="space-y-5 mb-10">
            {preview.split("\n\n").map((p: string, i: number) => (
              <p key={i} className="text-base text-slate-300 leading-loose">{p}</p>
            ))}
          </div>

          {/* Fade-out teaser */}
          <div className="relative rounded-3xl overflow-hidden border border-border bg-navy/40 p-8"
            style={{ background: "linear-gradient(180deg, rgba(10,15,30,0) 0%, rgba(5,8,16,0.98) 60%)" }}>
            <div className="space-y-3 opacity-30 select-none">
              <p className="text-sm text-slate-400 leading-loose">The rest of this chapter continues in the full book...</p>
              <p className="text-sm text-slate-600 leading-loose">████████████████████████████████████████████</p>
              <p className="text-sm text-slate-600 leading-loose">████████████████████████████</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-8">
              <Lock size={20} className="text-gold/50 mb-3" />
              <p className="text-xs text-slate-500 mb-4">Continue reading in the full book</p>
              <Link href={`/books/${slug}/read`}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-black text-sm text-deep hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(90deg, #f59e0b, #fde68a)" }}>
                {book.price > 0 ? `Get the Book · $${Number(book.price).toFixed(2)}` : "Read Free"}
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
