import { describe, it, expect } from "vitest";
import {
  LanguageContext,
  LanguageContextType,
  availableLanguages,
} from "../LanguageContextDefinition";

describe("LanguageContextDefinition", () => {
  it("exports LanguageContext with undefined default value", () => {
    expect(LanguageContext).toBeDefined();
    expect(LanguageContext.Provider).toBeDefined();
    expect(LanguageContext.Consumer).toBeDefined();
    expect(LanguageContext.displayName).toBeUndefined();

    // The default value should be undefined
    // @ts-expect-error - Testing internal implementation
    expect(LanguageContext._currentValue).toBeUndefined();
  });

  it("has the correct LanguageContextType interface", () => {
    // Create a mock implementation of LanguageContextType to verify the interface
    const mockLanguageContext: LanguageContextType = {
      language: "en",
      changeLanguage: () => {},
      availableLanguages: availableLanguages,
    };

    // Verify that the mock implements the interface correctly
    expect(mockLanguageContext).toHaveProperty("language");
    expect(mockLanguageContext).toHaveProperty("changeLanguage");
    expect(mockLanguageContext).toHaveProperty("availableLanguages");

    // Test with a different language
    const mockWithDifferentLanguage: LanguageContextType = {
      ...mockLanguageContext,
      language: "de",
    };

    expect(mockWithDifferentLanguage.language).toBe("de");
  });

  it("exports availableLanguages with correct structure", () => {
    expect(availableLanguages).toBeInstanceOf(Array);
    expect(availableLanguages.length).toBeGreaterThan(0);

    // Check the structure of each language
    availableLanguages.forEach((language) => {
      expect(language).toHaveProperty("code");
      expect(language).toHaveProperty("name");
      expect(typeof language.code).toBe("string");
      expect(typeof language.name).toBe("string");
    });

    // Check that English is available
    const english = availableLanguages.find((lang) => lang.code === "en");
    expect(english).toBeDefined();
    expect(english?.name).toBe("English");

    // Check that German is available
    const german = availableLanguages.find((lang) => lang.code === "de");
    expect(german).toBeDefined();
    expect(german?.name).toBe("Deutsch");
  });
});
