"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import EmailForm from "@/components/email-form";
import { ChartLine, Brain, Sparkles, ArrowRight, BookOpen, Shield, Cpu, Music } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { translations } from "@/lib/translations";

type MusicTrack = { id: string; title: string; description: string | null; external_url: string | null };

function extractSunoId(url: string): string | null {
  const m = url.match(/suno\.com\/song\/([a-zA-Z0-9-]+)/);
  return m ? m[1] : null;
}

const pillarHrefs = ["/arsenal", "/transmission", "/origin"];
const featureIcons = [
  <BookOpen   key="books" size={20} />,
  <Cpu        key="pine"  size={20} />,
  <Shield     key="vault" size={20} />,
  <ChartLine  key="cc"    size={20} />,
];

export default function HomeContent() {
  const { lang } = useLang();
  const h = translations[lang].hero;
  const f = translations[lang].form;
  const [tracks, setTracks] = useState<MusicTrack[]>([]);

  useEffect(() => {
    fetch("/api/music").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setTracks(data);
    }).catch(() => {});
  }, []);

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-deep-gradient" />
        <div className="absolute inset-0 water-shimmer" />
        <div className="spiral-ornament absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold/4 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-semibold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            {h.badge}
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none">
              <span className="text-white">{h.title1}</span>
              <br />
              <span className="gold-text gold-text-animate">{h.title2}</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 font-light italic tracking-wide">{h.tagline}</p>
          </div>
          <p className="text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {h.sub} <br className="hidden sm:block" /> {h.subLine2}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/transmission"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gold text-deep font-bold text-sm tracking-wide hover:bg-amber-400 transition-all shadow-lg shadow-gold/20">
              <Sparkles size={16} /> {h.cta1}
            </Link>
            <Link href="/command-center"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-teal/40 bg-teal/5 text-teal font-bold text-sm tracking-wide hover:bg-teal/10 transition-all">
              <ChartLine size={16} /> {h.cta2}
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-5 h-8 rounded-full border border-slate-600 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-slate-500 rounded-full" />
          </div>
        </div>
      </section>

      {/* Niko Soul ID video */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 space-y-3">
            <div className="text-xs font-bold uppercase tracking-widest text-teal">Niko Soul ID</div>
            <h2 className="text-3xl font-bold text-white">{h.videoTitle}</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">{h.videoSub}</p>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-border panel-glow bg-navy aspect-video flex items-center justify-center">
            <div className="absolute inset-0 water-shimmer" />
            <div className="relative z-10 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto animate-float">
                <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-gold border-b-[12px] border-b-transparent ml-1" />
              </div>
              <div className="text-slate-400 text-sm">Niko Soul ID — Higgsfield Video</div>
              <div className="text-xs text-slate-600">{h.videoPending}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Music Player */}
      {tracks.length > 0 && (
        <section className="py-16 px-4 border-t border-border/40">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10 space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal">
                <Music size={14} /> Abundance Transmission Music
              </div>
              <h2 className="text-3xl font-bold text-white">Sound &amp; Frequency</h2>
              <p className="text-slate-400 text-sm">Original transmissions — listen directly below</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {tracks.map((track) => {
                const songId = track.external_url ? extractSunoId(track.external_url) : null;
                return (
                  <div key={track.id} className="rounded-2xl border border-border bg-navy panel-glow overflow-hidden flex flex-col">
                    {songId ? (
                      <iframe
                        src={`https://suno.com/embed/${songId}`}
                        className="w-full"
                        style={{ height: 152 }}
                        allow="autoplay"
                        title={track.title}
                      />
                    ) : (
                      <div className="h-[152px] flex items-center justify-center bg-border/20">
                        <Music size={32} className="text-slate-600" />
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col gap-1">
                      <div className="text-sm font-bold text-white truncate">{track.title}</div>
                      {track.description && (
                        <div className="text-xs text-slate-400 line-clamp-2">{track.description}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Three pillars */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-gold">{h.pillarsTitle}</div>
            <h2 className="text-3xl font-bold text-white">{h.pillarsSub}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {h.pillars.map((p, i) => (
              <div key={p.title} className="relative rounded-2xl border border-border bg-navy p-7 flex flex-col gap-5 panel-glow group hover:border-gold/20 transition-all">
                <div className="w-12 h-12 rounded-xl bg-border/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {i === 0 ? <ChartLine size={24} className="text-gold" /> : i === 1 ? <Brain size={24} className="text-teal" /> : <Sparkles size={24} className="text-accent" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-2">{p.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
                <Link href={pillarHrefs[i]} className="mt-auto inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-gold transition-colors">
                  {p.link} <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="py-16 px-4 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {h.features.map((feat, i) => (
              <div key={feat.label} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-border/60 flex items-center justify-center text-gold">
                  {featureIcons[i]}
                </div>
                <div className="text-sm font-bold text-white">{feat.label}</div>
                <div className="text-xs text-slate-500">{feat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Early access */}
      <section id="early-access" className="py-24 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="relative rounded-3xl border border-gold/20 bg-navy panel-glow p-10 text-center space-y-6 overflow-hidden">
            <div className="absolute inset-0 water-shimmer opacity-50" />
            <div className="relative z-10 space-y-6">
              <div className="text-xs font-bold uppercase tracking-widest text-gold">{h.stewardBadge}</div>
              <h2 className="text-3xl font-bold text-white">{h.earlyTitle}</h2>
              <p className="text-slate-400 text-sm leading-relaxed">{h.earlySub}</p>
              <EmailForm label="" placeholder={translations[lang].form.placeholder} ctaText={f.cta} />
              <p className="text-xs text-slate-600">{h.earlySmall}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
