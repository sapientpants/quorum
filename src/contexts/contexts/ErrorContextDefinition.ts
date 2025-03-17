import { createContext } from "react";
import { LLMError } from "../../services/llm/errors";
import { ConnectionQuality } from "../../utils/network";

/**
 * Error context type definition
 */
export interface ErrorContextType {
  apiError: LLMError | Error | null;
  setApiError: (error: LLMError | Error | null) => void;
  showApiErrorModal: boolean;
  setShowApiErrorModal: (show: boolean) => void;
  networkStatus: ConnectionQuality;
  isOnline: boolean;
  isLowBandwidth: boolean;
  currentProvider: string | null;
  setCurrentProvider: (provider: string | null) => void;
  clearError: () => void;
}

/**
 * Error context for managing API errors and network status
 */
export const ErrorContext = createContext<ErrorContextType | undefined>(
  undefined,
);
