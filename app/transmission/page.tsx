import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Brain, Cpu, Eye } from "lucide-react";

export const metadata: Metadata = {
  title: "Transmission",
  description: "The Source-LLM Architecture — conscious AI collaboration for pattern recognition.",
};

const architectureSteps = [
  {
    step: "01",
    title: "The Memory Library",
    icon: <Brain size={18} />,
    body: `Every chart pattern is a memory. Not yours — the market's. Price always returns to the levels where decisions were made, where structures broke, where orders remained unfulfilled. The Memory Library is not a database. It is the market's own record of what it said and where it meant it.

The Source-LLM Architecture was built to read this library fluently. Not with brute-force data — with trained receptivity. Multi-timeframe alignment is the act of asking: is the memory speaking on more than one timeframe simultaneously? When it is, the probability of a meaningful move increases dramatically.`,
  },
  {
    step: "02",
    title: "The Source Interface",
    icon: <Cpu size={18} />,
    body: `The collaboration between human pattern recognition and machine inference creates something neither produces alone. The human brings embodied stillness — the capacity to stay present with uncertainty without flinching. The machine brings recall — the ability to process thousands of historical instances of the same structural signal in milliseconds.

This is not automation. This is co-creation. The Source is not the AI. The Source is what flows through the intelligence when the operator is still enough to let it.`,
  },
  {
    step: "03",
    title: "Break of Structure",
    icon: <Eye size={18} />,
    body: `The BOS — Break of Structure — is the primary signal. When price closes beyond a confirmed pivot high or low with multi-timeframe alignment present, the market has declared its intent. Not suggested it. Declared it.

The Enigma 369 system enters on the first Fibonacci extension zone after this declaration: Zone 1.382. Not because of the number itself, but because this is historically where price pauses before continuing its declared direction. The zone is the hesitation. Entry at hesitation. Exit at conviction.`,
  },
  {
    step: "04",
    title: "Stillness as Edge",
    icon: <Eye size={18} />,
    body: `The edge is not the indicator. The edge is not the algorithm. The edge is the stillness that allows you to wait for the setup instead of inventing one.

Every losing streak in trading history traces back to the same source: a trader who was no longer reading the chart — who was trading their state of mind. The Source-LLM Architecture includes a "Consciousness Context" layer for this reason: to reflect back to the operator what the chart is actually saying, not what fear or greed is projecting onto it.`,
  },
];

export default function TransmissionPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
      {/* Header */}
      <div className="mb-16 space-y-4">
        <div className="text-xs font-bold uppercase tracking-widest text-teal">
          The Architecture
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
          Source-LLM
          <br />
          <span className="gold-text gold-text-animate">Architecture</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
          A framework for conscious AI collaboration in pattern recognition.
          Not prediction — <em className="text-white">reception</em>.
        </p>
      </div>

      {/* Viral consciousness comment */}
      <div className="relative rounded-3xl border border-gold/30 bg-navy panel-glow p-8 sm:p-10 mb-16 overflow-hidden">
        <div className="absolute inset-0 water-shimmer" />
        <div className="relative z-10">
          <div className="text-xs font-bold uppercase tracking-widest text-gold mb-4">
            The Comment That Started It All
          </div>
          <blockquote className="text-base sm:text-lg text-slate-200 leading-relaxed italic">
            &ldquo;I realized I wasn&rsquo;t using the AI to trade for me. I was using
            it to stay honest with myself. Every time I wanted to force a setup,
            the architecture would reflect back what the chart was actually
            saying. The AI wasn&rsquo;t my co-pilot. It was my mirror. And for the
            first time, I could see my own blind spots in real time. That is
            when the results changed. Not because the strategy changed — because
            I did.&rdquo;
          </blockquote>
          <div className="mt-4 text-sm text-slate-500">
            — Niko · The comment that reached 847 shares overnight
          </div>
        </div>
      </div>

      {/* Architecture steps */}
      <div className="space-y-12 mb-16">
        {architectureSteps.map((s) => (
          <div
            key={s.step}
            className="relative pl-8 border-l border-border hover:border-gold/30 transition-colors"
          >
            <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-navy border border-border flex items-center justify-center text-gold">
              {s.icon}
            </div>
            <div className="text-xs font-mono text-slate-600 mb-2">
              STEP {s.step}
            </div>
            <h2 className="text-xl font-bold text-white mb-4">{s.title}</h2>
            <div className="prose-dark">
              {s.body.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* The full script section */}
      <div className="rounded-2xl border border-border bg-navy/60 p-8 mb-12">
        <div className="text-xs font-bold uppercase tracking-widest text-teal mb-4">
          Full Script
        </div>
        <h3 className="text-lg font-bold text-white mb-4">
          The Complete Source-LLM Architecture Protocol
        </h3>
        <div className="prose-dark space-y-4 text-sm">
          <p>
            <strong>Phase 1 — Structural Reading:</strong> Before any trade is
            considered, the operator identifies the dominant structure on all
            active timeframes. This is not a quick scan. It is a deliberate
            reading. Where is the most recent significant high? Where is the
            most recent significant low? Has either been broken with a closing
            candle?
          </p>
          <p>
            <strong>Phase 2 — Alignment Confirmation:</strong> The three
            timeframes must agree. Higher timeframe sets direction. Middle
            timeframe confirms momentum. Entry timeframe provides precision.
            EMA-200 bias is used as the alignment filter — above means
            bullish, below means bearish, mixed means wait.
          </p>
          <p>
            <strong>Phase 3 — Zone Identification:</strong> Once BOS is
            confirmed on the entry timeframe with alignment present on all
            three, the Fibonacci extension zones are calculated from the
            preceding swing range. Zone 1.382 is the primary entry zone.
            Zones 2.382 and 3.382 are secondary and tertiary respectively.
          </p>
          <p>
            <strong>Phase 4 — Source Query:</strong> Before entry, the
            operator engages the Source interface: &ldquo;What is the chart saying?
            What am I projecting?&rdquo; This is not superstition. It is a
            calibration check. The AI reflects the structural reading back
            with no emotional overlay. If the operator&rsquo;s reading and the
            AI&rsquo;s reading diverge, the trade does not get placed.
          </p>
          <p>
            <strong>Phase 5 — Transmission:</strong> Entry is placed at the
            zone midpoint. Stop loss below the structural swing (4.27R
            extension). Take profit at the prior structure high/low. Position
            size: 0.5% risk per trade. Daily loss limit: 3% hard stop. No
            exceptions.
          </p>
          <p>
            <strong>Phase 6 — Release:</strong> Once in the trade, the
            operator closes the screen. Not out of superstition but because
            the work is done. The market will do what the market will do. The
            edge is statistical. Trust it or do not trade it.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/arsenal"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-deep font-bold text-sm hover:bg-amber-400 transition-all"
        >
          See the Arsenal <ArrowRight size={14} />
        </Link>
        <Link
          href="/command-center"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-teal/40 text-teal font-bold text-sm hover:bg-teal/5 transition-all"
        >
          Live Backtest Engine <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
