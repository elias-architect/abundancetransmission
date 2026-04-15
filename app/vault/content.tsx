"use client";
import Link from "next/link";
import EmailForm from "@/components/email-form";
import { Shield, TrendingUp, Users, Heart, ArrowRight } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { translations } from "@/lib/translations";

const CURRENT_FUND = 2_360;
const TARGET       = 200_000;

const fundIcons = [
  <Shield    key="platform"  size={20} className="text-gold" />,
  <TrendingUp key="results" size={20} className="text-teal" />,
  <Heart      key="books"   size={20} className="text-red-400" />,
  <Users      key="steward" size={20} className="text-accent" />,
];

export default function VaultContent() {
  const { lang } = useLang();
  const v = translations[lang].vault;
  const f = translations[lang].form;

  const pct = Math.min(100, (CURRENT_FUND / TARGET) * 100);
  const currentMilestone = v.milestones.find((m) => m.target >= CURRENT_FUND) || v.milestones[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
      <div className="mb-16 space-y-4">
        <div className="text-xs font-bold uppercase tracking-widest text-gold">{v.badge}</div>
        <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">{v.title}</h1>
        <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">{v.subtitle}</p>
      </div>

      {/* Fund counter */}
      <div className="relative rounded-3xl border border-gold/30 bg-navy panel-glow p-8 sm:p-10 mb-12 overflow-hidden">
        <div className="absolute inset-0 water-shimmer" />
        <div className="relative z-10">
          <div className="text-xs font-bold uppercase tracking-widest text-gold mb-2">{v.currentFund}</div>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-5xl font-black text-white">€{CURRENT_FUND.toLocaleString()}</span>
            <span className="text-slate-500 text-sm">{v.of} €{TARGET.toLocaleString()} {v.target}</span>
          </div>
          <div className="text-xs text-slate-500 mb-6">{v.verified}</div>
          <div className="w-full h-2.5 bg-border rounded-full overflow-hidden mb-3">
            <div className="h-full bg-gradient-to-r from-gold to-amber-300 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-slate-600">
            <span>€0</span>
            <span>{pct.toFixed(1)}% {v.funded}</span>
            <span>€{TARGET.toLocaleString()}</span>
          </div>
          <div className="mt-6 p-4 rounded-xl bg-border/40 border border-gold/20">
            <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-bold">{v.nextMilestone}</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">€{currentMilestone.target.toLocaleString()} — {currentMilestone.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{currentMilestone.desc}</div>
              </div>
              <div className="text-gold font-black text-lg">€{(currentMilestone.target - CURRENT_FUND).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-white mb-6">{v.milestoneMap}</h2>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-6 pl-12">
            {v.milestones.map((m) => {
              const reached = CURRENT_FUND >= m.target;
              const active  = m.target === currentMilestone.target;
              return (
                <div key={m.target} className="relative">
                  <div className={`absolute -left-8 top-1 w-3 h-3 rounded-full border-2 ${reached ? "border-gold bg-gold" : active ? "border-gold bg-deep" : "border-border bg-deep"}`} />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className={`text-xs font-bold uppercase tracking-widest mb-0.5 ${reached ? "text-gold" : active ? "text-gold/70" : "text-slate-600"}`}>
                        €{m.target.toLocaleString()}
                      </div>
                      <div className={`text-sm font-bold mb-1 ${reached ? "text-white" : "text-slate-400"}`}>{m.label}</div>
                      <div className="text-xs text-slate-500">{m.desc}</div>
                    </div>
                    {reached && <span className="text-xs text-gold font-bold flex-shrink-0">{v.reached}</span>}
                    {active && !reached && <span className="text-xs text-gold/70 font-bold flex-shrink-0">{v.now}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* What vault funds */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
        {v.fundItems.map((item, i) => (
          <div key={item.title} className="rounded-2xl border border-border bg-navy/60 p-6">
            <div className="flex items-center gap-3 mb-3">
              {fundIcons[i]}
              <span className="text-sm font-bold text-white">{item.title}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Contribute */}
      <div className="relative rounded-3xl border border-gold/20 bg-navy p-8 sm:p-10 mb-10 overflow-hidden text-center">
        <div className="absolute inset-0 water-shimmer opacity-40" />
        <div className="relative z-10 space-y-5">
          <h3 className="text-xl font-bold text-white">{v.contributeTitle}</h3>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">{v.contributeSub}</p>
          <a href="https://paypal.me/abundancetransmited" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gold text-deep font-bold text-sm hover:bg-amber-400 transition-all">
            <Heart size={16} /> {v.contributeBtn}
          </a>
          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="p-3 bg-white rounded-2xl inline-block">
              <img src="/paypal-qr.png" alt="PayPal QR — abundancetransmited" width={160} height={160} className="rounded-lg" />
            </div>
            <p className="text-xs text-slate-500">{v.scanText}</p>
          </div>
          <p className="text-xs text-slate-600">{v.contributeFoot}</p>
        </div>
      </div>

      {/* Email */}
      <div className="rounded-2xl border border-border bg-navy/60 p-8 mb-10">
        <h3 className="text-sm font-bold text-white mb-2">{v.stayTitle}</h3>
        <p className="text-xs text-slate-400 mb-5">{v.staySub}</p>
        <EmailForm label="" placeholder={translations[lang].form.placeholder} ctaText={f.followVault} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/arsenal" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-slate-300 font-bold text-sm hover:border-gold/30 hover:text-gold transition-all">
          {v.cta1} <ArrowRight size={14} />
        </Link>
        <Link href="/command-center" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-slate-300 font-bold text-sm hover:border-teal/30 hover:text-teal transition-all">
          {v.cta2} <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
