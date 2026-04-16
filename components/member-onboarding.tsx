"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Eye, EyeOff, Loader2, ArrowRight, CheckCircle2,
  FileText, Music, Star, Shield, Lock, User, Calendar,
  MapPin, Dna, ShieldCheck, ChevronRight, Sparkles, X
} from "lucide-react";

type Props = {
  userEmail: string;
  userName:  string;
  onDone:    () => void;
};

const ACCESS_ITEMS = [
  { icon: <FileText size={16} />,  color: "text-teal   border-teal/30   bg-teal/10",   title: "Newsletters",       desc: "Exclusive transmissions published directly to your portal." },
  { icon: <Music size={16} />,     color: "text-accent border-accent/30 bg-accent/10", title: "Music",             desc: "Original frequency tracks posted for members only." },
  { icon: <Star size={16} />,      color: "text-gold   border-gold/30   bg-gold/10",   title: "Soul Calibration",  desc: "Personalized music created from your birth frequency." },
  { icon: <Shield size={16} />,    color: "text-slate-300 border-border bg-border/40", title: "Command Center",    desc: "Live strategy engine — Enigma 369, backtests, edge analysis." },
];

export default function MemberOnboarding({ userEmail, userName, onDone }: Props) {
  const [step, setStep]         = useState<1 | 2>(1);
  const [skipping, setSkipping] = useState(false);

  // Step 1 — password
  const [pw,        setPw]        = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [pwError,   setPwError]   = useState("");
  const [pwOk,      setPwOk]      = useState(false);
  const [settingPw, setSettingPw] = useState(false);

  // Step 2 — profile
  const [fullName,  setFullName]  = useState(userName || "");
  const [dob,       setDob]       = useState("");
  const [location,  setLocation]  = useState("");
  const [ancestry,  setAncestry]  = useState("");
  const [saving,    setSaving]    = useState(false);
  const [saveMsg,   setSaveMsg]   = useState("");

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (pw.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    if (pw !== pwConfirm) { setPwError("Passwords do not match."); return; }
    setSettingPw(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pw });
    setSettingPw(false);
    if (error) { setPwError(error.message); return; }
    setPwOk(true);
    setTimeout(() => setStep(2), 900);
  }

  async function handleSkipStep1() {
    setStep(2);
  }

  async function handleSaveProfile(complete: boolean) {
    if (complete && !dob) { setSaveMsg("Date of birth is required."); return; }
    setSaving(true); setSaveMsg("");
    const res = await fetch("/api/member/profile", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name:         fullName || null,
        date_of_birth:     dob      || null,
        birth_location:    location || null,
        ancestry:          ancestry || null,
        onboarding_complete: complete,
      }),
    });
    setSaving(false);
    if (res.ok) { onDone(); }
    else        { setSaveMsg("Something went wrong. Try again."); }
  }

  async function handleSkipAll() {
    setSkipping(true);
    await fetch("/api/member/profile", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboarding_complete: true }),
    });
    setSkipping(false);
    onDone();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
      style={{ background: "rgba(5,8,16,0.97)" }}>

      {/* Progress dots */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        <div className={`w-2 h-2 rounded-full transition-all ${step >= 1 ? "bg-gold" : "bg-slate-700"}`} />
        <div className="w-6 h-px bg-border/60" />
        <div className={`w-2 h-2 rounded-full transition-all ${step >= 2 ? "bg-gold" : "bg-slate-700"}`} />
      </div>

      {/* Skip all */}
      <button onClick={handleSkipAll} disabled={skipping}
        className="fixed top-4 right-6 flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors z-10">
        {skipping ? <Loader2 size={12} className="animate-spin" /> : <X size={13} />}
        Skip onboarding
      </button>

      <div className="w-full max-w-xl mx-auto px-4 py-20">

        {/* ── STEP 1: Password + access summary ── */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-3 mb-8">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center">
                <Sparkles size={24} className="text-gold" />
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-gold">Welcome to the Transmission</div>
              <h1 className="text-3xl font-black text-white leading-tight">
                Your access is confirmed.
              </h1>
              <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                Let&apos;s take 90 seconds to set up your account — then you&apos;re in.
              </p>
            </div>

            {/* What you have access to */}
            <div className="rounded-2xl border border-border bg-navy/60 p-6">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">What you now have access to</div>
              <div className="space-y-3">
                {ACCESS_ITEMS.map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${item.color}`}>
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{item.title}</div>
                      <div className="text-xs text-slate-500 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Password setup */}
            <div className="rounded-2xl border border-gold/20 bg-navy/60 p-6">
              <div className="flex items-center gap-2 mb-1">
                <Lock size={14} className="text-gold" />
                <div className="text-sm font-bold text-white">Set your password</div>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Used for both the Member Portal and the Command Center. Min. 8 characters.
              </p>

              {pwOk ? (
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold py-2">
                  <CheckCircle2 size={16} /> Password set — moving to next step...
                </div>
              ) : (
                <form onSubmit={handleSetPassword} className="space-y-3">
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={pw}
                      onChange={(e) => setPw(e.target.value)}
                      placeholder="New password (8+ characters)"
                      required
                      className="w-full px-4 py-3 pr-10 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50 transition-colors"
                    />
                    <button type="button" onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-3.5 text-slate-600 hover:text-slate-400">
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <input
                    type={showPw ? "text" : "password"}
                    value={pwConfirm}
                    onChange={(e) => setPwConfirm(e.target.value)}
                    placeholder="Confirm password"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50 transition-colors"
                  />
                  {pwError && <p className="text-xs text-red-400">{pwError}</p>}
                  <div className="flex items-center gap-4 pt-1">
                    <button type="submit" disabled={settingPw}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold text-deep font-black text-sm hover:bg-amber-400 transition-all disabled:opacity-60">
                      {settingPw ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                      Set Password &amp; Continue
                    </button>
                    <button type="button" onClick={handleSkipStep1}
                      className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
                      Skip for now
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 2: Profile / Soul Calibration data ── */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-3 mb-8">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center">
                <Star size={24} className="text-gold" />
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-gold">Your Frequency Profile</div>
              <h1 className="text-2xl font-black text-white leading-tight">
                Help us tune to your signal.
              </h1>
              <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                The more you share, the more accurately we can create personalized Soul Calibration music aligned to your frequency.
              </p>
            </div>

            {/* Privacy note */}
            <div className="rounded-xl border border-teal/20 bg-teal/5 px-5 py-4 flex items-start gap-3">
              <ShieldCheck size={16} className="text-teal flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">
                We have no intention of selling or sharing your private information. This data is used exclusively to personalize your Soul Calibration — to help you become more sovereign and free.
              </p>
            </div>

            {/* Form */}
            <div className="rounded-2xl border border-border bg-navy/60 p-6 space-y-4">

              {/* Full name */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1.5">
                  <User size={11} /> Full Name <span className="text-slate-600">(optional but recommended)</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50 transition-colors"
                />
              </div>

              {/* Date of birth */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1.5">
                  <Calendar size={11} /> Date of Birth <span className="text-gold font-bold">(required)</span>
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-deep border border-border text-white text-sm outline-none focus:border-gold/50 transition-colors"
                />
                <p className="text-xs text-slate-600 mt-1">Used to calculate your natal frequency and Soul Calibration alignment.</p>
              </div>

              {/* Birth location */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1.5">
                  <MapPin size={11} /> Place of Birth <span className="text-slate-600">(recommended — city, country)</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Paris, France"
                  className="w-full px-4 py-3 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50 transition-colors"
                />
              </div>

              {/* Ancestry */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1.5">
                  <Dna size={11} /> Ancestry / Bloodline <span className="text-slate-600">(optional)</span>
                </label>
                <input
                  type="text"
                  value={ancestry}
                  onChange={(e) => setAncestry(e.target.value)}
                  placeholder="e.g. West African, French, Haitian..."
                  className="w-full px-4 py-3 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50 transition-colors"
                />
                <p className="text-xs text-slate-600 mt-1">Ancestral lineage can influence frequency resonance in Soul Calibration.</p>
              </div>

              {saveMsg && (
                <p className="text-xs text-red-400">{saveMsg}</p>
              )}

              <div className="flex items-center gap-4 pt-2">
                <button onClick={() => handleSaveProfile(true)} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gold text-deep font-black text-sm hover:bg-amber-400 transition-all disabled:opacity-60">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Save &amp; Enter Portal
                </button>
                <button onClick={() => handleSaveProfile(true)} disabled={saving}
                  className="text-xs text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1">
                  Skip <ChevronRight size={11} />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
