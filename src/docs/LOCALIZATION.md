# Localization Guidelines

This document provides guidelines for ensuring all displayed text in the Quorum application is properly localized.

## Localization Setup

The project uses `react-i18next` for localization. The setup includes:

- Translation files in `src/locales/` directory (currently `en.json` and `de.json`)
- Initialization in `src/lib/i18n.ts`
- A `LanguageContext` provider in `src/contexts/LanguageContext.tsx`
- A `LanguageToggle` component for changing languages

## How to Localize Text

### Basic Translation

For simple text content, use the `t()` function from `react-i18next`:

```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("myComponent.title")}</h1>
      <p>{t("myComponent.description")}</p>
    </div>
  );
}
```

### Dynamic Content with Parameters

For text with dynamic content, pass parameters to the `t()` function:

```tsx
// In your component
const username = 'John'
t('greeting', { name: username })

// In locales/en.json
{
  "greeting": "Hello, {{name}}!"
}

// In locales/de.json
{
  "greeting": "Hallo, {{name}}!"
}
```

### Using Utility Components

For better organization, use the provided utility components:

```tsx
import { LocalizedText, LocalizedList } from '../components/LocalizedText'

// Single text item
<LocalizedText textKey="welcome.message" as="h1" className="text-2xl" />

// Lists of items
<LocalizedList
  keyPrefix="features"
  items={['cloud', 'security', 'performance']}
  className="list-disc pl-5"
/>
```

### Forms and Validation

For form labels, placeholders, and validation messages:

```tsx
// Use t() in labels and placeholders
<label>{t('form.email')}</label>
<input placeholder={t('form.emailPlaceholder')} />

// For validation messages in schemas
const schema = z.object({
  email: z.string().email(t('validation.invalidEmail'))
})
```

## Translation Structure

Organize translations with nested objects for better maintainability:

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
  "settings": {
    "apiKeys": {
      "title": "API Keys",
      "description": "Manage your API keys",
      "openai": "OpenAI API Key"
    }
  }
}
```

## Finding Non-Localized Text

Run the utility script to find potential non-localized text:

```bash
node src/utils/findNonLocalizedText.js
```

This will scan the codebase for patterns that might indicate hard-coded text and report files and line numbers.

## Localization Checklist

When creating or modifying components:

1. Import `useTranslation` hook
2. Extract the `t` function
3. Replace all hard-coded text with `t('key')`
4. Add translation keys to all locale files
5. For larger components, consider using `LocalizedText` or `LocalizedList`
6. Test the component with all supported languages

## Adding a New Language

To add a new language:

1. Create a new file in `src/locales/` (e.g., `fr.json`)
2. Copy the structure from an existing locale file
3. Translate all values
4. Add the language to the available languages in `src/contexts/LanguageContextDefinition.ts`

## Common Localization Mistakes

- Using string concatenation instead of parameters
- Forgetting to localize error messages
- Missing translations for new features
- Hard-coding text in utility functions
