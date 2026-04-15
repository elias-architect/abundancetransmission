import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Code2, BarChart3, Layers, Clock, ChartLine } from "lucide-react";

export const metadata: Metadata = {
  title: "Arsenal",
  description: "Pine Script indicators, automation systems, and the Enigma 369 framework.",
};

export default function ArsenalPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
      {/* Header */}
      <div className="mb-16 space-y-4">
        <div className="text-xs font-bold uppercase tracking-widest text-gold">
          The Tools
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
          The Arsenal
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
          Two Pine Script strategies. One command center. A complete system for
          reading structure, confirming alignment, and entering with precision.
        </p>
      </div>

      {/* Strategy 1 */}
      <div className="relative rounded-3xl border border-gold/30 bg-navy panel-glow p-8 sm:p-10 mb-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/3 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-gold mb-2">
                Strategy 01
              </div>
              <h2 className="text-2xl font-black text-white">Enigma 369</h2>
              <div className="text-sm text-slate-400 mt-1">
                3-Timeframe Alignment + Fibonacci Extension Entry
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-bold">
              <Code2 size={12} /> Pine Script v5
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { icon: <Layers size={16} />, label: "Timeframes", val: "15M/1H/4H · 1H/4H/D · 4H/D/W" },
              { icon: <BarChart3 size={16} />, label: "Entry Zones", val: "1.382 · 2.382 · 3.382 Fib Extension" },
              { icon: <Clock size={16} />, label: "Filter", val: "London 08-11 UTC · NY 13-16 UTC" },
            ].map((f) => (
              <div key={f.label} className="rounded-xl bg-border/30 p-4">
                <div className="flex items-center gap-2 text-gold mb-2">
                  {f.icon}
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {f.label}
                  </span>
                </div>
                <div className="text-xs text-slate-300">{f.val}</div>
              </div>
            ))}
          </div>

          <div className="prose-dark text-sm space-y-3 mb-6">
            <p>
              The Enigma 369 system watches for a <strong>Break of Structure</strong> on the
              entry timeframe while requiring EMA-200 alignment across all three
              timeframes simultaneously. When the structure breaks in the direction
              of the alignment, the Fibonacci extension zones are projected from
              the preceding swing range.
            </p>
            <p>
              Entry is placed at the <strong>Zone 1.382</strong> — the first resonance
              point after the BOS. Stop loss is placed at the 4.27 extension. Take
              profit targets the prior structural swing. Risk per trade: 0.5%. Daily
              loss limit: 3%.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Scalping (15M)", wr: "48–62%", net: "+12–22R" },
              { label: "Intraday (1H)", wr: "44–55%", net: "+8–18R" },
              { label: "Swing (4H)", wr: "40–52%", net: "+10–25R" },
              { label: "Best Zone", wr: "Zone 1.382", net: "Primary" },
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
              <div className="text-xs font-bold uppercase tracking-widest text-teal mb-2">
                Strategy 02
              </div>
              <h2 className="text-2xl font-black text-white">
                Micro Trend Sniper
              </h2>
              <div className="text-sm text-slate-400 mt-1">
                2-Timeframe BOS Alignment + Sniper Retest Zone Entry
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal/10 border border-teal/30 text-teal text-xs font-bold">
              <Code2 size={12} /> Pine Script v5
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { icon: <Layers size={16} />, label: "Combinations", val: "4H/1H · Daily/4H · 1H/30M" },
              { icon: <BarChart3 size={16} />, label: "Zone", val: "BOS gap × 0.75 → 2.50 retest" },
              { icon: <Clock size={16} />, label: "Filter", val: "Killzone on/off toggle" },
            ].map((f) => (
              <div key={f.label} className="rounded-xl bg-border/30 p-4">
                <div className="flex items-center gap-2 text-teal mb-2">
                  {f.icon}
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {f.label}
                  </span>
                </div>
                <div className="text-xs text-slate-300">{f.val}</div>
              </div>
            ))}
          </div>

          <div className="prose-dark text-sm space-y-3 mb-6">
            <p>
              The Micro Trend Sniper requires a BOS on both the anchor (higher)
              and confirm (lower) timeframes in the same direction. Once both
              confirm, a sniper retest zone is calculated from the gap between
              the two BOS levels.
            </p>
            <p>
              Price must pull back into this zone — the{" "}
              <strong>sniper retest area</strong> — before entry is triggered.
              This wait is the strategy. Most traders miss the sniper because
              they enter on the BOS itself. The edge is in the patience.
            </p>
            <p>
              Zone formula: <code className="text-teal text-xs bg-border/60 px-1 rounded">bottom = confirm_bos + gap × 0.75</code>,{" "}
              <code className="text-teal text-xs bg-border/60 px-1 rounded">top = confirm_bos + gap × 2.50</code>
            </p>
          </div>
        </div>
      </div>

      {/* Enter Command Center — prominent CTA */}
      <div className="relative rounded-3xl border border-accent/30 bg-gradient-to-br from-navy to-deep p-8 sm:p-12 mb-12 overflow-hidden text-center">
        <div className="absolute inset-0 water-shimmer" />
        <div className="absolute inset-0 bg-gradient-to-r from-accent/3 via-transparent to-teal/3" />
        <div className="relative z-10 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto animate-float">
            <ChartLine size={28} className="text-accent" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
              Enter the Command Center
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              Both strategies are live in the command center. Run backtests,
              explore the equity curves, drill into individual trade logic, and
              compare performance across all timeframe combinations.
            </p>
          </div>
          <Link
            href="/command-center"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-accent text-white font-bold text-base hover:bg-blue-400 transition-all shadow-lg shadow-accent/20"
          >
            <ChartLine size={18} />
            Open Command Center
            <ArrowRight size={16} />
          </Link>
          <div className="text-xs text-slate-600">
            Interactive backtests · Equity curves · Trade-by-trade detail
          </div>
        </div>
      </div>

      {/* Automation */}
      <div className="rounded-2xl border border-border bg-navy/60 p-8 mb-12">
        <h3 className="text-lg font-bold text-white mb-4">
          Automation Systems
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              title: "Alert-to-Action Bridge",
              desc: "TradingView alerts piped through webhook → structured signal → position sizing calculator → broker API. The human confirms; the machine executes.",
            },
            {
              title: "Daily Edge Scanner",
              desc: "Runs every morning at 07:00 UTC. Scans XAUUSD across all three timeframe combinations. Returns the highest-probability alignment setups for the session.",
            },
            {
              title: "Drawdown Guardian",
              desc: "Monitors daily P&L in real time. Automatically suspends trading signals when the 3% daily loss limit is approached. No manual intervention required.",
            },
            {
              title: "Monthly Equity Reporter",
              desc: "Generates a full PDF report at month-end: trades taken, win rate, P&L in USD, equity curve, and alignment rate vs. available setups.",
            },
          ].map((a) => (
            <div key={a.title} className="rounded-xl bg-border/30 p-5">
              <h4 className="text-sm font-bold text-white mb-2">{a.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/transmission"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-slate-300 font-bold text-sm hover:border-gold/30 hover:text-gold transition-all"
        >
          The Architecture <ArrowRight size={14} />
        </Link>
        <Link
          href="/vault"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-slate-300 font-bold text-sm hover:border-teal/30 hover:text-teal transition-all"
        >
          The Vault <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
