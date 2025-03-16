/**
 * Network utilities for checking connection quality and managing network-related features
 */

/**
 * Network connection quality levels
 */
export enum ConnectionQuality {
  UNKNOWN = 'unknown',
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  OFFLINE = 'offline'
}

/**
 * Network connection type mapping to connection quality
 */
const CONNECTION_TYPE_QUALITY: Record<string, ConnectionQuality> = {
  'slow-2g': ConnectionQuality.POOR,
  '2g': ConnectionQuality.POOR,
  '3g': ConnectionQuality.FAIR,
  '4g': ConnectionQuality.GOOD,
  'wifi': ConnectionQuality.EXCELLENT,
  'ethernet': ConnectionQuality.EXCELLENT
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
  if ('connection' in navigator) {
    const connection = (navigator as Navigator & { 
      connection?: { 
        effectiveType?: string;
        downlink?: number;
        rtt?: number;
        saveData?: boolean;
      } 
    }).connection;
    
    // Check effective type (4g, 3g, 2g, etc.)
    if (connection?.effectiveType) {
      return ['slow-2g', '2g', '3g'].includes(connection.effectiveType);
    }
    
    // Check if save data mode is enabled
    if (connection?.saveData) {
      return true;
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
 * Estimate the current connection quality
 * Returns a ConnectionQuality enum value
 */
export async function getConnectionQuality(): Promise<ConnectionQuality> {
  // If offline, connection quality is offline
  if (!navigator.onLine) {
    return ConnectionQuality.OFFLINE;
  }

  try {
    // Use network information API if available
    if ('connection' in navigator) {
      const connection = (navigator as Navigator & { 
        connection?: { 
          effectiveType?: string;
          downlink?: number;
          rtt?: number;
          saveData?: boolean;
        } 
      }).connection;
      
      // Check effective type (4g, 3g, 2g, etc.)
      if (connection?.effectiveType) {
        const type = connection.effectiveType;
        return CONNECTION_TYPE_QUALITY[type] || ConnectionQuality.UNKNOWN;
      }
      
      // Use downlink speed to determine quality
      if (connection?.downlink !== undefined) {
        const mbps = connection.downlink;
        
        if (mbps < 0.5) return ConnectionQuality.POOR;
        if (mbps < 1.5) return ConnectionQuality.FAIR;
        if (mbps < 5) return ConnectionQuality.GOOD;
        return ConnectionQuality.EXCELLENT;
      }
    }
    
    // Ping test as fallback 
    // Measure latency to determine quality
    const startTime = performance.now();
    const response = await fetch('/ping.txt?nocache=' + Date.now(), { 
      cache: 'no-store',
      headers: { 'pragma': 'no-cache' }
    });
    
    if (response.ok) {
      const latency = performance.now() - startTime;
      
      if (latency < 100) return ConnectionQuality.EXCELLENT;
      if (latency < 200) return ConnectionQuality.GOOD;
      if (latency < 500) return ConnectionQuality.FAIR;
      return ConnectionQuality.POOR;
    }
  } catch (error) {
    console.error('Error checking connection quality:', error);
  }
  
  // Default to unknown if we couldn't determine
  return ConnectionQuality.UNKNOWN;
}

/**
 * Create a simple ping endpoint handler for Express
 * This is useful for measuring latency on the server side
 */
export function pingHandler(
  res: { status: (code: number) => { send: (body: string) => void } }
) {
  res.status(200).send('pong');
}

/**
 * Check if reduced data mode should be used
 * based on user preferences and connection quality
 */
export async function shouldUseReducedDataMode(userPreference?: boolean): Promise<boolean> {
  // If user has explicitly enabled reduced data mode, respect that
  if (userPreference === true) {
    return true;
  }
  
  // If user has explicitly disabled it, respect that too
  if (userPreference === false) {
    return false;
  }
  
  // Otherwise, auto-determine based on connection quality
  const quality = await getConnectionQuality();
  
  return quality === ConnectionQuality.POOR || 
         quality === ConnectionQuality.FAIR || 
         quality === ConnectionQuality.OFFLINE;
}

/**
 * Get recommendations for LLM streaming based on connection quality
 */
export async function getStreamingRecommendations(): Promise<{
  shouldUseStreaming: boolean;
  chunkSize: number;
}> {
  const quality = await getConnectionQuality();
  
  switch (quality) {
    case ConnectionQuality.EXCELLENT:
      return { shouldUseStreaming: true, chunkSize: 10 };
    case ConnectionQuality.GOOD:
      return { shouldUseStreaming: true, chunkSize: 5 };
    case ConnectionQuality.FAIR:
      return { shouldUseStreaming: true, chunkSize: 2 };
    case ConnectionQuality.POOR:
      return { shouldUseStreaming: false, chunkSize: 0 };
    case ConnectionQuality.OFFLINE:
      return { shouldUseStreaming: false, chunkSize: 0 };
    default:
      return { shouldUseStreaming: true, chunkSize: 5 }; // Default to good quality
  }
} 