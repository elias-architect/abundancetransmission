"use client";
import Link from "next/link";
import { BookOpen, Clock, ArrowRight } from "lucide-react";
import EmailForm from "@/components/email-form";
import { useLang } from "@/lib/lang-context";
import { translations } from "@/lib/translations";

const colorMap: Record<string, string> = {
  writing: "border-gold/30 group-hover:border-gold/50",
  planned: "border-teal/30 group-hover:border-teal/50",
  concept: "border-accent/30 group-hover:border-accent/50",
};
const badgeMap: Record<string, string> = {
  writing: "bg-gold/10 text-gold border-gold/30",
  planned: "bg-teal/10 text-teal border-teal/30",
  concept: "bg-accent/10 text-accent border-accent/30",
};

export default function BooksContent() {
  const { lang } = useLang();
  const b = translations[lang].books;
  const f = translations[lang].form;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
      <div className="mb-16 space-y-4">
        <div className="text-xs font-bold uppercase tracking-widest text-gold">{b.badge}</div>
        <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">{b.title}</h1>
        <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">{b.subtitle}</p>
      </div>

      <div className="space-y-10 mb-16">
        {b.books.map((bk) => (
          <div key={bk.vol} className={`group relative rounded-3xl border bg-navy panel-glow p-8 sm:p-10 transition-all ${colorMap[bk.status]}`}>
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-border/60 flex items-center justify-center">
                  <BookOpen size={24} className="text-gold opacity-60" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-mono mb-0.5">{bk.vol}</div>
                  <h2 className="text-xl font-black text-white">{bk.title}</h2>
                  <div className="text-sm text-slate-400 italic">{bk.subtitle}</div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wide ${badgeMap[bk.status]}`}>
                {b.statusLabels[bk.status as keyof typeof b.statusLabels]}
              </div>
            </div>
            <div className="prose-dark mb-6">
              {bk.desc.split("\n\n").map((p, i) => <p key={i} className="text-sm">{p}</p>)}
            </div>
            {bk.chapters[0] !== "In development" && bk.chapters[0] !== "En développement" && (
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">{b.chapterLabel}</div>
                <ul className="space-y-1">
                  {bk.chapters.map((c) => (
                    <li key={c} className="text-xs text-slate-500 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-border flex-shrink-0" />{c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="relative rounded-3xl border border-border bg-navy p-8 sm:p-10 overflow-hidden mb-10">
        <div className="absolute inset-0 water-shimmer opacity-30" />
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-4">
            <Clock size={18} className="text-gold" />
            <span className="text-sm font-bold text-white">{b.notifyTitle}</span>
          </div>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">{b.notifySub}</p>
          <EmailForm label="" placeholder={translations[lang].form.placeholder} ctaText={f.notify} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/transmission" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-slate-300 font-bold text-sm hover:border-gold/30 hover:text-gold transition-all">
          {b.cta1} <ArrowRight size={14} />
        </Link>
        <Link href="/arsenal" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-slate-300 font-bold text-sm hover:border-teal/30 hover:text-teal transition-all">
          {b.cta2} <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
