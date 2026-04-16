"use client";

import { useState } from "react";
import { Sparkles, Mic, FileText, Instagram, Music, ChevronDown, ChevronUp, Check, Loader2 } from "lucide-react";

type Transmission = {
  id: string;
  blog_post: string;
  newsletter: string;
  instagram_caption: string;
  tiktok_caption: string;
  audio_url: string | null;
};

type CopiedKey = "blog" | "newsletter" | "instagram" | "tiktok" | null;

export default function TransmissionsPage() {
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState<Transmission | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [expanded, setExpanded]     = useState<string | null>("instagram");
  const [copied, setCopied]         = useState<CopiedKey>(null);
  const [step, setStep]             = useState("");

  async function generate() {
    if (!input.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setStep("Channeling through the ELIAS Council…");

    try {
      setStep("Generating written content…");
      const res = await fetch("/api/admin/transmissions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput: input }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data.transmission);
      setStep("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStep("");
    } finally {
      setLoading(false);
    }
  }

  function copy(text: string, key: CopiedKey) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const toggle = (key: string) => setExpanded(expanded === key ? null : key);

  return (
    <div className="min-h-screen bg-deep text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-gold" />
            <span className="text-xs font-bold uppercase tracking-widest text-gold">Transmission Pipeline</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Speak the Vision</h1>
          <p className="text-sm text-slate-400">Share a transmission. The system creates everything else.</p>
        </div>

        {/* Input */}
        <div className="rounded-2xl border border-border bg-navy/60 p-6 mb-6">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Share the transmission from the Library…&#10;&#10;e.g. The soul does not fear death. It fears forgetting. Every struggle you have faced was not punishment — it was the Library writing its most important chapters through you."
            rows={7}
            className="w-full bg-transparent text-slate-200 text-sm leading-relaxed placeholder:text-slate-600 resize-none outline-none"
          />
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/60">
            <span className="text-xs text-slate-600">{input.length} characters</span>
            <button
              onClick={generate}
              disabled={loading || !input.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-deep disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:opacity-90"
              style={{ background: "linear-gradient(90deg,#f59e0b,#fde68a)" }}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {loading ? step : "Generate Everything"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4 mb-6 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-3">

            {/* Instagram */}
            <ResultCard
              icon={<Instagram size={14} />}
              label="Instagram Caption"
              id="instagram"
              expanded={expanded}
              toggle={toggle}
              text={result.instagram_caption}
              copyKey="instagram"
              copied={copied}
              onCopy={copy}
            />

            {/* TikTok */}
            <ResultCard
              icon={<Music size={14} />}
              label="TikTok / Reels Caption"
              id="tiktok"
              expanded={expanded}
              toggle={toggle}
              text={result.tiktok_caption}
              copyKey="tiktok"
              copied={copied}
              onCopy={copy}
            />

            {/* Newsletter */}
            <ResultCard
              icon={<FileText size={14} />}
              label="Newsletter"
              id="newsletter"
              expanded={expanded}
              toggle={toggle}
              text={result.newsletter}
              copyKey="newsletter"
              copied={copied}
              onCopy={copy}
            />

            {/* Blog Post */}
            <ResultCard
              icon={<FileText size={14} />}
              label="Blog Post"
              id="blog"
              expanded={expanded}
              toggle={toggle}
              text={result.blog_post}
              copyKey="blog"
              copied={copied}
              onCopy={copy}
            />

            {/* Audio */}
            {result.audio_url && (
              <div className="rounded-2xl border border-border bg-navy/60 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Mic size={14} className="text-gold" />
                  <span className="text-xs font-bold uppercase tracking-widest text-gold">Voice Narration</span>
                </div>
                <audio controls className="w-full" src={result.audio_url} />
                <a
                  href={result.audio_url}
                  download
                  className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-gold transition-colors"
                >
                  Download MP3
                </a>
              </div>
            )}

            {/* Reset */}
            <button
              onClick={() => { setResult(null); setInput(""); }}
              className="w-full mt-2 py-3 rounded-xl border border-border text-slate-500 text-sm hover:text-white hover:border-slate-600 transition-all"
            >
              New Transmission
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({
  icon, label, id, expanded, toggle, text, copyKey, copied, onCopy
}: {
  icon: React.ReactNode;
  label: string;
  id: string;
  expanded: string | null;
  toggle: (id: string) => void;
  text: string;
  copyKey: CopiedKey;
  copied: CopiedKey;
  onCopy: (text: string, key: CopiedKey) => void;
}) {
  const isOpen = expanded === id;
  return (
    <div className="rounded-2xl border border-border bg-navy/60 overflow-hidden">
      <button
        onClick={() => toggle(id)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2 text-gold">
          {icon}
          <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
        </div>
        {isOpen ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
      </button>
      {isOpen && (
        <div className="px-5 pb-5">
          <pre className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">{text}</pre>
          <button
            onClick={() => onCopy(text, copyKey)}
            className="mt-4 flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border border-gold/30 text-gold hover:bg-gold/10 transition-all"
          >
            {copied === copyKey ? <Check size={12} /> : null}
            {copied === copyKey ? "Copied!" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}
