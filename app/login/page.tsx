"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [mode,     setMode]     = useState<"magic" | "password">("magic");
  const [loading,  setLoading]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const [error,    setError]    = useState("");

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/member`,
      },
    });

    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      // middleware will redirect to /admin or /member
      window.location.href = "/admin";
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-deep">
      <div className="absolute inset-0 water-shimmer opacity-30 pointer-events-none" />

      <div className="relative w-full max-w-sm z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/80 to-amber-600 flex items-center justify-center text-deep font-black text-lg">A</div>
          <span className="font-bold text-white tracking-wide">Abundance Transmission</span>
        </div>

        <div className="relative rounded-3xl border border-gold/30 bg-navy panel-glow p-8 overflow-hidden">
          <div className="absolute inset-0 water-shimmer opacity-20" />
          <div className="relative z-10 space-y-6">

            <div className="text-center space-y-1">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gold/10 border border-gold/30 mx-auto mb-4">
                <ShieldCheck size={22} className="text-gold" />
              </div>
              <h1 className="text-2xl font-black text-white">Member Access</h1>
              <p className="text-sm text-slate-400">Sign in to your steward portal</p>
            </div>

            {/* Mode toggle */}
            <div className="flex rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setMode("magic")}
                className={`flex-1 py-2 text-xs font-bold transition-all ${mode === "magic" ? "bg-gold/10 text-gold" : "text-slate-500 hover:text-slate-300"}`}
              >
                <Mail size={12} className="inline mr-1.5" />Magic Link
              </button>
              <button
                onClick={() => setMode("password")}
                className={`flex-1 py-2 text-xs font-bold transition-all ${mode === "password" ? "bg-gold/10 text-gold" : "text-slate-500 hover:text-slate-300"}`}
              >
                <Lock size={12} className="inline mr-1.5" />Password
              </button>
            </div>

            {sent ? (
              <div className="rounded-xl bg-teal/10 border border-teal/30 p-5 text-center space-y-2">
                <Mail size={24} className="text-teal mx-auto" />
                <p className="text-sm font-bold text-white">Check your inbox</p>
                <p className="text-xs text-slate-400">We sent a sign-in link to <span className="text-gold">{email}</span></p>
                <button onClick={() => setSent(false)} className="text-xs text-slate-500 hover:text-slate-300 mt-2">Use a different email</button>
              </div>
            ) : (
              <form onSubmit={mode === "magic" ? handleMagicLink : handlePassword} className="space-y-3">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20"
                  />
                </div>
                {mode === "password" && (
                  <div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 tracking-widest"
                    />
                  </div>
                )}
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gold text-deep font-bold text-sm hover:bg-amber-400 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : mode === "magic" ? (
                    <><Mail size={14} /> Send Magic Link</>
                  ) : (
                    <>Sign In <ArrowRight size={14} /></>
                  )}
                </button>
              </form>
            )}

            <p className="text-xs text-slate-600 text-center">
              Access is by invitation only.{" "}
              <a href="/#early-access" className="text-gold hover:underline">Join the waitlist.</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
