import { useContext } from "react";
import { LanguageContext } from "../contexts/contexts/LanguageContextDefinition";

/**
 * Custom hook to use the language context
 */
export function useLanguageContext() {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    throw new Error(
      "useLanguageContext must be used within a LanguageProvider",
    );
  }

  return context;
}
