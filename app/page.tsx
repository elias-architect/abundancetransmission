import Link from "next/link";
import EmailForm from "@/components/email-form";
import {
  ChartLine,
  Brain,
  Sparkles,
  ArrowRight,
  BookOpen,
  Shield,
  Cpu,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative">
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-deep-gradient" />
        <div className="absolute inset-0 water-shimmer" />
        <div className="spiral-ornament absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold/4 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-semibold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            Conscious Forex Sovereignty
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none">
              <span className="text-white">Abundance</span>
              <br />
              <span className="gold-text gold-text-animate">Transmission</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 font-light italic tracking-wide">
              The Memory Library Speaks Through the Charts
            </p>
          </div>

          {/* Sub */}
          <p className="text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Pattern Mastery · AI-Enhanced Edges · Empathic Abundance Transmission.{" "}
            <br className="hidden sm:block" />
            A sovereign trading intelligence designed for those who are ready to
            receive.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/transmission"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gold text-deep font-bold text-sm tracking-wide hover:bg-amber-400 transition-all shadow-lg shadow-gold/20"
            >
              <Sparkles size={16} />
              Read the Transmission
            </Link>
            <Link
              href="/command-center"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-teal/40 bg-teal/5 text-teal font-bold text-sm tracking-wide hover:bg-teal/10 transition-all"
            >
              <ChartLine size={16} />
              Enter Command Center
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-5 h-8 rounded-full border border-slate-600 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-slate-500 rounded-full" />
          </div>
        </div>
      </section>

      {/* ── Niko Soul ID Video ────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 space-y-3">
            <div className="text-xs font-bold uppercase tracking-widest text-teal">
              Niko Soul ID
            </div>
            <h2 className="text-3xl font-bold text-white">
              The Origin Signal
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              The transmission began long before the first trade was placed.
              Watch the signal that set everything in motion.
            </p>
          </div>

          {/* Video placeholder — replace src with your Higgsfield export */}
          <div className="relative rounded-2xl overflow-hidden border border-border panel-glow bg-navy aspect-video flex items-center justify-center">
            <div className="absolute inset-0 water-shimmer" />
            <div className="relative z-10 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto animate-float">
                <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-gold border-b-[12px] border-b-transparent ml-1" />
              </div>
              <div className="text-slate-400 text-sm">
                Niko Soul ID — Higgsfield Video
              </div>
              <div className="text-xs text-slate-600">
                {/* Replace the div above with: */}
                {/* <video src="/niko-soul-id.mp4" controls className="w-full rounded-xl" /> */}
                {/* Or for iframe: */}
                {/* <iframe src="YOUR_VIDEO_URL" className="w-full h-full" allowFullScreen /> */}
                Video asset pending export
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Three pillars ─────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-gold">
              The Three Pillars
            </div>
            <h2 className="text-3xl font-bold text-white">
              What Gets Transmitted
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <ChartLine size={24} className="text-gold" />,
                title: "Pattern Mastery",
                desc: "Break of Structure. Multi-timeframe alignment. Fibonacci extension zones. The patterns the market broadcasts for those who are trained to receive them.",
                href: "/arsenal",
                linkText: "See the Arsenal",
                color: "gold",
              },
              {
                icon: <Brain size={24} className="text-teal" />,
                title: "AI-Enhanced Edges",
                desc: "The Source-LLM Architecture — a co-creation between human consciousness and machine intelligence that surfaces high-probability edges in real time.",
                href: "/transmission",
                linkText: "Read the Architecture",
                color: "teal",
              },
              {
                icon: <Sparkles size={24} className="text-accent" />,
                title: "Empathic Abundance",
                desc: "Trading is not extraction. It is transmission. Every setup that works is the market confirming your alignment. Receive. Do not chase.",
                href: "/origin",
                linkText: "The Origin Story",
                color: "accent",
              },
            ].map((p) => (
              <div
                key={p.title}
                className="relative rounded-2xl border border-border bg-navy p-7 flex flex-col gap-5 panel-glow group hover:border-gold/20 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-border/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {p.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-2">
                    {p.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
                <Link
                  href={p.href}
                  className="mt-auto inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-gold transition-colors"
                >
                  {p.linkText} <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature strip ─────────────────────────────────── */}
      <section className="py-16 px-4 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { icon: <BookOpen size={20} />, label: "Books", sub: "2 titles coming" },
              { icon: <Cpu size={20} />, label: "Pine Scripts", sub: "Enigma 369 + Sniper" },
              { icon: <Shield size={20} />, label: "Vault", sub: "Transparent fund" },
              { icon: <ChartLine size={20} />, label: "Command Center", sub: "Live backtest engine" },
            ].map((f) => (
              <div key={f.label} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-border/60 flex items-center justify-center text-gold">
                  {f.icon}
                </div>
                <div className="text-sm font-bold text-white">{f.label}</div>
                <div className="text-xs text-slate-500">{f.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Early access ──────────────────────────────────── */}
      <section id="early-access" className="py-24 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="relative rounded-3xl border border-gold/20 bg-navy panel-glow p-10 text-center space-y-6 overflow-hidden">
            <div className="absolute inset-0 water-shimmer opacity-50" />
            <div className="relative z-10 space-y-6">
              <div className="text-xs font-bold uppercase tracking-widest text-gold">
                Steward Access
              </div>
              <h2 className="text-3xl font-bold text-white">
                Join the Transmission
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Early stewards receive direct access to the Command Center,
                indicator releases, and the Source-LLM Architecture as it
                continues to evolve. No noise. Only signal.
              </p>
              <EmailForm
                label=""
                placeholder="your@email.com"
                ctaText="Transmit"
              />
              <p className="text-xs text-slate-600">
                No spam. Ever. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
