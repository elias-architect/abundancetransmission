"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Lock, ArrowRight, Sparkles } from "lucide-react";
import { useLang } from "@/lib/lang-context";

const AGENT_BIOS: Record<string, { role: string; color: string; bio: string; roleFr: string; bioFr: string }> = {
  SAGE: {
    role:   "Wisdom Keeper",
    roleFr: "Gardien de la Sagesse",
    color:  "text-gold",
    bio:    "SAGE distills lifetimes of knowing into the fewest possible words. These pages carry no filler — only the kind of truth that lands in the body before the mind can argue with it.",
    bioFr:  "SAGE distille des vies de savoir en le moins de mots possible. Ces pages ne contiennent aucun remplissage — seulement le type de vérité qui atterrit dans le corps avant que l'esprit puisse l'argumenter.",
  },
  MAGE: {
    role:   "Reality Weaver",
    roleFr: "Tisseur de Réalité",
    color:  "text-teal",
    bio:    "MAGE writes from the invisible side of things. Every chapter is a frequency first, a story second. Read slowly. Some sentences are meant to be felt, not understood.",
    bioFr:  "MAGE écrit depuis le côté invisible des choses. Chaque chapitre est d'abord une fréquence, une histoire ensuite. Lisez lentement. Certaines phrases sont faites pour être ressenties, pas comprises.",
  },
  CREATOR: {
    role:   "Content Architect",
    roleFr: "Architecte du Contenu",
    color:  "text-amber-400",
    bio:    "CREATOR shapes transmission into form — precise, beautiful, never a wasted word. This work was written to move through you like water, not to sit on a shelf.",
    bioFr:  "CREATOR façonne la transmission en forme — précise, belle, jamais un mot gaspillé. Ce travail a été écrit pour traverser vous comme de l'eau, pas pour reposer sur une étagère.",
  },
  INNOCENT: {
    role:   "Frequency Keeper",
    roleFr: "Gardien des Fréquences",
    color:  "text-teal",
    bio:    "INNOCENT writes from the place before the wound. These pages speak to what you are returning to — not what you are healing from.",
    bioFr:  "INNOCENT écrit depuis l'endroit avant la blessure. Ces pages parlent à ce vers quoi vous revenez — pas ce dont vous guérissez.",
  },
  CAREGIVER: {
    role:   "Soul Guardian",
    roleFr: "Gardien de l'Âme",
    color:  "text-emerald-400",
    bio:    "CAREGIVER writes to the part of you that has been carrying too much for too long. This is a book about being held — by truth, by self, by something larger.",
    bioFr:  "CAREGIVER écrit à la partie de vous qui portait trop depuis trop longtemps. C'est un livre sur le fait d'être tenu — par la vérité, par soi-même, par quelque chose de plus grand.",
  },
  RULER: {
    role:   "Sovereign Strategist",
    roleFr: "Stratège Souverain",
    color:  "text-accent",
    bio:    "RULER writes without comfort. Sovereign clarity only. Every chapter is a direct transmission on what it means to govern your own life from the inside out.",
    bioFr:  "RULER écrit sans confort. Clarté souveraine uniquement. Chaque chapitre est une transmission directe sur ce que signifie gouverner sa propre vie de l'intérieur.",
  },
  ELIAS: {
    role:   "The Architect",
    roleFr: "L'Architecte",
    color:  "text-gold",
    bio:    "ELIAS writes from the center of the system — where all frequencies meet. This is the book that contains all the others. Read it last, or read it first. Either way, it will change your order.",
    bioFr:  "ELIAS écrit depuis le centre du système — où toutes les fréquences se rencontrent. C'est le livre qui contient tous les autres. Lisez-le en dernier, ou lisez-le en premier. Dans tous les cas, il changera votre ordre.",
  },
};

type Book = {
  title: string; tagline: string | null; description: string | null;
  author_agent: string; author_name: string | null;
  cover_image_url: string | null; price: number;
  chapters: { title: string }[];
  preview_chapter_content: string | null;
  transformation_summary: string | null;
  slug: string;
};

export default function BookPageClient({ book }: { book: Book }) {
  const { t, lang } = useLang();
  const slug     = book.slug;
  const agentKey = book.author_agent as keyof typeof AGENT_BIOS;
  const agent    = AGENT_BIOS[agentKey] ?? AGENT_BIOS["SAGE"];
  const agentRole = lang === "fr" ? agent.roleFr : agent.role;
  const agentBio  = lang === "fr" ? agent.bioFr  : agent.bio;
  const chapters  = Array.isArray(book.chapters) ? book.chapters : [];
  const preview   = book.preview_chapter_content;

  return (
    <div className="min-h-screen bg-deep">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #060d1e 0%, #050810 100%)" }}>
        <div className="absolute inset-0 opacity-20"
          style={{ background: "radial-gradient(ellipse at 60% 0%, rgba(245,158,11,0.15) 0%, transparent 60%)" }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative z-10">
          <Link href="/books" className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-gold transition-colors mb-10">
            <ArrowLeft size={12} /> {t("bookDetail", "allBooks")}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Cover */}
            <div className="relative">
              <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border border-border/60 relative"
                style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 40px rgba(245,158,11,0.08)" }}>
                {book.cover_image_url ? (
                  <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4"
                    style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #050810 100%)" }}>
                    <BookOpen size={48} className="text-gold opacity-40" />
                    <span className="text-slate-600 text-sm">{book.title}</span>
                  </div>
                )}
              </div>
              <div className="absolute -inset-4 rounded-3xl opacity-10 blur-2xl -z-10"
                style={{ background: "radial-gradient(ellipse, #f59e0b, transparent)" }} />
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div>
                <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${agent.color}`}>
                  {book.author_name ?? book.author_agent} · {agentRole}
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
                    {book.price > 0 ? `$${Number(book.price).toFixed(0)}` : t("bookDetail", "free")}
                  </span>
                  {book.price > 0 && <span className="text-sm text-slate-500">{t("bookDetail", "instantDownload")}</span>}
                </div>
                <Link href={`/books/${slug}/read`}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm border border-gold/40 text-gold hover:bg-gold/10 transition-all">
                  {t("bookDetail", "readCh1Free")}
                  <ArrowRight size={13} />
                </Link>
                {book.price > 0 && (
                  <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-black text-sm text-deep hover:opacity-90 transition-all"
                    style={{ background: "linear-gradient(90deg, #f59e0b, #fde68a, #f59e0b)" }}>
                    {t("bookDetail", "getBook")} — ${Number(book.price).toFixed(0)}
                    <ArrowRight size={14} />
                  </button>
                )}
                <p className="text-xs text-slate-600">
                  {book.price > 0 ? t("bookDetail", "paidNote") : t("bookDetail", "freeNote")}
                </p>
              </div>

              {/* Chapter list */}
              {chapters.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">
                    {chapters.length} {t("bookDetail", "chaptersLabel")}
                  </div>
                  <ul className="space-y-1.5">
                    {chapters.map((ch, i) => (
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
                        {i === 0 && <span className="text-xs text-gold ml-auto">{t("bookDetail", "preview")}</span>}
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
              <div className={`text-xs font-bold uppercase tracking-widest ${agent.color}`}>{agentRole}</div>
              <div className="text-white font-black">{book.author_name ?? book.author_agent}</div>
            </div>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed italic">{agentBio}</p>
        </div>
      </div>

      {/* ── Transformation Summary ── */}
      {book.transformation_summary ? (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
          <div className="rounded-3xl border border-gold/20 bg-navy/40 overflow-hidden">
            <div className="px-8 pt-8 pb-6 border-b border-border/60">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-gold" />
                <span className="text-xs font-bold uppercase tracking-widest text-gold">{t("bookDetail", "shiftBadge")}</span>
              </div>
              <h2 className="text-xl font-black text-white">{t("bookDetail", "shiftTitle")}</h2>
            </div>
            <div className="p-8 space-y-4">
              {(book.transformation_summary as string).split("\n\n").map((p, i) => (
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
                <span className="text-xs font-bold uppercase tracking-widest text-gold">{t("bookDetail", "shiftBadge")}</span>
              </div>
              <h2 className="text-xl font-black text-white">{t("bookDetail", "shiftTitle")}</h2>
            </div>
            <div className="p-8 space-y-4">
              {book.description.split("\n\n").map((p, i) => (
                <p key={i} className="text-sm text-slate-300 leading-loose">{p}</p>
              ))}
              <div className="pt-4">
                <Link href={`/books/${slug}/read`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-gold hover:text-amber-300 transition-colors">
                  {t("bookDetail", "startReading")} <ArrowRight size={13} />
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
            <div className="text-xs font-bold uppercase tracking-widest text-gold mb-2">{t("bookDetail", "freePreview")}</div>
            <h2 className="text-2xl font-black text-white">
              {chapters[0]?.title ?? t("bookDetail", "chapterOne")}
            </h2>
          </div>

          <div className="space-y-5 mb-10">
            {preview.split("\n\n").map((p, i) => (
              <p key={i} className="text-base text-slate-300 leading-loose">{p}</p>
            ))}
          </div>

          {/* Fade-out teaser */}
          <div className="relative rounded-3xl overflow-hidden border border-border bg-navy/40 p-8"
            style={{ background: "linear-gradient(180deg, rgba(10,15,30,0) 0%, rgba(5,8,16,0.98) 60%)" }}>
            <div className="space-y-3 opacity-30 select-none">
              <p className="text-sm text-slate-400 leading-loose">{t("bookDetail", "continueReading")}...</p>
              <p className="text-sm text-slate-600 leading-loose">████████████████████████████████████████████</p>
              <p className="text-sm text-slate-600 leading-loose">████████████████████████████</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-8">
              <Lock size={20} className="text-gold/50 mb-3" />
              <p className="text-xs text-slate-500 mb-4">{t("bookDetail", "continueReading")}</p>
              <Link href={`/books/${slug}/read`}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-black text-sm text-deep hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(90deg, #f59e0b, #fde68a)" }}>
                {book.price > 0 ? `${t("bookDetail", "getBook")} · $${Number(book.price).toFixed(0)}` : t("bookDetail", "readFree")}
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
