"use client";
import Link from "next/link";
import { ArrowRight, MapPin, Calendar, Coins } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { translations } from "@/lib/translations";

export default function OriginContent() {
  const { lang } = useLang();
  const o = translations[lang].origin;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
      <div className="mb-16 space-y-4">
        <div className="text-xs font-bold uppercase tracking-widest text-teal">{o.badge}</div>
        <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">{o.title}</h1>
        <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">{o.subtitle}</p>
      </div>

      <div className="relative rounded-3xl border border-gold/30 bg-navy panel-glow p-8 sm:p-10 mb-16 overflow-hidden">
        <div className="absolute inset-0 water-shimmer" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-gold" /> Antalya, Turkey</span>
            <span className="flex items-center gap-1.5"><Calendar size={14} className="text-gold" /> 2025</span>
            <span className="flex items-center gap-1.5"><Coins size={14} className="text-gold" /> 2,360€</span>
          </div>
          <blockquote className="text-xl sm:text-2xl font-light text-white leading-relaxed italic border-l-2 border-gold pl-6">
            &ldquo;{o.quote}&rdquo;
          </blockquote>
          <div className="mt-6 text-sm text-slate-500">— {o.quoteBy}</div>
        </div>
      </div>

      <div className="prose-dark mb-16 space-y-6">
        <p>{o.p1}</p>
        <p>{o.p2}</p>
        <p>{o.p3}</p>
        <p>{o.p4}</p>
        <blockquote>{o.blockquote}</blockquote>
      </div>

      <div className="mb-16">
        <h2 className="text-xl font-bold text-white mb-8">{o.timelineTitle}</h2>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-10 pl-12">
            {o.timeline.map((e) => (
              <div key={e.year} className="relative">
                <div className="absolute -left-8 top-1 w-3 h-3 rounded-full border-2 border-gold bg-deep" />
                <div className="text-xs font-bold text-gold uppercase tracking-widest mb-1">{e.year}</div>
                <h3 className="text-sm font-bold text-white mb-2">{e.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{e.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/transmission" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-deep font-bold text-sm hover:bg-amber-400 transition-all">
          {o.cta1} <ArrowRight size={14} />
        </Link>
        <Link href="/command-center" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-teal/40 text-teal font-bold text-sm hover:bg-teal/5 transition-all">
          {o.cta2} <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
