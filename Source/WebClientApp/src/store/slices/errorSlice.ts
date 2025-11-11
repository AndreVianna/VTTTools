import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface VTTError {
  id: string;
  type: 'network' | 'validation' | 'asset_loading' | 'encounter_save' | 'encounter_load' | 'system' | 'authentication' | 'authorization';
  message: string;
  details?: string;
  timestamp: number;
  context?: {
    component?: string;
    operation?: string;
    data?: any;
  };
  recovered?: boolean;
  retryable?: boolean;
  userFriendlyMessage?: string;
}

export interface ErrorState {
  errors: VTTError[];
  globalError: VTTError | null;
  networkErrors: VTTError[];
  validationErrors: VTTError[];
  systemErrors: VTTError[];

  // Error recovery state
  retryAttempts: { [errorId: string]: number };
  maxRetryAttempts: number;

  // Error reporting
  reportedErrors: string[]; // IDs of errors that have been reported

  // User feedback
  userErrorsVisible: boolean;
  errorReportingEnabled: boolean;
}

const initialState: ErrorState = {
  errors: [],
  globalError: null,
  networkErrors: [],
  validationErrors: [],
  systemErrors: [],
  retryAttempts: {},
  maxRetryAttempts: 3,
  reportedErrors: [],
  userErrorsVisible: false,
  errorReportingEnabled: true,
};

const errorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    // Add a new error
    addError: (state, action: PayloadAction<Omit<VTTError, 'id' | 'timestamp'>>) => {
      const error: VTTError = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        ...action.payload,
      };

      state.errors.push(error);

      // Categorize errors
      switch (error.type) {
        case 'network':
          state.networkErrors.push(error);
          break;
        case 'validation':
          state.validationErrors.push(error);
          break;
        case 'system':
        case 'asset_loading':
        case 'encounter_save':
        case 'encounter_load':
          state.systemErrors.push(error);
          break;
      }

      // Set global error for critical errors
      if (['system', 'authentication'].includes(error.type)) {
        state.globalError = error;
      }
    },

    // Remove an error
    removeError: (state, action: PayloadAction<string>) => {
      const errorId = action.payload;
      state.errors = state.errors.filter(e => e.id !== errorId);
      state.networkErrors = state.networkErrors.filter(e => e.id !== errorId);
      state.validationErrors = state.validationErrors.filter(e => e.id !== errorId);
      state.systemErrors = state.systemErrors.filter(e => e.id !== errorId);

      // Clear global error if it was removed
      if (state.globalError?.id === errorId) {
        state.globalError = null;
      }

      // Clean up retry attempts
      delete state.retryAttempts[errorId];
    },

    // Mark error as recovered
    markErrorRecovered: (state, action: PayloadAction<string>) => {
      const errorId = action.payload;
      const error = state.errors.find(e => e.id === errorId);
      if (error) {
        error.recovered = true;
      }

      // Clear from global error if recovered
      if (state.globalError?.id === errorId) {
        state.globalError = null;
      }
    },

    // Clear all errors
    clearAllErrors: (state) => {
      state.errors = [];
      state.networkErrors = [];
      state.validationErrors = [];
      state.systemErrors = [];
      state.globalError = null;
      state.retryAttempts = {};
    },

    // Clear errors by type
    clearErrorsByType: (state, action: PayloadAction<VTTError['type']>) => {
      const type = action.payload;
      state.errors = state.errors.filter(e => e.type !== type);

      switch (type) {
        case 'network':
          state.networkErrors = [];
          break;
        case 'validation':
          state.validationErrors = [];
          break;
        case 'system':
        case 'asset_loading':
        case 'encounter_save':
        case 'encounter_load':
          state.systemErrors = state.systemErrors.filter(e => e.type !== type);
          break;
      }

      // Clear global error if it matches the type
      if (state.globalError?.type === type) {
        state.globalError = null;
      }
    },

    // Increment retry attempts
    incrementRetryAttempt: (state, action: PayloadAction<string>) => {
      const errorId = action.payload;
      state.retryAttempts[errorId] = (state.retryAttempts[errorId] || 0) + 1;
    },

    // Clear retry attempts for an error
    clearRetryAttempts: (state, action: PayloadAction<string>) => {
      delete state.retryAttempts[action.payload];
    },

    // Mark error as reported
    markErrorReported: (state, action: PayloadAction<string>) => {
      const errorId = action.payload;
      if (!state.reportedErrors.includes(errorId)) {
        state.reportedErrors.push(errorId);
      }
    },

    // Set global error visibility
    setUserErrorsVisible: (state, action: PayloadAction<boolean>) => {
      state.userErrorsVisible = action.payload;
    },

    // Toggle error reporting
    setErrorReportingEnabled: (state, action: PayloadAction<boolean>) => {
      state.errorReportingEnabled = action.payload;
    },

    // Set global error manually
    setGlobalError: (state, action: PayloadAction<VTTError | null>) => {
      state.globalError = action.payload;
    },

    // Clear old errors (cleanup)
    clearOldErrors: (state, action: PayloadAction<number>) => {
      const maxAge = action.payload; // milliseconds
      const cutoff = Date.now() - maxAge;

      state.errors = state.errors.filter(e => e.timestamp > cutoff);
      state.networkErrors = state.networkErrors.filter(e => e.timestamp > cutoff);
      state.validationErrors = state.validationErrors.filter(e => e.timestamp > cutoff);
      state.systemErrors = state.systemErrors.filter(e => e.timestamp > cutoff);

      // Clear retry attempts for old errors
      const activeErrorIds = new Set(state.errors.map(e => e.id));
      Object.keys(state.retryAttempts).forEach(errorId => {
        if (!activeErrorIds.has(errorId)) {
          delete state.retryAttempts[errorId];
        }
      });
    },
  },
});

export const {
  addError,
  removeError,
  markErrorRecovered,
  clearAllErrors,
  clearErrorsByType,
  incrementRetryAttempt,
  clearRetryAttempts,
  markErrorReported,
  setUserErrorsVisible,
  setErrorReportingEnabled,
  setGlobalError,
  clearOldErrors,
} = errorSlice.actions;

export default errorSlice.reducer;

// Selectors
export const selectErrors = (state: { error: ErrorState }) => state.error.errors;
export const selectGlobalError = (state: { error: ErrorState }) => state.error.globalError;
export const selectErrorsByType = (type: VTTError['type']) =>
  (state: { error: ErrorState }) => state.error.errors.filter(e => e.type === type);
export const selectNetworkErrors = (state: { error: ErrorState }) => state.error.networkErrors;
export const selectValidationErrors = (state: { error: ErrorState }) => state.error.validationErrors;
export const selectSystemErrors = (state: { error: ErrorState }) => state.error.systemErrors;
export const selectRetryAttempts = (errorId: string) =>
  (state: { error: ErrorState }) => state.error.retryAttempts[errorId] || 0;
export const selectCanRetry = (errorId: string) =>
  (state: { error: ErrorState }) =>
    (state.error.retryAttempts[errorId] || 0) < state.error.maxRetryAttempts;
export const selectUserErrorsVisible = (state: { error: ErrorState }) => state.error.userErrorsVisible;
export const selectErrorReportingEnabled = (state: { error: ErrorState }) => state.error.errorReportingEnabled;