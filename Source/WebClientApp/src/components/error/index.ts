/**
 * Error handling components for VTT Tools
 * Implements UC032-UC036 error handling framework
 */

// UC036 - System Error Display
export { ErrorBoundary, withErrorBoundary } from './ErrorBoundary';
export type { ErrorBoundaryFallbackProps } from './ErrorBoundary';

// UC032 - Network Connection Error Handling
export { NetworkStatus, NetworkStatusIndicator } from './NetworkStatus';

// UC033 - Form Validation Error Display
export {
  FormValidation,
  ValidatedTextField,
  ValidatedFormControl,
  useFormValidation,
} from './FormValidation';
export type { ValidationError, FormValidationProps } from './FormValidation';

// UC034 - Asset Loading Failure Handling
export {
  AssetLoadingError,
  ImageLoadingError,
  AssetSkeleton,
  SafeImage,
  AssetGridError,
} from './AssetLoadingError';
export type { AssetErrorProps } from './AssetLoadingError';

// UC035 - Scene Saving/Loading Error Recovery
export { SceneRecoveryManager } from './SceneRecovery';

// Global Error Resource System
export { GlobalErrorDisplay } from './GlobalErrorDisplay';
export { ServiceUnavailablePage } from './ServiceUnavailablePage';

// Re-export error utilities from utils
export {
  handleError,
  handleApiError,
  handleValidationError,
  handleSystemError,
  handleAssetLoadingError,
  handleSceneError,
  retryOperation,
  createValidationError,
  createNetworkError,
} from '@/utils/errorHandling';

export type {
  ErrorType,
  EnhancedError,
  ApiErrorResponse,
} from '@/utils/errorHandling';