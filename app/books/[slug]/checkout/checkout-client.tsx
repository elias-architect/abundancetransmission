"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Loader2, CheckCircle2, ExternalLink } from "lucide-react";

type Book = {
  id: string; slug: string; title: string; tagline: string | null;
  cover_image_url: string | null; price: number;
  author_agent: string; author_name: string | null;
};

type Stage = "form" | "paypal" | "processing" | "done";

export default function CheckoutClient({ book }: { book: Book }) {
  const router   = useRouter();
  const [stage,  setStage]  = useState<Stage>("form");
  const [name,   setName]   = useState("");
  const [email,  setEmail]  = useState("");
  const [error,  setError]  = useState("");

  const paypalUrl = `https://paypal.me/abundancetransmited/${book.price}`;

  function handlePayPal(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError("Email is required."); return; }
    setError("");
    // Open PayPal in a new tab, then show the confirmation button
    window.open(paypalUrl, "_blank", "noopener");
    setStage("paypal");
  }

  async function handleConfirm() {
    setStage("processing");
    setError("");
    try {
      const res = await fetch("/api/books/purchase", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ book_slug: book.slug, email: email.trim(), full_name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); setStage("paypal"); return; }
      setStage("done");
      setTimeout(() => router.push(`/books/${book.slug}/thank-you?email=${encodeURIComponent(email.trim())}&name=${encodeURIComponent(name.trim())}`), 1200);
    } catch {
      setError("Network error. Please try again.");
      setStage("paypal");
    }
  }

  return (
    <div className="min-h-screen bg-deep flex items-start justify-center px-4 py-16 sm:py-24">
      <div className="w-full max-w-lg">

        <Link href={`/books/${book.slug}`}
          className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-gold transition-colors mb-10">
          <ArrowLeft size={12} /> Back to book
        </Link>

        {/* Book summary */}
        <div className="flex gap-5 mb-10 items-center">
          <div className="w-16 flex-shrink-0">
            <div className="aspect-[3/4] rounded-xl overflow-hidden border border-border/40"
              style={{ background: "linear-gradient(135deg,#0a0f1e,#050810)" }}>
              {book.cover_image_url
                ? <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center"><BookOpen size={16} className="text-slate-700" /></div>
              }
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-mono mb-1">{book.author_name ?? book.author_agent}</div>
            <h1 className="text-xl font-black text-white leading-tight">{book.title}</h1>
            {book.tagline && <p className="text-xs text-slate-400 italic mt-1">{book.tagline}</p>}
          </div>
        </div>

        {/* Checkout card */}
        <div className="rounded-3xl border border-border bg-navy/70 overflow-hidden">

          {/* Price header */}
          <div className="px-8 py-6 border-b border-border/60 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-gold mb-1">Order Summary</div>
              <div className="text-sm text-slate-400">{book.title}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-white">${Number(book.price).toFixed(0)}</div>
              <div className="text-xs text-slate-600">USD · PDF · Instant access</div>
            </div>
          </div>

          <div className="p-8">

            {/* ── STAGE: FORM ── */}
            {(stage === "form") && (
              <form onSubmit={handlePayPal} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Your Name</label>
                  <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Full name (optional)"
                    className="w-full px-4 py-3 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Email Address *</label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com" required
                    className="w-full px-4 py-3 rounded-xl bg-deep border border-border text-white placeholder:text-slate-600 text-sm outline-none focus:border-gold/50 transition-colors"
                  />
                  <p className="text-xs text-slate-600 mt-1.5">Your PDF + access link will be sent here.</p>
                </div>

                {error && <p className="text-xs text-red-400">{error}</p>}

                <button type="submit"
                  className="w-full py-4 rounded-2xl font-black text-sm text-deep hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(90deg,#009cde,#003087)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.313 2.42 1.29 3.924-.023 1.565-.435 2.985-1.244 4.205a7.98 7.98 0 0 1-3.28 2.783c.57 1.32.606 2.97-.03 4.74-1.05 2.91-3.44 3.875-6.61 3.875h-.198zm.524-3.33h2.51c1.5 0 2.613-.302 3.323-1.107.662-.748.875-1.814.622-2.97-.285-1.285-1.076-1.92-2.378-1.92H9.032l-1.432 6zm1.908-9.57h2.22c1.41 0 2.456-.265 3.122-.93.62-.617.845-1.55.665-2.56-.186-1.04-.858-1.568-2.032-1.568H11.03l-1.522 5.058z"/></svg>
                  Pay ${Number(book.price).toFixed(0)} with PayPal
                </button>

                <p className="text-xs text-slate-600 text-center">
                  You will be redirected to PayPal to complete the payment securely.
                </p>
              </form>
            )}

            {/* ── STAGE: PAYPAL (opened, waiting for confirm) ── */}
            {stage === "paypal" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-gold/20 bg-gold/5 p-5 text-center space-y-2">
                  <div className="text-xs font-bold uppercase tracking-widest text-gold">PayPal opened</div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Complete your payment of <span className="text-white font-bold">${Number(book.price).toFixed(0)}</span> to <span className="text-white font-bold">@abundancetransmited</span> on PayPal.
                  </p>
                  <a href={paypalUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-gold hover:text-amber-300 transition-colors">
                    Open PayPal again <ExternalLink size={11} />
                  </a>
                </div>

                {error && <p className="text-xs text-red-400 text-center">{error}</p>}

                <button onClick={handleConfirm}
                  className="w-full py-4 rounded-2xl bg-gold text-deep font-black text-sm hover:bg-amber-400 transition-all flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} />
                  I have completed my PayPal payment
                </button>

                <button onClick={() => setStage("form")}
                  className="w-full text-xs text-slate-600 hover:text-slate-400 transition-colors">
                  Go back
                </button>
              </div>
            )}

            {/* ── STAGE: PROCESSING ── */}
            {stage === "processing" && (
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 size={28} className="animate-spin text-gold" />
                <p className="text-sm text-slate-400">Activating your access...</p>
              </div>
            )}

            {/* ── STAGE: DONE ── */}
            {stage === "done" && (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <CheckCircle2 size={32} className="text-emerald-400" />
                <p className="text-white font-black text-lg">You are in.</p>
                <p className="text-sm text-slate-400">Redirecting to your confirmation...</p>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-700 text-center mt-6">
          Questions? Email <a href="mailto:niko@abundancetransmission.com" className="text-slate-500 hover:text-gold transition-colors">niko@abundancetransmission.com</a>
        </p>
      </div>
    </div>
  );
}
