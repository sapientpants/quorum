/**
 * Network utilities for checking connection quality and managing network-related features
 */

/**
 * Network connection quality levels
 */
export enum ConnectionQuality {
  UNKNOWN = "unknown",
  EXCELLENT = "excellent",
  GOOD = "good",
  FAIR = "fair",
  POOR = "poor",
  OFFLINE = "offline",
}

/**
 * Interface for streaming recommendations based on connection quality
 */
export interface StreamingRecommendations {
  shouldUseStreaming: boolean;
  chunkSize: number;
}

/**
 * Network connection type mapping to connection quality
 */
const CONNECTION_TYPE_QUALITY: Record<string, ConnectionQuality> = {
  "slow-2g": ConnectionQuality.POOR,
  "2g": ConnectionQuality.POOR,
  "3g": ConnectionQuality.FAIR,
  "4g": ConnectionQuality.GOOD,
  wifi: ConnectionQuality.EXCELLENT,
  ethernet: ConnectionQuality.EXCELLENT,
};

/**
 * For testing purposes
 */
let _testConnectionQuality: ConnectionQuality | null = null;

/**
 * Sets a test connection quality value for testing purposes.
 * This is only used in tests and should not be used in production code.
 * @param quality The connection quality to use for testing
 */
export function _setTestConnectionQuality(
  quality: ConnectionQuality | null,
): void {
  _testConnectionQuality = quality;
}

/**
 * Check if the current connection is low bandwidth
 * Returns true if the device is offline or has a slow connection
 */
export function isLowBandwidth(): boolean {
  // If offline, consider it low bandwidth
  if (!navigator.onLine) {
    return true;
  }

  // Use network information API if available
  if ("connection" in navigator) {
    const connection = (
      navigator as Navigator & {
        connection?: {
          effectiveType?: string;
          downlink?: number;
          rtt?: number;
          saveData?: boolean;
        };
      }
    ).connection;

    // Check if save data mode is enabled
    if (connection?.saveData === true) {
      return true;
    }

    // Check effective type (4g, 3g, 2g, etc.)
    if (connection?.effectiveType) {
      return ["slow-2g", "2g", "3g"].includes(connection.effectiveType);
    }

    // Check downlink speed (in Mbps)
    if (connection?.downlink !== undefined) {
      return connection.downlink < 1.5; // Consider less than 1.5 Mbps as low bandwidth
    }
  }

  // Default to false if we can't determine
  return false;
}

/**
 * Get the current connection quality
 * Returns a ConnectionQuality enum value
 */
export async function getConnectionQuality(): Promise<ConnectionQuality> {
  // Check for test environment and offline status first
  if (_testConnectionQuality !== null) {
    return _testConnectionQuality;
  }

  if (!navigator.onLine) {
    return ConnectionQuality.OFFLINE;
  }

  try {
    // Try different methods to determine connection quality in order of preference
    const quality =
      (await getConnectionQualityWithNetworkInfo()) ||
      (await getConnectionQualityWithPing()) ||
      ConnectionQuality.UNKNOWN;
    return quality;
  } catch (error) {
    console.error("Error checking connection quality:", error);
    return ConnectionQuality.UNKNOWN;
  }
}

/**
 * Get connection quality using the Network Information API
 */
async function getConnectionQualityWithNetworkInfo(): Promise<ConnectionQuality | null> {
  if (!("connection" in navigator)) {
    return null;
  }

  const connection = (
    navigator as Navigator & {
      connection?: {
        effectiveType?: string;
        downlink?: number;
        rtt?: number;
      };
    }
  ).connection;

  // Check effective type (4g, 3g, 2g, etc.)
  if (connection?.effectiveType) {
    return (
      CONNECTION_TYPE_QUALITY[connection.effectiveType] ||
      ConnectionQuality.UNKNOWN
    );
  }

  // Check downlink speed (in Mbps)
  if (connection?.downlink !== undefined) {
    return getQualityFromDownlink(connection.downlink);
  }

  return null;
}

/**
 * Get quality level based on downlink speed
 */
function getQualityFromDownlink(downlink: number): ConnectionQuality {
  if (downlink < 1) return ConnectionQuality.POOR;
  if (downlink < 2) return ConnectionQuality.FAIR;
  if (downlink < 10) return ConnectionQuality.GOOD;
  return ConnectionQuality.EXCELLENT;
}

/**
 * Get connection quality by measuring ping latency
 */
async function getConnectionQualityWithPing(): Promise<ConnectionQuality | null> {
  try {
    const start = performance.now();
    const response = await fetch("/api/ping", {
      method: "GET",
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });
    const end = performance.now();

    if (!response.ok) {
      return null;
    }

    // Calculate and evaluate latency
    const latency = end - start;
    return getQualityFromLatency(latency);
  } catch (pingError) {
    console.error("Error during ping test:", pingError);
    return null;
  }
}

/**
 * Get quality level based on latency
 */
function getQualityFromLatency(latency: number): ConnectionQuality {
  if (latency < 100) return ConnectionQuality.EXCELLENT;
  if (latency < 200) return ConnectionQuality.GOOD;
  if (latency < 500) return ConnectionQuality.FAIR;
  return ConnectionQuality.POOR;
}

/**
 * Create a simple ping endpoint handler for Express
 * This is useful for measuring latency on the server side
 */
export function pingHandler(res: {
  status: (code: number) => { send: (body: string) => void };
}) {
  res.status(200).send("pong");
}

/**
 * Determines if reduced data mode should be used based on user preference or connection quality.
 * @param userPreference Optional user preference for reduced data mode
 * @returns True if reduced data mode should be used, false otherwise
 */
export async function shouldUseReducedDataMode(
  userPreference?: boolean,
): Promise<boolean> {
  // If user has explicitly set a preference, respect it
  if (userPreference !== undefined) {
    return userPreference;
  }

  try {
    // Get the current connection quality
    const quality = await getConnectionQuality();
    console.log("shouldUseReducedDataMode - quality:", quality);

    // Return true for FAIR, POOR, or OFFLINE connections
    return (
      quality === ConnectionQuality.FAIR ||
      quality === ConnectionQuality.POOR ||
      quality === ConnectionQuality.OFFLINE
    );
  } catch (error) {
    console.error(
      "Error determining if reduced data mode should be used:",
      error,
    );
    // Default to false if there's an error
    return false;
  }
}

/**
 * Gets recommendations for streaming based on connection quality.
 * @returns Recommendations for streaming including whether to use streaming and chunk size
 */
export async function getStreamingRecommendations(): Promise<StreamingRecommendations> {
  try {
    // Get the current connection quality
    const quality = await getConnectionQuality();
    console.log("getStreamingRecommendations - quality:", quality);

    // Return recommendations based on connection quality
    switch (quality) {
      case ConnectionQuality.EXCELLENT:
        return { shouldUseStreaming: true, chunkSize: 10 };
      case ConnectionQuality.GOOD:
        return { shouldUseStreaming: true, chunkSize: 5 };
      case ConnectionQuality.FAIR:
        return { shouldUseStreaming: true, chunkSize: 2 };
      case ConnectionQuality.POOR:
      case ConnectionQuality.OFFLINE:
        return { shouldUseStreaming: false, chunkSize: 0 };
      case ConnectionQuality.UNKNOWN:
      default:
        return { shouldUseStreaming: true, chunkSize: 5 };
    }
  } catch (error) {
    console.error("Error getting streaming recommendations:", error);
    // Default recommendations if there's an error
    return { shouldUseStreaming: true, chunkSize: 5 };
  }
}

/**
 * Fetch with timeout
 * @param url URL to fetch
 * @param options Fetch options
 * @param timeoutMs Timeout in milliseconds
 * @returns Promise with fetch response
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 30000,
): Promise<Response> {
  // Create abort controller for timeout
  const { controller, timeoutId } = setupTimeoutController(timeoutMs);

  try {
    // Add abort signal to options if not already present
    const fetchOptions = addAbortSignalToOptions(options, controller.signal);

    // Execute fetch with the configured options
    return await executeFetchWithErrorHandling(url, fetchOptions);
  } finally {
    // Always clean up timeout
    clearTimeout(timeoutId);
  }
}

/**
 * Setup abort controller with timeout
 */
function setupTimeoutController(timeoutMs: number): {
  controller: AbortController;
  timeoutId: NodeJS.Timeout;
} {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  return { controller, timeoutId };
}

/**
 * Add abort signal to fetch options if not already present
 */
function addAbortSignalToOptions(
  options: RequestInit,
  signal: AbortSignal,
): RequestInit {
  // If options already has a signal, use it, otherwise add our signal
  if (options.signal) {
    return options;
  }

  return {
    ...options,
    signal,
  };
}

/**
 * Execute fetch with error handling
 */
async function executeFetchWithErrorHandling(
  url: string,
  options: RequestInit,
): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (error) {
    // Handle abort errors
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timed out: ${url}`);
    }

    // Re-throw other errors
    throw error;
  }
}
