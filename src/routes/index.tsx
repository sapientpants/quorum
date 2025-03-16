import * as React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "../components/layouts/AppLayout";
import { PageLoader } from "../components/ui/PageLoader";
import { usePreferencesStore } from "../store/preferencesStore";

// Lazy-loaded pages
const Welcome = React.lazy(() =>
  import("../pages/Welcome").then((mod) => ({ default: mod.Welcome })),
);
const SecurityPage = React.lazy(() =>
  import("../pages/SecurityPage").then((mod) => ({
    default: mod.SecurityPage,
  })),
);
const ApiKeysPage = React.lazy(() =>
  import("../pages/ApiKeysPage").then((mod) => ({ default: mod.ApiKeysPage })),
);
const ParticipantsPage = React.lazy(() =>
  import("../pages/ParticipantsPage").then((mod) => ({
    default: mod.ParticipantsPage,
  })),
);
const RoundTablePage = React.lazy(() =>
  import("../pages/RoundTablePage").then((mod) => ({
    default: mod.RoundTablePage,
  })),
);
const Settings = React.lazy(() =>
  import("../pages/Settings").then((mod) => ({ default: mod.Settings })),
);
const Templates = React.lazy(() =>
  import("../pages/Templates").then((mod) => ({ default: mod.Templates })),
);
const NotFound = React.lazy(() =>
  import("../pages/NotFound").then((mod) => ({ default: mod.NotFound })),
);

// Route guard for wizard steps
function WizardStepGuard({
  children,
  requiredStep,
}: {
  children: React.ReactNode;
  requiredStep: number;
}) {
  const { preferences } = usePreferencesStore();
  const wizardStep = preferences.wizardStep || 0;

  // If the user hasn't completed the wizard, redirect to the appropriate step
  if (wizardStep < requiredStep) {
    const redirectPath =
      wizardStep === 0
        ? "/security"
        : wizardStep === 1
          ? "/apiKeys"
          : wizardStep === 2
            ? "/participants"
            : "/";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

// Route guard for completed wizard
function CompletedWizardGuard({ children }: { children: React.ReactNode }) {
  const { preferences } = usePreferencesStore();
  const wizardCompleted = preferences.wizardCompleted;

  if (!wizardCompleted) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Welcome page */}
      <Route
        path="/"
        element={
          <React.Suspense fallback={<PageLoader />}>
            <Welcome />
          </React.Suspense>
        }
      />

      {/* Wizard steps */}
      <Route
        path="/security"
        element={
          <React.Suspense fallback={<PageLoader />}>
            <SecurityPage />
          </React.Suspense>
        }
      />

      <Route
        path="/apiKeys"
        element={
          <React.Suspense fallback={<PageLoader />}>
            <WizardStepGuard requiredStep={1}>
              <ApiKeysPage />
            </WizardStepGuard>
          </React.Suspense>
        }
      />

      <Route
        path="/participants"
        element={
          <React.Suspense fallback={<PageLoader />}>
            <WizardStepGuard requiredStep={2}>
              <ParticipantsPage />
            </WizardStepGuard>
          </React.Suspense>
        }
      />

      {/* Main app routes (require completed wizard) */}
      <Route element={<AppLayout />}>
        <Route
          path="/roundtable"
          element={
            <React.Suspense fallback={<PageLoader />}>
              <CompletedWizardGuard>
                <RoundTablePage />
              </CompletedWizardGuard>
            </React.Suspense>
          }
        />

        <Route
          path="/settings"
          element={
            <React.Suspense fallback={<PageLoader />}>
              <CompletedWizardGuard>
                <Settings />
              </CompletedWizardGuard>
            </React.Suspense>
          }
        />

        <Route
          path="/templates"
          element={
            <React.Suspense fallback={<PageLoader />}>
              <CompletedWizardGuard>
                <Templates />
              </CompletedWizardGuard>
            </React.Suspense>
          }
        />

        <Route
          path="*"
          element={
            <React.Suspense fallback={<PageLoader />}>
              <NotFound />
            </React.Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
