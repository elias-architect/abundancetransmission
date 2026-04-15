"use client";
import Link from "next/link";
import { ArrowRight, Brain, Cpu, Eye } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { translations } from "@/lib/translations";

const icons = [<Brain size={18} />, <Cpu size={18} />, <Eye size={18} />, <Eye size={18} />];

export default function TransmissionContent() {
  const { lang } = useLang();
  const tr = translations[lang].transmission;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
      <div className="mb-16 space-y-4">
        <div className="text-xs font-bold uppercase tracking-widest text-teal">{tr.badge}</div>
        <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
          {tr.title1}<br /><span className="gold-text gold-text-animate">{tr.title2}</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
          {tr.subtitle} <em className="text-white">{tr.subtitleEm}</em>.
        </p>
      </div>

      <div className="relative rounded-3xl border border-gold/30 bg-navy panel-glow p-8 sm:p-10 mb-16 overflow-hidden">
        <div className="absolute inset-0 water-shimmer" />
        <div className="relative z-10">
          <div className="text-xs font-bold uppercase tracking-widest text-gold mb-4">{tr.viralBadge}</div>
          <blockquote className="text-base sm:text-lg text-slate-200 leading-relaxed italic">
            &ldquo;{tr.viralQuote}&rdquo;
          </blockquote>
          <div className="mt-4 text-sm text-slate-500">— {tr.viralBy}</div>
        </div>
      </div>

      <div className="space-y-12 mb-16">
        {tr.steps.map((s, i) => (
          <div key={s.step} className="relative pl-8 border-l border-border hover:border-gold/30 transition-colors">
            <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-navy border border-border flex items-center justify-center text-gold">
              {icons[i]}
            </div>
            <div className="text-xs font-mono text-slate-600 mb-2">STEP {s.step}</div>
            <h2 className="text-xl font-bold text-white mb-4">{s.title}</h2>
            <div className="prose-dark">
              {s.body.split("\n\n").map((para, j) => <p key={j}>{para}</p>)}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-navy/60 p-8 mb-12">
        <div className="text-xs font-bold uppercase tracking-widest text-teal mb-4">{tr.scriptBadge}</div>
        <h3 className="text-lg font-bold text-white mb-4">{tr.scriptTitle}</h3>
        <div className="prose-dark space-y-4 text-sm">
          {tr.phases.map((p) => (
            <p key={p.title}><strong>{p.title}</strong> {p.body}</p>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/arsenal" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-deep font-bold text-sm hover:bg-amber-400 transition-all">
          {tr.cta1} <ArrowRight size={14} />
        </Link>
        <Link href="/command-center" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-teal/40 text-teal font-bold text-sm hover:bg-teal/5 transition-all">
          {tr.cta2} <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
