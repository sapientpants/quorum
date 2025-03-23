import { useState, useEffect, ReactNode, useMemo } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { LLMError } from "../services/llm/errors";
import { getConnectionQuality, ConnectionQuality } from "../utils/network";
import {
  ErrorContext,
  ErrorContextType,
} from "./contexts/ErrorContextDefinition";

interface ErrorProviderProps {
  readonly children: ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  const [apiError, setApiError] = useState<LLMError | Error | null>(null);
  const [showApiErrorModal, setShowApiErrorModal] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<ConnectionQuality>(
    navigator.onLine ? ConnectionQuality.UNKNOWN : ConnectionQuality.OFFLINE,
  );
  const [isLowBandwidth, setIsLowBandwidth] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<string | null>(null);
  const { t } = useTranslation();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus((prevStatus) => {
        if (prevStatus === ConnectionQuality.OFFLINE) {
          toast.success(t("network.backOnline"));
          return ConnectionQuality.UNKNOWN;
        }
        return prevStatus;
      });
    };

    const handleOffline = () => {
      setNetworkStatus(ConnectionQuality.OFFLINE);
      toast.error(t("network.offline"));
    };

    // Check connection quality periodically
    const checkConnectionQuality = async () => {
      if (navigator.onLine) {
        const quality = await getConnectionQuality();
        setNetworkStatus(quality);

        // Set low bandwidth flag for POOR and FAIR connection quality
        const isLow =
          quality === ConnectionQuality.POOR ||
          quality === ConnectionQuality.FAIR;

        if (isLow !== isLowBandwidth) {
          setIsLowBandwidth(isLow);
          if (isLow) {
            toast.warning(t("network.lowBandwidth"));
          }
        }
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check and interval setup
    checkConnectionQuality();
    const interval = setInterval(checkConnectionQuality, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [t, isLowBandwidth]);

  // Show the API error modal when an error is set
  useEffect(() => {
    if (apiError) {
      setShowApiErrorModal(true);
    }
  }, [apiError]);

  // The value provided to consumers
  const value = useMemo<ErrorContextType>(() => {
    // Moved clearError inside useMemo to avoid dependency array issues
    const clearError = () => {
      setApiError(null);
      setShowApiErrorModal(false);
    };

    return {
      apiError,
      setApiError,
      showApiErrorModal,
      setShowApiErrorModal,
      networkStatus,
      isOnline: navigator.onLine,
      isLowBandwidth,
      currentProvider,
      setCurrentProvider,
      clearError,
    };
  }, [
    apiError,
    setApiError,
    showApiErrorModal,
    setShowApiErrorModal,
    networkStatus,
    isLowBandwidth,
    currentProvider,
    setCurrentProvider,
  ]);

  return (
    <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
  );
}
