import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Icon } from "@iconify/react";
import { usePreferencesStore } from "../../store/preferencesStore";
import type { KeyStoragePreference } from "../../types/preferences";

interface SecurityStepProps{
  readonly onNext: () => void;
  readonly onBack?: () => void;
}

export function SecurityStep({ onNext, onBack }: SecurityStepProps) {
  const { t } = useTranslation();
  const { preferences, updatePreferences } = usePreferencesStore();
  const [selectedStorage, setSelectedStorage] = useState<KeyStoragePreference>(
    preferences.keyStoragePreference || "local",
  );

  function handleStorageChange(preference: KeyStoragePreference) {
    setSelectedStorage(preference);
    updatePreferences({ keyStoragePreference: preference });
  }

  function handleContinue() {
    console.log("SecurityStep: handleContinue called");
    onNext();
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">
          {t("wizard.security.title")}
        </h2>
        <p className="text-muted-foreground">
          {t("wizard.security.description")}
        </p>
      </div>

      <div className="space-y-4">
        {/* Local Storage Option */}
        <button
          className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
            selectedStorage === "local"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onClick={() => handleStorageChange("local")}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 rounded-full w-5 h-5 flex items-center justify-center border ${
                selectedStorage === "local"
                  ? "border-primary"
                  : "border-muted-foreground"
              }`}
            >
              {selectedStorage === "local" && (
                <div className="w-3 h-3 rounded-full bg-primary" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-lg">
                {t("wizard.security.localStorage.title")}
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                {t("wizard.security.localStorage.description")}
              </p>
            </div>
          </div>
        </button>

        {/* Session Storage Option */}
        <button
          className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
            selectedStorage === "session"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onClick={() => handleStorageChange("session")}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 rounded-full w-5 h-5 flex items-center justify-center border ${
                selectedStorage === "session"
                  ? "border-primary"
                  : "border-muted-foreground"
              }`}
            >
              {selectedStorage === "session" && (
                <div className="w-3 h-3 rounded-full bg-primary" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-lg">
                {t("wizard.security.sessionOnly.title")}
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                {t("wizard.security.sessionOnly.description")}
              </p>
            </div>
          </div>
        </button>

        {/* No Storage Option */}
        <button
          className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
            selectedStorage === "none"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onClick={() => handleStorageChange("none")}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 rounded-full w-5 h-5 flex items-center justify-center border ${
                selectedStorage === "none"
                  ? "border-primary"
                  : "border-muted-foreground"
              }`}
            >
              {selectedStorage === "none" && (
                <div className="w-3 h-3 rounded-full bg-primary" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-lg">
                {t("wizard.security.noStorage.title")}
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                {t("wizard.security.noStorage.description")}
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="bg-muted/30 rounded-lg p-4 mt-6 border border-border">
        <div className="flex items-start gap-2">
          <Icon
            icon="solar:info-circle-linear"
            className="text-muted-foreground mt-0.5 flex-shrink-0"
          />
          <div>
            <p className="text-sm text-muted-foreground">
              {t("wizard.security.note")}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {t("wizard.security.changeNote")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        {onBack && (
          <Button variant="outline" onClick={onBack} className="mr-2">
            {t("wizard.navigation.back")}
          </Button>
        )}
        <Button
          onClick={handleContinue}
          variant="default"
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {t("wizard.navigation.next")}
        </Button>
      </div>
    </div>
  );
}
