import { useState, useEffect, ReactNode, useMemo } from "react";
import i18n from "../lib/i18n";
import {
  LanguageContext,
  LanguageContextType,
  availableLanguages,
} from "./contexts/LanguageContextDefinition";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(i18n.language || "en");

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setLanguage(lng);
    };

    i18n.on("languageChanged", handleLanguageChanged);

    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, []);

  const value = useMemo<LanguageContextType>(() => {
    const changeLanguage = (lang: string) => {
      i18n.changeLanguage(lang);
    };

    return {
      language,
      changeLanguage,
      availableLanguages,
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
