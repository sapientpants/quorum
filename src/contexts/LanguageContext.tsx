import { useState, useEffect, ReactNode } from "react";
import i18n from "../lib/i18n";
import {
  LanguageContext,
  LanguageContextType,
  availableLanguages,
} from "./contexts/LanguageContextDefinition";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(i18n.language || "en");

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setLanguage(lng);
    };

    i18n.on("languageChanged", handleLanguageChanged);

    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, []);

  const value: LanguageContextType = {
    language,
    changeLanguage,
    availableLanguages,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
