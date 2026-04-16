"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, PenLine, Users, Settings, LogOut,
  FileText, Music, Video, Upload, Link2, Send, Trash2,
  Mail, Download, Play, Eye, EyeOff, TrendingUp, Shield,
  Loader2, Check, X, ChevronRight, Bell, Lock, Save,
  BarChart3, Activity, Star
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
type Tab = "overview" | "compose" | "members" | "settings";
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
    { id: "overview", icon: <LayoutDashboard size={16} />, label: "Overview" },
    { id: "compose",  icon: <PenLine size={16} />,         label: "Compose" },
    { id: "members",  icon: <Users size={16} />,           label: "Members" },
    { id: "settings", icon: <Settings size={16} />,        label: "Settings" },
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

              {/* ════ SETTINGS ════ */}
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
