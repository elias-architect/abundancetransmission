"use client";
import { useForm, ValidationError } from "@formspree/react";
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
  const [state, handleSubmit] = useForm("mdayaldk");

  if (state.succeeded) {
    return (
      <div className="flex items-center gap-3 py-4">
        <CheckCircle size={20} className="text-emerald flex-shrink-0" />
        <span className="text-sm text-slate-300">
          You&apos;re in. The transmission is beginning.
        </span>
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
          disabled={state.submitting}
          className="px-5 py-3 rounded-lg bg-gold text-deep font-bold text-sm flex items-center gap-2 hover:bg-amber-400 transition-all disabled:opacity-60 whitespace-nowrap"
        >
          {state.submitting ? (
            <span className="w-4 h-4 border-2 border-deep/30 border-t-deep rounded-full animate-spin" />
          ) : (
            <Send size={14} />
          )}
          {ctaText}
        </button>
      </div>
      <ValidationError errors={state.errors} className="text-xs text-red-400" />
    </form>
  );
}
