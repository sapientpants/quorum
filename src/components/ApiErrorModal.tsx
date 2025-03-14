import { useTranslation } from 'react-i18next';
import { LLMError, LLMErrorType } from '../services/llm/errors';
import { useError } from '../hooks/useErrorContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  ShieldAlert,
  Clock,
  Wifi,
  Network,
  AlertCircle,
  ExternalLink,
  X,
  RefreshCcw,
} from 'lucide-react';

// Mock implementations for the missing icon packages
// These would normally be imported from react-icons
const SiOpenai = () => <span>OpenAI</span>;
const SiGoogle = () => <span>Google</span>;
const SiMicrosoft = () => <span>Microsoft</span>;
const SiAmazonaws = () => <span>AWS</span>;
const SiCohere = () => <span>Cohere</span>;
const TbBrandMeta = () => <span>Meta</span>;
const FaRobot = () => <span>Robot</span>;

export function ApiErrorModal() {
  const { t } = useTranslation();
  const { 
    apiError, 
    showApiErrorModal, 
    setShowApiErrorModal, 
    clearError, 
    currentProvider 
  } = useError();

  if (!apiError) return null;

  // Determine if error is LLMError
  const isLLMError = apiError instanceof LLMError;
  const errorType = isLLMError ? (apiError as LLMError).type : 'unknown';
  const errorMessage = apiError.message;

  // Get provider icon
  const getProviderIcon = (provider: string | null) => {
    if (!provider) return <FaRobot />;
    
    switch (provider.toLowerCase()) {
      case 'openai':
        return <SiOpenai />;
      case 'google':
      case 'gemini':
      case 'grok':
        return <SiGoogle />;
      case 'anthropic':
      case 'claude':
        return <FaRobot />;
      case 'azure':
        return <SiMicrosoft />;
      case 'meta':
      case 'llama':
        return <TbBrandMeta />;
      case 'cohere':
        return <SiCohere />;
      case 'aws':
      case 'bedrock':
        return <SiAmazonaws />;
      default:
        return <FaRobot />;
    }
  };

  // Generate appropriate suggestions based on error type
  const getSuggestions = () => {
    const suggestions: string[] = [];
    
    if (isLLMError) {
      switch (errorType) {
        case LLMErrorType.AUTHENTICATION:
          suggestions.push(t('errors.suggestions.checkApiKey'));
          suggestions.push(t('errors.suggestions.regenerateKey'));
          suggestions.push(t('errors.suggestions.verifyAccount'));
          break;
        case LLMErrorType.RATE_LIMIT:
          suggestions.push(t('errors.suggestions.waitAndRetry'));
          suggestions.push(t('errors.suggestions.upgradeAccount'));
          suggestions.push(t('errors.suggestions.checkUsage'));
          break;
        case LLMErrorType.TIMEOUT:
          suggestions.push(t('errors.suggestions.checkConnection'));
          suggestions.push(t('errors.suggestions.retryRequest'));
          suggestions.push(t('errors.suggestions.reduceComplexity'));
          break;
        case LLMErrorType.CONTENT_FILTER:
          suggestions.push(t('errors.suggestions.modifyContent'));
          suggestions.push(t('errors.suggestions.checkPolicies'));
          break;
        case LLMErrorType.NETWORK:
          suggestions.push(t('errors.suggestions.checkConnection'));
          suggestions.push(t('errors.suggestions.retry'));
          suggestions.push(t('errors.suggestions.refreshPage'));
          break;
        default:
          suggestions.push(t('errors.suggestions.retry'));
          suggestions.push(t('errors.suggestions.refreshPage'));
          suggestions.push(t('errors.suggestions.contactSupport'));
      }
    } else {
      suggestions.push(t('errors.suggestions.retry'));
      suggestions.push(t('errors.suggestions.refreshPage'));
      suggestions.push(t('errors.suggestions.contactSupport'));
    }
    
    return suggestions;
  };

  // Get technical details about the error
  const getTechnicalDetails = () => {
    let details = `Error: ${errorMessage}\n`;
    
    if (isLLMError) {
      const llmError = apiError as LLMError;
      details += `Type: ${llmError.type}\n`;
      
      if (llmError.statusCode) {
        details += `Status: ${llmError.statusCode}\n`;
      }
      
      if (llmError.requestId) {
        details += `Request ID: ${llmError.requestId}\n`;
      }
    }
    
    if (currentProvider) {
      details += `Provider: ${currentProvider}\n`;
    }
    
    return details;
  };

  // Get status code text
  const getStatusCode = () => {
    if (isLLMError && (apiError as LLMError).statusCode) {
      return `${(apiError as LLMError).statusCode}`;
    }
    return '';
  };

  // Get error title based on error type
  const getErrorTitle = () => {
    if (isLLMError) {
      switch (errorType) {
        case LLMErrorType.AUTHENTICATION:
          return t('errors.titles.authError');
        case LLMErrorType.RATE_LIMIT:
          return t('errors.titles.rateLimitError');
        case LLMErrorType.TIMEOUT:
          return t('errors.titles.timeoutError');
        case LLMErrorType.CONTENT_FILTER:
          return t('errors.titles.contentFilterError');
        case LLMErrorType.NETWORK:
          return t('errors.titles.networkError');
        case LLMErrorType.API_ERROR:
          return t('errors.titles.apiError');
        default:
          return t('errors.titles.unknownError');
      }
    }
    return t('errors.titles.unknownError');
  };

  // Get icon based on error type
  const getErrorIcon = () => {
    if (isLLMError) {
      switch (errorType) {
        case LLMErrorType.AUTHENTICATION:
          return <ShieldAlert className="h-6 w-6 text-destructive" />;
        case LLMErrorType.RATE_LIMIT:
          return <Clock className="h-6 w-6 text-destructive" />;
        case LLMErrorType.TIMEOUT:
          return <Clock className="h-6 w-6 text-destructive" />;
        case LLMErrorType.CONTENT_FILTER:
          return <AlertTriangle className="h-6 w-6 text-destructive" />;
        case LLMErrorType.NETWORK:
          return <Wifi className="h-6 w-6 text-destructive" />;
        case LLMErrorType.API_ERROR:
          return <Network className="h-6 w-6 text-destructive" />;
        default:
          return <AlertCircle className="h-6 w-6 text-destructive" />;
      }
    }
    return <AlertCircle className="h-6 w-6 text-destructive" />;
  };

  // Get documentation links
  const getDocumentationLink = () => {
    if (!currentProvider) return null;
    
    let url = '';
    switch (currentProvider.toLowerCase()) {
      case 'openai':
        url = 'https://platform.openai.com/docs/guides/error-codes';
        break;
      case 'anthropic':
      case 'claude':
        url = 'https://docs.anthropic.com/claude/reference/errors';
        break;
      case 'google':
      case 'gemini':
        url = 'https://ai.google.dev/docs/gemini_api_overview';
        break;
      case 'grok':
        url = 'https://x.ai/';
        break;
      case 'cohere':
        url = 'https://docs.cohere.com/reference/errors';
        break;
      default:
        return null;
    }
    
    return (
      <Button variant="outline" size="sm" onClick={() => window.open(url, '_blank')}>
        <ExternalLink className="mr-2 h-4 w-4" />
        {t('errors.viewDocumentation')}
      </Button>
    );
  };

  return (
    <Dialog open={showApiErrorModal} onOpenChange={setShowApiErrorModal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="flex flex-row items-center gap-2">
          {getErrorIcon()}
          <div className="flex flex-col">
            <DialogTitle className="text-lg flex items-center">
              {getErrorTitle()}
              {getStatusCode() && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {getStatusCode()}
                </span>
              )}
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm">
              {errorMessage}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="py-2">
          <h4 className="mb-2 font-medium">{t('errors.suggestionsTitle')}</h4>
          <ul className="space-y-1 pl-5 list-disc text-sm">
            {getSuggestions().map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>

        <Separator />

        <div className="py-2">
          <h4 className="mb-2 font-medium flex items-center gap-2">
            {t('errors.technicalDetails')}
            {currentProvider && (
              <span className="flex items-center gap-1 text-xs px-2 py-1 bg-muted rounded-md">
                {getProviderIcon(currentProvider)}
                {currentProvider}
              </span>
            )}
          </h4>
          <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-32">
            {getTechnicalDetails()}
          </pre>
        </div>

        <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
          <div className="flex-1">
            {getDocumentationLink()}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => clearError()}>
              <X className="mr-2 h-4 w-4" />
              {t('errors.dismiss')}
            </Button>
            <Button variant="default" size="sm" onClick={() => clearError()}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              {t('errors.tryAgain')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 