"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { translations, type Lang } from "./translations";

type LangContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (section: string, key: string) => string;
};

const LangContext = createContext<LangContextType>({
  lang: "en",
  setLang: () => {},
  t: (s, k) => k,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      // URL param takes priority (used in email links: ?lang=fr)
      const urlParam = new URLSearchParams(window.location.search).get("lang") as Lang | null;
      if (urlParam === "en" || urlParam === "fr") {
        setLangState(urlParam);
        localStorage.setItem("at_lang", urlParam);
        return;
      }
      const saved = localStorage.getItem("at_lang") as Lang;
      if (saved === "fr") setLangState("fr");
    } catch {}
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    try { localStorage.setItem("at_lang", l); } catch {}
  }

  function t(section: string, key: string): string {
    const dict = translations[lang] as Record<string, Record<string, unknown>>;
    const enDict = translations["en"] as Record<string, Record<string, unknown>>;
    const val = dict?.[section]?.[key];
    if (typeof val === "string") return val;
    const fallback = enDict?.[section]?.[key];
    return typeof fallback === "string" ? fallback : key;
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

/** Convenience: get a full translated section as typed object */
export function useSection<T>(section: keyof typeof translations.en): T {
  const { lang } = useContext(LangContext);
  return (translations[lang] as Record<string, unknown>)[section as string] as T;
}
