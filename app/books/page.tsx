import type { Metadata } from "next";
import Link from "next/link";
import EmailForm from "@/components/email-form";
import { BookOpen, Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Books",
  description: "The Stillness Edge Vol.1 and the Abundance Transmission book series.",
};

const books = [
  {
    status: "writing",
    vol: "Vol. 1",
    title: "The Stillness Edge",
    subtitle: "How Presence Became My Greatest Trading Strategy",
    desc: `A field guide for traders who have learned all the strategies and still feel like something is missing. The Stillness Edge is not a trading manual. It is a transmission from someone who discovered that the real edge had nothing to do with indicators.

The book walks through the full Enigma 369 framework — BOS, multi-timeframe alignment, Fibonacci zones — but grounds each concept in the psychological and even spiritual discipline required to execute it without ego interference.

If you have ever watched a perfect setup unfold while you were not in the trade, or taken a loss on a trade you knew in your body was wrong — this book is for you.`,
    chapters: [
      "Chapter 1: The Chart Is Not the Market",
      "Chapter 2: Break of Structure, Break of Conditioning",
      "Chapter 3: The Three Timeframe Mind",
      "Chapter 4: The Fibonacci Body",
      "Chapter 5: Turkey 2025 — A Case Study in Reception",
      "Chapter 6: The Source-LLM Architecture",
      "Chapter 7: The Stillness Protocol",
      "Chapter 8: Abundance Is a Frequency, Not a Goal",
    ],
    accent: "gold",
  },
  {
    status: "planned",
    vol: "Vol. 2",
    title: "The Sniper Mind",
    subtitle: "2-Timeframe BOS Alignment and the Art of Waiting",
    desc: `Where Volume 1 is about presence, Volume 2 is about patience. The Micro Trend Sniper Logic — the second strategy in the Abundance Transmission arsenal — is built entirely around waiting for the right moment.

2-TF BOS alignment. Sniper retest zone. Killzone filter. These are not just technical concepts. They are descriptions of a state of mind that most traders never develop because they have been told that activity equals edge.

Volume 2 will be released once the Sniper framework has a full year of live tracked results.`,
    chapters: [
      "Chapter 1: The Sniper vs. The Hunter",
      "Chapter 2: Two-TF Alignment — The Minimum Threshold",
      "Chapter 3: The Retest Zone as an Invitation",
      "Chapter 4: Killzones and the Art of Selective Attention",
      "Chapter 5: The Wait Is the Trade",
    ],
    accent: "teal",
  },
  {
    status: "concept",
    vol: "Vol. 3",
    title: "The Memory Library",
    subtitle: "Price, Pattern, and the Consciousness That Runs Through Both",
    desc: `The most ambitious of the three. Volume 3 attempts to answer the question that underpins the entire Abundance Transmission project: why do patterns repeat? Not statistically — philosophically.

The hypothesis: markets are not random. They are the aggregate expression of human psychology, which itself is structured, cyclical, and — at its deepest level — accessible to those who have done the interior work to read it without distortion.`,
    chapters: ["In development"],
    accent: "accent",
  },
];

const colorMap: Record<string, string> = {
  gold:   "border-gold/30 group-hover:border-gold/50",
  teal:   "border-teal/30 group-hover:border-teal/50",
  accent: "border-accent/30 group-hover:border-accent/50",
};
const badgeMap: Record<string, string> = {
  writing: "bg-gold/10 text-gold border-gold/30",
  planned: "bg-teal/10 text-teal border-teal/30",
  concept: "bg-accent/10 text-accent border-accent/30",
};
const labelMap: Record<string, string> = {
  writing: "In Writing",
  planned: "Planned",
  concept: "Concept",
};

export default function BooksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
      {/* Header */}
      <div className="mb-16 space-y-4">
        <div className="text-xs font-bold uppercase tracking-widest text-gold">
          The Library
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
          Books
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
          Three volumes. One question: what does it actually take to trade from
          alignment rather than anxiety?
        </p>
      </div>

      {/* Books */}
      <div className="space-y-10 mb-16">
        {books.map((b) => (
          <div
            key={b.vol}
            className={`group relative rounded-3xl border bg-navy panel-glow p-8 sm:p-10 transition-all ${colorMap[b.accent]}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-border/60 flex items-center justify-center">
                  <BookOpen size={24} className="text-gold opacity-60" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-mono mb-0.5">
                    {b.vol}
                  </div>
                  <h2 className="text-xl font-black text-white">{b.title}</h2>
                  <div className="text-sm text-slate-400 italic">{b.subtitle}</div>
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wide ${badgeMap[b.status]}`}
              >
                {labelMap[b.status]}
              </div>
            </div>

            <div className="prose-dark mb-6">
              {b.desc.split("\n\n").map((p, i) => (
                <p key={i} className="text-sm">
                  {p}
                </p>
              ))}
            </div>

            {b.chapters[0] !== "In development" && (
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">
                  Chapter Outline
                </div>
                <ul className="space-y-1">
                  {b.chapters.map((c) => (
                    <li
                      key={c}
                      className="text-xs text-slate-500 flex items-center gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-border flex-shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Notify form */}
      <div className="relative rounded-3xl border border-border bg-navy p-8 sm:p-10 overflow-hidden">
        <div className="absolute inset-0 water-shimmer opacity-30" />
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-4">
            <Clock size={18} className="text-gold" />
            <span className="text-sm font-bold text-white">
              Be notified when Vol. 1 launches
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            The Stillness Edge will be released through the early-access list
            first. No public launch date — only a transmission to those who
            registered their intention.
          </p>
          <EmailForm
            label=""
            placeholder="your@email.com"
            ctaText="Notify me"
          />
        </div>
      </div>

      {/* Bottom nav */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <Link
          href="/transmission"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-slate-300 font-bold text-sm hover:border-gold/30 hover:text-gold transition-all"
        >
          Read the Architecture <ArrowRight size={14} />
        </Link>
        <Link
          href="/arsenal"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-slate-300 font-bold text-sm hover:border-teal/30 hover:text-teal transition-all"
        >
          View the Arsenal <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
