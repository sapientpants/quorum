import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useError } from "../hooks/useErrorContext";
import { ConnectionQuality } from "../utils/network";
import { Wifi, WifiOff, AlertTriangle, SignalLow, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * NetworkStatusIndicator props
 */
interface NetworkStatusIndicatorProps {
  readonly position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  readonly showToasts?: boolean;
}

/**
 * Component that monitors and displays network status
 */
export function NetworkStatusIndicator({
  position = "bottom-right",
}: NetworkStatusIndicatorProps) {
  const { t } = useTranslation();
  const { networkStatus, isOnline, isLowBandwidth } = useError();
  const [visible, setVisible] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  // Position classes
  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  };

  // Show indicator when offline or low bandwidth
  useEffect(() => {
    if (!isOnline || networkStatus === ConnectionQuality.POOR) {
      setVisible(true);
    } else if (networkStatus === ConnectionQuality.FAIR) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [networkStatus, isOnline]);

  // Test connection
  const testConnection = async () => {
    setTestingConnection(true);
    try {
      const startTime = Date.now();
      const response = await fetch("/ping.txt?nocache=" + Date.now(), {
        cache: "no-store",
      });
      if (response.ok) {
        const latency = Date.now() - startTime;
        console.log(`Network latency: ${latency}ms`);
      }
    } catch (error) {
      console.error("Failed to test connection:", error);
    } finally {
      setTestingConnection(false);
    }
  };

  // Don't render anything if we're online and have good connectivity
  if (!visible && networkStatus !== ConnectionQuality.OFFLINE) {
    return null;
  }

  // Network status badge
  const getStatusContent = () => {
    if (!isOnline) {
      return {
        icon: <WifiOff className="h-4 w-4" />,
        text: t("network.offline"),
        classes: "bg-destructive text-destructive-foreground",
      };
    }

    switch (networkStatus) {
      case ConnectionQuality.POOR:
        return {
          icon: <SignalLow className="h-4 w-4" />,
          text: t("network.slow"),
          classes: "bg-warning text-warning-foreground",
        };
      case ConnectionQuality.FAIR:
        return {
          icon: <SignalLow className="h-4 w-4" />,
          text: t("network.slow"),
          classes: "bg-warning/70 text-warning-foreground",
        };
      case ConnectionQuality.OFFLINE:
        return {
          icon: <WifiOff className="h-4 w-4" />,
          text: t("network.offline"),
          classes: "bg-destructive text-destructive-foreground",
        };
      default:
        return {
          icon: <Wifi className="h-4 w-4" />,
          text: t("network.online"),
          classes: "bg-muted text-muted-foreground",
        };
    }
  };

  const status = getStatusContent();

  return (
    <button
      className={cn(
        "fixed z-50 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium shadow-lg transition-all duration-300",
        positionClasses[position],
        status.classes,
        {
          "opacity-90 hover:opacity-100": visible,
          "opacity-0 pointer-events-none":
            !visible && networkStatus !== ConnectionQuality.OFFLINE,
        },
      )}
      onClick={testConnection}
    >
      {testingConnection ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        status.icon
      )}
      <span>{status.text}</span>
      {isLowBandwidth && (
        <span className="ml-1">
          <AlertTriangle className="h-3 w-3 inline ml-1 text-warning-foreground" />
        </span>
      )}
    </button>
  );
}
