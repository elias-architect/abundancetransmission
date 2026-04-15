"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  FileText, Music, Download, LogOut, Play, Pause,
  ExternalLink, Loader2, ChevronRight, Shield
} from "lucide-react";
import Link from "next/link";

type ContentItem = {
  id: string; type: "newsletter" | "music"; title: string;
  description: string | null; file_url: string | null;
  external_url: string | null; created_at: string;
};

function extractSunoId(url: string): string | null {
  const m = url.match(/suno\.com\/(?:song|embed)\/([a-zA-Z0-9-]+)/);
  return m ? m[1] : null;
}

function MusicCard({ item }: { item: ContentItem }) {
  const [open, setOpen] = useState(false);
  const sunoId = item.external_url ? extractSunoId(item.external_url) : null;
  const embedUrl = sunoId ? `https://suno.com/embed/${sunoId}` : item.external_url;

  return (
    <div className="rounded-2xl border border-accent/20 bg-navy/60 overflow-hidden hover:border-accent/40 transition-all">
      <div
        className="p-5 flex items-center gap-4 cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center flex-shrink-0">
          {open ? <Pause size={18} className="text-accent" /> : <Play size={18} className="text-accent" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-white truncate">{item.title}</div>
          {item.description && <div className="text-xs text-slate-400 truncate mt-0.5">{item.description}</div>}
          <div className="text-xs text-slate-600 mt-1">{new Date(item.created_at).toLocaleDateString()}</div>
        </div>
        <ChevronRight size={16} className={`text-slate-600 flex-shrink-0 transition-transform ${open ? "rotate-90" : ""}`} />
      </div>

      {open && embedUrl && (
        <div className="border-t border-border/40 bg-deep/40">
          {sunoId ? (
            <iframe
              src={embedUrl}
              className="w-full"
              height="166"
              allow="autoplay"
              style={{ border: 0 }}
            />
          ) : (
            <div className="p-4">
              <a href={item.external_url!} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-accent hover:underline">
                <ExternalLink size={12} /> Open on Suno
              </a>
            </div>
          )}
          {item.external_url && (
            <div className="px-5 pb-4">
              <a href={item.external_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-accent transition-colors">
                <ExternalLink size={11} /> Open on Suno
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NewsletterCard({ item }: { item: ContentItem }) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    const res = await fetch(`/api/member/download?content_id=${item.id}`);
    if (res.ok) {
      const { url, title } = await res.json();
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.pdf`;
      a.click();
    } else {
      alert("Download failed. Please try again.");
    }
    setDownloading(false);
  }

  return (
    <div className="rounded-2xl border border-teal/20 bg-navy/60 p-5 flex items-center gap-4 hover:border-teal/40 transition-all">
      <div className="w-12 h-12 rounded-xl bg-teal/10 border border-teal/30 flex items-center justify-center flex-shrink-0">
        <FileText size={20} className="text-teal" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-white truncate">{item.title}</div>
        {item.description && <div className="text-xs text-slate-400 truncate mt-0.5">{item.description}</div>}
        <div className="text-xs text-slate-600 mt-1">{new Date(item.created_at).toLocaleDateString()}</div>
      </div>
      <button onClick={handleDownload} disabled={downloading}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal/10 border border-teal/30 text-teal text-xs font-bold hover:bg-teal/20 transition-all disabled:opacity-60 flex-shrink-0">
        {downloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
        {downloading ? "..." : "PDF"}
      </button>
    </div>
  );
}

export default function MemberClient({
  userEmail, userName, isAdmin
}: { userEmail: string; userName: string; isAdmin: boolean }) {
  const [tab, setTab] = useState<"newsletters" | "music">("newsletters");
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/member/content")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setContent(data); })
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const newsletters = content.filter((c) => c.type === "newsletter");
  const music       = content.filter((c) => c.type === "music");
  const display     = tab === "newsletters" ? newsletters : music;

  return (
    <div className="min-h-screen bg-deep">
      {/* Header */}
      <header className="border-b border-border/60 bg-navy/80 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold/80 to-amber-600 flex items-center justify-center text-deep font-black text-xs">A</div>
            <span className="font-bold text-white text-sm hidden sm:block">Abundance Transmission</span>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link href="/admin" className="flex items-center gap-1.5 text-xs text-gold hover:underline">
                <Shield size={12} /> Admin
              </Link>
            )}
            <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-slate-400 hover:text-red-400 transition-colors">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Welcome */}
        <div className="mb-10 space-y-1">
          <div className="text-xs font-bold uppercase tracking-widest text-gold">Member Portal</div>
          <h1 className="text-3xl font-black text-white">
            Welcome{userName ? `, ${userName}` : ""}
          </h1>
          <p className="text-slate-400 text-sm">{userEmail}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-navy/40 rounded-xl p-1 w-fit border border-border">
          <button onClick={() => setTab("newsletters")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === "newsletters" ? "bg-teal/10 text-teal border border-teal/30" : "text-slate-500 hover:text-slate-300"}`}>
            <FileText size={12} /> Newsletters ({newsletters.length})
          </button>
          <button onClick={() => setTab("music")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === "music" ? "bg-accent/10 text-accent border border-accent/30" : "text-slate-500 hover:text-slate-300"}`}>
            <Music size={12} /> Music ({music.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-gold" />
          </div>
        ) : display.length === 0 ? (
          <div className="rounded-2xl border border-border bg-navy/40 p-12 text-center">
            <div className="text-slate-500 text-sm mb-2">
              {tab === "newsletters" ? "No newsletters yet." : "No music posted yet."}
            </div>
            <div className="text-xs text-slate-600">Check back soon — new content is added weekly.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {display.map((item) =>
              item.type === "music"
                ? <MusicCard key={item.id} item={item} />
                : <NewsletterCard key={item.id} item={item} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
