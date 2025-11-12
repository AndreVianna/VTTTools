/**
 * Error handling components for VTT Tools
 * Implements UC032-UC036 error handling framework
 */

export type {
  ApiErrorResponse,
  EnhancedError,
  ErrorType,
} from '@/utils/errorHandling';
// Re-export error utilities from utils
export {
  createNetworkError,
  createValidationError,
  handleApiError,
  handleAssetLoadingError,
  handleEncounterError,
  handleError,
  handleSystemError,
  handleValidationError,
  retryOperation,
} from '@/utils/errorHandling';
export type { AssetErrorProps } from './AssetLoadingError';
// UC034 - Asset Loading Failure Handling
export {
  AssetGridError,
  AssetLoadingError,
  AssetSkeleton,
  ImageLoadingError,
  SafeImage,
} from './AssetLoadingError';
// UC035 - Encounter Saving/Loading Error Recovery
export { EncounterRecoveryManager } from './EncounterRecovery';
export type { ErrorBoundaryFallbackProps } from './ErrorBoundary';
// UC036 - System Error Display
export { ErrorBoundary, withErrorBoundary } from './ErrorBoundary';
export type { FormValidationProps, ValidationError } from './FormValidation';
// UC033 - Form Validation Error Display
export {
  FormValidation,
  useFormValidation,
  ValidatedFormControl,
  ValidatedTextField,
} from './FormValidation';
// Global Error Resource System
export { GlobalErrorDisplay } from './GlobalErrorDisplay';
// UC032 - Network Connection Error Handling
export { NetworkStatus, NetworkStatusIndicator } from './NetworkStatus';
export { ServiceUnavailablePage } from './ServiceUnavailablePage';
