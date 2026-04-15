import type { Metadata } from "next";
import Link from "next/link";
import EmailForm from "@/components/email-form";
import { Shield, TrendingUp, Users, Heart, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Vault",
  description: "The Evolutionary Vault — transparent fund tracking and steward contributions.",
};

const milestones = [
  { target: 1_000,   label: "First Signal",      desc: "Fund operational. First allocation confirmed." },
  { target: 5_000,   label: "Momentum Phase",    desc: "First 5 stewards contributing. Strategy 1 deployed live." },
  { target: 10_000,  label: "The Library Grows", desc: "Vol. 1 editing & publishing funded." },
  { target: 25_000,  label: "Strategy 2 Live",   desc: "Micro Trend Sniper deployed with tracked results." },
  { target: 50_000,  label: "Steward Fund",      desc: "Stewards receive quarterly results reports." },
  { target: 200_000, label: "Full Sovereignty",  desc: "Autonomous operation. Full strategy suite live. The transmission is complete." },
];

// Update this number manually or via a CMS/API
const CURRENT_FUND = 2_360;
const TARGET       = 200_000;

export default function VaultPage() {
  const pct = Math.min(100, (CURRENT_FUND / TARGET) * 100);
  const currentMilestone = milestones.find((m) => m.target >= CURRENT_FUND) || milestones[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
      {/* Header */}
      <div className="mb-16 space-y-4">
        <div className="text-xs font-bold uppercase tracking-widest text-gold">
          Transparency
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
          Evolutionary Vault
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
          A transparent fund built to support the development of Abundance
          Transmission — the platform, the books, the strategies, and the
          steward community. Every contribution is acknowledged. Nothing is
          hidden.
        </p>
      </div>

      {/* Fund counter */}
      <div className="relative rounded-3xl border border-gold/30 bg-navy panel-glow p-8 sm:p-10 mb-12 overflow-hidden">
        <div className="absolute inset-0 water-shimmer" />
        <div className="relative z-10">
          <div className="text-xs font-bold uppercase tracking-widest text-gold mb-2">
            Current Fund
          </div>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-5xl font-black text-white">
              €{CURRENT_FUND.toLocaleString()}
            </span>
            <span className="text-slate-500 text-sm">
              of €{TARGET.toLocaleString()} target
            </span>
          </div>
          <div className="text-xs text-slate-500 mb-6">
            Last verified: April 2026 · Origin: Antalya, Turkey 2025 — Trade
            transmission
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-border rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-gold to-amber-300 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-600">
            <span>€0</span>
            <span>{pct.toFixed(1)}% funded</span>
            <span>€{TARGET.toLocaleString()}</span>
          </div>

          {/* Current milestone */}
          <div className="mt-6 p-4 rounded-xl bg-border/40 border border-gold/20">
            <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-bold">
              Next milestone
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">
                  €{currentMilestone.target.toLocaleString()} — {currentMilestone.label}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {currentMilestone.desc}
                </div>
              </div>
              <div className="text-gold font-black text-lg">
                €{(currentMilestone.target - CURRENT_FUND).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-white mb-6">Milestone Map</h2>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-6 pl-12">
            {milestones.map((m) => {
              const reached = CURRENT_FUND >= m.target;
              const active  = m.target === currentMilestone.target;
              return (
                <div key={m.target} className="relative">
                  <div
                    className={`absolute -left-8 top-1 w-3 h-3 rounded-full border-2 ${
                      reached
                        ? "border-gold bg-gold"
                        : active
                        ? "border-gold bg-deep"
                        : "border-border bg-deep"
                    }`}
                  />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div
                        className={`text-xs font-bold uppercase tracking-widest mb-0.5 ${
                          reached ? "text-gold" : active ? "text-gold/70" : "text-slate-600"
                        }`}
                      >
                        €{m.target.toLocaleString()}
                      </div>
                      <div
                        className={`text-sm font-bold mb-1 ${reached ? "text-white" : "text-slate-400"}`}
                      >
                        {m.label}
                      </div>
                      <div className="text-xs text-slate-500">{m.desc}</div>
                    </div>
                    {reached && (
                      <span className="text-xs text-gold font-bold flex-shrink-0">
                        ✓ Reached
                      </span>
                    )}
                    {active && !reached && (
                      <span className="text-xs text-gold/70 font-bold flex-shrink-0">
                        ← Now
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* What the vault funds */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
        {[
          {
            icon: <Shield size={20} className="text-gold" />,
            title: "Platform Development",
            desc: "Command Center, Pine Script indicators, automation systems, and the Abundance Transmission website.",
          },
          {
            icon: <TrendingUp size={20} className="text-teal" />,
            title: "Live Tracked Results",
            desc: "Every strategy is run with real money alongside the backtest. The vault funds the initial position sizing.",
          },
          {
            icon: <Heart size={20} className="text-red-400" />,
            title: "Book Production",
            desc: "Editing, design, and publishing of The Stillness Edge Vol.1 and the full trilogy.",
          },
          {
            icon: <Users size={20} className="text-accent" />,
            title: "Steward Community",
            desc: "Building a private space for stewards to access signals, reports, and the evolving architecture.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-border bg-navy/60 p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              {f.icon}
              <span className="text-sm font-bold text-white">{f.title}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Contribute */}
      <div className="relative rounded-3xl border border-border bg-navy p-8 sm:p-10 mb-10 overflow-hidden text-center">
        <div className="absolute inset-0 water-shimmer opacity-40" />
        <div className="relative z-10 space-y-5">
          <h3 className="text-xl font-bold text-white">
            Contribute to the Vault
          </h3>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Contributions are voluntary and transparent. Every amount is
            recorded in the fund counter above. Stewards who contribute are
            acknowledged in the book and receive early access to all releases.
          </p>
          <a
            href="mailto:niko@abundancetransmission.com?subject=Vault%20Contribution"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gold text-deep font-bold text-sm hover:bg-amber-400 transition-all"
          >
            <Heart size={16} />
            Reach Out to Contribute
          </a>
          <p className="text-xs text-slate-600">
            Contact niko@abundancetransmission.com — payment details provided
            personally. No automated payment processor at this stage.
          </p>
        </div>
      </div>

      {/* Email form */}
      <div className="rounded-2xl border border-border bg-navy/60 p-8 mb-10">
        <h3 className="text-sm font-bold text-white mb-2">
          Stay Updated on Vault Progress
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Milestone notifications sent directly to stewards.
        </p>
        <EmailForm label="" placeholder="your@email.com" ctaText="Follow the Vault" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/arsenal"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-slate-300 font-bold text-sm hover:border-gold/30 hover:text-gold transition-all"
        >
          View the Arsenal <ArrowRight size={14} />
        </Link>
        <Link
          href="/command-center"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-slate-300 font-bold text-sm hover:border-teal/30 hover:text-teal transition-all"
        >
          Command Center <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
