"use client";
import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EmailForm({
  label = "Join the early-access list",
  placeholder = "your@email.com",
  ctaText = "Transmit",
  dark = true,
}: {
  label?: string;
  placeholder?: string;
  ctaText?: string;
  dark?: boolean;
}) {
  const [email, setEmail]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [succeeded, setSucceeded]   = useState(false);
  const [error, setError]           = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/early-access", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      if (res.ok) {
        setSucceeded(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (succeeded) {
    return (
      <div className="space-y-3 py-2">
        <div className="flex items-center gap-3">
          <CheckCircle size={20} className="text-emerald flex-shrink-0" />
          <span className="text-sm text-slate-300">
            You&apos;re in. The transmission is beginning.
          </span>
        </div>
        <div className="flex items-start gap-2 rounded-lg border border-gold/20 bg-gold/5 px-4 py-3">
          <span className="text-gold text-base leading-none mt-0.5">!</span>
          <p className="text-xs text-slate-400 leading-relaxed">
            <span className="text-gold font-semibold">Check your spam folder.</span>{" "}
            Our confirmation email may have landed there. Mark it as{" "}
            <span className="text-slate-300 font-medium">Not Spam</span> to ensure
            you receive all future transmissions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <input
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "flex-1 px-4 py-3 rounded-lg text-sm border outline-none transition-all",
            dark
              ? "bg-deep border-border text-white placeholder:text-slate-600 focus:border-gold/50 focus:ring-1 focus:ring-gold/20"
              : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-gold/50"
          )}
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-3 rounded-lg bg-gold text-deep font-bold text-sm flex items-center gap-2 hover:bg-amber-400 transition-all disabled:opacity-60 whitespace-nowrap"
        >
          {submitting ? (
            <span className="w-4 h-4 border-2 border-deep/30 border-t-deep rounded-full animate-spin" />
          ) : (
            <Send size={14} />
          )}
          {ctaText}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <p className="text-xs text-slate-600">
        After submitting, check your spam folder and confirm the email to activate your access.
      </p>
    </form>
  );
}
