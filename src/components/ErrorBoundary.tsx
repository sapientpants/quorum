import { Component, ErrorInfo, ReactNode } from "react";
import { withTranslation, WithTranslation } from "react-i18next";

interface ErrorBoundaryProps extends WithTranslation {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    const { t } = this.props;

    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <div className="p-2 text-sm text-red-500">
            <div className="font-medium">{t("errorBoundary.title")}</div>
            <div className="text-xs opacity-75">
              {this.state.error?.message ?? t("errorBoundary.unknownError")}
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Export with a named component for fast refresh
const NamedErrorBoundary = withTranslation()(ErrorBoundary);
export default NamedErrorBoundary;
