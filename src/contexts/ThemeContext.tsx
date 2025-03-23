import { ReactNode } from "react";
import { useTheme } from "../hooks/useTheme";
import { ThemeContext } from "./contexts/ThemeContextDefinition";

interface ThemeProviderProps {
  readonly children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeValue = useTheme();

  return (
    <ThemeContext.Provider value={themeValue}>{children}</ThemeContext.Provider>
  );
}
