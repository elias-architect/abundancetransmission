"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ArrowRight, Loader2 } from "lucide-react";
import { useLang } from "@/lib/lang-context";

type Book = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  author_agent: string;
  author_name: string | null;
  description: string | null;
  cover_image_url: string | null;
  price: number;
  published_at: string;
};

const AGENT_COLORS: Record<string, { border: string; badge: string; dot: string }> = {
  SAGE:      { border: "border-gold/30 hover:border-gold/60",     badge: "bg-gold/10 text-gold border-gold/30",         dot: "bg-gold" },
  MAGE:      { border: "border-teal/30 hover:border-teal/60",     badge: "bg-teal/10 text-teal border-teal/30",         dot: "bg-teal" },
  CREATOR:   { border: "border-amber-400/30 hover:border-amber-400/60", badge: "bg-amber-400/10 text-amber-400 border-amber-400/30", dot: "bg-amber-400" },
  INNOCENT:  { border: "border-teal/30 hover:border-teal/60",     badge: "bg-teal/10 text-teal border-teal/30",         dot: "bg-teal" },
  CAREGIVER: { border: "border-emerald-400/30 hover:border-emerald-400/60", badge: "bg-emerald-400/10 text-emerald-400 border-emerald-400/30", dot: "bg-emerald-400" },
  RULER:     { border: "border-accent/30 hover:border-accent/60", badge: "bg-accent/10 text-accent border-accent/30",   dot: "bg-accent" },
  ELIAS:     { border: "border-gold/30 hover:border-gold/60",     badge: "bg-gold/10 text-gold border-gold/30",         dot: "bg-gold" },
};

const DEFAULT_COLORS = { border: "border-border hover:border-gold/30", badge: "bg-border/60 text-slate-400 border-border", dot: "bg-slate-500" };

export default function BooksContent() {
  const { t } = useLang();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/books")
      .then((r) => r.json())
      .then((data) => setBooks(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
      {/* Header */}
      <div className="mb-16 space-y-4">
        <div className="text-xs font-bold uppercase tracking-widest text-gold">{t("booksLibrary", "badge")}</div>
        <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
          {t("booksLibrary", "title")}
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
          {t("booksLibrary", "subtitle")}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 size={28} className="animate-spin text-gold" />
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-3xl border border-border bg-navy/40 p-16 text-center mb-16">
          <BookOpen size={36} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500">{t("booksLibrary", "empty")}</p>
          <p className="text-xs text-slate-700 mt-2">{t("booksLibrary", "emptySub")}</p>
        </div>
      ) : (
        <div className="space-y-8 mb-16">
          {books.map((book) => {
            const colors = AGENT_COLORS[book.author_agent] ?? DEFAULT_COLORS;
            return (
              <Link key={book.id} href={`/books/${book.slug}`}
                className={`group block rounded-3xl border bg-navy transition-all ${colors.border}`}
                style={{ boxShadow: "0 0 0 0 transparent" }}>
                <div className="p-8 sm:p-10 flex flex-col sm:flex-row gap-8">
                  {/* Cover thumbnail */}
                  <div className="w-full sm:w-32 flex-shrink-0">
                    <div className="aspect-[3/4] sm:w-32 rounded-2xl overflow-hidden border border-border/40"
                      style={{ background: "linear-gradient(135deg, #0a0f1e, #050810)" }}>
                      {book.cover_image_url ? (
                        <img src={book.cover_image_url} alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen size={20} className="text-slate-700" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors.dot}`} />
                        <span className="text-xs text-slate-500 font-mono">
                          {book.author_name ?? book.author_agent}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wide ${colors.badge}`}>
                        {book.price > 0 ? `$${Number(book.price).toFixed(0)}` : t("booksLibrary", "free")}
                      </span>
                    </div>

                    <h2 className="text-2xl font-black text-white mb-1 group-hover:text-gold transition-colors">
                      {book.title}
                    </h2>
                    {book.tagline && (
                      <p className="text-sm text-slate-400 italic mb-4">{book.tagline}</p>
                    )}
                    {book.description && (
                      <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
                        {book.description.split("\n\n")[0]}
                      </p>
                    )}

                    <div className="mt-5 flex items-center gap-2 text-xs font-bold text-gold group-hover:gap-3 transition-all">
                      {t("booksLibrary", "readMore")} <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* CTA row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/transmission"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-slate-300 font-bold text-sm hover:border-gold/30 hover:text-gold transition-all">
          {t("booksLibrary", "cta1")} <ArrowRight size={14} />
        </Link>
        <Link href="/member"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-slate-300 font-bold text-sm hover:border-teal/30 hover:text-teal transition-all">
          {t("booksLibrary", "cta2")} <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
