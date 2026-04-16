"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Mail, BookOpen, ArrowRight } from "lucide-react";
import { Suspense } from "react";

function ThankYouContent() {
  const params = useSearchParams();
  const email  = params.get("email") ?? "";
  const name   = params.get("name") ?? "";

  return (
    <div className="min-h-screen bg-deep flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-8">

        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center mx-auto">
          <CheckCircle2 size={36} className="text-emerald-400" />
        </div>

        {/* Message */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-widest text-gold">Purchase Confirmed</div>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            {name ? `Thank you, ${name.split(" ")[0]}.` : "You are in."}
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
            The transmission is now yours. Your copy is on its way.
          </p>
        </div>

        {/* Email notice */}
        {email && (
          <div className="rounded-2xl border border-border bg-navy/60 p-5 flex items-start gap-4 text-left">
            <Mail size={18} className="text-gold flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white mb-1">Check your inbox</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your confirmation and access details were sent to <span className="text-slate-300 font-semibold">{email}</span>.
                If you don&apos;t see it within a few minutes, check your spam folder.
              </p>
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <Link href="/member"
            className="flex items-center justify-center gap-2 py-4 px-8 rounded-2xl font-black text-sm text-deep hover:opacity-90 transition-all"
            style={{ background: "linear-gradient(90deg,#f59e0b,#fde68a,#f59e0b)" }}>
            <BookOpen size={15} />
            Go to My Member Library
            <ArrowRight size={14} />
          </Link>
          <Link href="/books"
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors py-2">
            Browse more books
          </Link>
        </div>

        {/* Footer note */}
        <p className="text-xs text-slate-700 leading-relaxed">
          Questions? Email{" "}
          <a href="mailto:niko@abundancetransmission.com" className="text-slate-500 hover:text-gold transition-colors">
            niko@abundancetransmission.com
          </a>
        </p>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-deep flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>}>
      <ThankYouContent />
    </Suspense>
  );
}
