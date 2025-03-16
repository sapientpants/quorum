import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as networkModule from "../network";
import {
  ConnectionQuality,
  isLowBandwidth,
  getConnectionQuality,
  pingHandler,
  shouldUseReducedDataMode,
  getStreamingRecommendations,
  _setTestConnectionQuality,
} from "../network";

describe("Network utilities", () => {
  // Mock fetch for testing ping latency
  const mockFetch = vi.fn();

  // Mock navigator object
  const originalNavigator = global.navigator;

  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Mock console.error
    vi.spyOn(console, "error").mockImplementation(() => {});

    // Mock fetch
    global.fetch = mockFetch;
    mockFetch.mockResolvedValue({
      ok: true,
    });

    // Mock performance.now()
    vi.spyOn(performance, "now")
      .mockReturnValueOnce(0) // First call when starting timing
      .mockReturnValueOnce(150); // Second call when calculating duration

    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn(),
      key: vi.fn(),
      length: 0,
    };
  });

  afterEach(() => {
    // Restore original functions
    vi.restoreAllMocks();
    global.navigator = originalNavigator;
  });

  describe("isLowBandwidth", () => {
    it("should return true when offline", () => {
      // Create a navigator mock with offline status
      const mockNavigator = {
        onLine: false,
        connection: undefined,
      };
      // Replace the global navigator
      global.navigator = mockNavigator as unknown as typeof global.navigator;

      expect(isLowBandwidth()).toBe(true);
    });

    it("should return true for slow connections based on effectiveType", () => {
      // Test each slow connection type
      ["slow-2g", "2g", "3g"].forEach((type) => {
        // Create a navigator mock with the connection type
        const mockNavigator = {
          onLine: true,
          connection: {
            effectiveType: type,
            downlink: undefined,
            rtt: undefined,
            saveData: false,
          },
        };
        // Replace the global navigator
        global.navigator = mockNavigator as unknown as typeof global.navigator;

        expect(isLowBandwidth()).toBe(true);
      });
    });

    it("should return false for fast connections based on effectiveType", () => {
      // Create a navigator mock with a fast connection type
      const mockNavigator = {
        onLine: true,
        connection: {
          effectiveType: "4g",
          downlink: undefined,
          rtt: undefined,
          saveData: false,
        },
      };
      // Replace the global navigator
      global.navigator = mockNavigator as unknown as typeof global.navigator;

      expect(isLowBandwidth()).toBe(false);
    });

    it("should return true when save data is enabled", () => {
      // Create a navigator mock with save data enabled
      const mockNavigator = {
        onLine: true,
        connection: {
          effectiveType: "4g", // Fast connection, but save data is enabled
          downlink: 10,
          rtt: 50,
          saveData: true,
        },
      };
      // Replace the global navigator
      global.navigator = mockNavigator as unknown as typeof global.navigator;

      expect(isLowBandwidth()).toBe(true);
    });

    it("should return true for low downlink speed", () => {
      // Create a navigator mock with low downlink speed
      const mockNavigator = {
        onLine: true,
        connection: {
          effectiveType: undefined,
          downlink: 1, // 1 Mbps is low
          rtt: undefined,
          saveData: false,
        },
      };
      // Replace the global navigator
      global.navigator = mockNavigator as unknown as typeof global.navigator;

      expect(isLowBandwidth()).toBe(true);
    });

    it("should return false for high downlink speed", () => {
      // Create a navigator mock with high downlink speed
      const mockNavigator = {
        onLine: true,
        connection: {
          effectiveType: undefined,
          downlink: 10, // 10 Mbps is high
          rtt: undefined,
          saveData: false,
        },
      };
      // Replace the global navigator
      global.navigator = mockNavigator as unknown as typeof global.navigator;

      expect(isLowBandwidth()).toBe(false);
    });

    it("should return false when connection info is not available", () => {
      // Create a navigator mock without connection info
      const mockNavigator = {
        onLine: true,
      };
      // Replace the global navigator
      global.navigator = mockNavigator as typeof global.navigator;

      expect(isLowBandwidth()).toBe(false);
    });
  });

  describe("getConnectionQuality", () => {
    it("should return OFFLINE when offline", async () => {
      // Create a navigator mock that is offline
      const mockNavigator = {
        onLine: false,
      };
      // Replace the global navigator
      global.navigator = mockNavigator as typeof global.navigator;

      const quality = await getConnectionQuality();
      expect(quality).toBe(ConnectionQuality.OFFLINE);
    });

    it("should determine quality from effectiveType", async () => {
      // Test each connection type and its expected quality
      const testCases = [
        { type: "slow-2g", expected: ConnectionQuality.POOR },
        { type: "2g", expected: ConnectionQuality.POOR },
        { type: "3g", expected: ConnectionQuality.FAIR },
        { type: "4g", expected: ConnectionQuality.GOOD },
        { type: "wifi", expected: ConnectionQuality.EXCELLENT },
        { type: "ethernet", expected: ConnectionQuality.EXCELLENT },
      ];

      for (const { type, expected } of testCases) {
        // Mock navigator with the connection type
        global.navigator = {
          ...global.navigator,
          onLine: true,
          connection: {
            effectiveType: type,
            downlink: undefined,
            rtt: undefined,
            saveData: false,
          },
        } as unknown as typeof global.navigator;

        const quality = await getConnectionQuality();
        expect(quality).toBe(expected);
      }
    });

    it("should determine quality from downlink speed", async () => {
      // Test different downlink speeds and their expected qualities
      const testCases = [
        { downlink: 0.5, expected: ConnectionQuality.POOR },
        { downlink: 1.5, expected: ConnectionQuality.FAIR },
        { downlink: 5, expected: ConnectionQuality.GOOD },
        { downlink: 20, expected: ConnectionQuality.EXCELLENT },
      ];

      for (const { downlink, expected } of testCases) {
        // Mock navigator with the downlink speed
        global.navigator = {
          ...global.navigator,
          onLine: true,
          connection: {
            effectiveType: undefined,
            downlink,
            rtt: undefined,
            saveData: false,
          },
        } as unknown as typeof global.navigator;

        const quality = await getConnectionQuality();
        expect(quality).toBe(expected);
      }
    });

    it("should determine quality from ping latency when connection API is not available", async () => {
      // Create a navigator mock without connection API
      const mockNavigator = {
        onLine: true,
      };
      // Replace the global navigator
      global.navigator = mockNavigator as typeof global.navigator;

      // Test different latencies by manipulating performance.now() return values
      const testCases = [
        { latency: 50, expected: ConnectionQuality.EXCELLENT },
        { latency: 150, expected: ConnectionQuality.GOOD },
        { latency: 300, expected: ConnectionQuality.FAIR },
        { latency: 600, expected: ConnectionQuality.POOR },
      ];

      for (const { latency, expected } of testCases) {
        // Reset mocks
        vi.resetAllMocks();

        // Mock performance.now() to return appropriate values for the test case
        vi.spyOn(performance, "now")
          .mockReturnValueOnce(0) // First call when starting timing
          .mockReturnValueOnce(latency); // Second call when calculating duration

        mockFetch.mockResolvedValue({ ok: true });

        const quality = await getConnectionQuality();
        expect(quality).toBe(expected);
      }
    });

    it("should return UNKNOWN when fetch fails", async () => {
      // Create a navigator mock without connection API
      const mockNavigator = {
        onLine: true,
      };
      // Replace the global navigator
      global.navigator = mockNavigator as typeof global.navigator;

      // Mock fetch to fail
      mockFetch.mockRejectedValue(new Error("Network error"));

      const quality = await getConnectionQuality();
      expect(quality).toBe(ConnectionQuality.UNKNOWN);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("pingHandler", () => {
    it('should respond with 200 status and "pong" body', () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };

      pingHandler(
        mockRes as {
          status: (code: number) => { send: (body: string) => void };
        },
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith("pong");
    });
  });

  describe("shouldUseReducedDataMode", () => {
    // Reset the test connection quality after each test
    afterEach(() => {
      _setTestConnectionQuality(null);
    });

    it("should respect user preference when true", async () => {
      const result = await shouldUseReducedDataMode(true);
      expect(result).toBe(true);
      // getConnectionQuality should not be called when preference is explicitly set
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should respect user preference when false", async () => {
      const result = await shouldUseReducedDataMode(false);
      expect(result).toBe(false);
      // getConnectionQuality should not be called when preference is explicitly set
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should return false for EXCELLENT connection quality", async () => {
      _setTestConnectionQuality(ConnectionQuality.EXCELLENT);
      const result = await shouldUseReducedDataMode();
      expect(result).toBe(false);
    });

    it("should return false for GOOD connection quality", async () => {
      _setTestConnectionQuality(ConnectionQuality.GOOD);
      const result = await shouldUseReducedDataMode();
      expect(result).toBe(false);
    });

    it("should return true for FAIR connection quality", async () => {
      _setTestConnectionQuality(ConnectionQuality.FAIR);
      const result = await shouldUseReducedDataMode();
      expect(result).toBe(true);
    });

    it("should return true for POOR connection quality", async () => {
      _setTestConnectionQuality(ConnectionQuality.POOR);
      const result = await shouldUseReducedDataMode();
      expect(result).toBe(true);
    });

    it("should return true for OFFLINE connection quality", async () => {
      _setTestConnectionQuality(ConnectionQuality.OFFLINE);
      const result = await shouldUseReducedDataMode();
      expect(result).toBe(true);
    });

    it("should return false for UNKNOWN connection quality", async () => {
      _setTestConnectionQuality(ConnectionQuality.UNKNOWN);
      const result = await shouldUseReducedDataMode();
      expect(result).toBe(false);
    });

    it("should handle errors gracefully", async () => {
      // Mock getConnectionQuality to throw an error
      vi.spyOn(networkModule, "getConnectionQuality").mockRejectedValue(
        new Error("Test error"),
      );

      // Even with an error, it should still return a value (defaulting to false)
      const result = await shouldUseReducedDataMode();
      expect(result).toBe(false);
    });
  });

  describe("getStreamingRecommendations", () => {
    // Reset the test connection quality after each test
    afterEach(() => {
      _setTestConnectionQuality(null);
    });

    it("should return { shouldUseStreaming: true, chunkSize: 10 } for EXCELLENT connection quality", async () => {
      _setTestConnectionQuality(ConnectionQuality.EXCELLENT);
      const recommendations = await getStreamingRecommendations();
      expect(recommendations).toEqual({
        shouldUseStreaming: true,
        chunkSize: 10,
      });
    });

    it("should return { shouldUseStreaming: true, chunkSize: 5 } for GOOD connection quality", async () => {
      _setTestConnectionQuality(ConnectionQuality.GOOD);
      const recommendations = await getStreamingRecommendations();
      expect(recommendations).toEqual({
        shouldUseStreaming: true,
        chunkSize: 5,
      });
    });

    it("should return { shouldUseStreaming: true, chunkSize: 2 } for FAIR connection quality", async () => {
      _setTestConnectionQuality(ConnectionQuality.FAIR);
      const recommendations = await getStreamingRecommendations();
      expect(recommendations).toEqual({
        shouldUseStreaming: true,
        chunkSize: 2,
      });
    });

    it("should return { shouldUseStreaming: false, chunkSize: 0 } for POOR connection quality", async () => {
      _setTestConnectionQuality(ConnectionQuality.POOR);
      const recommendations = await getStreamingRecommendations();
      expect(recommendations).toEqual({
        shouldUseStreaming: false,
        chunkSize: 0,
      });
    });

    it("should return { shouldUseStreaming: false, chunkSize: 0 } for OFFLINE connection quality", async () => {
      _setTestConnectionQuality(ConnectionQuality.OFFLINE);
      const recommendations = await getStreamingRecommendations();
      expect(recommendations).toEqual({
        shouldUseStreaming: false,
        chunkSize: 0,
      });
    });

    it("should return { shouldUseStreaming: true, chunkSize: 5 } for UNKNOWN connection quality", async () => {
      _setTestConnectionQuality(ConnectionQuality.UNKNOWN);
      const recommendations = await getStreamingRecommendations();
      expect(recommendations).toEqual({
        shouldUseStreaming: true,
        chunkSize: 5,
      });
    });

    it("should handle errors gracefully", async () => {
      // Mock getConnectionQuality to throw an error
      vi.spyOn(networkModule, "getConnectionQuality").mockRejectedValue(
        new Error("Test error"),
      );

      // Even with an error, it should still return default recommendations
      const recommendations = await getStreamingRecommendations();
      expect(recommendations).toEqual({
        shouldUseStreaming: true,
        chunkSize: 5,
      });
    });
  });
});
