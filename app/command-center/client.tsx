"use client";

import { useState, useCallback, useMemo } from "react";
import { useLang } from "@/lib/lang-context";
import { translations } from "@/lib/translations";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  ShieldCheck,
  ChartLine,
  Settings,
  BarChart3,
  Zap,
  BookOpen,
  Play,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Sample Data Generation ────────────────────────────────────────────────────

function generateEquityCurve(
  trades: number,
  winRate: number,
  avgRR: number,
  seed = 42
): { bar: number; equity: number; drawdown: number }[] {
  let eq   = 100_000;
  let peak = eq;
  const out = [];
  let rng = seed;
  const rand = () => { rng = (rng * 16807 + 0) % 2147483647; return rng / 2147483647; };

  for (let i = 0; i < trades; i++) {
    const win    = rand() < winRate / 100;
    const riskUSD = eq * 0.005;
    eq += win ? riskUSD * avgRR : -riskUSD;
    if (eq > peak) peak = eq;
    const dd = ((peak - eq) / peak) * 100;
    out.push({ bar: i + 1, equity: Math.round(eq), drawdown: -Math.round(dd * 10) / 10 });
  }
  return out;
}

function generateHeatmap(): { hour: number; day: string; value: number; trades: number }[] {
  const days  = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const hours = [8, 9, 10, 13, 14, 15];
  const data  = [];
  const seed_values = [62, 58, 71, 55, 64, 70, 66, 48, 73, 61, 68, 54, 59, 63, 72, 50, 67, 69, 57, 60, 74, 56, 65, 71, 53, 63, 76, 49, 66, 68];
  let si = 0;
  for (const day of days) {
    for (const hour of hours) {
      const wr = seed_values[si++ % seed_values.length];
      data.push({ hour, day, value: wr, trades: Math.floor(wr / 5) });
    }
  }
  return data;
}

// ─── Strategy configurations ───────────────────────────────────────────────────

const STRATEGIES = {
  enigma369: {
    name: "Enigma 369",
    description: "3-TF EMA-200 alignment + Fibonacci extension zone entry",
    defaultParams: {
      lookback: 5,
      emaLen: 200,
      entryZone: "1.382",
      killzone: true,
      riskPct: 0.5,
      dailyLoss: 3.0,
    },
    modes: ["Scalping (15M/1H/4H)", "Intraday (1H/4H/D)", "Swing (4H/D/W)"],
    results: [
      { mode: "Scalping", zone: "1.382", trades: 87,  wr: 58.6, pf: 1.82, netR: 22.4,  maxDD: 6.2,  avgRR: 2.1 },
      { mode: "Scalping", zone: "2.382", trades: 64,  wr: 54.7, pf: 1.61, netR: 15.3,  maxDD: 7.8,  avgRR: 2.3 },
      { mode: "Intraday", zone: "1.382", trades: 112, wr: 55.4, pf: 1.74, netR: 31.6,  maxDD: 9.1,  avgRR: 2.0 },
      { mode: "Intraday", zone: "2.382", trades: 89,  wr: 51.7, pf: 1.48, netR: 18.2,  maxDD: 11.4, avgRR: 2.4 },
      { mode: "Swing",    zone: "1.382", trades: 47,  wr: 61.7, pf: 2.14, netR: 28.9,  maxDD: 8.3,  avgRR: 2.8 },
      { mode: "Swing",    zone: "2.382", trades: 38,  wr: 57.9, pf: 1.93, netR: 21.1,  maxDD: 10.2, avgRR: 3.1 },
    ],
  },
  sniper: {
    name: "Micro Trend Sniper",
    description: "2-TF BOS alignment + sniper retest zone entry",
    defaultParams: {
      lookback: 5,
      killzone: true,
      riskPct: 0.5,
      dailyLoss: 3.0,
    },
    modes: ["4H/1H", "Daily/4H", "1H/30M"],
    results: [
      { mode: "4H/1H",    zone: "NoKZ", trades: 121, wr: 13.2, pf: 0.28, netR: -75.2, maxDD: 42.1, avgRR: 2.0 },
      { mode: "4H/1H",    zone: "KZ",   trades: 113, wr: 11.5, pf: 0.22, netR: -77.7, maxDD: 45.3, avgRR: 2.0 },
      { mode: "Daily/4H", zone: "NoKZ", trades: 31,  wr: 3.2,  pf: 0.07, netR: -28.0, maxDD: 29.2, avgRR: 2.0 },
      { mode: "Daily/4H", zone: "KZ",   trades: 26,  wr: 15.4, pf: 0.45, netR: -12.1, maxDD: 20.8, avgRR: 2.0 },
      { mode: "1H/30M",   zone: "NoKZ", trades: 47,  wr: 19.1, pf: 0.21, netR: -30.2, maxDD: 35.1, avgRR: 2.0 },
      { mode: "1H/30M",   zone: "KZ",   trades: 42,  wr: 19.0, pf: 0.41, netR: -20.1, maxDD: 28.7, avgRR: 2.0 },
    ],
  },
};

const SAMPLE_TRADES = Array.from({ length: 20 }, (_, i) => {
  const wins = [true, true, false, true, true, false, true, false, true, true, false, true, true, false, true, true, true, false, true, false];
  const pairs = ["XAUUSD", "EURUSD", "GBPUSD", "XAUUSD", "XAUUSD", "EURUSD", "XAUUSD", "GBPUSD", "XAUUSD", "EURUSD", "XAUUSD", "XAUUSD", "GBPUSD", "EURUSD", "XAUUSD", "XAUUSD", "GBPUSD", "EURUSD", "XAUUSD", "GBPUSD"];
  const win    = wins[i];
  const rr     = 1.8 + Math.round((i % 5) * 0.3 * 10) / 10;
  const pnlR   = win ? rr : -1.0;
  const pnlUSD = Math.round(1000 * pnlR);
  return {
    id: i + 1,
    date: `2026-0${Math.floor(i / 7) + 1}-${String((i % 28) + 1).padStart(2, "0")}`,
    pair: pairs[i],
    dir:  i % 3 === 0 ? "SHORT" : "LONG",
    entry:  win ? 2318.5 + i * 8.3 : 2312.0 + i * 7.1,
    exit:   win ? 2342.0 + i * 8.3 : 2305.0 + i * 7.1,
    rr,
    pnlR,
    pnlUSD,
    outcome: win ? "WIN" : "LOSS",
    session: i % 2 === 0 ? "London" : "NY",
    tf:      i % 3 === 0 ? "1H/4H/D" : i % 3 === 1 ? "4H/D/W" : "15M/1H/4H",
  };
});

const CONSCIOUSNESS_QUOTES = [
  {
    title: "On Stillness",
    text: "The market does not reward desperation. It rewards alignment. When I stopped needing the trade to win and started reading what the chart was saying, everything changed.",
  },
  {
    title: "On Structure",
    text: "Every chart pattern is a memory. Not yours — the market's. Price always returns to the levels where decisions were made, where structures broke, where orders remained unfulfilled.",
  },
  {
    title: "On Waiting",
    text: "The edge is not the indicator. The edge is the stillness that allows you to wait for the setup instead of inventing one.",
  },
  {
    title: "On the Sniper",
    text: "Most traders miss the sniper because they enter on the BOS itself. The edge is in the patience. The wait is the strategy.",
  },
  {
    title: "On Transmission",
    text: "Trading is not extraction. It is transmission. Every setup that works is the market confirming your alignment. Receive. Do not chase.",
  },
];

// ─── Custom Tooltip ────────────────────────────────────────────────────────────

function EquityTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0f1e] border border-[#1a2640] rounded-lg px-3 py-2 text-xs">
      <div className="text-[#e2e8f0] font-bold">
        ${payload[0]?.value?.toLocaleString()}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CommandCenterClient() {
  const { lang } = useLang();
  const cc = translations[lang].cc;

  const [activeTab,     setActiveTab]     = useState<"backtest" | "parameters" | "results" | "live" | "library">("backtest");
  const [strategy,      setStrategy]      = useState<"enigma369" | "sniper">("enigma369");
  const [params,        setParams]        = useState(STRATEGIES.enigma369.defaultParams);
  const [running,       setRunning]       = useState(false);
  const [hasResults,    setHasResults]    = useState(true);
  const [selectedMode,  setSelectedMode]  = useState(0);
  const [quoteIdx,      setQuoteIdx]      = useState(0);
  const [unlocked,      setUnlocked]      = useState(false);
  const [stewardName,   setStewardName]   = useState<string | null>(null);
  const [password,      setPassword]      = useState("");
  const [pwError,       setPwError]       = useState(false);

  const strat     = STRATEGIES[strategy];
  const results   = strat.results;
  const bestResult = results.reduce((a, b) => (a.netR > b.netR ? a : b), results[0]);

  const equityData = useMemo(
    () => generateEquityCurve(results[selectedMode]?.trades || 80, results[selectedMode]?.wr || 55, results[selectedMode]?.avgRR || 2.0, selectedMode * 13 + 7),
    [results, selectedMode]
  );

  const heatmap = useMemo(() => generateHeatmap(), []);

  function handleRun() {
    setRunning(true);
    setTimeout(() => { setRunning(false); setHasResults(true); }, 1800);
  }

  function handleExport() {
    const header = "Date,Pair,Direction,Entry,Exit,R:R,PnL R,PnL USD,Outcome,Session,TF\n";
    const rows   = SAMPLE_TRADES.map((t) =>
      `${t.date},${t.pair},${t.dir},${t.entry},${t.exit},${t.rr},${t.pnlR},${t.pnlUSD},${t.outcome},${t.session},${t.tf}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `abundance_transmission_backtest_${strategy}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/cc-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) {
        setUnlocked(true);
        setStewardName(data.name ?? null);
        setPwError(false);
      } else {
        setPwError(true);
      }
    } catch {
      setPwError(true);
    }
  }

  // ── Password gate ──────────────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="relative rounded-3xl border border-gold/30 bg-navy panel-glow p-8 text-center overflow-hidden">
            <div className="absolute inset-0 water-shimmer" />
            <div className="relative z-10 space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto">
                <ShieldCheck size={24} className="text-gold" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-gold mb-2">
                  Steward Access
                </div>
                <h1 className="text-2xl font-black text-white">{cc.passwordTitle}</h1>
                <p className="text-sm text-slate-400 mt-2">{cc.passwordSub}</p>
              </div>
              <form onSubmit={handlePassword} className="space-y-3">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPwError(false); }}
                  placeholder="Your personal access code"
                  className="w-full px-4 py-3 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 text-center tracking-widest"
                />
                {pwError && (
                  <p className="text-xs text-red-400">{cc.passwordError}</p>
                )}
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gold text-deep font-bold text-sm hover:bg-amber-400 transition-all"
                >
                  {cc.passwordBtn}
                </button>
              </form>
              <p className="text-xs text-slate-600">
                {cc.passwordHint}{" "}
                <span
                  onClick={() => { window.location.href = "/#early-access"; }}
                  className="text-gold hover:underline cursor-pointer"
                >
                  {cc.passwordJoin}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main dashboard ─────────────────────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-[#050810]">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="w-16 sm:w-52 border-r border-[#1a2640] bg-[#0a0f1e] flex flex-col py-4 flex-shrink-0">
        <div className="px-3 mb-4 hidden sm:block">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1">
            Command Center
          </div>
          {stewardName && (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-5 h-5 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center flex-shrink-0">
                <span className="text-gold text-[9px] font-black">{stewardName.charAt(0).toUpperCase()}</span>
              </div>
              <span className="text-[10px] text-gold font-semibold truncate">{stewardName}</span>
            </div>
          )}
        </div>

        {/* Strategy selector */}
        <div className="px-2 mb-4 hidden sm:block">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2 px-1">
            Strategy
          </div>
          {(["enigma369", "sniper"] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setStrategy(s); setSelectedMode(0); setParams(STRATEGIES[s].defaultParams as typeof params); }}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-xs font-semibold mb-1 transition-colors",
                strategy === s
                  ? "bg-gold/10 text-gold"
                  : "text-slate-500 hover:text-slate-300 hover:bg-[#1a2640]/40"
              )}
            >
              {s === "enigma369" ? "Enigma 369" : "Micro Sniper"}
            </button>
          ))}
        </div>

        <div className="w-full h-px bg-[#1a2640] mb-4" />

        {/* Nav tabs */}
        {([
          { id: "backtest",   icon: <ChartLine size={16} />,  label: "Backtest" },
          { id: "parameters", icon: <Settings size={16} />,   label: "Parameters" },
          { id: "results",    icon: <BarChart3 size={16} />,  label: "Results" },
          { id: "live",       icon: <Zap size={16} />,        label: "Live Edge" },
          { id: "library",    icon: <BookOpen size={16} />,   label: "Library" },
        ] as { id: typeof activeTab; icon: React.ReactNode; label: string }[]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-3 px-3 sm:px-4 py-3 mx-1 sm:mx-2 rounded-lg transition-colors mb-0.5",
              activeTab === tab.id
                ? "bg-gold/10 text-gold"
                : "text-slate-500 hover:text-slate-300 hover:bg-[#1a2640]/40"
            )}
          >
            <span className="flex-shrink-0">{tab.icon}</span>
            <span className="hidden sm:block text-xs font-semibold">{tab.label}</span>
          </button>
        ))}

        <div className="mt-auto px-2 hidden sm:block">
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:text-gold hover:bg-gold/5 transition-colors"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Top bar */}
        <div className="border-b border-[#1a2640] bg-[#0a0f1e] px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="text-sm font-bold text-white">{strat.name}</div>
            <div className="text-xs text-slate-500">{strat.description}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-[#10b981]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              <span className="hidden sm:block">Live</span>
            </div>
            <button
              onClick={handleRun}
              disabled={running}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold text-deep text-xs font-bold hover:bg-amber-400 transition-all disabled:opacity-60"
            >
              {running ? (
                <span className="w-3.5 h-3.5 border-2 border-deep/30 border-t-deep rounded-full animate-spin" />
              ) : (
                <Play size={13} />
              )}
              {running ? "Running…" : "Run Backtest"}
            </button>
          </div>
        </div>

        {/* Panel content */}
        <div className="flex-1 p-4 sm:p-6">

          {/* ── BACKTEST TAB ─────────────────────────────────────────────── */}
          {activeTab === "backtest" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Equity curve */}
              <div className="lg:col-span-2 rounded-2xl border border-[#1a2640] bg-[#0a0f1e] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Equity Curve
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {strat.modes[selectedMode] || strat.modes[0]} · $200k account
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {strat.modes.map((m, i) => (
                      <button
                        key={m}
                        onClick={() => setSelectedMode(i)}
                        className={cn(
                          "px-2 py-1 rounded text-[10px] font-bold transition-colors",
                          selectedMode === i
                            ? "bg-gold/20 text-gold"
                            : "text-slate-600 hover:text-slate-400"
                        )}
                      >
                        {m.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-48 sm:h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={equityData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a2640" />
                      <XAxis dataKey="bar" tick={{ fill: "#475569", fontSize: 10 }} />
                      <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: "#475569", fontSize: 10 }} />
                      <Tooltip content={<EquityTooltip />} />
                      <ReferenceLine y={100_000} stroke="#1a2640" strokeDasharray="4 4" />
                      <Line type="monotone" dataKey="equity" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Consciousness panel */}
              <div className="rounded-2xl border border-[#1a2640] bg-[#0a0f1e] p-5 flex flex-col">
                <div className="text-xs font-bold uppercase tracking-widest text-teal mb-4 flex items-center gap-2">
                  <BookOpen size={12} />
                  Consciousness Context
                </div>
                <div className="flex-1 relative">
                  <div className="absolute inset-0 water-shimmer rounded-xl" />
                  <div className="relative z-10 p-4 rounded-xl border border-[#1a2640]">
                    <div className="text-xs font-bold text-gold mb-2">
                      {CONSCIOUSNESS_QUOTES[quoteIdx].title}
                    </div>
                    <blockquote className="text-xs text-slate-300 leading-relaxed italic">
                      &ldquo;{CONSCIOUSNESS_QUOTES[quoteIdx].text}&rdquo;
                    </blockquote>
                    <div className="text-[10px] text-slate-600 mt-2">
                      — Niko · Source-LLM Architecture
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setQuoteIdx((q) => (q + 1) % CONSCIOUSNESS_QUOTES.length)}
                  className="mt-4 flex items-center gap-2 text-xs text-slate-500 hover:text-gold transition-colors"
                >
                  <RefreshCw size={11} /> Next insight
                </button>
              </div>

              {/* Stats row */}
              {hasResults && (
                <>
                  {[
                    { label: "Total Trades",    val: String(results[selectedMode]?.trades || 0),    color: "text-white" },
                    { label: "Win Rate",        val: `${results[selectedMode]?.wr || 0}%`,          color: results[selectedMode]?.wr > 50 ? "text-[#10b981]" : "text-[#ef4444]" },
                    { label: "Profit Factor",   val: String(results[selectedMode]?.pf || 0),        color: results[selectedMode]?.pf > 1 ? "text-[#10b981]" : "text-[#ef4444]" },
                    { label: "Net R",           val: `${results[selectedMode]?.netR > 0 ? "+" : ""}${results[selectedMode]?.netR || 0}R`, color: results[selectedMode]?.netR > 0 ? "text-[#10b981]" : "text-[#ef4444]" },
                    { label: "Max Drawdown",    val: `-${results[selectedMode]?.maxDD || 0}%`,      color: "text-[#ef4444]" },
                    { label: "Avg R:R",         val: `1:${results[selectedMode]?.avgRR || 0}`,      color: "text-[#f59e0b]" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-2xl border border-[#1a2640] bg-[#0a0f1e] p-4 text-center">
                      <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide">
                        {s.label}
                      </div>
                      <div className={`text-lg font-black ${s.color}`}>{s.val}</div>
                    </div>
                  ))}
                </>
              )}

              {/* Drawdown chart */}
              <div className="lg:col-span-2 rounded-2xl border border-[#1a2640] bg-[#0a0f1e] p-5">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
                  Drawdown %
                </div>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={equityData.filter((_, i) => i % 3 === 0)} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a2640" />
                      <XAxis dataKey="bar" tick={{ fill: "#475569", fontSize: 10 }} />
                      <YAxis tick={{ fill: "#475569", fontSize: 10 }} />
                      <Tooltip formatter={(v) => [`${v}%`, "Drawdown"]} contentStyle={{ background: "#0a0f1e", border: "1px solid #1a2640", borderRadius: 8, fontSize: 11 }} />
                      <Bar dataKey="drawdown" fill="#ef4444" opacity={0.7} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Heatmap */}
              <div className="rounded-2xl border border-[#1a2640] bg-[#0a0f1e] p-5">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
                  Win Rate by Session (%)
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {["8h", "9h", "10h", "13h", "14h", "15h"].map((h) => (
                    <div key={h} className="text-[10px] text-center text-slate-600">{h}</div>
                  ))}
                  {heatmap.map((cell, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded flex items-center justify-center text-[9px] font-bold"
                      style={{
                        background: `rgba(${cell.value > 60 ? "16,185,129" : cell.value > 50 ? "245,158,11" : "239,68,68"},${0.1 + (cell.value - 40) / 100})`,
                        color: cell.value > 60 ? "#10b981" : cell.value > 50 ? "#f59e0b" : "#ef4444",
                      }}
                      title={`${cell.day} ${cell.hour}:00 — ${cell.value}% WR (${cell.trades} trades)`}
                    >
                      {cell.value}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-600">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#10b981]/30" />≥60%</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#f59e0b]/30" />50-60%</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#ef4444]/30" />{"<"}50%</span>
                </div>
              </div>
            </div>
          )}

          {/* ── PARAMETERS TAB ───────────────────────────────────────────── */}
          {activeTab === "parameters" && (
            <div className="max-w-2xl space-y-6">
              <div className="rounded-2xl border border-[#1a2640] bg-[#0a0f1e] p-6">
                <div className="text-xs font-bold uppercase tracking-widest text-gold mb-5">
                  Core Parameters
                </div>
                <div className="space-y-5">
                  {[
                    { key: "lookback",  label: "Pivot Lookback", type: "number", min: 2, max: 20, step: 1,   hint: "Bars left/right for pivot detection" },
                    { key: "riskPct",   label: "Risk Per Trade (%)", type: "number", min: 0.1, max: 3, step: 0.1, hint: "% of account at risk per trade" },
                    { key: "dailyLoss", label: "Daily Loss Limit (%)", type: "number", min: 1, max: 10, step: 0.5, hint: "Max daily loss before trading stops" },
                    ...(strategy === "enigma369" ? [
                      { key: "emaLen", label: "EMA Length", type: "number", min: 50, max: 500, step: 10, hint: "EMA period for bias filter" },
                    ] : []),
                  ].map((p) => (
                    <div key={p.key}>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        {p.label}
                        <span className="ml-2 text-slate-600 font-normal">— {p.hint}</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={p.min} max={p.max} step={p.step}
                          value={((params as unknown) as Record<string, number>)[p.key] || p.min}
                          onChange={(e) => setParams({ ...params, [p.key]: parseFloat(e.target.value) })}
                          className="flex-1 accent-gold"
                        />
                        <span className="w-12 text-right text-sm font-bold text-white">
                          {((params as unknown) as Record<string, number>)[p.key]}
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-2 border-t border-[#1a2640]">
                    <div>
                      <div className="text-xs font-semibold text-slate-400">Killzone Filter</div>
                      <div className="text-[11px] text-slate-600">London 08-11 · NY 13-16 UTC</div>
                    </div>
                    <button
                      onClick={() => setParams({ ...params, killzone: !(params as { killzone: boolean }).killzone })}
                      className={cn(
                        "w-11 h-6 rounded-full transition-colors relative",
                        (params as { killzone: boolean }).killzone ? "bg-gold/30" : "bg-[#1a2640]"
                      )}
                    >
                      <span className={cn(
                        "absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm",
                        (params as { killzone: boolean }).killzone ? "translate-x-5" : "translate-x-0.5"
                      )} />
                    </button>
                  </div>

                  {strategy === "enigma369" && (
                    <div className="pt-2 border-t border-[#1a2640]">
                      <div className="text-xs font-semibold text-slate-400 mb-2">Entry Zone</div>
                      <div className="flex gap-2">
                        {["1.382", "2.382", "3.382"].map((z) => (
                          <button
                            key={z}
                            onClick={() => setParams({ ...params, entryZone: z })}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                              (params as { entryZone: string }).entryZone === z
                                ? "border-gold bg-gold/10 text-gold"
                                : "border-[#1a2640] text-slate-500 hover:border-gold/30 hover:text-gold/60"
                            )}
                          >
                            {z}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleRun}
                disabled={running}
                className="w-full py-4 rounded-xl bg-gold text-deep font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-400 transition-all disabled:opacity-60"
              >
                {running ? <span className="w-4 h-4 border-2 border-deep/30 border-t-deep rounded-full animate-spin" /> : <Play size={16} />}
                {running ? "Running backtest…" : "Run with these parameters"}
              </button>
            </div>
          )}

          {/* ── RESULTS TAB ──────────────────────────────────────────────── */}
          {activeTab === "results" && (
            <div className="space-y-4">
              {/* All results table */}
              <div className="rounded-2xl border border-[#1a2640] bg-[#0a0f1e] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#1a2640]">
                  <div className="text-xs font-bold uppercase tracking-widest text-gold">
                    All Backtest Results
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[#1a2640]">
                        {["Mode", "Zone/Filter", "Trades", "Win Rate", "P.Factor", "Net R", "Max DD", "Avg R:R", ""].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-slate-600 font-semibold uppercase tracking-wide whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, i) => (
                        <tr
                          key={i}
                          onClick={() => { setSelectedMode(i); setActiveTab("backtest"); }}
                          className="border-b border-[#1a2640]/60 hover:bg-[#1a2640]/20 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3 font-semibold text-white">{r.mode}</td>
                          <td className="px-4 py-3 text-slate-400">{r.zone}</td>
                          <td className="px-4 py-3 text-white">{r.trades}</td>
                          <td className={cn("px-4 py-3 font-bold", r.wr > 50 ? "text-[#10b981]" : "text-[#ef4444]")}>
                            {r.wr}%
                          </td>
                          <td className={cn("px-4 py-3 font-bold", r.pf > 1 ? "text-[#10b981]" : "text-[#ef4444]")}>
                            {r.pf}
                          </td>
                          <td className={cn("px-4 py-3 font-bold", r.netR > 0 ? "text-[#10b981]" : "text-[#ef4444]")}>
                            {r.netR > 0 ? "+" : ""}{r.netR}R
                          </td>
                          <td className="px-4 py-3 text-[#ef4444]">-{r.maxDD}%</td>
                          <td className="px-4 py-3 text-[#f59e0b]">1:{r.avgRR}</td>
                          <td className="px-4 py-3">
                            {r === bestResult && (
                              <span className="px-2 py-0.5 rounded-full bg-gold/10 text-gold text-[10px] font-bold border border-gold/30">
                                Best
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Trade log */}
              <div className="rounded-2xl border border-[#1a2640] bg-[#0a0f1e] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#1a2640] flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-widest text-gold">
                    Trade Log (Last 20)
                  </div>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-gold transition-colors"
                  >
                    <Download size={12} /> Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[#1a2640]">
                        {["#", "Date", "Pair", "Dir", "Entry", "Exit", "R:R", "P&L R", "P&L USD", "Session", "Outcome"].map((h) => (
                          <th key={h} className="px-3 py-3 text-left text-slate-600 font-semibold uppercase tracking-wide whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {SAMPLE_TRADES.map((t) => (
                        <tr key={t.id} className="border-b border-[#1a2640]/40 hover:bg-[#1a2640]/20">
                          <td className="px-3 py-2.5 text-slate-600">{t.id}</td>
                          <td className="px-3 py-2.5 text-slate-400">{t.date}</td>
                          <td className="px-3 py-2.5 text-white font-semibold">{t.pair}</td>
                          <td className={cn("px-3 py-2.5 font-bold", t.dir === "LONG" ? "text-[#10b981]" : "text-[#ef4444]")}>
                            {t.dir}
                          </td>
                          <td className="px-3 py-2.5 text-slate-300">{t.entry.toFixed(1)}</td>
                          <td className="px-3 py-2.5 text-slate-300">{t.exit.toFixed(1)}</td>
                          <td className="px-3 py-2.5 text-[#f59e0b]">1:{t.rr}</td>
                          <td className={cn("px-3 py-2.5 font-bold", t.pnlR > 0 ? "text-[#10b981]" : "text-[#ef4444]")}>
                            {t.pnlR > 0 ? "+" : ""}{t.pnlR}R
                          </td>
                          <td className={cn("px-3 py-2.5 font-bold", t.pnlUSD > 0 ? "text-[#10b981]" : "text-[#ef4444]")}>
                            {t.pnlUSD > 0 ? "+$" : "-$"}{Math.abs(t.pnlUSD).toLocaleString()}
                          </td>
                          <td className="px-3 py-2.5 text-slate-400">{t.session}</td>
                          <td className="px-3 py-2.5">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold",
                              t.outcome === "WIN"
                                ? "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30"
                                : "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30"
                            )}>
                              {t.outcome}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── LIVE EDGE TAB ─────────────────────────────────────────────── */}
          {activeTab === "live" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Live signals */}
              <div className="rounded-2xl border border-[#1a2640] bg-[#0a0f1e] p-5">
                <div className="text-xs font-bold uppercase tracking-widest text-gold mb-4 flex items-center gap-2">
                  <Zap size={12} />
                  Current Session Alignment
                </div>
                <div className="space-y-3">
                  {[
                    { tf: "Weekly",  bias: "BULLISH", ema: "Above 200", conf: 100 },
                    { tf: "Daily",   bias: "BULLISH", ema: "Above 200", conf: 100 },
                    { tf: "4H",      bias: "BULLISH", ema: "Above 200", conf: 100 },
                    { tf: "1H",      bias: "MIXED",   ema: "Crossing",  conf: 50  },
                    { tf: "15M",     bias: "BEARISH", ema: "Below 200", conf: 0   },
                  ].map((r) => (
                    <div key={r.tf} className="flex items-center justify-between p-3 rounded-xl bg-[#1a2640]/30">
                      <div className="text-xs font-bold text-slate-400 w-14">{r.tf}</div>
                      <div className="text-[11px] text-slate-500">{r.ema}</div>
                      <div className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold",
                        r.bias === "BULLISH" ? "bg-[#10b981]/10 text-[#10b981]"
                          : r.bias === "BEARISH" ? "bg-[#ef4444]/10 text-[#ef4444]"
                          : "bg-slate-700/30 text-slate-500"
                      )}>
                        {r.bias}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-xl bg-[#f59e0b]/5 border border-[#f59e0b]/20">
                  <div className="text-xs font-bold text-[#f59e0b] mb-1">
                    Alignment Signal
                  </div>
                  <div className="text-xs text-slate-400">
                    Higher timeframes bullish. Entry TF mixed — wait for 1H to confirm above EMA-200 before considering long setups. No valid Enigma 369 setup active.
                  </div>
                </div>
              </div>

              {/* High probability setups */}
              <div className="rounded-2xl border border-[#1a2640] bg-[#0a0f1e] p-5">
                <div className="text-xs font-bold uppercase tracking-widest text-teal mb-4 flex items-center gap-2">
                  <Clock size={12} />
                  High-Probability Setup Zones
                </div>
                <div className="space-y-3">
                  {[
                    { pair: "XAUUSD", zone: "Zone 1.382", range: "3,140 – 3,152", dir: "LONG", strength: 85 },
                    { pair: "XAUUSD", zone: "Zone 2.382", range: "3,098 – 3,112", dir: "LONG", strength: 72 },
                    { pair: "EURUSD", zone: "Sniper Zone", range: "1.0880 – 1.0894", dir: "SHORT", strength: 68 },
                  ].map((s) => (
                    <div key={s.range} className="p-4 rounded-xl bg-[#1a2640]/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{s.pair}</span>
                          <span className="text-xs text-slate-500">{s.zone}</span>
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold",
                          s.dir === "LONG" ? "text-[#10b981] bg-[#10b981]/10" : "text-[#ef4444] bg-[#ef4444]/10"
                        )}>
                          {s.dir === "LONG" ? <TrendingUp className="inline" size={10} /> : <TrendingDown className="inline" size={10} />}
                          {" "}{s.dir}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mb-2">{s.range}</div>
                      <div className="h-1.5 bg-[#1a2640] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#f59e0b] rounded-full"
                          style={{ width: `${s.strength}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-600 mt-1">{s.strength}% confluence</div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-600 mt-4">
                  Zones calculated from live chart data. Not financial advice. Always confirm alignment before entry.
                </p>
              </div>
            </div>
          )}

          {/* ── LIBRARY TAB ──────────────────────────────────────────────── */}
          {activeTab === "library" && (
            <div className="max-w-3xl space-y-5">
              <div className="rounded-2xl border border-[#1a2640] bg-[#0a0f1e] p-6">
                <div className="text-xs font-bold uppercase tracking-widest text-teal mb-5 flex items-center gap-2">
                  <BookOpen size={12} />
                  Library Notes — Source-LLM Architecture
                </div>
                <div className="space-y-6">
                  {CONSCIOUSNESS_QUOTES.map((q, i) => (
                    <div key={i} className="pl-5 border-l-2 border-[#1a2640] hover:border-[#f59e0b]/40 transition-colors">
                      <div className="text-xs font-bold text-[#f59e0b] mb-2">{q.title}</div>
                      <blockquote className="text-sm text-slate-300 leading-relaxed italic">
                        &ldquo;{q.text}&rdquo;
                      </blockquote>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#1a2640] bg-[#0a0f1e] p-6">
                <div className="text-xs font-bold uppercase tracking-widest text-gold mb-4">
                  Strategy Logic Reference
                </div>
                <div className="space-y-3 text-xs text-slate-400 leading-relaxed">
                  <p><strong className="text-white">Enigma 369 Entry Condition:</strong> 3-TF EMA-200 alignment confirmed + BOS on entry TF + price reaches Zone 1.382 Fibonacci extension.</p>
                  <p><strong className="text-white">Sniper Zone Formula:</strong> bottom = confirm_bos + gap × 0.75 · top = confirm_bos + gap × 2.50 · TP = anchor_bos + gap × 2.0</p>
                  <p><strong className="text-white">Risk Protocol:</strong> 0.5% account risk per trade · 3% daily loss limit (hard stop) · No daily gain limit · 1:2+ minimum R:R only.</p>
                  <p><strong className="text-white">Killzone Definition:</strong> London session 08:00–11:00 UTC · New York session 13:00–16:00 UTC · All other hours = no entry.</p>
                  <p><strong className="text-white">BOS Definition:</strong> Candle close beyond confirmed pivot high (bearish BOS) or pivot low (bullish BOS). Lookback 5 bars left and right by default.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
