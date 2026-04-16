"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/lang-context";
import { translations } from "@/lib/translations";

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { lang, setLang } = useLang();
  const n = translations[lang].nav;

  const links = [
    { href: "/",               label: n.home },
    { href: "/origin",         label: n.origin },
    { href: "/transmission",   label: n.transmission },
    { href: "/books",          label: n.books },
    { href: "/arsenal",        label: n.arsenal },
    { href: "/automation",     label: lang === "en" ? "Automation" : "Automatisation" },
    { href: "/command-center", label: n.commandCenter },
    { href: "/vault",          label: n.vault },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-deep/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold/80 to-amber-600 flex items-center justify-center text-deep font-black text-sm">
            A
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold tracking-wide text-white group-hover:text-gold transition-colors">
              Abundance Transmission
            </div>
            <div className="text-[10px] text-slate-500 tracking-wider uppercase">
              {lang === "en"
                ? "Pattern Mastery · AI Edges · Empathic Abundance"
                : "Maîtrise des Patterns · Avantages IA · Abondance Empathique"}
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className={cn(
                "nav-link px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide uppercase transition-colors",
                pathname === l.href ? "text-gold" : "text-slate-400 hover:text-white"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "en" ? "fr" : "en")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-navy text-xs font-bold tracking-widest hover:border-gold/40 transition-all"
          >
            <span className={lang === "en" ? "text-gold" : "text-slate-500"}>EN</span>
            <span className="text-slate-600">|</span>
            <span className={lang === "fr" ? "text-gold" : "text-slate-500"}>FR</span>
          </button>
          <Link href="/login"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-slate-500 text-xs font-semibold hover:border-gold/30 hover:text-gold transition-all"
            title={lang === "en" ? "Member Portal" : "Espace Membre"}
          >
            <LogIn size={13} />
            <span className="hidden md:inline">{lang === "en" ? "Portal" : "Portail"}</span>
          </Link>
          <Link href="/#early-access"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold/10 border border-gold/30 text-gold text-xs font-bold uppercase tracking-wide hover:bg-gold/20 transition-all"
          >
            {n.earlyAccess}
          </Link>
          <button className="lg:hidden p-2 text-slate-400 hover:text-white" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/60 bg-navy">
          <nav className="flex flex-col p-4 gap-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-lg text-sm font-semibold transition-colors",
                  pathname === l.href ? "bg-gold/10 text-gold" : "text-slate-300 hover:bg-border/60 hover:text-white"
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/#early-access" onClick={() => setOpen(false)}
              className="mt-2 px-4 py-3 rounded-lg bg-gold/10 border border-gold/30 text-gold text-sm font-bold text-center hover:bg-gold/20 transition-all"
            >
              {n.earlyAccess}
            </Link>
            <Link href="/login" onClick={() => setOpen(false)}
              className="px-4 py-3 rounded-lg border border-border text-slate-400 text-sm font-semibold text-center hover:border-gold/30 hover:text-gold transition-all flex items-center justify-center gap-2"
            >
              <LogIn size={14} />
              {lang === "en" ? "Member Portal" : "Espace Membre"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
