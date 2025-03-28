import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ApiKey, ApiKeyStorageOptions } from "../types/api";
import type { LLMProviderId } from "../types/llm";
import { validateApiKey } from "../services/apiKeyService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

/**
 * Props for the ApiKeySetup component
 */
interface ApiKeySetupProps {
  /** Callback function to execute when setup is complete */
  readonly onComplete: () => void | Promise<void>;
  /** Initial API keys to populate the form with */
  readonly initialKeys?: ApiKey[];
  /** Storage type for the API keys */
  readonly storageType?: ApiKeyStorageOptions["storage"];
}

/**
 * Configuration for each provider
 */
interface ProviderConfig {
  /** Provider identifier */
  id: LLMProviderId;
  /** Display label for the provider */
  label: string;
  /** URL to get an API key for this provider */
  getKeyUrl: string;
  /** Text for the "get key" link */
  getKeyText: string;
  /** Placeholder text for the input field */
  placeholder: string;
  /** Regular expression to validate the API key format */
  validatePattern?: RegExp;
}

// Form schema using Zod
const formSchema = z
  .object({
    openai: z.string().optional(),
    anthropic: z.string().optional(),
    grok: z.string().optional(),
    google: z.string().optional(),
  })
  .refine(
    (data) => {
      // At least one key must be provided
      return Object.values(data).some((value) => !!value);
    },
    {
      message: "apiKeys.errors.atLeastOneRequired",
      path: ["openai"], // Show error on the first field
    },
  );

// Define the form schema type
type FormSchema = z.infer<typeof formSchema>;

/**
 * Component for setting up API keys for different LLM providers
 */
export function ApiKeySetup({
  onComplete,
  initialKeys = [],
  storageType = "session",
}: ApiKeySetupProps): React.ReactElement {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Define provider configurations
  const providers: ProviderConfig[] = [
    {
      id: "openai",
      label: t("apiKeys.openai.label"),
      getKeyUrl: "https://platform.openai.com/api-keys",
      getKeyText: t("apiKeys.openai.getKey"),
      placeholder: t("apiKeys.openai.placeholder"),
      validatePattern: /^sk-/,
    },
    {
      id: "anthropic",
      label: t("apiKeys.anthropic.label"),
      getKeyUrl: "https://console.anthropic.com/account/keys",
      getKeyText: t("apiKeys.anthropic.getKey"),
      placeholder: t("apiKeys.anthropic.placeholder"),
      validatePattern: /^sk-ant-/,
    },
    {
      id: "grok",
      label: t("apiKeys.grok.label"),
      getKeyUrl: "https://grok.x.ai/keys",
      getKeyText: t("apiKeys.grok.getKey"),
      placeholder: t("apiKeys.grok.placeholder"),
    },
    {
      id: "google",
      label: t("apiKeys.google.label"),
      getKeyUrl: "https://makersuite.google.com/app/apikey",
      getKeyText: t("apiKeys.google.getKey"),
      placeholder: t("apiKeys.google.placeholder"),
    },
  ];

  // Initialize form with React Hook Form and Zod validation
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      openai: "",
      anthropic: "",
      grok: "",
      google: "",
    },
  });

  // Load initial keys if provided
  useEffect(() => {
    if (initialKeys.length === 0) return;

    const defaultValues: FormSchema = {
      openai: "",
      anthropic: "",
      grok: "",
      google: "",
    };

    // Update defaultValues with any matching keys from initialKeys
    initialKeys.forEach((apiKey) => {
      const providerKey = apiKey.provider as keyof FormSchema;
      if (providerKey && providerKey in defaultValues) {
        defaultValues[providerKey] = apiKey.key;
      }
    });

    form.reset(defaultValues);
  }, [initialKeys, form]);

  /**
   * Validates an API key for a specific provider
   * @param provider - The LLM provider ID
   * @param value - The API key to validate
   * @returns true if valid, or an error message if invalid
   */
  function validateProviderKey(
    provider: LLMProviderId,
    value: string,
  ): true | string {
    if (!value) return true;

    const providerConfig = providers.find((p) => p.id === provider);
    if (
      providerConfig?.validatePattern &&
      !providerConfig.validatePattern.test(value)
    ) {
      return t("apiKeys.errors.invalidKey");
    }

    const validation = validateApiKey(provider, value);
    if (!validation.isValid) {
      return validation.message ?? t("apiKeys.errors.invalidKey");
    }

    return true;
  }

  /**
   * Form submission handler
   * @param data - The form data
   */
  async function onSubmit(data: FormSchema): Promise<void> {
    // Validate each provided key
    const validationErrors: Record<string, string> = {};

    for (const [provider, key] of Object.entries(data)) {
      if (!key) continue;

      const validationResult = validateProviderKey(
        provider as LLMProviderId,
        key,
      );
      if (validationResult !== true) {
        validationErrors[provider] = validationResult;
      }
    }

    // If there are validation errors, set them and return
    if (Object.keys(validationErrors).length > 0) {
      Object.entries(validationErrors).forEach(([field, message]) => {
        form.setError(field as keyof FormSchema, {
          type: "manual",
          message,
        });
      });
      return;
    }

    // Store keys based on storage preference
    if (storageType !== "none") {
      const storage = storageType === "local" ? localStorage : sessionStorage;
      Object.entries(data).forEach(([provider, key]) => {
        if (key) {
          storage.setItem(`${provider}_api_key`, key);
        }
      });
    }

    setIsLoading(true);
    try {
      await onComplete();
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Handle input change and clear errors
   * @param field - The form field
   * @param e - The change event
   */
  const handleInputChange = (
    field: ControllerRenderProps<FormSchema, keyof FormSchema>,
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    field.onChange(e);
    // Clear errors when user starts typing
    if (form.formState.errors[field.name]) {
      form.clearErrors(field.name);
    }
  };

  /**
   * Handle input blur for validation
   * @param field - The form field
   * @param e - The blur event
   * @param validatePattern - Optional regex pattern for validation
   */
  const handleInputBlur = (
    field: ControllerRenderProps<FormSchema, keyof FormSchema>,
    e: React.FocusEvent<HTMLInputElement>,
    validatePattern?: RegExp,
  ): void => {
    field.onBlur();
    if (
      e.target.value &&
      validatePattern &&
      !validatePattern.test(e.target.value)
    ) {
      form.setError(field.name, {
        type: "manual",
        message: t("apiKeys.errors.invalidKey"),
      });
    }
  };

  return (
    <div className="relative bg-card p-8 rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10 rounded-xl -z-10"></div>

      <h2 className="text-2xl font-bold mb-4 text-foreground">
        {t("apiKeys.setup.title")}
      </h2>
      <p className="text-foreground/70 mb-8">
        {t("apiKeys.setup.description")}
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {providers.map((provider) => (
            <FormField
              key={provider.id}
              control={form.control}
              name={provider.id as keyof FormSchema}
              render={({
                field,
              }: {
                field: ControllerRenderProps<FormSchema, keyof FormSchema>;
              }) => (
                <FormItem className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormLabel htmlFor={provider.id} className="text-base">
                      {provider.label}
                    </FormLabel>
                    <a
                      href={provider.getKeyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                    >
                      <Icon
                        icon="solar:info-circle-linear"
                        className="w-4 h-4"
                      />
                      {provider.getKeyText}
                    </a>
                  </div>
                  <FormControl>
                    <Input
                      id={provider.id}
                      type="password"
                      placeholder={provider.placeholder}
                      {...field}
                      onChange={(e) => handleInputChange(field, e)}
                      onBlur={(e) =>
                        handleInputBlur(field, e, provider.validatePattern)
                      }
                    />
                  </FormControl>
                  <FormMessage data-testid={`${provider.id}-error`} />
                </FormItem>
              )}
            />
          ))}

          <div className="mt-8 flex justify-end">
            <Button
              type="submit"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-secondary/80 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 font-medium px-8 h-12 rounded-md shadow-lg hover:shadow-purple-600/30 transition-all inline-flex items-center justify-center gap-2 w-64 mx-auto"
              disabled={isLoading}
            >
              <span>
                {isLoading ? t("common.testing") : t("common.continue")}
              </span>
            </Button>
          </div>
        </form>
      </Form>

      <p className="mt-6 text-sm text-foreground/70">
        {t("apiKeys.setup.storageNote", {
          storage:
            storageType === "none"
              ? t("apiKeys.setup.notStored")
              : t("apiKeys.setup.storedLocally"),
        })}
      </p>
    </div>
  );
}
