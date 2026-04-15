"use client";
import Link from "next/link";
import { Mail, ExternalLink } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { translations } from "@/lib/translations";

export default function Footer() {
  const { lang } = useLang();
  const n = translations[lang].nav;
  const f = translations[lang].footer;

  const navLinks = [
    { href: "/origin",         label: n.origin },
    { href: "/transmission",   label: n.transmission },
    { href: "/books",          label: n.books },
    { href: "/arsenal",        label: n.arsenal },
    { href: "/command-center", label: n.commandCenter },
    { href: "/vault",          label: n.vault },
  ];

  return (
    <footer className="border-t border-border/60 bg-navy mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold/80 to-amber-600 flex items-center justify-center text-deep font-black text-sm">
                A
              </div>
              <span className="font-bold text-white tracking-wide">Abundance Transmission</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">{f.tagline}</p>
            <div className="text-xs text-slate-600">
              {f.by} <span className="text-gold">Niko</span> — Pisces ♓ Feb 27, 1989
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">{f.navigate}</div>
            <ul className="space-y-2">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-400 hover:text-gold transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">{f.contact}</div>
            <div className="space-y-3">
              <a href="mailto:niko@abundancetransmission.com"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-gold transition-colors">
                <Mail size={14} /> niko@abundancetransmission.com
              </a>
              <a href="https://abundancetransmission.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-teal transition-colors">
                <ExternalLink size={14} /> abundancetransmission.com
              </a>
            </div>
            <div className="mt-6 pt-6 border-t border-border/40">
              <Link href="/#early-access"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold/10 border border-gold/30 text-gold text-xs font-bold hover:bg-gold/20 transition-all">
                {f.joinList}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div>© {new Date().getFullYear()} Abundance Transmission. {f.copyright}</div>
          <div className="flex items-center gap-1">
            <span className="text-gold animate-glow-pulse">✦</span>
            <span>{f.tagline.replace(".", "")}</span>
            <span className="text-gold animate-glow-pulse">✦</span>
          </div>
        </div>
        <div className="mt-4 text-center text-[10px] text-slate-700 tracking-widest uppercase select-none">
          {f.watermark}
        </div>
      </div>
    </footer>
  );
}
