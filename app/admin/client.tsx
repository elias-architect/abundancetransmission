"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, PenLine, Users, Settings, LogOut,
  FileText, Music, Video, Upload, Link2, Send, Trash2,
  Mail, Download, Play, Eye, EyeOff, TrendingUp, Shield,
  Loader2, Check, X, ChevronRight, Bell, Lock, Save,
  BarChart3, Activity, Star, Instagram, Heart, MessageCircle, Telescope,
  BookOpen, BookMarked, DollarSign, Globe, RefreshCw,
  Radio, ChevronUp, ChevronDown, ToggleLeft, ToggleRight, Sparkles
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
type Tab = "overview" | "compose" | "members" | "calibration" | "instagram" | "books" | "radio" | "settings" | "transmissions";
type ContentType = "newsletter" | "music" | "video";
type ContentItem = {
  id: string; type: ContentType; title: string;
  description: string | null; file_url: string | null;
  external_url: string | null; body_html: string | null;
  published: boolean; created_at: string;
};
type Member = {
  id: string; email: string; full_name: string | null;
  joined: string; last_sign_in: string | null;
  downloads: number; plays: number;
};
type Stats = {
  total_members: number; active_members: number;
  total_content: number; newsletters: number;
  music: number; total_downloads: number;
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: number | string;
  sub?: string; color: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-navy/60 p-5">
      <div className={`w-9 h-9 rounded-xl bg-border/60 flex items-center justify-center mb-3 ${color}`}>
        {icon}
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gold mt-1">{sub}</div>}
    </div>
  );
}

// ── Formatting toolbar ────────────────────────────────────────────────────────
function FormatBar({ onFormat }: { onFormat: (tag: string) => void }) {
  const btns = [
    { label: "B", tag: "bold", title: "Bold" },
    { label: "I", tag: "italic", title: "Italic" },
    { label: "H2", tag: "h2", title: "Heading" },
    { label: "¶", tag: "p", title: "Paragraph" },
    { label: "•", tag: "ul", title: "List" },
    { label: "❝", tag: "blockquote", title: "Quote" },
  ];
  return (
    <div className="flex gap-1 mb-2 flex-wrap">
      {btns.map((b) => (
        <button key={b.tag} type="button" title={b.title}
          onClick={() => onFormat(b.tag)}
          className="px-2.5 py-1 rounded-lg bg-border/60 text-slate-400 hover:text-white hover:bg-border text-xs font-bold transition-all">
          {b.label}
        </button>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminClient({ adminEmail, adminName }: { adminEmail: string; adminName: string }) {
  const [tab, setTab] = useState<Tab>("overview");

  // Data
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [topContent, setTopContent] = useState<(ContentItem & { downloads: number })[]>([]);
  const [loading, setLoading] = useState(true);

  // Compose
  const [cType,    setCType]    = useState<ContentType>("newsletter");
  const [cTitle,   setCTitle]   = useState("");
  const [cDesc,    setCDesc]    = useState("");
  const [cBody,    setCBody]    = useState("");
  const [cUrl,     setCUrl]     = useState("");
  const [cFile,    setCFile]    = useState<File | null>(null);
  const [cNotify,  setCNotify]  = useState(true);
  const [posting,  setPosting]  = useState(false);
  const [postOk,   setPostOk]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // Members
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName,  setInviteName]  = useState("");
  const [inviting,    setInviting]    = useState(false);
  const [inviteMsg,   setInviteMsg]   = useState("");

  // Settings
  const [ccPassword,    setCcPassword]    = useState("");
  const [ccConfirm,     setCcConfirm]     = useState("");
  const [savingPw,      setSavingPw]      = useState(false);
  const [pwMsg,         setPwMsg]         = useState("");
  const [showPw,        setShowPw]        = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);

  // Calibration
  type CalibrationRequest = {
    id: string; title: string; description: string | null;
    calibration_user_id: string; calibration_status: string;
    external_url: string | null; created_at: string;
  };
  const [calibrations,    setCalibrations]    = useState<CalibrationRequest[]>([]);
  const [calLoading,      setCalLoading]      = useState(false);
  const [calUrls,         setCalUrls]         = useState<Record<string, string>>({});
  const [calPosting,      setCalPosting]      = useState<Record<string, boolean>>({});
  const [calMsg,          setCalMsg]          = useState<Record<string, string>>({});

  // Instagram
  type IGPost = {
    id: string; caption?: string; media_type: string;
    media_url?: string; thumbnail_url?: string; permalink: string;
    timestamp: string; like_count: number; comments_count: number;
    reach?: number; impressions?: number; saved?: number;
  };
  const [igPosts,      setIgPosts]      = useState<IGPost[]>([]);
  const [igFollowers,  setIgFollowers]  = useState(0);
  const [igMediaCount, setIgMediaCount] = useState(0);
  const [igLoading,    setIgLoading]    = useState(false);
  const [igError,      setIgError]      = useState("");

  // Books
  type BookItem = {
    id: string; slug: string; title: string; tagline: string | null;
    author_agent: string; author_name: string | null;
    description: string | null; cover_image_url: string | null;
    preview_chapter_title: string | null; preview_chapter_content: string | null;
    chapters: { title: string; content?: string }[];
    price: number; status: string; created_at: string;
  };
  const [books,       setBooks]      = useState<BookItem[]>([]);
  const [booksLoad,   setBooksLoad]  = useState(false);
  const [bookAction,  setBookAction] = useState<Record<string, boolean>>({});
  const [bookMsg,     setBookMsg]    = useState<Record<string, string>>({});

  // Radio
  type TrackItem = {
    id: string; title: string; artist: string;
    audio_url: string; cover_url: string | null;
    active: boolean; sort_order: number; created_at: string;
  };
  const [tracks,       setAdminTracks]  = useState<TrackItem[]>([]);
  const [tracksLoading,setTracksLoading]= useState(false);
  const [tTitle,       setTTitle]       = useState("");
  const [tArtist,      setTArtist]      = useState("");
  const [tUrl,         setTUrl]         = useState("");
  const [tCover,       setTCover]       = useState("");
  const [tFile,        setTFile]        = useState<File | null>(null);
  const [tPosting,     setTPosting]     = useState(false);
  const [tMsg,         setTMsg]         = useState("");
  const trackFileRef = useRef<HTMLInputElement>(null);

  async function loadTracks() {
    setTracksLoading(true);
    const res = await fetch("/api/admin/tracks");
    if (res.ok) setAdminTracks(await res.json());
    setTracksLoading(false);
  }

  async function handleAddTrack(e: React.FormEvent) {
    e.preventDefault();
    if (!tTitle.trim()) return;
    setTPosting(true); setTMsg("");

    let audio_url = tUrl.trim();

    // Upload file directly to Supabase (bypasses Vercel 4.5 MB limit)
    if (tFile) {
      // Step 1 — get a signed upload URL from our server
      const signRes = await fetch("/api/admin/tracks/upload", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ filename: tFile.name, mimeType: tFile.type }),
      });
      const signData = await signRes.json();
      if (!signRes.ok) { setTMsg("Upload failed: " + (signData.error ?? "Unknown error")); setTPosting(false); return; }

      // Step 2 — upload the binary directly to Supabase (no Vercel size limit)
      const putRes = await fetch(signData.signedUrl, {
        method:  "PUT",
        headers: { "Content-Type": signData.mimeType },
        body:    tFile,
      });
      if (!putRes.ok) {
        const errText = await putRes.text();
        setTMsg("Upload failed: " + errText);
        setTPosting(false);
        return;
      }
      audio_url = signData.publicUrl;
    }

    if (!audio_url) { setTMsg("Provide a file or URL."); setTPosting(false); return; }

    const res = await fetch("/api/admin/tracks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: tTitle, artist: tArtist || "Abundance Transmission", audio_url, cover_url: tCover || null }),
    });
    const data = await res.json();
    setTPosting(false);
    if (res.ok) {
      setTMsg("✓ Track added");
      setTTitle(""); setTArtist(""); setTUrl(""); setTCover(""); setTFile(null);
      if (trackFileRef.current) trackFileRef.current.value = "";
      loadTracks();
      setTimeout(() => setTMsg(""), 3000);
    } else {
      setTMsg("Error: " + (data.error ?? "Failed"));
    }
  }

  async function handleToggleTrack(id: string, active: boolean) {
    await fetch("/api/admin/tracks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !active }),
    });
    loadTracks();
  }

  async function handleDeleteTrack(id: string) {
    if (!confirm("Remove this track from the radio?")) return;
    await fetch(`/api/admin/tracks?id=${id}`, { method: "DELETE" });
    loadTracks();
  }

  async function handleReorderTrack(id: string, direction: "up" | "down") {
    const idx = tracks.findIndex((t) => t.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= tracks.length) return;
    const a = tracks[idx];
    const b = tracks[swapIdx];
    await Promise.all([
      fetch("/api/admin/tracks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: a.id, sort_order: b.sort_order }) }),
      fetch("/api/admin/tracks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: b.id, sort_order: a.sort_order }) }),
    ]);
    loadTracks();
  }

  useEffect(() => { if (tab === "radio") loadTracks(); }, [tab]);

  async function loadData() {
    setLoading(true);
    const [analyticsRes, contentRes] = await Promise.all([
      fetch("/api/admin/analytics"),
      fetch("/api/admin/content"),
    ]);
    const analytics = await analyticsRes.json();
    const contentData = await contentRes.json();
    if (analytics.stats) {
      setStats(analytics.stats);
      setMembers(analytics.members ?? []);
      setTopContent(analytics.top_content ?? []);
    }
    if (Array.isArray(contentData)) setContent(contentData);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function loadCalibrations() {
    setCalLoading(true);
    const res = await fetch("/api/admin/calibration");
    if (res.ok) {
      const data = await res.json();
      setCalibrations(Array.isArray(data) ? data : []);
    }
    setCalLoading(false);
  }

  useEffect(() => {
    if (tab === "calibration") loadCalibrations();
  }, [tab]);

  async function loadInstagram() {
    setIgLoading(true); setIgError("");
    const res = await fetch("/api/admin/instagram");
    if (res.ok) {
      const data = await res.json();
      setIgPosts(data.posts ?? []);
      setIgFollowers(data.followers_count ?? 0);
      setIgMediaCount(data.media_count ?? 0);
    } else {
      const data = await res.json();
      setIgError(data.error ?? "Failed to load Instagram data");
    }
    setIgLoading(false);
  }

  useEffect(() => {
    if (tab === "instagram") loadInstagram();
  }, [tab]);

  async function loadBooks() {
    setBooksLoad(true);
    const res = await fetch("/api/admin/books");
    if (res.ok) setBooks(await res.json());
    setBooksLoad(false);
  }

  async function handleBookStatus(id: string, status: string) {
    setBookAction((p) => ({ ...p, [id]: true }));
    const res = await fetch("/api/admin/books", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const msg = status === "published" ? "✓ Published" : status === "rejected" ? "✗ Rejected" : "✓ Updated";
    setBookMsg((p) => ({ ...p, [id]: res.ok ? msg : "Failed" }));
    setBookAction((p) => ({ ...p, [id]: false }));
    if (res.ok) loadBooks();
  }

  async function handleDeleteBook(id: string) {
    if (!confirm("Delete this book permanently?")) return;
    await fetch(`/api/admin/books?id=${id}`, { method: "DELETE" });
    loadBooks();
  }

  useEffect(() => {
    if (tab === "books") loadBooks();
  }, [tab]);

  async function handlePostCalibrationTrack(req: CalibrationRequest) {
    const url = calUrls[req.id];
    if (!url) return;
    setCalPosting((p) => ({ ...p, [req.id]: true }));
    const res = await fetch("/api/admin/calibration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request_id: req.id, external_url: url, calibration_user_id: req.calibration_user_id }),
    });
    const data = await res.json();
    setCalMsg((p) => ({ ...p, [req.id]: res.ok ? "✓ Track posted — member notified" : (data.error ?? "Failed") }));
    setCalPosting((p) => ({ ...p, [req.id]: false }));
    if (res.ok) loadCalibrations();
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  // ── Formatting helper ────────────────────────────────────────────────────────
  function applyFormat(tag: string) {
    const ta = bodyRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const sel   = cBody.substring(start, end);
    let replacement = sel;
    if (tag === "bold")       replacement = `<strong>${sel}</strong>`;
    if (tag === "italic")     replacement = `<em>${sel}</em>`;
    if (tag === "h2")         replacement = `\n<h2>${sel}</h2>\n`;
    if (tag === "p")          replacement = `\n<p>${sel}</p>\n`;
    if (tag === "ul")         replacement = `\n<ul>\n  <li>${sel}</li>\n</ul>\n`;
    if (tag === "blockquote") replacement = `\n<blockquote>${sel}</blockquote>\n`;
    const next = cBody.substring(0, start) + replacement + cBody.substring(end);
    setCBody(next);
  }

  // ── Post content ─────────────────────────────────────────────────────────────
  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!cTitle.trim()) return;
    setPosting(true);

    let file_url = null;
    if (cType === "newsletter" && cFile) {
      const supabase = createClient();
      const path = `${Date.now()}-${cFile.name.replace(/\s+/g, "-")}`;
      const { error: upErr } = await supabase.storage.from("newsletters").upload(path, cFile);
      if (upErr) { alert("Upload failed: " + upErr.message); setPosting(false); return; }
      const { data: urlData } = supabase.storage.from("newsletters").getPublicUrl(path);
      file_url = urlData.publicUrl;
    }

    const res = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: cType,
        title: cTitle,
        description: cDesc || null,
        body_html: cBody || null,
        file_url,
        external_url: (cType === "music" || cType === "video") ? cUrl || null : null,
        notify: cNotify,
      }),
    });

    setPosting(false);
    if (res.ok) {
      setPostOk(true);
      setCTitle(""); setCDesc(""); setCBody(""); setCUrl(""); setCFile(null);
      if (fileRef.current) fileRef.current.value = "";
      loadData();
      setTimeout(() => setPostOk(false), 4000);
    } else {
      const err = await res.json();
      alert("Error: " + err.error);
    }
  }

  // ── Invite member ────────────────────────────────────────────────────────────
  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true); setInviteMsg("");
    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, full_name: inviteName }),
    });
    setInviting(false);
    const data = await res.json();
    setInviteMsg(res.ok ? `✓ Invite sent to ${inviteEmail}` : `Error: ${data.error}`);
    if (res.ok) { setInviteEmail(""); setInviteName(""); loadData(); }
  }

  async function handleRevoke(id: string, email: string) {
    if (!confirm(`Revoke access for ${email}?`)) return;
    await fetch(`/api/admin/invite?id=${id}`, { method: "DELETE" });
    loadData();
  }

  async function handleDeleteContent(id: string) {
    if (!confirm("Delete this content? Members will lose access.")) return;
    await fetch(`/api/admin/content?id=${id}`, { method: "DELETE" });
    loadData();
  }

  // ── Save CC password ─────────────────────────────────────────────────────────
  async function handleSavePw(e: React.FormEvent) {
    e.preventDefault();
    if (ccPassword !== ccConfirm) { setPwMsg("Passwords don't match"); return; }
    if (ccPassword.length < 6) { setPwMsg("Minimum 6 characters"); return; }
    setSavingPw(true); setPwMsg("");
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cc_password: ccPassword }),
    });
    setSavingPw(false);
    setPwMsg(res.ok ? "✓ Password updated" : "Failed to save");
    if (res.ok) { setCcPassword(""); setCcConfirm(""); }
  }

  const navItems: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: "transmissions", icon: <Sparkles size={16} />,        label: "Transmit" },
    { id: "overview",      icon: <LayoutDashboard size={16} />, label: "Overview" },
    { id: "compose",       icon: <PenLine size={16} />,         label: "Compose" },
    { id: "members",       icon: <Users size={16} />,           label: "Members" },
    { id: "calibration",   icon: <Star size={16} />,            label: "Calibration" },
    { id: "instagram",     icon: <Instagram size={16} />,       label: "Instagram" },
    { id: "books",         icon: <BookOpen size={16} />,        label: "Books" },
    { id: "radio",         icon: <Radio size={16} />,           label: "Radio" },
    { id: "settings",      icon: <Settings size={16} />,        label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-deep flex flex-col">
      {/* ── Top bar ── */}
      <header className="border-b border-border/60 bg-navy/80 sticky top-0 z-40 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold/80 to-amber-600 flex items-center justify-center text-deep font-black text-xs">A</div>
            <span className="font-bold text-white text-sm">Admin</span>
            <span className="text-xs text-slate-600 hidden sm:inline">· {adminEmail}</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/member" target="_blank" className="text-xs text-slate-500 hover:text-teal transition-colors flex items-center gap-1">
              <Eye size={12} /> Member view
            </a>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors">
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 gap-6">

        {/* ── Sidebar nav ── */}
        <nav className="w-44 flex-shrink-0 hidden sm:block">
          <div className="sticky top-20 space-y-1">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3 px-3">Dashboard</div>
            {navItems.map((n) => (
              <button key={n.id} onClick={() => setTab(n.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  tab === n.id ? "bg-gold/10 text-gold border border-gold/20" : "text-slate-500 hover:text-white hover:bg-border/40"
                }`}>
                {n.icon} {n.label}
              </button>
            ))}
            <div className="pt-4 border-t border-border/40">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3 px-3">Site</div>
              <a href="/command-center" target="_blank"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-white hover:bg-border/40 transition-all">
                <Shield size={16} /> Command Center
              </a>
            </div>
          </div>
        </nav>

        {/* ── Mobile tabs ── */}
        <div className="sm:hidden flex gap-1 mb-4 w-full">
          {navItems.map((n) => (
            <button key={n.id} onClick={() => setTab(n.id)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${tab === n.id ? "bg-gold/10 text-gold" : "text-slate-600 bg-navy/40"}`}>
              {n.label}
            </button>
          ))}
        </div>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={28} className="animate-spin text-gold" />
            </div>
          ) : (
            <>
              {/* ════ OVERVIEW ════ */}
              {tab === "overview" && (
                <div className="space-y-8">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-gold mb-1">Overview</div>
                    <h1 className="text-2xl font-black text-white">Welcome back, {adminName}</h1>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <StatCard icon={<Users size={16} />}      label="Members"     value={stats?.total_members ?? 0}   color="text-gold" />
                    <StatCard icon={<Activity size={16} />}   label="Active (30d)" value={stats?.active_members ?? 0} color="text-teal" sub="last 30 days" />
                    <StatCard icon={<FileText size={16} />}   label="Newsletters"  value={stats?.newsletters ?? 0}    color="text-teal" />
                    <StatCard icon={<Music size={16} />}      label="Music tracks" value={stats?.music ?? 0}          color="text-accent" />
                    <StatCard icon={<Download size={16} />}   label="Downloads"    value={stats?.total_downloads ?? 0} color="text-slate-400" />
                    <StatCard icon={<BarChart3 size={16} />}  label="Content total" value={stats?.total_content ?? 0} color="text-slate-400" />
                  </div>

                  {/* Top content */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-border bg-navy/60 p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Star size={14} className="text-gold" />
                        <span className="text-sm font-bold text-white">Top Content</span>
                      </div>
                      {topContent.length === 0 ? (
                        <p className="text-xs text-slate-500">No content yet — go to Compose to post.</p>
                      ) : (
                        <div className="space-y-2">
                          {topContent.map((c) => (
                            <div key={c.id} className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0">
                              {c.type === "newsletter" ? <FileText size={13} className="text-teal flex-shrink-0" /> : <Music size={13} className="text-accent flex-shrink-0" />}
                              <span className="text-sm text-white flex-1 truncate">{c.title}</span>
                              <span className="text-xs text-gold flex-shrink-0">{c.downloads} ↓</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Recent members */}
                    <div className="rounded-2xl border border-border bg-navy/60 p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Users size={14} className="text-teal" />
                        <span className="text-sm font-bold text-white">Recent Members</span>
                      </div>
                      {members.length === 0 ? (
                        <p className="text-xs text-slate-500">No members yet — invite from the Members tab.</p>
                      ) : (
                        <div className="space-y-2">
                          {members.slice(0, 5).map((m) => (
                            <div key={m.id} className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0">
                              <div className="w-7 h-7 rounded-full bg-teal/20 text-teal flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {(m.email?.[0] ?? "?").toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-white truncate">{m.full_name || m.email}</div>
                                <div className="text-xs text-slate-600">{m.downloads} downloads · {m.plays} plays</div>
                              </div>
                              <div className="text-xs text-slate-600 flex-shrink-0">
                                {m.last_sign_in ? new Date(m.last_sign_in).toLocaleDateString() : "Never"}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* All content list */}
                  <div className="rounded-2xl border border-border bg-navy/60 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-white">All Content ({content.length})</span>
                      <button onClick={() => setTab("compose")} className="text-xs text-gold hover:underline flex items-center gap-1">
                        <PenLine size={11} /> New post
                      </button>
                    </div>
                    {content.length === 0 ? (
                      <p className="text-xs text-slate-500">Nothing posted yet.</p>
                    ) : (
                      <div className="space-y-1 max-h-60 overflow-y-auto">
                        {content.map((c) => (
                          <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-border/30 group transition-all">
                            {c.type === "newsletter" ? <FileText size={13} className="text-teal flex-shrink-0" />
                             : c.type === "music" ? <Music size={13} className="text-accent flex-shrink-0" />
                             : <Video size={13} className="text-blue-400 flex-shrink-0" />}
                            <span className="text-sm text-white flex-1 truncate">{c.title}</span>
                            <span className="text-xs text-slate-600">{new Date(c.created_at).toLocaleDateString()}</span>
                            <button onClick={() => handleDeleteContent(c.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ════ COMPOSE ════ */}
              {tab === "compose" && (
                <div className="space-y-6">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-gold mb-1">Compose</div>
                    <h1 className="text-2xl font-black text-white">New Post</h1>
                    <p className="text-sm text-slate-500 mt-1">Write a newsletter, post music, or share a video — members are notified automatically.</p>
                  </div>

                  <form onSubmit={handlePost} className="space-y-5">
                    {/* Type selector */}
                    <div className="flex gap-2">
                      {(["newsletter", "music", "video"] as ContentType[]).map((t) => (
                        <button key={t} type="button" onClick={() => setCType(t)}
                          className={`flex-1 py-3 rounded-xl border text-xs font-bold capitalize transition-all flex items-center justify-center gap-2 ${
                            cType === t ? "border-gold/40 bg-gold/10 text-gold" : "border-border text-slate-500 hover:text-slate-300"
                          }`}>
                          {t === "newsletter" ? <FileText size={13} /> : t === "music" ? <Music size={13} /> : <Video size={13} />}
                          {t}
                        </button>
                      ))}
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5 font-semibold uppercase tracking-wide">Title *</label>
                      <input value={cTitle} onChange={(e) => setCTitle(e.target.value)} required
                        placeholder={cType === "newsletter" ? "Issue #1 — The Stillness Protocol" : cType === "music" ? "Track title" : "Video title"}
                        className="w-full px-4 py-3 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50 font-semibold" />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5 font-semibold uppercase tracking-wide">Short description</label>
                      <input value={cDesc} onChange={(e) => setCDesc(e.target.value)}
                        placeholder="One-line preview shown in the email and member portal"
                        className="w-full px-4 py-3 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50" />
                    </div>

                    {/* Newsletter body */}
                    {cType === "newsletter" && (
                      <div>
                        <label className="block text-xs text-slate-500 mb-1.5 font-semibold uppercase tracking-wide">Body (HTML supported)</label>
                        <FormatBar onFormat={applyFormat} />
                        <textarea ref={bodyRef} value={cBody} onChange={(e) => setCBody(e.target.value)} rows={14}
                          placeholder="Write your newsletter here... You can use HTML tags or the formatting buttons above."
                          className="w-full px-4 py-3 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50 resize-y font-mono leading-relaxed" />
                        {cBody && (
                          <details className="mt-2">
                            <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-300">Preview</summary>
                            <div className="mt-2 p-4 rounded-xl bg-navy/60 border border-border prose-dark text-sm"
                              dangerouslySetInnerHTML={{ __html: cBody }} />
                          </details>
                        )}
                      </div>
                    )}

                    {/* PDF upload (newsletter) */}
                    {cType === "newsletter" && (
                      <div>
                        <label className="block text-xs text-slate-500 mb-1.5 font-semibold uppercase tracking-wide flex items-center gap-1.5">
                          <Upload size={11} /> PDF attachment (optional)
                        </label>
                        <input ref={fileRef} type="file" accept=".pdf"
                          onChange={(e) => setCFile(e.target.files?.[0] ?? null)}
                          className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gold/10 file:text-gold hover:file:bg-gold/20 cursor-pointer" />
                      </div>
                    )}

                    {/* Music / video URL */}
                    {(cType === "music" || cType === "video") && (
                      <div>
                        <label className="block text-xs text-slate-500 mb-1.5 font-semibold uppercase tracking-wide flex items-center gap-1.5">
                          <Link2 size={11} /> {cType === "music" ? "Suno URL" : "Video URL (YouTube / Vimeo)"}
                        </label>
                        <input value={cUrl} onChange={(e) => setCUrl(e.target.value)}
                          placeholder={cType === "music" ? "https://suno.com/song/..." : "https://youtube.com/watch?v=..."}
                          className="w-full px-4 py-3 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50" />
                      </div>
                    )}

                    {/* Notify toggle */}
                    <button type="button" onClick={() => setCNotify((v) => !v)}
                      className={`w-full py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        cNotify ? "border-teal/40 bg-teal/10 text-teal" : "border-border text-slate-500"
                      }`}>
                      <Bell size={12} />
                      {cNotify ? "Email all members on post ✓" : "Email members — off"}
                    </button>

                    {/* Submit */}
                    <button type="submit" disabled={posting || !cTitle.trim()}
                      className="w-full py-4 rounded-xl bg-gold text-deep font-bold text-sm hover:bg-amber-400 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                      {posting ? <Loader2 size={16} className="animate-spin" />
                       : postOk ? <><Check size={16} /> Published!</>
                       : <><Send size={16} /> Publish{cNotify ? " & Notify Members" : ""}</>}
                    </button>
                  </form>
                </div>
              )}

              {/* ════ MEMBERS ════ */}
              {tab === "members" && (
                <div className="space-y-6">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-gold mb-1">Members</div>
                    <h1 className="text-2xl font-black text-white">{members.length} Member{members.length !== 1 ? "s" : ""}</h1>
                  </div>

                  {/* Invite */}
                  <div className="rounded-2xl border border-border bg-navy/60 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Mail size={15} className="text-gold" />
                      <span className="text-sm font-bold text-white">Invite a Member</span>
                    </div>
                    <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
                      <input value={inviteName} onChange={(e) => setInviteName(e.target.value)}
                        placeholder="Name (optional)"
                        className="flex-1 px-4 py-2.5 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50" />
                      <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                        type="email" required placeholder="Email address *"
                        className="flex-1 px-4 py-2.5 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50" />
                      <button type="submit" disabled={inviting}
                        className="px-6 py-2.5 rounded-xl bg-gold text-deep font-bold text-sm hover:bg-amber-400 transition-all flex items-center gap-2 disabled:opacity-60 flex-shrink-0">
                        {inviting ? <Loader2 size={13} className="animate-spin" /> : <><Mail size={13} /> Invite</>}
                      </button>
                    </form>
                    {inviteMsg && (
                      <p className={`text-xs mt-3 ${inviteMsg.startsWith("✓") ? "text-teal" : "text-red-400"}`}>{inviteMsg}</p>
                    )}
                    <p className="text-xs text-slate-600 mt-2">Member receives a magic link — one click and they're in.</p>
                  </div>

                  {/* Member table */}
                  {members.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-navy/40 p-10 text-center">
                      <p className="text-slate-500 text-sm">No members yet.</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-border bg-navy/60 overflow-hidden">
                      <div className="grid grid-cols-12 gap-3 px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-600 border-b border-border">
                        <div className="col-span-4">Member</div>
                        <div className="col-span-2 text-center">Downloads</div>
                        <div className="col-span-2 text-center">Plays</div>
                        <div className="col-span-3">Last active</div>
                        <div className="col-span-1" />
                      </div>
                      <div className="divide-y divide-border/40">
                        {members.map((m) => (
                          <div key={m.id} className="grid grid-cols-12 gap-3 px-5 py-4 items-center hover:bg-border/10 group transition-all">
                            <div className="col-span-4 flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-teal/20 text-teal flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {(m.email?.[0] ?? "?").toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-white truncate">{m.full_name || "—"}</div>
                                <div className="text-xs text-slate-500 truncate">{m.email}</div>
                              </div>
                            </div>
                            <div className="col-span-2 text-center text-sm font-bold text-white">{m.downloads}</div>
                            <div className="col-span-2 text-center text-sm font-bold text-white">{m.plays}</div>
                            <div className="col-span-3 text-xs text-slate-500">
                              {m.last_sign_in ? new Date(m.last_sign_in).toLocaleDateString() : "Never signed in"}
                            </div>
                            <div className="col-span-1 flex justify-end">
                              <button onClick={() => handleRevoke(m.id, m.email)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all">
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ════ RADIO ════ */}
              {tab === "radio" && (
                <div className="space-y-8 max-w-3xl">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-gold mb-1">Radio</div>
                    <h1 className="text-2xl font-black text-white">Home Radio Playlist</h1>
                    <p className="text-sm text-slate-500 mt-1">
                      Upload MP3 files or paste direct audio URLs. Max {18} tracks. Active tracks play automatically for all visitors.
                    </p>
                  </div>

                  {/* ── Add track form ── */}
                  <div className="rounded-2xl border border-border bg-navy/60 p-6">
                    <div className="text-xs font-bold uppercase tracking-widest text-gold mb-4">Add a Track</div>
                    <form onSubmit={handleAddTrack} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1.5 font-semibold uppercase tracking-wide">Track Title *</label>
                          <input value={tTitle} onChange={(e) => setTTitle(e.target.value)} required
                            placeholder="Sovereign Frequency Vol.1"
                            className="w-full px-4 py-2.5 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50" />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1.5 font-semibold uppercase tracking-wide">Artist</label>
                          <input value={tArtist} onChange={(e) => setTArtist(e.target.value)}
                            placeholder="Abundance Transmission"
                            className="w-full px-4 py-2.5 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50" />
                        </div>
                      </div>

                      {/* Upload file OR paste URL */}
                      <div className="rounded-xl border border-border/60 bg-deep/60 p-4 space-y-3">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Audio Source — pick one</div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1.5 font-semibold uppercase tracking-wide flex items-center gap-1.5">
                            <Upload size={11} /> Upload MP3 / WAV
                          </label>
                          <input ref={trackFileRef} type="file" accept="audio/*"
                            onChange={(e) => { setTFile(e.target.files?.[0] ?? null); if (e.target.files?.[0]) setTUrl(""); }}
                            className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gold/10 file:text-gold hover:file:bg-gold/20 cursor-pointer" />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <div className="flex-1 h-px bg-border/60" /> or <div className="flex-1 h-px bg-border/60" />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1.5 font-semibold uppercase tracking-wide flex items-center gap-1.5">
                            <Link2 size={11} /> Direct Audio URL (.mp3, .wav, .ogg)
                          </label>
                          <input value={tUrl} onChange={(e) => { setTUrl(e.target.value); if (e.target.value) setTFile(null); }}
                            placeholder="https://..."
                            className="w-full px-4 py-2.5 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-500 mb-1.5 font-semibold uppercase tracking-wide">Cover Image URL (optional)</label>
                        <input value={tCover} onChange={(e) => setTCover(e.target.value)}
                          placeholder="https://... (jpg/png)"
                          className="w-full px-4 py-2.5 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50" />
                      </div>

                      <div className="flex items-center gap-4">
                        <button type="submit" disabled={tPosting || tracks.length >= 18}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold text-deep font-bold text-sm hover:bg-amber-400 transition-all disabled:opacity-50">
                          {tPosting ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                          {tPosting ? "Adding..." : "Add to Playlist"}
                        </button>
                        {tracks.length >= 18 && (
                          <span className="text-xs text-amber-500">Playlist full (18/18). Remove a track first.</span>
                        )}
                        {tMsg && (
                          <span className={`text-xs font-semibold ${tMsg.startsWith("✓") ? "text-emerald-400" : "text-red-400"}`}>{tMsg}</span>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* ── Track list ── */}
                  <div className="rounded-2xl border border-border bg-navy/60 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
                      <div className="text-xs font-bold uppercase tracking-widest text-gold">
                        Playlist — {tracks.filter(t => t.active).length} active / {tracks.length} total
                      </div>
                      <button onClick={loadTracks} className="text-slate-600 hover:text-gold transition-colors">
                        <RefreshCw size={13} />
                      </button>
                    </div>

                    {tracksLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 size={22} className="animate-spin text-gold" />
                      </div>
                    ) : tracks.length === 0 ? (
                      <div className="text-center py-12 text-slate-600 text-sm">
                        No tracks yet. Add your first track above.
                      </div>
                    ) : (
                      <ul className="divide-y divide-border/40">
                        {tracks.map((t, i) => (
                          <li key={t.id} className="flex items-center gap-3 px-5 py-3">
                            {/* Sort order buttons */}
                            <div className="flex flex-col gap-0.5 flex-shrink-0">
                              <button onClick={() => handleReorderTrack(t.id, "up")} disabled={i === 0}
                                className="p-0.5 text-slate-700 hover:text-gold disabled:opacity-20 transition-colors">
                                <ChevronUp size={13} />
                              </button>
                              <button onClick={() => handleReorderTrack(t.id, "down")} disabled={i === tracks.length - 1}
                                className="p-0.5 text-slate-700 hover:text-gold disabled:opacity-20 transition-colors">
                                <ChevronDown size={13} />
                              </button>
                            </div>

                            {/* Cover */}
                            <div className="w-9 h-9 rounded-lg flex-shrink-0 overflow-hidden border border-border/40"
                              style={{ background: "#0a0f1e" }}>
                              {t.cover_url
                                ? <img src={t.cover_url} alt={t.title} className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center text-gold text-xs">♪</div>
                              }
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold truncate ${t.active ? "text-white" : "text-slate-600"}`}>{t.title}</p>
                              <p className="text-xs text-slate-600 truncate">{t.artist}</p>
                            </div>

                            {/* Active toggle */}
                            <button onClick={() => handleToggleTrack(t.id, t.active)}
                              className={`flex-shrink-0 transition-colors ${t.active ? "text-emerald-400 hover:text-slate-500" : "text-slate-700 hover:text-emerald-400"}`}
                              title={t.active ? "Deactivate" : "Activate"}>
                              {t.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                            </button>

                            {/* Delete */}
                            <button onClick={() => handleDeleteTrack(t.id)}
                              className="flex-shrink-0 text-slate-700 hover:text-red-400 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* ════ SETTINGS ════ */}
              {tab === "calibration" && (
                <div className="space-y-6 max-w-3xl">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-gold mb-1">Soul Calibration</div>
                    <h1 className="text-2xl font-black text-white">Calibration Requests</h1>
                    <p className="text-sm text-slate-400 mt-1">Members who requested personalized frequency tracks. Paste a Suno URL to deliver their tracks.</p>
                  </div>

                  {calLoading ? (
                    <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gold" /></div>
                  ) : calibrations.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-navy/40 p-12 text-center">
                      <Star size={24} className="text-slate-600 mx-auto mb-3" />
                      <div className="text-slate-500 text-sm">No calibration requests yet.</div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {calibrations.map((req) => {
                        const isPending  = req.calibration_status === "pending";
                        const isDelivered = req.calibration_status === "ready" || req.calibration_status === "approved";
                        return (
                          <div key={req.id} className={`rounded-2xl border ${isPending ? "border-gold/30 bg-gold/5" : "border-border bg-navy/40"} p-5`}>
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div>
                                <div className="text-sm font-bold text-white">{req.title}</div>
                                {req.description && <div className="text-xs text-slate-400 mt-1 leading-relaxed">{req.description}</div>}
                                <div className="text-xs text-slate-600 mt-1">{new Date(req.created_at).toLocaleString()}</div>
                              </div>
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                                isPending   ? "bg-gold/10 text-gold border border-gold/30" :
                                isDelivered ? "bg-teal/10 text-teal border border-teal/30" :
                                "bg-border/60 text-slate-400"
                              }`}>
                                {isPending ? "Pending" : isDelivered ? "Delivered" : req.calibration_status}
                              </span>
                            </div>

                            {isPending && (
                              <div className="space-y-2">
                                <div className="text-xs font-semibold text-slate-400">Paste Suno track URL:</div>
                                <div className="flex gap-2">
                                  <input
                                    type="url"
                                    value={calUrls[req.id] ?? ""}
                                    onChange={(e) => setCalUrls((p) => ({ ...p, [req.id]: e.target.value }))}
                                    placeholder="https://suno.com/song/..."
                                    className="flex-1 px-3 py-2.5 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-xs outline-none focus:border-gold/50 transition-colors"
                                  />
                                  <button
                                    onClick={() => handlePostCalibrationTrack(req)}
                                    disabled={calPosting[req.id] || !calUrls[req.id]}
                                    className="px-4 py-2.5 rounded-xl bg-gold text-deep text-xs font-black hover:bg-amber-400 transition-all disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
                                  >
                                    {calPosting[req.id] ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                    {calPosting[req.id] ? "..." : "Deliver"}
                                  </button>
                                </div>
                                {calMsg[req.id] && (
                                  <p className={`text-xs ${calMsg[req.id].startsWith("✓") ? "text-teal" : "text-red-400"}`}>
                                    {calMsg[req.id]}
                                  </p>
                                )}
                              </div>
                            )}

                            {isDelivered && req.external_url && (
                              <div className="text-xs text-teal flex items-center gap-1.5 mt-1">
                                <Check size={12} /> Track delivered
                                <a href={req.external_url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-teal ml-2 underline">
                                  {req.external_url.substring(0, 50)}...
                                </a>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ════ INSTAGRAM ════ */}
              {tab === "instagram" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-gold mb-1">Instagram</div>
                      <h1 className="text-2xl font-black text-white">@nikopicasso369</h1>
                    </div>
                    <button onClick={loadInstagram} className="text-xs text-slate-500 hover:text-gold transition-colors flex items-center gap-1.5">
                      <Activity size={12} /> Refresh
                    </button>
                  </div>

                  {igLoading ? (
                    <div className="flex justify-center py-24"><Loader2 size={28} className="animate-spin text-gold" /></div>
                  ) : igError ? (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-400">{igError}</div>
                  ) : (
                    <>
                      {/* Account stats */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <StatCard icon={<Users size={16} />}     label="Followers"   value={igFollowers}  color="text-gold" />
                        <StatCard icon={<Instagram size={16} />} label="Total posts"  value={igMediaCount} color="text-teal" />
                        <StatCard icon={<Heart size={16} />}     label="Avg likes"
                          value={igPosts.length ? Math.round(igPosts.reduce((s, p) => s + (p.like_count ?? 0), 0) / igPosts.length) : 0}
                          color="text-rose-400" sub="last 12 posts" />
                      </div>

                      {/* Posts grid */}
                      {igPosts.length === 0 ? (
                        <div className="rounded-2xl border border-border bg-navy/40 p-12 text-center">
                          <Instagram size={24} className="text-slate-600 mx-auto mb-3" />
                          <p className="text-slate-500 text-sm">No posts found.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {igPosts.map((post) => (
                            <a key={post.id} href={post.permalink} target="_blank" rel="noopener noreferrer"
                              className="rounded-2xl border border-border bg-navy/60 overflow-hidden hover:border-gold/30 transition-all group">
                              {/* Thumbnail */}
                              <div className="aspect-square bg-deep relative overflow-hidden">
                                {(post.media_url || post.thumbnail_url) ? (
                                  <img
                                    src={post.thumbnail_url ?? post.media_url}
                                    alt={post.caption?.slice(0, 40) ?? "Post"}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-700">
                                    <Instagram size={32} />
                                  </div>
                                )}
                                <div className="absolute top-2 right-2">
                                  <span className="text-xs bg-deep/80 text-slate-400 px-2 py-0.5 rounded-full">
                                    {post.media_type === "VIDEO" ? "Reel" : post.media_type === "CAROUSEL_ALBUM" ? "Album" : "Photo"}
                                  </span>
                                </div>
                              </div>

                              {/* Metrics */}
                              <div className="p-4">
                                <div className="flex items-center gap-4 mb-3">
                                  <span className="flex items-center gap-1 text-xs text-slate-400">
                                    <Heart size={11} className="text-rose-400" /> {post.like_count ?? 0}
                                  </span>
                                  <span className="flex items-center gap-1 text-xs text-slate-400">
                                    <MessageCircle size={11} className="text-teal" /> {post.comments_count ?? 0}
                                  </span>
                                  {post.reach !== undefined && (
                                    <span className="flex items-center gap-1 text-xs text-slate-400">
                                      <Telescope size={11} className="text-gold" /> {post.reach}
                                    </span>
                                  )}
                                  {post.saved !== undefined && (
                                    <span className="flex items-center gap-1 text-xs text-slate-400">
                                      <Star size={11} className="text-amber-400" /> {post.saved}
                                    </span>
                                  )}
                                </div>
                                {post.caption && (
                                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{post.caption}</p>
                                )}
                                <p className="text-xs text-slate-700 mt-2">
                                  {new Date(post.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </p>
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ════ BOOKS ════ */}
              {tab === "books" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-gold mb-1">Books</div>
                      <h1 className="text-2xl font-black text-white">Council Library</h1>
                      <p className="text-sm text-slate-500 mt-1">Review agent-written books before publishing to the site.</p>
                    </div>
                    <button onClick={loadBooks} className="text-xs text-slate-500 hover:text-gold transition-colors flex items-center gap-1.5">
                      <RefreshCw size={12} /> Refresh
                    </button>
                  </div>

                  {booksLoad ? (
                    <div className="flex justify-center py-24"><Loader2 size={28} className="animate-spin text-gold" /></div>
                  ) : books.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-navy/40 p-14 text-center">
                      <BookMarked size={28} className="text-slate-700 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">No books yet.</p>
                      <p className="text-xs text-slate-700 mt-1">Use /write_book in Telegram to have an agent write one.</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {books.map((book) => {
                        const isPending   = book.status === "pending_review";
                        const isPublished = book.status === "published";
                        const isDraft     = book.status === "draft";
                        const isRejected  = book.status === "rejected";
                        const statusColor = isPending ? "border-gold/30 bg-gold/5" : isPublished ? "border-teal/30 bg-teal/5" : isRejected ? "border-red-500/20 bg-red-500/5" : "border-border bg-navy/40";
                        const badgeColor  = isPending ? "bg-gold/10 text-gold border-gold/30" : isPublished ? "bg-teal/10 text-teal border-teal/30" : isRejected ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-border/60 text-slate-400 border-border";

                        return (
                          <div key={book.id} className={`rounded-2xl border ${statusColor} p-5`}>
                            <div className="flex gap-5">
                              {/* Cover thumbnail */}
                              <div className="w-20 flex-shrink-0">
                                <div className="aspect-[3/4] rounded-xl overflow-hidden border border-border/40"
                                  style={{ background: "linear-gradient(135deg,#0a0f1e,#050810)" }}>
                                  {book.cover_image_url ? (
                                    <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <BookOpen size={16} className="text-slate-700" />
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <div>
                                    <div className="text-xs text-slate-500 mb-1">
                                      {book.author_name ?? book.author_agent}
                                    </div>
                                    <h3 className="text-base font-black text-white">{book.title}</h3>
                                    {book.tagline && <p className="text-xs text-slate-400 italic mt-0.5">{book.tagline}</p>}
                                  </div>
                                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${badgeColor}`}>
                                    {isPending ? "Pending Review" : isPublished ? "Published" : isRejected ? "Rejected" : "Draft"}
                                  </span>
                                </div>

                                {book.description && (
                                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                                    {book.description.split("\n\n")[0]}
                                  </p>
                                )}

                                <div className="flex items-center gap-3 text-xs text-slate-600 mb-4">
                                  <span className="flex items-center gap-1">
                                    <BookMarked size={10} /> {book.chapters?.length ?? 0} chapters
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <DollarSign size={10} /> {book.price > 0 ? `$${Number(book.price).toFixed(2)}` : "Free"}
                                  </span>
                                  <span>{new Date(book.created_at).toLocaleDateString()}</span>
                                </div>

                                {/* Preview chapter */}
                                {book.preview_chapter_content && (
                                  <details className="mb-4">
                                    <summary className="text-xs text-gold cursor-pointer hover:underline">
                                      Preview first chapter
                                    </summary>
                                    <div className="mt-3 p-4 rounded-xl bg-deep/60 border border-border/40 max-h-48 overflow-y-auto">
                                      {book.preview_chapter_content.split("\n\n").map((p: string, i: number) => (
                                        <p key={i} className="text-xs text-slate-400 leading-relaxed mb-2">{p}</p>
                                      ))}
                                    </div>
                                  </details>
                                )}

                                {/* Actions */}
                                <div className="flex flex-wrap items-center gap-2">
                                  {(isPending || isDraft) && (
                                    <button
                                      onClick={() => handleBookStatus(book.id, "published")}
                                      disabled={bookAction[book.id]}
                                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal/10 text-teal border border-teal/30 text-xs font-bold hover:bg-teal/20 transition-all disabled:opacity-50">
                                      {bookAction[book.id] ? <Loader2 size={11} className="animate-spin" /> : <Globe size={11} />}
                                      Publish
                                    </button>
                                  )}
                                  {isPending && (
                                    <button
                                      onClick={() => handleBookStatus(book.id, "rejected")}
                                      disabled={bookAction[book.id]}
                                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-border/40 text-slate-400 border border-border text-xs font-bold hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all disabled:opacity-50">
                                      <X size={11} /> Reject
                                    </button>
                                  )}
                                  {isPublished && (
                                    <a href={`/books/${book.slug}`} target="_blank"
                                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-border/40 text-slate-400 border border-border text-xs font-bold hover:text-white transition-all">
                                      <Eye size={11} /> View live
                                    </a>
                                  )}
                                  {isRejected && (
                                    <button
                                      onClick={() => handleBookStatus(book.id, "pending_review")}
                                      disabled={bookAction[book.id]}
                                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-border/40 text-slate-400 border border-border text-xs font-bold hover:text-white transition-all disabled:opacity-50">
                                      <RefreshCw size={11} /> Restore
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteBook(book.id)}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-border/20 text-slate-600 border border-border/40 text-xs font-bold hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all ml-auto">
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                                {bookMsg[book.id] && (
                                  <p className={`text-xs mt-2 ${bookMsg[book.id].startsWith("✓") ? "text-teal" : "text-red-400"}`}>
                                    {bookMsg[book.id]}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {tab === "transmissions" && (
                <div className="w-full">
                  <TransmissionPanel />
                </div>
              )}

              {tab === "settings" && (
                <div className="space-y-6 max-w-lg">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-gold mb-1">Settings</div>
                    <h1 className="text-2xl font-black text-white">Site Settings</h1>
                  </div>

                  {/* CC Password */}
                  <div className="rounded-2xl border border-border bg-navy/60 p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <Lock size={15} className="text-gold" />
                      <span className="text-sm font-bold text-white">Command Center Password</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-5">This is the code members enter to access the Command Center backtest engine.</p>
                    <form onSubmit={handleSavePw} className="space-y-3">
                      <div className="relative">
                        <input type={showPw ? "text" : "password"} value={ccPassword} onChange={(e) => setCcPassword(e.target.value)}
                          placeholder="New password" required minLength={6}
                          className="w-full px-4 py-3 pr-11 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50 tracking-widest" />
                        <button type="button" onClick={() => setShowPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <div className="relative">
                        <input type={showPwConfirm ? "text" : "password"} value={ccConfirm} onChange={(e) => setCcConfirm(e.target.value)}
                          placeholder="Confirm password" required
                          className="w-full px-4 py-3 pr-11 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50 tracking-widest" />
                        <button type="button" onClick={() => setShowPwConfirm((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                          {showPwConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {pwMsg && (
                        <p className={`text-xs ${pwMsg.startsWith("✓") ? "text-teal" : "text-red-400"}`}>{pwMsg}</p>
                      )}
                      <button type="submit" disabled={savingPw}
                        className="w-full py-3 rounded-xl bg-gold text-deep font-bold text-sm hover:bg-amber-400 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                        {savingPw ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> Update Password</>}
                      </button>
                    </form>
                  </div>

                  {/* Account info */}
                  <div className="rounded-2xl border border-border bg-navy/60 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield size={15} className="text-teal" />
                      <span className="text-sm font-bold text-white">Admin Account</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Email</span>
                        <span className="text-white">{adminEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Name</span>
                        <span className="text-white">{adminName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Role</span>
                        <span className="text-gold font-bold">Admin</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// ── Transmission Panel ─────────────────────────────────────────────────────────
type TransmissionResult = {
  id: string;
  blog_post: string;
  newsletter: string;
  instagram_caption: string;
  tiktok_caption: string;
  audio_url: string | null;
  video_url: string | null;
};

type CopiedKey = "blog" | "newsletter" | "instagram" | "tiktok" | null;

function TransmissionPanel() {
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<TransmissionResult[] | null>(null);
  const [activeVar, setActiveVar] = useState(0);
  const [error, setError]       = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>("instagram");
  const [copied, setCopied]     = useState<CopiedKey>(null);

  async function generate() {
    if (!input.trim() || loading) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/admin/transmissions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput: input }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data.transmissions ?? [data.transmission]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
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
    <div className="max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-gold" />
          <span className="text-xs font-bold uppercase tracking-widest text-gold">Transmission Pipeline</span>
        </div>
        <h1 className="text-2xl font-black text-white mb-1">Speak the Vision</h1>
        <p className="text-sm text-slate-500">Share a transmission. Everything else gets created automatically.</p>
      </div>

      <div className="rounded-2xl border border-border bg-navy/60 p-6 mb-5">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={"Share the transmission from the Library…\n\ne.g. The soul does not fear death. It fears forgetting. Every struggle you have faced was the Library writing its most important chapters through you."}
          rows={7}
          className="w-full bg-transparent text-slate-200 text-sm leading-relaxed placeholder:text-slate-600 resize-none outline-none"
        />
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/60">
          <span className="text-xs text-slate-600">{input.length} chars</span>
          <button
            onClick={generate}
            disabled={loading || !input.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-deep disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all"
            style={{ background: "linear-gradient(90deg,#f59e0b,#fde68a)" }}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {loading ? "Generating…" : "Generate Everything"}
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4 mb-5 text-sm text-red-400">{error}</div>}

      {result && result.length > 0 && (() => {
        const LABELS = ["🌊 Calm & Poetic", "✨ Playful & Curious", "🔥 Passionate & Direct"];
        const TIMES  = ["7:00 PM", "7:45 PM", "8:30 PM"];
        const v = result[activeVar];
        if (!v) return null;
        const videoMeta = (() => { try { return JSON.parse(v.video_url ?? "{}"); } catch { return {}; } })();
        return (
          <div className="space-y-3">
            {/* Variation tabs */}
            <div className="flex gap-2">
              {LABELS.map((label, i) => (
                <button key={i} onClick={() => setActiveVar(i)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${activeVar === i ? "bg-gold/15 text-gold border border-gold/30" : "bg-navy/40 text-slate-500 border border-border hover:text-white"}`}>
                  {label}<br/><span className="text-[10px] opacity-60">{TIMES[i]}</span>
                </button>
              ))}
            </div>

            {/* Video script */}
            {videoMeta.script && (
              <div className="rounded-2xl border border-gold/20 bg-navy/60 p-5">
                <div className="text-xs font-bold uppercase tracking-widest text-gold mb-2">Video Script · {TIMES[activeVar]}</div>
                <p className="text-sm text-slate-200 leading-relaxed italic">"{videoMeta.script}"</p>
                <button onClick={() => copy(videoMeta.script, "tiktok")}
                  className="mt-3 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gold/30 text-gold hover:bg-gold/10 transition-all">
                  {copied === "tiktok" ? <Check size={11} /> : null} Copy Script
                </button>
              </div>
            )}

            {/* Content cards */}
            {([
              { id: "instagram", label: "Instagram Caption", text: v.instagram_caption, key: "instagram" as CopiedKey },
              { id: "tiktok2",   label: "TikTok / Reels",    text: v.tiktok_caption,    key: "tiktok"    as CopiedKey },
              { id: "newsletter",label: "Newsletter",         text: v.newsletter,         key: "newsletter"as CopiedKey },
              { id: "blog",      label: "Blog Post",         text: v.blog_post,          key: "blog"      as CopiedKey },
            ]).map(({ id, label, text, key }) => (
              <div key={`${activeVar}-${id}`} className="rounded-2xl border border-border bg-navy/60 overflow-hidden">
                <button onClick={() => toggle(id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors">
                  <span className="text-xs font-bold uppercase tracking-widest text-gold">{label}</span>
                  {expanded === id ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                </button>
                {expanded === id && (
                  <div className="px-5 pb-5">
                    <pre className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">{text}</pre>
                    <button onClick={() => copy(text, key)}
                      className="mt-4 flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border border-gold/30 text-gold hover:bg-gold/10 transition-all">
                      {copied === key ? <Check size={12} /> : null}
                      {copied === key ? "Copied!" : "Copy"}
                    </button>
                  </div>
                )}
              </div>
            ))}

            {v.audio_url && (
              <div className="rounded-2xl border border-border bg-navy/60 p-5">
                <div className="text-xs font-bold uppercase tracking-widest text-gold mb-3">Voice Narration</div>
                <audio controls className="w-full" src={v.audio_url} />
              </div>
            )}

            <button onClick={() => { setResult(null); setInput(""); setActiveVar(0); }}
              className="w-full mt-1 py-3 rounded-xl border border-border text-slate-500 text-sm hover:text-white hover:border-slate-600 transition-all">
              New Transmission
            </button>
          </div>
        );
      })()}
    </div>
  );
}
