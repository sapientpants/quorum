import "@testing-library/jest-dom";
import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import React from "react";

// Extend Vitest's expect method with React Testing Library methods
expect.extend(matchers);

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Default translations for tests
let translations: Record<string, string> = {
  "common.actions.close": "Close",
  "common.buttons.cancel": "Cancel",
  "common.continue": "Continue",
  "common.testing": "Testing...",
  "welcome.consent.title": "API Key Storage Consent",
  "welcome.consent.intro":
    "Before you enter your API key, please understand how it will be handled:",
  "welcome.consent.points.storage":
    "Your API key will be stored in your browser only.",
  "welcome.consent.points.processing":
    "Your API key is only used to make requests to the AI provider.",
  "welcome.consent.points.access":
    "We never see or store your API key on our servers.",
  "welcome.consent.points.options": "Choose your storage preference:",
  "welcome.consent.agreement":
    "I understand and consent to the storage of my API key as selected above.",
  "welcome.consent.cancel": "Cancel",
  "welcome.consent.continue": "Continue",
  "wizard.apiKeys.noKeyWarning":
    "You need at least one valid API key to continue",
  "roundTable.title": "Round Table",
  "roundTable.noParticipants": "No participants configured yet.",
  "roundTable.goToSettings": "Go to the Settings page to add participants.",
  "roundTable.clickToViewDetails": "Click on a participant to view details",
  "modelSelector.selectAModel": "Select a model",
  "providerSelector.label": "Select Provider",
  "providerSelector.noApiKey": "No API Key",
  "participantForm.name": "Name",
  "participantForm.provider": "Provider",
  "participantForm.model": "Model",
  "participantForm.roleDescription": "Role Description",
  "participantForm.systemPrompt": "System Prompt",
  "participantForm.systemPromptDescription":
    "Instructions for how the participant should behave",
  "participantForm.advancedSettings": "Advanced Settings",
  "participantForm.buttons.create": "Create Participant",
  "participantForm.namePlaceholder": "Enter participant name",
  "participantForm.roleDescriptionPlaceholder": "Describe the role...",
  "participantForm.systemPromptPlaceholder": "Enter system prompt...",
  "participantForm.temperature": "Temperature",
  "participantForm.temperatureOptions.precise": "Precise",
  "participantForm.temperatureOptions.balanced": "Balanced",
  "participantForm.temperatureOptions.creative": "Creative",
  "participantForm.maxTokens": "Max Tokens",
  "participantForm.maxTokensOptions.short": "Short",
  "participantForm.maxTokensOptions.medium": "Medium",
  "participantForm.maxTokensOptions.long": "Long",
  "validation.nameRequired": "Name is required",
  "validation.modelRequired": "Model is required",
  "validation.systemPromptRequired": "System prompt is required",
  "apiKeys.setup.title": "API Keys",
  "apiKeys.setup.description": "Add your API keys to use with Quorum",
  "apiKeys.setup.storageNote":
    "Your API key is stored locally in your browser and never sent to our servers.",
  "apiKeys.errors.invalidKey": "Invalid API key",
  "apiKeys.openai.label": "OpenAI API Key",
  "apiKeys.anthropic.label": "Anthropic API Key",
  "apiKeys.grok.label": "Grok API Key",
  "apiKeys.google.label": "Google API Key",
  "templateForm.selectParticipants": "Select Participants",
  "templateForm.namePlaceholder": "Enter template name",
  "templateForm.descriptionPlaceholder": "Enter template description",
  "templateForm.conversationStarterPlaceholder": "Enter a conversation starter",
  "templateForm.conversationStarterDescription":
    "This message will be sent automatically when using this template",
  "welcome.consent.points.localStorage.title": "Local Storage",
  "welcome.consent.points.localStorage.description":
    "Stays until explicitly cleared",
  "welcome.consent.points.sessionStorage.title": "Session Storage",
  "welcome.consent.points.sessionStorage.description":
    "Clears when you close the browser",
  "welcome.consent.points.noStorage.title": "No Storage",
  "welcome.consent.points.noStorage.description": "Enter key each time",
  "errors.technicalDetails.error": "Error: Invalid API key",
  "errors.technicalDetails.type": "Type: authentication",
  "errors.technicalDetails.status": "Status: 401",
  "errors.technicalDetails.provider": "Provider: openai",
  "participantConfig.title": "Participant Configuration",
  "participantConfig.views.list": "List",
  "participantConfig.views.roundTable": "Round Table",
  "participantConfig.configuration.title": "Configuration",
  "participantConfig.configuration.selectPrompt":
    "Select a participant to view details",
  "participantConfig.configuration.systemPrompt": "System Prompt",
  "participantConfig.configuration.edit": "Edit",
  "participantConfig.configuration.activeParticipant.title":
    "Active Participant",
  "participantConfig.configuration.activeParticipant.description":
    "This participant will start the conversation",
  "participantConfig.configuration.activeParticipant.clearSelection":
    "Clear Selection",
  "errorBoundary.title": "Something went wrong",
  "errorBoundary.unknownError": "Unknown error",
};

// Directly modify the react-i18next mock to allow direct manipulation of radio inputs
vi.mock("react-i18next", () => {
  const getT = () => (key: string, defaultValue?: string) =>
    translations[key] || defaultValue || key;

  return {
    // Mock the useTranslation hook
    useTranslation: () => ({
      t: getT(),
      i18n: {
        changeLanguage: () => Promise.resolve(),
      },
    }),

    // Mock the Trans component
    Trans: ({
      i18nKey,
      children,
    }: {
      i18nKey?: string;
      children?: React.ReactNode;
    }) => {
      return i18nKey ? translations[i18nKey] || i18nKey : children;
    },

    // Mock the withTranslation HOC
    withTranslation:
      () =>
      (
        Component: React.ComponentType<{
          t: (key: string) => string;
          i18n?: { language: string };
        }>,
      ) => {
        Component.displayName = `withTranslation(${Component.displayName || Component.name || "Component"})`;
        const WrappedComponent = (props: Record<string, unknown>) => {
          const tFunction = getT();
          // Use createElement instead of JSX
          return React.createElement(Component, {
            t: tFunction,
            i18n: { language: "en" },
            ...props,
          });
        };
        WrappedComponent.displayName = `WithTranslation(${Component.displayName || Component.name || "Component"})`;
        return WrappedComponent;
      },

    // Add other react-i18next functionality as needed
    initReactI18next: {
      type: "3rdParty",
      init: () => {},
    },
  };
});

// Helper to create a translation mock with specific translations
export const createTranslationMock = (
  newTranslations: Record<string, string>,
) => {
  translations = { ...translations, ...newTranslations };
};
