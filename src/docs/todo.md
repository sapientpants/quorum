# Localization TODO List

This document outlines the tasks needed to ensure all displayed text in the Quorum application is properly localized using react-i18next.

## Overview

Our localization audit found approximately 170 potential instances of non-localized text across 44 files. This document categorizes and prioritizes the work needed to address these issues.

The localization process follows the guidelines outlined in [LOCALIZATION.md](./LOCALIZATION.md).

## Priority 1: User-Facing Components

These components directly impact the user experience and should be localized first.

### Main Pages and Components

- [x] **ParticipantForm.tsx**

  - Localize remaining button text (Cancel/Update/Create buttons)
  - Finish localizing form labels and descriptions
  - Localize form validation error messages
  - Add translation keys for temperature/max tokens indicators

- [x] **TemplateForm.tsx**

  - Add proper translation keys instead of direct string usage
  - Update usage of t('No participants available. Create participants first.')
  - Update usage of t('Default Conversation Starter (Optional)')
  - Update usage of t('Enter a message to start the conversation with')
  - Update usage of t('This message will be automatically sent when using this template')
  - Localize form actions and buttons

- [x] **ApiKeyManager.tsx**

  - Make sure all button text is localized
  - Check for any hard-coded error messages or status indicators
  - Ensure all placeholders use t() function
  - Added missing 'common.loading' translation key

- [ ] **Common UI texts in src/components**
  - Review all modal titles and messages
  - Check for any hard-coded button texts (Submit, Cancel, etc.)
  - Ensure all error messages display localized text

### Navigation and Layout Components

- [x] **TopBar.tsx**

  - Verify app.name translation is used for branding
  - Check for any hardcoded strings
  - Ensure accessibility labels are localized

- [x] **LanguageToggle.tsx**
  - Verify accessibility labels are localized
  - Check language selection UI
  - Ensure no hardcoded language names

## Priority 2: Forms and Inputs

Focus on ensuring all form elements are consistently localized.

- [ ] **Form Labels**

  - Ensure all <label> elements use t() for their text
  - Check for elements using className="label-text" that might contain hard-coded text

- [ ] **Placeholders**

  - Update all input placeholders to use t()
  - Example: placeholder={t('componentName.inputName.placeholder')}

- [ ] **Validation Messages**

  - Convert all hard-coded validation message strings to use t()
  - Ensure zod schemas use t() for error messages

- [ ] **Select Options and Dropdowns**
  - Check for hard-coded option text in select elements
  - Ensure toggles and switches have localized labels

## Priority 3: Utility and Helper Components

Ensure smaller, reusable components are properly localized.

- [ ] **Toast/Notification Messages**

  - Review all toast messages for localization
  - Check success/error/warning notifications

- [ ] **Modal Components**

  - Verify all modal titles, content and buttons use t()
  - Check for confirmation dialogs with hard-coded text

- [ ] **Empty States**
  - Localize all empty state messages
  - Example: "No items found" or "No results to display"

## Priority 4: Test Files

While tests don't impact user experience, they should be updated for consistency.

- [ ] **Component Tests**
  - Update tests to reflect localized component expectations
  - Mock translations in test files consistently
  - Consider a common pattern for translation mocking

## Implementation Strategy

### 1. Component Auditing

For each component file:

1. Import the useTranslation hook if not already imported:

   ```tsx
   import { useTranslation } from "react-i18next";
   ```

2. Extract the t function in the component:

   ```tsx
   const { t } = useTranslation();
   ```

3. Replace hard-coded strings with t() calls:

   ```tsx
   // Before
   <button>Submit</button>

   // After
   <button>{t('common.buttons.submit')}</button>
   ```

### 2. Translation Keys Organization

Organize translation keys hierarchically:

```json
{
  "componentName": {
    "section": {
      "element": "Translated text"
    }
  }
}
```

For example:

```json
{
  "participantForm": {
    "buttons": {
      "cancel": "Cancel",
      "create": "Create Participant",
      "update": "Update Participant"
    }
  }
}
```

### 3. Updating Locale Files

After identifying text to be localized:

1. Add new translation keys to **both** `en.json` and `de.json` files
2. Consider using the `LocalizedText` and `LocalizedList` components for cleaner JSX
3. Run the app and test each page in both languages to verify all text is translated

### 4. Using the Script for Verification

Re-run the localization checking script periodically to verify progress:

```
node src/utils/findNonLocalizedText.js
```

## Exclusions

The following should NOT be localized:

- Variable names, object keys, and other code identifiers
- Technical error codes and stack traces (though error messages should be localized)
- Test fixture data that isn't displayed to users
- CSS class names and style attributes

## Completion Checklist

- [ ] All user-visible text is localized with t()
- [ ] All dynamic text with variables uses t() with parameters
- [ ] Validation error messages are localized
- [ ] Toast/notification messages are localized
- [ ] Both en.json and de.json files are up to date
- [ ] Text loads correctly when switching languages
- [ ] Running the localization script produces only expected/acceptable results

- [x] ApiErrorModal.tsx
  - Localize modal title and content ✓
  - Add translations for action buttons ✓
  - Ensure error messages are localized ✓
  - Add translations for technical details ✓

## Components

- [x] ApiErrorModal.tsx
- [x] TopBar.tsx
- [x] LanguageToggle.tsx

## Pages

- [x] Welcome.tsx
- [x] Settings.tsx
- [x] RoundTablePage.tsx
- [x] Templates.tsx
- [x] ApiKeysPage.tsx
- [x] ParticipantsPage.tsx

## Tasks

- [x] Set up i18next
- [x] Create language toggle
- [x] Add basic translations
- [ ] Complete all page translations
- [ ] Add language detection
- [ ] Test all translations
