"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/",               label: "Home" },
  { href: "/origin",         label: "Origin" },
  { href: "/transmission",   label: "Transmission" },
  { href: "/books",          label: "Books" },
  { href: "/arsenal",        label: "Arsenal" },
  { href: "/command-center", label: "Command Center" },
  { href: "/vault",          label: "Vault" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-deep/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold/80 to-amber-600 flex items-center justify-center text-deep font-black text-sm">
            A
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold tracking-wide text-white group-hover:text-gold transition-colors">
              Abundance Transmission
            </div>
            <div className="text-[10px] text-slate-500 tracking-wider uppercase">
              Pattern Mastery · AI Edges · Empathic Abundance
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "nav-link px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide uppercase transition-colors",
                pathname === l.href
                  ? "text-gold"
                  : "text-slate-400 hover:text-white"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* CTA + burger */}
        <div className="flex items-center gap-3">
          <Link
            href="/#early-access"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold/10 border border-gold/30 text-gold text-xs font-bold uppercase tracking-wide hover:bg-gold/20 transition-all"
          >
            Early Access
          </Link>
          <button
            className="lg:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-border/60 bg-navy">
          <nav className="flex flex-col p-4 gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-lg text-sm font-semibold transition-colors",
                  pathname === l.href
                    ? "bg-gold/10 text-gold"
                    : "text-slate-300 hover:bg-border/60 hover:text-white"
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/#early-access"
              onClick={() => setOpen(false)}
              className="mt-2 px-4 py-3 rounded-lg bg-gold/10 border border-gold/30 text-gold text-sm font-bold text-center hover:bg-gold/20 transition-all"
            >
              Get Early Access
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
