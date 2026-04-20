import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "bbbfi-locale";

const LanguageContext = createContext({
  locale: "en",
  setLocale: () => {},
});

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "zh" || saved === "en") {
        setLocaleState(saved);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
  }, [locale, ready]);

  const setLocale = useCallback((next) => {
    setLocaleState(next === "zh" ? "zh" : "en");
  }, []);

  const value = useMemo(
    () => ({ locale, setLocale }),
    [locale, setLocale]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
