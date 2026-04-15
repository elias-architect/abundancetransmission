"use client";
import Link from "next/link";
import { ArrowRight, Code2, BarChart3, Layers, Clock, ChartLine } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { translations } from "@/lib/translations";

export default function ArsenalContent() {
  const { lang } = useLang();
  const a = translations[lang].arsenal;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
      <div className="mb-16 space-y-4">
        <div className="text-xs font-bold uppercase tracking-widest text-gold">{a.badge}</div>
        <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">{a.title}</h1>
        <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">{a.subtitle}</p>
      </div>

      {/* Strategy 1 */}
      <div className="relative rounded-3xl border border-gold/30 bg-navy panel-glow p-8 sm:p-10 mb-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/3 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-gold mb-2">{a.s1Badge}</div>
              <h2 className="text-2xl font-black text-white">{a.s1Title}</h2>
              <div className="text-sm text-slate-400 mt-1">{a.s1Sub}</div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-bold">
              <Code2 size={12} /> Pine Script v5
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { icon: <Layers size={16} />, label: lang === "fr" ? "Unités de Temps" : "Timeframes", val: "15M/1H/4H · 1H/4H/D · 4H/D/W" },
              { icon: <BarChart3 size={16} />, label: lang === "fr" ? "Zones d'Entrée" : "Entry Zones", val: "1.382 · 2.382 · 3.382 Fib Extension" },
              { icon: <Clock size={16} />, label: lang === "fr" ? "Filtre" : "Filter", val: "London 08-11 UTC · NY 13-16 UTC" },
            ].map((f) => (
              <div key={f.label} className="rounded-xl bg-border/30 p-4">
                <div className="flex items-center gap-2 text-gold mb-2">
                  {f.icon}
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{f.label}</span>
                </div>
                <div className="text-xs text-slate-300">{f.val}</div>
              </div>
            ))}
          </div>
          <div className="prose-dark text-sm space-y-3 mb-6">
            <p>{a.s1p1}</p>
            <p>{a.s1p2}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: lang === "fr" ? "Scalping (15M)" : "Scalping (15M)", wr: "48–62%", net: "+12–22R" },
              { label: lang === "fr" ? "Intraday (1H)" : "Intraday (1H)", wr: "44–55%", net: "+8–18R" },
              { label: lang === "fr" ? "Swing (4H)" : "Swing (4H)", wr: "40–52%", net: "+10–25R" },
              { label: lang === "fr" ? "Meilleure Zone" : "Best Zone", wr: "Zone 1.382", net: lang === "fr" ? "Primaire" : "Primary" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-border/40 p-3 text-center">
                <div className="text-xs text-slate-500 mb-1">{s.label}</div>
                <div className="text-sm font-bold text-white">{s.wr}</div>
                <div className="text-xs text-gold">{s.net}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategy 2 */}
      <div className="relative rounded-3xl border border-teal/30 bg-navy panel-glow-teal p-8 sm:p-10 mb-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal/3 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-teal mb-2">{a.s2Badge}</div>
              <h2 className="text-2xl font-black text-white">{a.s2Title}</h2>
              <div className="text-sm text-slate-400 mt-1">{a.s2Sub}</div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal/10 border border-teal/30 text-teal text-xs font-bold">
              <Code2 size={12} /> Pine Script v5
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { icon: <Layers size={16} />, label: lang === "fr" ? "Combinaisons" : "Combinations", val: "4H/1H · Daily/4H · 1H/30M" },
              { icon: <BarChart3 size={16} />, label: "Zone", val: "BOS gap × 0.75 → 2.50 retest" },
              { icon: <Clock size={16} />, label: "Filter", val: lang === "fr" ? "Filtre killzone on/off" : "Killzone on/off toggle" },
            ].map((f) => (
              <div key={f.label} className="rounded-xl bg-border/30 p-4">
                <div className="flex items-center gap-2 text-teal mb-2">
                  {f.icon}
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{f.label}</span>
                </div>
                <div className="text-xs text-slate-300">{f.val}</div>
              </div>
            ))}
          </div>
          <div className="prose-dark text-sm space-y-3">
            <p>{a.s2p1}</p>
            <p>{a.s2p2}</p>
            <p>{a.s2formula} <code className="text-teal text-xs bg-border/60 px-1 rounded">bottom = confirm_bos + gap × 0.75</code>, <code className="text-teal text-xs bg-border/60 px-1 rounded">top = confirm_bos + gap × 2.50</code></p>
          </div>
        </div>
      </div>

      {/* Enter Command Center CTA */}
      <div className="relative rounded-3xl border border-accent/30 bg-gradient-to-br from-navy to-deep p-8 sm:p-12 mb-12 overflow-hidden text-center">
        <div className="absolute inset-0 water-shimmer" />
        <div className="absolute inset-0 bg-gradient-to-r from-accent/3 via-transparent to-teal/3" />
        <div className="relative z-10 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto animate-float">
            <ChartLine size={28} className="text-accent" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">{a.enterTitle}</h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">{a.enterSub}</p>
          </div>
          <Link href="/command-center"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-accent text-white font-bold text-base hover:bg-blue-400 transition-all shadow-lg shadow-accent/20">
            <ChartLine size={18} /> {a.enterBtn} <ArrowRight size={16} />
          </Link>
          <div className="text-xs text-slate-600">{a.enterSmall}</div>
        </div>
      </div>

      {/* Automation */}
      <div className="rounded-2xl border border-border bg-navy/60 p-8 mb-12">
        <h3 className="text-lg font-bold text-white mb-4">{a.automationTitle}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {a.automations.map((au) => (
            <div key={au.title} className="rounded-xl bg-border/30 p-5">
              <h4 className="text-sm font-bold text-white mb-2">{au.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{au.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/transmission" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-slate-300 font-bold text-sm hover:border-gold/30 hover:text-gold transition-all">
          {a.cta1} <ArrowRight size={14} />
        </Link>
        <Link href="/vault" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-slate-300 font-bold text-sm hover:border-teal/30 hover:text-teal transition-all">
          {a.cta2} <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
