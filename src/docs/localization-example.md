# Localization Example

This document provides a detailed example of how to properly localize a component, showing before and after code.

## Example: Localizing the ParticipantForm Component

### Before: Hard-coded Text in Form Actions

```tsx
{
  /* Form Actions */
}
<div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-base-300">
  {!isMobileView && (
    <button
      type="button"
      onClick={onCancel}
      className="btn btn-ghost order-2 sm:order-1 h-auto py-3"
    >
      Cancel
    </button>
  )}
  <button
    type="submit"
    disabled={isSubmitting}
    className="btn btn-primary flex-1 order-1 sm:order-2 h-auto py-3"
  >
    {isSubmitting ? (
      <>
        <span className="loading loading-spinner loading-sm"></span>
        Saving...
      </>
    ) : initialData?.name ? (
      "Update Participant"
    ) : (
      "Create Participant"
    )}
  </button>
</div>;
```

### After: Properly Localized Text

```tsx
import { useTranslation } from "react-i18next";

// Later in the component
const { t } = useTranslation();

// In the render section
{
  /* Form Actions */
}
<div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-base-300">
  {!isMobileView && (
    <button
      type="button"
      onClick={onCancel}
      className="btn btn-ghost order-2 sm:order-1 h-auto py-3"
    >
      {t("participantForm.buttons.cancel")}
    </button>
  )}
  <button
    type="submit"
    disabled={isSubmitting}
    className="btn btn-primary flex-1 order-1 sm:order-2 h-auto py-3"
  >
    {isSubmitting ? (
      <>
        <span className="loading loading-spinner loading-sm"></span>
        {t("common.status.saving")}
      </>
    ) : initialData?.name ? (
      t("participantForm.buttons.update")
    ) : (
      t("participantForm.buttons.create")
    )}
  </button>
</div>;
```

### Corresponding Locale File Updates

#### In `en.json`:

```json
{
  "participantForm": {
    "buttons": {
      "cancel": "Cancel",
      "update": "Update Participant",
      "create": "Create Participant"
    }
  },
  "common": {
    "status": {
      "saving": "Saving..."
    }
  }
}
```

#### In `de.json`:

```json
{
  "participantForm": {
    "buttons": {
      "cancel": "Abbrechen",
      "update": "Teilnehmer aktualisieren",
      "create": "Teilnehmer erstellen"
    }
  },
  "common": {
    "status": {
      "saving": "Speichern..."
    }
  }
}
```

## Example: Localizing Validation Messages

### Before: Hard-coded Validation Messages

```tsx
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  provider: z.enum(["openai", "anthropic", "grok", "google"] as const),
  model: z.string().min(1, "Model is required"),
  roleDescription: z.string().optional(),
  systemPrompt: z.string().min(1, "System prompt is required"),
  settings: z.object({
    temperature: z.number().min(0).max(2),
    maxTokens: z.number().positive(),
  }),
});
```

### After: Localized Validation Messages

```tsx
// Move the schema inside the component function so it has access to t
function ParticipantForm() {
  const { t } = useTranslation();

  // Schema with localized error messages
  const formSchema = z.object({
    name: z.string().min(1, t("validation.nameRequired")),
    provider: z.enum(["openai", "anthropic", "grok", "google"] as const),
    model: z.string().min(1, t("validation.modelRequired")),
    roleDescription: z.string().optional(),
    systemPrompt: z.string().min(1, t("validation.systemPromptRequired")),
    settings: z.object({
      temperature: z
        .number()
        .min(0, t("validation.temperatureMin"))
        .max(2, t("validation.temperatureMax")),
      maxTokens: z.number().positive(t("validation.maxTokensPositive")),
    }),
  });

  // Rest of the component...
}
```

### Updated Locale Files for Validation

#### In `en.json`:

```json
{
  "validation": {
    "nameRequired": "Name is required",
    "modelRequired": "Model is required",
    "systemPromptRequired": "System prompt is required",
    "temperatureMin": "Temperature must be at least 0",
    "temperatureMax": "Temperature cannot exceed 2",
    "maxTokensPositive": "Max tokens must be a positive number"
  }
}
```

#### In `de.json`:

```json
{
  "validation": {
    "nameRequired": "Name ist erforderlich",
    "modelRequired": "Modell ist erforderlich",
    "systemPromptRequired": "System Prompt ist erforderlich",
    "temperatureMin": "Temperatur muss mindestens 0 sein",
    "temperatureMax": "Temperatur darf 2 nicht überschreiten",
    "maxTokensPositive": "Max Tokens muss eine positive Zahl sein"
  }
}
```

## Example: Using Utility Components for Complex Content

### Before: Hard-coded Complex Content

```tsx
<div className="space-y-4">
  <h3 className="text-lg font-medium">Features</h3>
  <ul className="list-disc pl-5 space-y-2">
    <li>Create custom AI participants with different roles</li>
    <li>Facilitate natural multi-model conversations</li>
    <li>Save and share your favorite configurations</li>
    <li>Analyze conversation patterns and insights</li>
  </ul>
</div>
```

### After: Using LocalizedList Component

```tsx
import { LocalizedText, LocalizedList } from "../components/LocalizedText";

// In the render section
<div className="space-y-4">
  <LocalizedText
    textKey="welcome.featuresSection.title"
    as="h3"
    className="text-lg font-medium"
  />

  <LocalizedList
    keyPrefix="welcome.features"
    items={["customParticipants", "multiModel", "saveConfigs", "analyze"]}
    className="list-disc pl-5 space-y-2"
  />
</div>;
```

### Corresponding Locale File Updates

#### In `en.json`:

```json
{
  "welcome": {
    "featuresSection": {
      "title": "Features"
    },
    "features": {
      "customParticipants": "Create custom AI participants with different roles",
      "multiModel": "Facilitate natural multi-model conversations",
      "saveConfigs": "Save and share your favorite configurations",
      "analyze": "Analyze conversation patterns and insights"
    }
  }
}
```

## Tips for Effective Localization

1. **Use meaningful key names** that reflect the content and location
2. **Keep keys consistently structured** across the application
3. **Use parameters for dynamic content** rather than string concatenation
4. **Test with both languages** to ensure everything displays correctly
5. **Consider text expansion/contraction** in different languages (German text is typically longer than English)
6. **Use the utility components** for complex or repetitive content
7. **Check automated UI tests** to ensure they also work with localization
