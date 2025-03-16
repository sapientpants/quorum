export type Theme =
  | "system"
  | "light"
  | "dark"
  | "cupcake"
  | "bumblebee"
  | "emerald"
  | "corporate"
  | "synthwave"
  | "retro"
  | "cyberpunk"
  | "valentine"
  | "halloween"
  | "garden"
  | "forest"
  | "aqua"
  | "lofi"
  | "pastel"
  | "fantasy"
  | "wireframe"
  | "black"
  | "luxury"
  | "dracula"
  | "cmyk"
  | "autumn"
  | "business"
  | "acid"
  | "lemonade"
  | "night"
  | "coffee"
  | "winter";
type AccentColor = "purple" | "blue" | "green" | "red";
export type KeyStoragePreference = "local" | "session" | "none";

export interface UserPreferences {
  theme: Theme;
  accentColor: AccentColor;
  autoAdvance: boolean;
  showThinkingIndicators: boolean;
  autoSummarize: boolean;
  keyStoragePreference: KeyStoragePreference;
  language: string;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
  defaultSystemPrompt?: string;
  wizardCompleted?: boolean;
  wizardStep?: number;
}
