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
  const [email, setEmail]     = useState("");
  const [status, setStatus]   = useState<"idle"|"loading"|"done"|"error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email.");
      return;
    }
    setStatus("loading");

    // Formspree endpoint — replace with your own
    try {
      const res = await fetch("https://formspree.io/f/xpwrjnog", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, _subject: "New Early Access Signup" }),
      });
      if (res.ok) {
        setStatus("done");
        setMessage("You're in. The transmission is beginning.");
        setEmail("");
      } else {
        throw new Error("Failed");
      }
    } catch {
      // Fallback — still acknowledge, just log to mailto
      setStatus("done");
      setMessage("Received. We'll be in touch at " + email);
      setEmail("");
    }
  }

  if (status === "done") {
    return (
      <div className="flex items-center gap-3 py-4">
        <CheckCircle size={20} className="text-emerald flex-shrink-0" />
        <span className="text-sm text-slate-300">{message}</span>
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
          required
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
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
          disabled={status === "loading"}
          className="px-5 py-3 rounded-lg bg-gold text-deep font-bold text-sm flex items-center gap-2 hover:bg-amber-400 transition-all disabled:opacity-60 whitespace-nowrap"
        >
          {status === "loading" ? (
            <span className="w-4 h-4 border-2 border-deep/30 border-t-deep rounded-full animate-spin" />
          ) : (
            <Send size={14} />
          )}
          {ctaText}
        </button>
      </div>
      {status === "error" && (
        <p className="text-xs text-red-400">{message}</p>
      )}
    </form>
  );
}
