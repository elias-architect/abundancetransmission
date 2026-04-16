"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  FileText, Music, Download, LogOut, Play, Pause,
  ExternalLink, Loader2, ChevronRight, Shield, Sparkles,
  Star, Calendar, Clock, MapPin, StickyNote, Send
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

// ── Soul Calibration Tab ──────────────────────────────────────────────────────
type BirthProfile = {
  dob: string | null; birth_time: string | null;
  birth_place: string | null; birth_notes: string | null;
};
type CalibrationTrack = {
  id: string; title: string; description: string | null;
  external_url: string | null; calibration_status: string; created_at: string;
};

function SoulCalibrationTab({ userEmail }: { userEmail: string }) {
  const [birthProfile, setBirthProfile] = useState<BirthProfile>({ dob: "", birth_time: "", birth_place: "", birth_notes: "" });
  const [tracks, setTracks]             = useState<CalibrationTrack[]>([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [requested, setRequested]       = useState(false);
  const [msg, setMsg]                   = useState("");

  useEffect(() => {
    fetch("/api/member/calibration")
      .then((r) => r.json())
      .then((data) => {
        if (data.birth_profile) setBirthProfile(data.birth_profile);
        if (Array.isArray(data.tracks)) setTracks(data.tracks);
        if (data.tracks?.some((t: CalibrationTrack) => t.calibration_status === "pending" || t.calibration_status === "ready")) {
          setRequested(true);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(generate: boolean) {
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/member/calibration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...birthProfile, request_generation: generate }),
    });
    if (res.ok) {
      setMsg(generate ? "✓ Request sent! Your calibration tracks will be ready within 24 hours." : "✓ Birth data saved.");
      if (generate) setRequested(true);
    } else {
      setMsg("Something went wrong. Please try again.");
    }
    setSaving(false);
  }

  const approvedTracks = tracks.filter((t) => t.calibration_status === "ready" || t.calibration_status === "approved");
  const pendingTracks  = tracks.filter((t) => t.calibration_status === "pending");

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gold" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Header */}
      <div className="rounded-2xl border border-gold/20 bg-navy/60 p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Star size={16} className="text-gold" />
            <span className="text-xs font-bold uppercase tracking-widest text-gold">Soul Calibration</span>
          </div>
          <h2 className="text-xl font-black text-white mb-2">Your Frequency Blueprint</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Enter your birth details below. We will create 1–2 personalized calibration tracks aligned to your soul frequency — designed to elevate and align your energy field.
          </p>
        </div>
      </div>

      {/* Birth Data Form */}
      <div className="rounded-2xl border border-border bg-navy/60 p-6 space-y-4">
        <h3 className="text-sm font-bold text-white">Your Birth Details</h3>

        <div className="space-y-3">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1.5">
              <Calendar size={12} /> Date of Birth
            </label>
            <input type="date" value={birthProfile.dob ?? ""} onChange={(e) => setBirthProfile((p) => ({ ...p, dob: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-deep border border-border text-white text-sm outline-none focus:border-gold/50 transition-colors" />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1.5">
              <Clock size={12} /> Birth Time <span className="text-slate-600 font-normal">(optional — as close as you remember)</span>
            </label>
            <input type="time" value={birthProfile.birth_time ?? ""} onChange={(e) => setBirthProfile((p) => ({ ...p, birth_time: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-deep border border-border text-white text-sm outline-none focus:border-gold/50 transition-colors" />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1.5">
              <MapPin size={12} /> Place of Birth <span className="text-slate-600 font-normal">(city, country)</span>
            </label>
            <input type="text" value={birthProfile.birth_place ?? ""} onChange={(e) => setBirthProfile((p) => ({ ...p, birth_place: e.target.value }))}
              placeholder="e.g. Paris, France"
              className="w-full px-4 py-3 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50 transition-colors" />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1.5">
              <StickyNote size={12} /> Any notes <span className="text-slate-600 font-normal">(feelings, intentions, what you want to align)</span>
            </label>
            <textarea value={birthProfile.birth_notes ?? ""} onChange={(e) => setBirthProfile((p) => ({ ...p, birth_notes: e.target.value }))}
              placeholder="e.g. I want to feel more grounded, attract abundance, release old patterns..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50 transition-colors resize-none" />
          </div>
        </div>

        {msg && <p className={`text-xs ${msg.startsWith("✓") ? "text-teal" : "text-red-400"}`}>{msg}</p>}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button onClick={() => handleSave(false)} disabled={saving}
            className="flex-1 py-3 rounded-xl border border-border text-slate-400 text-sm font-bold hover:border-slate-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : null} Save Details
          </button>
          <button onClick={() => handleSave(true)} disabled={saving || requested}
            className="flex-1 py-3 rounded-xl bg-gold text-deep text-sm font-black hover:bg-amber-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            <Sparkles size={14} />
            {requested ? "Request Sent ✓" : "Generate Free Sample"}
          </button>
        </div>
      </div>

      {/* Pending state */}
      {pendingTracks.length > 0 && approvedTracks.length === 0 && (
        <div className="rounded-2xl border border-gold/20 bg-gold/5 p-6 text-center space-y-2">
          <Loader2 size={20} className="animate-spin text-gold mx-auto" />
          <p className="text-sm font-bold text-white">Your calibration tracks are being prepared</p>
          <p className="text-xs text-slate-400">Niko is personally crafting your frequency blueprint. You will receive an email when they are ready — usually within 24 hours.</p>
        </div>
      )}

      {/* Ready tracks */}
      {approvedTracks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gold">Your Calibration Tracks</h3>
          {approvedTracks.map((track) => {
            const sunoId = track.external_url ? track.external_url.match(/suno\.com\/(?:song|embed)\/([a-zA-Z0-9-]+)/)?.[1] : null;
            return (
              <div key={track.id} className="rounded-2xl border border-gold/20 bg-navy/60 overflow-hidden">
                {sunoId && (
                  <iframe src={`https://suno.com/embed/${sunoId}`} className="w-full" height="166" allow="autoplay" style={{ border: 0 }} />
                )}
                <div className="p-4">
                  <div className="text-sm font-bold text-white">{track.title}</div>
                  {track.description && <div className="text-xs text-slate-400 mt-1">{track.description}</div>}
                </div>
              </div>
            );
          })}

          {/* Upgrade prompt */}
          <div className="rounded-2xl border border-gold/30 bg-navy p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="text-xs font-bold uppercase tracking-widest text-gold">Elevate Your Practice</div>
              <h3 className="text-lg font-black text-white">Continue your frequency journey</h3>
              <p className="text-xs text-slate-400">Your free sample showed what's possible. Go deeper with a full calibration plan.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-deep p-4 space-y-3">
                <div className="text-xs font-bold uppercase tracking-widest text-teal">Weekly</div>
                <div className="text-2xl font-black text-white">€9<span className="text-sm font-normal text-slate-400">/week</span></div>
                <div className="text-xs text-slate-400 leading-relaxed">One full week of personalized calibration songs — new tracks every 7 days.</div>
                <a href="mailto:niko@abundancetransmission.com?subject=Soul Calibration — Weekly Plan"
                  className="block text-center py-2.5 rounded-lg bg-teal/10 border border-teal/30 text-teal text-xs font-bold hover:bg-teal/20 transition-all">
                  Start Weekly Plan →
                </a>
              </div>
              <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 space-y-3 relative">
                <div className="absolute -top-2 right-3 bg-gold text-deep text-xs font-black px-2 py-0.5 rounded-full">Best Value</div>
                <div className="text-xs font-bold uppercase tracking-widest text-gold">Monthly</div>
                <div className="text-2xl font-black text-white">€27<span className="text-sm font-normal text-slate-400">/month</span></div>
                <div className="text-xs text-slate-400 leading-relaxed">Unlimited albums and songs — full access to your complete frequency library.</div>
                <a href="mailto:niko@abundancetransmission.com?subject=Soul Calibration — Monthly Subscription"
                  className="block text-center py-2.5 rounded-lg bg-gold text-deep text-xs font-black hover:bg-amber-400 transition-all">
                  Start Monthly →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MemberClient({
  userEmail, userName, isAdmin
}: { userEmail: string; userName: string; isAdmin: boolean }) {
  const [tab, setTab] = useState<"newsletters" | "music" | "calibration">("newsletters");
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
        <div className="flex gap-1 mb-8 bg-navy/40 rounded-xl p-1 w-fit border border-border flex-wrap">
          <button onClick={() => setTab("newsletters")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === "newsletters" ? "bg-teal/10 text-teal border border-teal/30" : "text-slate-500 hover:text-slate-300"}`}>
            <FileText size={12} /> Newsletters ({newsletters.length})
          </button>
          <button onClick={() => setTab("music")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === "music" ? "bg-accent/10 text-accent border border-accent/30" : "text-slate-500 hover:text-slate-300"}`}>
            <Music size={12} /> Music ({music.length})
          </button>
          <button onClick={() => setTab("calibration")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === "calibration" ? "bg-gold/10 text-gold border border-gold/30" : "text-slate-500 hover:text-slate-300"}`}>
            <Star size={12} /> Soul Calibration
          </button>
        </div>

        {/* Content */}
        {tab === "calibration" ? (
          <SoulCalibrationTab userEmail={userEmail} />
        ) : loading ? (
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
