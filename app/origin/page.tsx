import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Calendar, Coins } from "lucide-react";

export const metadata: Metadata = {
  title: "Origin",
  description: "Where it all began — the Turkey 2025 story and the 2360€ transmission.",
};

const timeline = [
  {
    year: "1989",
    title: "February 27 — The Signal Arrives",
    body: "Niko is born under Pisces. Water. Depth. The capacity to feel what others cannot see. The market would one day speak in the same language.",
  },
  {
    year: "2020",
    title: "The First Pattern",
    body: "A moment of recognition — not in a textbook, but in a live chart. Structure breaking. Price remembering where it had been. The memory library had been there the whole time, waiting to be read.",
  },
  {
    year: "2023",
    title: "The Architecture Begins",
    body: "The convergence of multi-timeframe alignment, Fibonacci extension zones, and AI-assisted edge refinement. The Enigma 369 framework takes shape — not designed, but received.",
  },
  {
    year: "2025 — Turkey",
    title: "The 2360€ Transmission",
    body: "Antalya. A small apartment overlooking the sea. Rent was overdue. The account was under pressure. And then — clarity. Not the frantic kind. The still kind. One aligned setup. 3-TF confirmation. Zone entry. The market delivered exactly what was needed: 2360€. Not a trade. A transmission. The moment the philosophy became real.",
  },
  {
    year: "2025",
    title: "Abundance Transmission is Born",
    body: "What had been a private practice became a signal worth sharing. The platform, the books, the indicator suite, the command center — all of it is the architecture made visible.",
  },
];

export default function OriginPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
      {/* Header */}
      <div className="mb-16 space-y-4">
        <div className="text-xs font-bold uppercase tracking-widest text-teal">
          The Origin
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
          Where It All Began
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
          Every system starts as a feeling. This one started in a rented
          apartment in Turkey, with an overdue bill and a perfectly still mind.
        </p>
      </div>

      {/* The Turkey card */}
      <div className="relative rounded-3xl border border-gold/30 bg-navy panel-glow p-8 sm:p-10 mb-16 overflow-hidden">
        <div className="absolute inset-0 water-shimmer" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-gold" /> Antalya, Turkey
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-gold" /> 2025
            </span>
            <span className="flex items-center gap-1.5">
              <Coins size={14} className="text-gold" /> 2,360€
            </span>
          </div>

          <blockquote className="text-xl sm:text-2xl font-light text-white leading-relaxed italic border-l-2 border-gold pl-6">
            &ldquo;The market does not reward desperation. It rewards alignment.
            When I stopped needing the trade to win and started reading what the
            chart was saying, everything changed.&rdquo;
          </blockquote>

          <div className="mt-6 text-sm text-slate-500">— Niko, Antalya 2025</div>
        </div>
      </div>

      {/* Prose */}
      <div className="prose-dark mb-16 space-y-6">
        <p>
          The rent notice had been sitting on the table for three days. Not
          ignored — <strong>witnessed</strong>. There is a difference. Panic
          closes the aperture. Witnessing keeps it open.
        </p>
        <p>
          The XAUUSD chart on the secondary screen was doing something
          interesting. The 4H structure had just broken. The 1H confirmed.
          The 15M was inside the Fibonacci extension zone — Zone 1.382, the
          first resonance point. All three timeframes aligned.{" "}
          <em>The library was speaking.</em>
        </p>
        <p>
          What followed was not a bold move. It was a quiet one. Position sized
          at 0.5% of account. Stop below the swing low. Target at the opposing
          structure. And then — release. Not resignation. Release. The kind that
          only becomes possible when you trust that pattern recognition, when
          trained long enough, becomes a form of reception.
        </p>
        <p>
          The trade ran for eleven hours. When it hit the target, the number on
          the screen was 2,360€. Exactly what was needed. Not approximately.{" "}
          <em>Exactly.</em>
        </p>
        <blockquote>
          This is what Abundance Transmission means. Not manifesting. Not
          hoping. Aligning. Reading the structure. Entering with precision.
          Trusting the architecture. The market is always transmitting. The
          question is whether you have trained yourself to receive.
        </blockquote>
      </div>

      {/* Timeline */}
      <div className="mb-16">
        <h2 className="text-xl font-bold text-white mb-8">
          The Signal Timeline
        </h2>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-10 pl-12">
            {timeline.map((e) => (
              <div key={e.year} className="relative">
                <div className="absolute -left-8 top-1 w-3 h-3 rounded-full border-2 border-gold bg-deep" />
                <div className="text-xs font-bold text-gold uppercase tracking-widest mb-1">
                  {e.year}
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{e.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{e.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/transmission"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-deep font-bold text-sm hover:bg-amber-400 transition-all"
        >
          Read the Architecture <ArrowRight size={14} />
        </Link>
        <Link
          href="/command-center"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-teal/40 text-teal font-bold text-sm hover:bg-teal/5 transition-all"
        >
          Enter Command Center <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
