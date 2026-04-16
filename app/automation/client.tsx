"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Zap, Bell, Bot, ChevronRight, Check, Lock,
  TrendingUp, ShieldCheck, Clock, Users, ArrowRight,
  BarChart3, AlertCircle
} from "lucide-react";

const PAIRS = ["XAUUSD", "NAS100", "GBPJPY", "GBPUSD", "EURUSD", "USDCAD", "US30"];

const STATS = [
  { label: "Win Rate",       value: "61.7%",  sub: "Swing 4H/D/W",    color: "text-gold" },
  { label: "Profit Factor",  value: "2.14",   sub: "per R risked",     color: "text-teal" },
  { label: "Avg R:R",        value: "2.8",    sub: "reward to risk",   color: "text-gold" },
  { label: "Max Drawdown",   value: "8.3%",   sub: "controlled risk",  color: "text-emerald-400" },
];

const SIGNALS_FEATURES = [
  "TradingView alert fired the moment conditions align",
  "One pair of your choice from our 7-pair universe",
  "Entry price, stop loss and take profit included",
  "Enigma 369 Swing setup only — highest quality signals",
  "Telegram + email delivery",
  "Weekly performance report",
];

const AUTO_FEATURES = [
  "Everything in Signals — plus hands-free execution",
  "Up to 3 pairs running simultaneously",
  "Trades execute on your broker automatically",
  "Compatible with FTMO, funded accounts & live brokers",
  "Risk per trade set by you (default 0.5%)",
  "Daily drawdown guardian — auto-pause at 3% daily loss",
  "Full trade log in your dashboard",
  "Priority support",
];

const FAQ = [
  {
    q: "Do I need a funded account?",
    a: "No — you can run this on any MT4/MT5 broker, a prop firm challenge, or a funded account like FTMO. We'll guide you through the setup.",
  },
  {
    q: "What pairs can I choose for signals?",
    a: "XAUUSD, NAS100 (Nasdaq), GBPJPY, GBPUSD, EURUSD, USDCAD, US30. You select one for the annual plan, up to three for automation.",
  },
  {
    q: "How many signals per month?",
    a: "The Enigma 369 Swing strategy averages 4-8 high-quality setups per month per pair. We do not overtrade — quality over quantity.",
  },
  {
    q: "When does automation go live?",
    a: "We are currently connecting the live demo account. Waitlist members will be the first to access it and lock in the launch price.",
  },
  {
    q: "Can I cancel automation anytime?",
    a: "Yes — monthly billing, cancel anytime. Your access continues until the end of the paid period.",
  },
];

type Product = "signals" | "automation" | null;

export default function AutomationClient() {
  const [product,    setProduct]    = useState<Product>(null);
  const [pairs,      setPairs]      = useState<string[]>([]);
  const [name,       setName]       = useState("");
  const [email,      setEmail]      = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const [error,      setError]      = useState("");
  const [openFaq,    setOpenFaq]    = useState<number | null>(null);

  const maxPairs = product === "signals" ? 1 : 3;

  function togglePair(pair: string) {
    if (pairs.includes(pair)) {
      setPairs(pairs.filter((p) => p !== pair));
    } else if (pairs.length < maxPairs) {
      setPairs([...pairs, pair]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product || pairs.length === 0) {
      setError("Please select a product and at least one pair.");
      return;
    }
    setSubmitting(true); setError("");
    const res = await fetch("/api/automation-waitlist", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email, product, pairs }),
    });
    setSubmitting(false);
    if (res.ok) {
      setDone(true);
    } else {
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-deep">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(245,158,11,0.12) 0%, transparent 60%)" }} />
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 80% 50%, rgba(6,182,212,0.06) 0%, transparent 50%)" }} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-bold uppercase tracking-widest mb-8">
            <Zap size={11} /> Enigma 369 Automation
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-none mb-6">
            The Edge.<br />
            <span style={{ background: "linear-gradient(90deg, #f59e0b, #fde68a, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Automated.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Enigma 369 Swing — 61.7% win rate, 2.14 profit factor — now firing signals
            and executing trades automatically on your account.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#join"
              className="px-10 py-4 rounded-2xl font-black text-sm text-deep hover:opacity-90 transition-all"
              style={{ background: "linear-gradient(90deg, #f59e0b, #fde68a, #f59e0b)" }}>
              Join the Waitlist
            </a>
            <Link href="/command-center"
              className="px-8 py-4 rounded-2xl border border-border text-slate-300 font-bold text-sm hover:border-gold/40 hover:text-gold transition-all flex items-center gap-2">
              View Backtest Results <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Live results placeholder ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="rounded-3xl border border-border/60 bg-navy/60 p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30"
            style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(245,158,11,0.08) 0%, transparent 60%)" }} />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Live Demo Account — Connecting
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {STATS.map((s) => (
                <div key={s.label} className="rounded-2xl border border-border bg-deep/60 p-5 text-center">
                  <div className={`text-3xl font-black mb-1 ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-slate-400 font-semibold">{s.label}</div>
                  <div className="text-xs text-slate-600 mt-0.5">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Equity curve placeholder */}
            <div className="rounded-2xl border border-border/40 bg-deep/40 p-6 flex flex-col items-center justify-center"
              style={{ minHeight: 180 }}>
              <BarChart3 size={32} className="text-slate-700 mb-3" />
              <p className="text-sm text-slate-600 font-semibold">Live equity curve</p>
              <p className="text-xs text-slate-700 mt-1">Connecting to FTMO demo account — results will display here live</p>
            </div>

            <p className="text-xs text-slate-600 mt-4 text-center">
              Strategy: Enigma 369 · Swing 4H/D/W · Zone 1.382 · XAUUSD · 0.5% risk per trade
            </p>
          </div>
        </div>
      </div>

      {/* ── Pricing ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="text-center mb-12">
          <div className="text-xs font-bold uppercase tracking-widest text-gold mb-3">Pricing</div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Two ways to run the edge</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Signals */}
          <div className="rounded-3xl border border-border bg-navy/60 p-8 flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                <Bell size={18} className="text-gold" />
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-widest">Signals</div>
                <div className="text-white font-black text-lg">Alert Service</div>
              </div>
            </div>

            <div className="my-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white">€300</span>
                <span className="text-slate-400 text-sm">/ year</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Less than €1 per day · 1 pair</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {SIGNALS_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <Check size={14} className="text-gold flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            <a href="#join" onClick={() => setProduct("signals")}
              className="w-full py-4 rounded-2xl border border-gold/40 bg-gold/10 text-gold font-black text-sm text-center hover:bg-gold/20 transition-all">
              Join Signals Waitlist
            </a>
          </div>

          {/* Automation */}
          <div className="rounded-3xl border border-gold/30 bg-navy/60 p-8 flex flex-col relative overflow-hidden"
            style={{ boxShadow: "0 0 60px rgba(245,158,11,0.06)" }}>
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest text-deep"
              style={{ background: "linear-gradient(90deg, #f59e0b, #fde68a)" }}>
              Most Popular
            </div>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                <Bot size={18} className="text-gold" />
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-widest">Automation</div>
                <div className="text-white font-black text-lg">Hands-Free Trading</div>
              </div>
            </div>

            <div className="my-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white">€99</span>
                <span className="text-slate-400 text-sm">/ month</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Cancel anytime · up to 3 pairs</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {AUTO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <Check size={14} className="text-gold flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            <a href="#join" onClick={() => setProduct("automation")}
              className="w-full py-4 rounded-2xl font-black text-sm text-deep text-center hover:opacity-90 transition-all"
              style={{ background: "linear-gradient(90deg, #f59e0b, #fde68a)" }}>
              Join Automation Waitlist
            </a>
          </div>
        </div>
      </div>

      {/* ── How it works ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="text-center mb-12">
          <div className="text-xs font-bold uppercase tracking-widest text-gold mb-3">The System</div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">How it works</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: <BarChart3 size={22} className="text-gold" />, step: "01", title: "Chart aligns", body: "Enigma 369 scans for 3-timeframe EMA-200 alignment + Fibonacci zone entry on your chosen pairs." },
            { icon: <Bell size={22} className="text-gold" />, step: "02", title: "Signal fires", body: "The moment conditions are met, a TradingView alert sends you the entry, stop loss and take profit instantly." },
            { icon: <Bot size={22} className="text-gold" />, step: "03", title: "Trade executes", body: "For automation subscribers, the trade opens on your account automatically — no screen time required." },
          ].map((s) => (
            <div key={s.step} className="rounded-2xl border border-border bg-navy/40 p-7">
              <div className="w-11 h-11 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-5">
                {s.icon}
              </div>
              <div className="text-xs font-black text-slate-600 mb-2 uppercase tracking-widest">Step {s.step}</div>
              <h3 className="text-white font-black text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Waitlist form ── */}
      <div id="join" className="max-w-2xl mx-auto px-4 sm:px-6 pb-20">
        <div className="rounded-3xl border border-gold/20 bg-navy/80 p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.15) 0%, transparent 60%)" }} />
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="text-xs font-bold uppercase tracking-widest text-gold mb-2">Early Access</div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Join the Waitlist</h2>
              <p className="text-sm text-slate-400">Lock in your spot and launch pricing before we go live.</p>
            </div>

            {done ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-teal/10 border border-teal/30 flex items-center justify-center mx-auto mb-4">
                  <Check size={24} className="text-teal" />
                </div>
                <h3 className="text-white font-black text-lg mb-2">You're on the list</h3>
                <p className="text-sm text-slate-400">
                  We'll reach out as soon as the demo goes live — you'll have first access and launch pricing locked in.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Product selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                    I want *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {([["signals", "Signals", "€300/yr", Bell], ["automation", "Automation", "€99/mo", Bot]] as const).map(([val, label, price, Icon]) => (
                      <button key={val} type="button" onClick={() => { setProduct(val); setPairs([]); }}
                        className={`p-4 rounded-2xl border text-left transition-all ${product === val ? "border-gold/50 bg-gold/10" : "border-border bg-deep/40 hover:border-border-gold/20"}`}>
                        <Icon size={16} className={product === val ? "text-gold mb-2" : "text-slate-500 mb-2"} />
                        <div className={`text-sm font-black ${product === val ? "text-gold" : "text-slate-300"}`}>{label}</div>
                        <div className="text-xs text-slate-500">{price}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pair selector */}
                {product && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                      {product === "signals" ? "Choose 1 pair *" : "Choose up to 3 pairs *"}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PAIRS.map((pair) => {
                        const selected = pairs.includes(pair);
                        const disabled = !selected && pairs.length >= maxPairs;
                        return (
                          <button key={pair} type="button"
                            onClick={() => togglePair(pair)}
                            disabled={disabled}
                            className={`px-4 py-2 rounded-xl border text-xs font-black transition-all ${
                              selected ? "border-gold/50 bg-gold/10 text-gold" :
                              disabled ? "border-border/30 text-slate-700 cursor-not-allowed" :
                              "border-border text-slate-400 hover:border-gold/30 hover:text-white"
                            }`}>
                            {pair}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Name + email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Email *</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)}
                      type="email" required placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50 transition-colors" />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-xs text-red-400">
                    <AlertCircle size={13} /> {error}
                  </div>
                )}

                <button type="submit" disabled={submitting || !product || pairs.length === 0 || !email}
                  className="w-full py-4 rounded-2xl font-black text-sm text-deep hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(90deg, #f59e0b, #fde68a)" }}>
                  {submitting ? "Saving..." : "Secure My Spot"}
                  {!submitting && <ChevronRight size={16} />}
                </button>

                <p className="text-xs text-slate-600 text-center">
                  No payment now · We'll contact you when ready · Unsubscribe anytime
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Trust signals ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <ShieldCheck size={20} className="text-teal" />, label: "FTMO Compatible", sub: "Works with all major prop firms" },
            { icon: <Clock size={20} className="text-gold" />,       label: "Swing Only",      sub: "4-8 quality setups per month" },
            { icon: <Users size={20} className="text-gold" />,       label: "Limited Spots",   sub: "Early access pricing locked in" },
          ].map((t) => (
            <div key={t.label} className="rounded-2xl border border-border bg-navy/40 p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-border/60 flex items-center justify-center flex-shrink-0">{t.icon}</div>
              <div>
                <div className="text-sm font-black text-white">{t.label}</div>
                <div className="text-xs text-slate-500">{t.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-24">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-white">Questions</h2>
        </div>
        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <div key={i} className="rounded-2xl border border-border bg-navy/40 overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left">
                <span className="text-sm font-bold text-white">{item.q}</span>
                <ChevronRight size={14} className={`text-slate-500 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-90" : ""}`} />
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5">
                  <p className="text-sm text-slate-400 leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
