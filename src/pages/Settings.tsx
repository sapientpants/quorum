import * as React from "react";
import { Button } from "../components/ui/button";
import ApiKeyManager from "../components/ApiKeyManager";
import { ParticipantList } from "../components/ParticipantList";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { usePreferencesStore } from "../store/preferencesStore";
import { type KeyStoragePreference } from "../types/preferences";
import { useState } from "react";
import { Separator } from "../components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { toast } from "sonner";

export function Settings() {
  const [activeTab, setActiveTab] = React.useState("api-keys");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    preferences,
    updatePreferences,
    resetPreferences,
    setWizardCompleted,
  } = usePreferencesStore();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportData, setExportData] = useState("");

  function handleRestartWizard() {
    // Reset wizard state
    setWizardCompleted(false);

    // Navigate to root (wizard will show)
    navigate("/");

    toast.success(t("settings.wizardRestarted", "Setup wizard restarted"));
  }

  function handleApiKeyChange(provider: string, key: string) {
    // Store in localStorage
    if (key) {
      localStorage.setItem(`${provider}_api_key`, key);
    } else {
      localStorage.removeItem(`${provider}_api_key`);
    }
  }

  function handleResetDefaults() {
    // Close the dialog
    setIsResetDialogOpen(false);

    // Use the preferences store reset function
    resetPreferences();

    toast.success(t("settings.resetSuccessful"));
  }

  function handleKeyStorageChange(preference: KeyStoragePreference) {
    updatePreferences({ keyStoragePreference: preference });
    toast.success(t("settings.keyStorageUpdated"));
  }

  function handleClearAllData() {
    // Clear localStorage
    localStorage.clear();

    // Reset preferences to defaults
    resetPreferences();

    // Close the dialog
    setIsResetDialogOpen(false);

    toast.success(t("settings.dataCleared"));
  }

  function handleExportData() {
    try {
      // Collect all data from localStorage
      const exportObj: Record<string, unknown> = {};

      // Add all localStorage items
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            // Try to parse as JSON first
            exportObj[key] = JSON.parse(localStorage.getItem(key) ?? "");
          } catch {
            // If not valid JSON, store as string
            exportObj[key] = localStorage.getItem(key);
          }
        }
      }

      // Format as pretty JSON
      const dataStr = JSON.stringify(exportObj, null, 2);
      setExportData(dataStr);
      setIsExportDialogOpen(true);
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error(t("settings.exportError"));
    }
  }

  function downloadExportedData() {
    try {
      const dataStr =
        "data:text/json;charset=utf-8," + encodeURIComponent(exportData);
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "quorum_data_export.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      setIsExportDialogOpen(false);
    } catch (error) {
      console.error("Error downloading data:", error);
      toast.error(t("settings.downloadError"));
    }
  }

  return (
    <div className="mb-6 mt-6 pl-6 pr-6 mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t("settings.title")}</h1>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:shrink-0">
          <div className="flex flex-col gap-2 sticky top-20">
            <Button
              variant={activeTab === "api-keys" ? "default" : "ghost"}
              onClick={() => setActiveTab("api-keys")}
              className="justify-start"
            >
              <Icon icon="solar:key-linear" className="mr-2 h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{t("settings.apiKeys")}</span>
            </Button>
            <Button
              variant={activeTab === "participants" ? "default" : "ghost"}
              onClick={() => setActiveTab("participants")}
              className="justify-start"
            >
              <Icon
                icon="solar:users-group-rounded-linear"
                className="mr-2 h-4 w-4 shrink-0"
              />
              <span className="whitespace-nowrap">
                {t("settings.participants")}
              </span>
            </Button>
            <Button
              variant={activeTab === "privacy" ? "default" : "ghost"}
              onClick={() => setActiveTab("privacy")}
              className="justify-start"
            >
              <Icon
                icon="solar:shield-user-linear"
                className="mr-2 h-4 w-4 shrink-0"
              />
              <span className="whitespace-nowrap">{t("settings.privacy")}</span>
            </Button>
            <Button
              variant={activeTab === "about" ? "default" : "ghost"}
              onClick={() => setActiveTab("about")}
              className="justify-start"
            >
              <Icon
                icon="solar:info-circle-linear"
                className="mr-2 h-4 w-4 shrink-0"
              />
              <span className="whitespace-nowrap">{t("settings.about")}</span>
            </Button>
          </div>
        </div>

        <div className="w-full md:grow">
          {activeTab === "api-keys" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                {t("settings.apiKeys")}
              </h2>
              <p className="mb-6">{t("settings.apiKeysDescription")}</p>

              <ApiKeyManager
                onApiKeyChange={handleApiKeyChange}
                storageOption={{ storage: preferences.keyStoragePreference }}
              />
            </div>
          )}

          {activeTab === "participants" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                {t("settings.participants")}
              </h2>
              <p className="mb-6">{t("settings.participantsDescription")}</p>

              <ParticipantList />
            </div>
          )}

          {activeTab === "privacy" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                {t("settings.privacy")}
              </h2>
              <p className="mb-6">{t("settings.privacyDescription")}</p>

              <div className="space-y-8">
                <div className="card bg-base-200 shadow-sm">
                  <div className="card-body">
                    <h3 className="text-xl font-semibold">
                      {t("settings.apiKeyStorage")}
                    </h3>
                    <p className="mb-4">
                      {t("settings.apiKeyStorageDescription")}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="localStorage"
                          name="keyStorage"
                          className="radio radio-primary"
                          checked={preferences.keyStoragePreference === "local"}
                          onChange={() => handleKeyStorageChange("local")}
                        />
                        <label htmlFor="localStorage" className="flex flex-col">
                          <span className="font-medium">
                            {t("settings.localStorage")}
                          </span>
                          <span className="text-sm opacity-70">
                            {t("settings.localStorageDescription")}
                          </span>
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="sessionOnly"
                          name="keyStorage"
                          className="radio radio-primary"
                          checked={
                            preferences.keyStoragePreference === "session"
                          }
                          onChange={() => handleKeyStorageChange("session")}
                        />
                        <label htmlFor="sessionOnly" className="flex flex-col">
                          <span className="font-medium">
                            {t("settings.sessionOnly")}
                          </span>
                          <span className="text-sm opacity-70">
                            {t("settings.sessionOnlyDescription")}
                          </span>
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="noStorage"
                          name="keyStorage"
                          className="radio radio-primary"
                          checked={preferences.keyStoragePreference === "none"}
                          onChange={() => handleKeyStorageChange("none")}
                        />
                        <label htmlFor="noStorage" className="flex flex-col">
                          <span className="font-medium">
                            {t("settings.noStorage")}
                          </span>
                          <span className="text-sm opacity-70">
                            {t("settings.noStorageDescription")}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card bg-base-200 shadow-sm">
                  <div className="card-body">
                    <h3 className="text-xl font-semibold">
                      {t("settings.dataManagement")}
                    </h3>
                    <p className="mb-4">
                      {t("settings.dataManagementDescription")}
                    </p>

                    <div className="flex flex-col gap-4 sm:flex-row">
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={handleExportData}
                      >
                        <Icon
                          icon="solar:export-line-duotone"
                          className="h-4 w-4"
                        />
                        {t("settings.exportAllData")}
                      </Button>

                      <Button
                        variant="error"
                        className="flex items-center gap-2"
                        onClick={handleClearAllData}
                      >
                        <Icon
                          icon="solar:trash-bin-trash-linear"
                          className="h-4 w-4"
                        />
                        {t("settings.clearAllData")}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="card bg-base-200 shadow-sm">
                  <div className="card-body">
                    <h3 className="text-xl font-semibold">
                      {t("settings.setupWizard", "Setup Wizard")}
                    </h3>
                    <p className="mb-4">
                      {t(
                        "settings.setupWizardDescription",
                        "Restart the setup wizard to reconfigure your application from scratch.",
                      )}
                    </p>

                    <Button
                      variant="outline"
                      className="flex items-center gap-2 w-fit"
                      onClick={handleRestartWizard}
                    >
                      <Icon icon="solar:restart-linear" className="h-4 w-4" />
                      {t("settings.restartWizard", "Restart Setup Wizard")}
                    </Button>
                  </div>
                </div>

                <div className="card bg-base-200 shadow-sm">
                  <div className="card-body">
                    <h3 className="text-xl font-semibold">
                      {t("settings.dataSecurity")}
                    </h3>
                    <div className="space-y-2">
                      <p>{t("settings.dataSecurityDescription1")}</p>
                      <p>{t("settings.dataSecurityDescription2")}</p>

                      <div className="bg-warning/20 border border-warning/50 text-warning-content rounded-md p-4 mt-4">
                        <div className="flex items-start gap-2">
                          <Icon
                            icon="solar:danger-triangle-bold"
                            className="h-5 w-5 mt-0.5"
                          />
                          <div>
                            <p className="font-medium">
                              {t("settings.securityWarning")}
                            </p>
                            <p className="text-sm mt-1">
                              {t("settings.securityWarningDetails")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "about" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                {t("settings.about")} Quorum
              </h2>
              <p className="mb-4">{t("settings.aboutDescription")}</p>

              <div className="card bg-base-200 shadow-sm mb-6">
                <div className="card-body">
                  <div className="flex items-center gap-4 mb-4">
                    <Icon
                      icon="solar:chat-round-dots-linear"
                      className="h-12 w-12 text-primary"
                    />
                    <div>
                      <h3 className="text-2xl font-bold">Quorum</h3>
                      <p className="text-sm opacity-70">
                        A round-table conversation with AI participants
                      </p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {t("settings.version")}
                      </span>
                      <span>0.1.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {t("settings.lastUpdated")}
                      </span>
                      <span>May 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {t("settings.license")}
                      </span>
                      <span>MIT</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Icon icon="solar:code-linear" className="h-4 w-4" />
                      <a
                        href="https://github.com/yourusername/quorum"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("settings.viewOnGitHub")}
                      </a>
                    </Button>

                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Icon icon="solar:bug-linear" className="h-4 w-4" />
                      <a
                        href="https://github.com/yourusername/quorum/issues"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("settings.reportIssue")}
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("settings.resetConfirmation")}</DialogTitle>
            <DialogDescription>
              {t("settings.resetConfirmationDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsResetDialogOpen(false)}
            >
              {t("settings.cancel")}
            </Button>
            <Button variant="error" onClick={handleResetDefaults}>
              {t("settings.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Data Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("settings.exportData")}</DialogTitle>
            <DialogDescription>
              {t("settings.exportDataDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted/50 rounded-md p-4 max-h-80 overflow-auto">
            <pre className="text-xs whitespace-pre-wrap overflow-x-auto">
              {exportData}
            </pre>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsExportDialogOpen(false)}
            >
              {t("settings.close")}
            </Button>
            <Button onClick={downloadExportedData}>
              <Icon icon="solar:download-linear" className="mr-2 h-4 w-4" />
              {t("settings.download")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
