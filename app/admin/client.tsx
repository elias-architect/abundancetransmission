"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Users, FileText, Music, Download, Plus, Trash2, LogOut,
  Upload, Link2, RefreshCw, ChevronDown, ChevronUp, Shield,
  Mail, BarChart3, Loader2, Check, X
} from "lucide-react";

type ContentItem = {
  id: string; type: "newsletter" | "music"; title: string;
  description: string | null; file_url: string | null;
  external_url: string | null; published: boolean; created_at: string;
};
type Member = {
  id: string; email: string; role: string;
  full_name: string | null; created_at: string; last_sign_in: string | null;
};
type Stats = { total_members: number; total_content: number; total_downloads: number };

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) {
  return (
    <div className="rounded-2xl border border-border bg-navy/60 p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl bg-border/60 flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <div className="text-2xl font-black text-white">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  );
}

export default function AdminClient({ adminEmail, adminName }: { adminEmail: string; adminName: string }) {
  const [tab, setTab] = useState<"overview" | "content" | "members">("overview");

  // Data
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // New content form
  const [newType,      setNewType]      = useState<"newsletter" | "music">("newsletter");
  const [newTitle,     setNewTitle]     = useState("");
  const [newDesc,      setNewDesc]      = useState("");
  const [newUrl,       setNewUrl]       = useState(""); // Suno URL for music
  const [newFile,      setNewFile]      = useState<File | null>(null);
  const [posting,      setPosting]      = useState(false);
  const [postSuccess,  setPostSuccess]  = useState(false);
  const [notifyMembers, setNotifyMembers] = useState(true);
  const [emailResult,  setEmailResult]  = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName,  setInviteName]  = useState("");
  const [inviting,    setInviting]    = useState(false);
  const [inviteMsg,   setInviteMsg]   = useState("");

  async function loadData() {
    setLoading(true);
    const [membersRes, contentRes] = await Promise.all([
      fetch("/api/admin/members"),
      fetch("/api/admin/content"),
    ]);
    const membersData = await membersRes.json();
    const contentData = await contentRes.json();
    if (membersData.members) { setMembers(membersData.members); setStats(membersData.stats); }
    if (Array.isArray(contentData)) setContent(contentData);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    setPosting(true);
    const supabase = createClient();

    let file_url = null;

    if (newType === "newsletter" && newFile) {
      const path = `${Date.now()}-${newFile.name.replace(/\s+/g, "-")}`;
      const { error: uploadError } = await supabase.storage
        .from("newsletters")
        .upload(path, newFile, { cacheControl: "3600", upsert: false });

      if (uploadError) { alert("Upload failed: " + uploadError.message); setPosting(false); return; }

      const { data: urlData } = supabase.storage.from("newsletters").getPublicUrl(path);
      file_url = urlData.publicUrl;
    }

    const res = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: newType,
        title: newTitle,
        description: newDesc || null,
        file_url,
        external_url: newType === "music" ? newUrl || null : null,
        notify: notifyMembers,
      }),
    });

    setPosting(false);
    if (res.ok) {
      setPostSuccess(true);
      setEmailResult(notifyMembers ? "Email notifications sent to all members." : null);
      setNewTitle(""); setNewDesc(""); setNewUrl(""); setNewFile(null);
      if (fileRef.current) fileRef.current.value = "";
      loadData();
      setTimeout(() => { setPostSuccess(false); setEmailResult(null); }, 5000);
    } else {
      const err = await res.json();
      alert("Error: " + err.error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this content? Members will lose access.")) return;
    await fetch(`/api/admin/content?id=${id}`, { method: "DELETE" });
    loadData();
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true); setInviteMsg("");
    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, full_name: inviteName }),
    });
    setInviting(false);
    if (res.ok) {
      setInviteMsg(`Invite sent to ${inviteEmail}`);
      setInviteEmail(""); setInviteName("");
      loadData();
    } else {
      const err = await res.json();
      setInviteMsg("Error: " + err.error);
    }
  }

  async function handleRevoke(id: string, email: string) {
    if (!confirm(`Revoke access for ${email}?`)) return;
    await fetch(`/api/admin/invite?id=${id}`, { method: "DELETE" });
    loadData();
  }

  const newsletters = content.filter((c) => c.type === "newsletter");
  const music       = content.filter((c) => c.type === "music");

  return (
    <div className="min-h-screen bg-deep">
      {/* Header */}
      <header className="border-b border-border/60 bg-navy/80 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield size={18} className="text-gold" />
            <span className="font-bold text-white text-sm">Admin Dashboard</span>
            <span className="text-xs text-slate-600 hidden sm:block">· {adminEmail}</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-slate-400 hover:text-red-400 transition-colors">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Page title */}
        <div className="mb-8">
          <div className="text-xs font-bold uppercase tracking-widest text-gold mb-1">Admin Portal</div>
          <h1 className="text-3xl font-black text-white">Welcome back, {adminName}</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-navy/40 rounded-xl p-1 w-fit border border-border">
          {(["overview", "content", "members"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${tab === t ? "bg-gold/10 text-gold border border-gold/30" : "text-slate-500 hover:text-slate-300"}`}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-gold" />
          </div>
        ) : (
          <>
            {/* ── OVERVIEW ── */}
            {tab === "overview" && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard icon={<Users size={18} />}     label="Total Members"    value={stats?.total_members ?? 0}   color="text-gold" />
                  <StatCard icon={<FileText size={18} />}  label="Newsletters"      value={newsletters.length}          color="text-teal" />
                  <StatCard icon={<Music size={18} />}     label="Music Tracks"     value={music.length}                color="text-accent" />
                  <StatCard icon={<Download size={18} />}  label="Total Downloads"  value={stats?.total_downloads ?? 0} color="text-slate-400" />
                </div>

                {/* Vault fund manual update note */}
                <div className="rounded-2xl border border-gold/20 bg-navy/60 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 size={16} className="text-gold" />
                    <span className="text-sm font-bold text-white">Evolutionary Vault</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Current fund: <span className="text-gold font-bold">€2,360</span> — Update the vault amount in{" "}
                    <code className="text-teal text-xs bg-border/60 px-1 rounded">app/vault/content.tsx</code> line 9.
                  </p>
                </div>

                {/* Recent content */}
                <div>
                  <h2 className="text-base font-bold text-white mb-4">Recent Content</h2>
                  {content.length === 0 ? (
                    <p className="text-sm text-slate-500">No content yet. Go to the Content tab to post.</p>
                  ) : (
                    <div className="space-y-2">
                      {content.slice(0, 5).map((c) => (
                        <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border bg-navy/40 px-4 py-3">
                          {c.type === "newsletter" ? <FileText size={14} className="text-teal flex-shrink-0" /> : <Music size={14} className="text-accent flex-shrink-0" />}
                          <span className="text-sm text-white flex-1 truncate">{c.title}</span>
                          <span className="text-xs text-slate-600">{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── CONTENT ── */}
            {tab === "content" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Post form */}
                <div className="rounded-2xl border border-border bg-navy/60 p-6">
                  <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                    <Plus size={16} className="text-gold" /> Post New Content
                  </h2>

                  <form onSubmit={handlePost} className="space-y-4">
                    {/* Type selector */}
                    <div className="flex gap-2">
                      {(["newsletter", "music"] as const).map((t) => (
                        <button key={t} type="button" onClick={() => setNewType(t)}
                          className={`flex-1 py-2.5 rounded-xl border text-xs font-bold capitalize transition-all ${newType === t ? "border-gold/40 bg-gold/10 text-gold" : "border-border text-slate-500 hover:text-slate-300"}`}>
                          {t === "newsletter" ? <><FileText size={12} className="inline mr-1" />Newsletter</> : <><Music size={12} className="inline mr-1" />Music</>}
                        </button>
                      ))}
                    </div>

                    <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required
                      placeholder="Title *"
                      className="w-full px-4 py-3 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50" />

                    <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3}
                      placeholder="Description (optional)"
                      className="w-full px-4 py-3 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50 resize-none" />

                    {newType === "newsletter" ? (
                      <div>
                        <label className="block text-xs text-slate-500 mb-2 flex items-center gap-1.5">
                          <Upload size={12} /> PDF File
                        </label>
                        <input ref={fileRef} type="file" accept=".pdf" onChange={(e) => setNewFile(e.target.files?.[0] ?? null)}
                          className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gold/10 file:text-gold hover:file:bg-gold/20 cursor-pointer" />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs text-slate-500 mb-2 flex items-center gap-1.5">
                          <Link2 size={12} /> Suno URL (e.g. https://suno.com/song/abc123)
                        </label>
                        <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
                          placeholder="https://suno.com/song/..."
                          className="w-full px-4 py-3 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50" />
                      </div>
                    )}

                    {/* Notify toggle */}
                    <button
                      type="button"
                      onClick={() => setNotifyMembers((v) => !v)}
                      className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${notifyMembers ? "border-teal/40 bg-teal/10 text-teal" : "border-border text-slate-500"}`}
                    >
                      <Mail size={12} />
                      {notifyMembers ? "Email members on post ✓" : "Email members on post — off"}
                    </button>

                    <button type="submit" disabled={posting}
                      className="w-full py-3 rounded-xl bg-gold text-deep font-bold text-sm hover:bg-amber-400 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                      {posting ? <Loader2 size={14} className="animate-spin" /> : postSuccess ? <><Check size={14} /> Posted!</> : <><Plus size={14} /> Post Content</>}
                    </button>

                    {emailResult && (
                      <p className="text-xs text-teal flex items-center gap-1.5">
                        <Check size={11} /> {emailResult}
                      </p>
                    )}
                  </form>
                </div>

                {/* Content list */}
                <div className="space-y-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <BarChart3 size={16} className="text-teal" /> All Content ({content.length})
                  </h2>
                  {content.length === 0 ? (
                    <p className="text-sm text-slate-500">Nothing posted yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                      {content.map((c) => (
                        <div key={c.id} className="rounded-xl border border-border bg-navy/40 p-4 flex items-start gap-3 group">
                          <div className="mt-0.5">
                            {c.type === "newsletter" ? <FileText size={16} className="text-teal" /> : <Music size={16} className="text-accent" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-white truncate">{c.title}</div>
                            {c.description && <div className="text-xs text-slate-500 truncate mt-0.5">{c.description}</div>}
                            <div className="text-xs text-slate-600 mt-1">{new Date(c.created_at).toLocaleDateString()}</div>
                          </div>
                          <button onClick={() => handleDelete(c.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── MEMBERS ── */}
            {tab === "members" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Invite form */}
                <div className="rounded-2xl border border-border bg-navy/60 p-6">
                  <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                    <Mail size={16} className="text-gold" /> Invite a Member
                  </h2>
                  <form onSubmit={handleInvite} className="space-y-3">
                    <input value={inviteName} onChange={(e) => setInviteName(e.target.value)}
                      placeholder="Full name (optional)"
                      className="w-full px-4 py-3 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50" />
                    <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} type="email" required
                      placeholder="Email address *"
                      className="w-full px-4 py-3 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50" />
                    {inviteMsg && (
                      <p className={`text-xs ${inviteMsg.startsWith("Error") ? "text-red-400" : "text-teal"}`}>{inviteMsg}</p>
                    )}
                    <button type="submit" disabled={inviting}
                      className="w-full py-3 rounded-xl bg-gold text-deep font-bold text-sm hover:bg-amber-400 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                      {inviting ? <Loader2 size={14} className="animate-spin" /> : <><Mail size={14} /> Send Invite</>}
                    </button>
                    <p className="text-xs text-slate-600">Member gets a magic link email. They click it to access their portal.</p>
                  </form>
                </div>

                {/* Member list */}
                <div>
                  <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <Users size={16} className="text-teal" /> Members ({members.filter(m => m.role !== "admin").length})
                  </h2>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {members.map((m) => (
                      <div key={m.id} className="rounded-xl border border-border bg-navy/40 p-4 flex items-center gap-3 group">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${m.role === "admin" ? "bg-gold/20 text-gold" : "bg-teal/20 text-teal"}`}>
                          {(m.email?.[0] ?? "?").toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-white truncate">{m.full_name || m.email}</div>
                          <div className="text-xs text-slate-500 truncate">{m.email}</div>
                          <div className="text-xs text-slate-600">{m.role} · joined {new Date(m.created_at).toLocaleDateString()}</div>
                        </div>
                        {m.role !== "admin" && (
                          <button onClick={() => handleRevoke(m.id, m.email)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all flex-shrink-0">
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
