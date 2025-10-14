/* eslint-disable react-refresh/only-export-components */
// FormValidation exports both validation components and utility functions (getErrorMessage, formatFieldName, useFormValidation hook)
// These utilities are tightly coupled to form validation behavior and logically belong in the same file
import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  FormControl,
  FormHelperText,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { FieldError, FieldErrors } from 'react-hook-form';

/**
 * UC033 - Form Validation Error Display
 * Real-time form validation with Material UI error states and accessible error announcements
 */

export interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning' | 'info';
}

export interface FormValidationProps {
  errors: FieldErrors;
  touched?: Record<string, boolean>;
  showSummary?: boolean;
  variant?: 'standard' | 'detailed';
}

/**
 * Comprehensive form validation display component
 */
export const FormValidation: React.FC<FormValidationProps> = ({
  errors,
  touched = {},
  showSummary = false,
  variant = 'standard',
}) => {
  const errorList = React.useMemo(() => {
    return Object.entries(errors).map(([field, error]) => ({
      field,
      message: getErrorMessage(error as FieldError),
      type: 'error' as const,
    }));
  }, [errors]);

  const hasErrors = errorList.length > 0;

  if (!hasErrors && !showSummary) {
    return null;
  }

  if (variant === 'detailed') {
    return (
      <DetailedFormValidation
        errors={errorList}
        touched={touched}
        showSummary={showSummary}
      />
    );
  }

  return (
    <StandardFormValidation
      errors={errorList}
      touched={touched}
      showSummary={showSummary}
    />
  );
};

/**
 * Standard form validation display
 */
const StandardFormValidation: React.FC<{
  errors: ValidationError[];
  touched: Record<string, boolean>;
  showSummary: boolean;
}> = ({ errors, touched: _touched, showSummary }) => {
  if (!showSummary || errors.length === 0) {
    return null;
  }

  return (
    <Alert
      severity="error"
      sx={{ mb: 2 }}
      role="alert"
      aria-live="polite"
    >
      <AlertTitle>Please correct the following errors:</AlertTitle>
      <List dense>
        {errors.map((error, index) => (
          <ListItem key={index} sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <ErrorIcon color="error" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={error.message}
              secondary={`Field: ${formatFieldName(error.field)}`}
            />
          </ListItem>
        ))}
      </List>
    </Alert>
  );
};

/**
 * Detailed form validation display with field-specific feedback
 */
const DetailedFormValidation: React.FC<{
  errors: ValidationError[];
  touched: Record<string, boolean>;
  showSummary: boolean;
}> = ({ errors, touched, showSummary }) => {
  const [expanded, setExpanded] = React.useState(true);

  return (
    <Box sx={{ mb: 2 }}>
      {showSummary && errors.length > 0 && (
        <Alert
          severity="error"
          sx={{ mb: 2, cursor: 'pointer' }}
          onClick={() => setExpanded(!expanded)}
          role="alert"
          aria-live="polite"
          aria-expanded={expanded}
        >
          <AlertTitle>
            Form Validation ({errors.length} error{errors.length !== 1 ? 's' : ''})
          </AlertTitle>
          <Typography variant="body2">
            Click to {expanded ? 'hide' : 'show'} detailed error information
          </Typography>
        </Alert>
      )}

      <Collapse in={expanded}>
        <Box sx={{ display: 'grid', gap: 1 }}>
          {errors.map((error, index) => (
            <ValidationErrorItem
              key={index}
              error={error}
              {...(touched[error.field] !== undefined ? { isTouched: touched[error.field] } : {})}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

/**
 * Individual validation error item
 */
const ValidationErrorItem: React.FC<{
  error: ValidationError;
  isTouched?: boolean;
}> = ({ error, isTouched = true }) => {
  const getSeverityColor = () => {
    switch (error.type) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'error';
    }
  };

  const getSeverityIcon = () => {
    switch (error.type) {
      case 'error': return <ErrorIcon />;
      case 'warning': return <WarningIcon />;
      case 'info': return <SuccessIcon />;
      default: return <ErrorIcon />;
    }
  };

  if (!isTouched) {
    return null;
  }

  return (
    <Alert
      severity={getSeverityColor()}
      variant="outlined"
      icon={getSeverityIcon()}
      role="alert"
      aria-live="polite"
    >
      <Box>
        <Typography variant="body2" fontWeight={500}>
          {formatFieldName(error.field)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error.message}
        </Typography>
      </Box>
    </Alert>
  );
};

/**
 * Enhanced TextField with built-in validation display
 */
interface ValidatedTextFieldProps {
  name: string;
  error?: FieldError;
  touched?: boolean;
  helperText?: string;
  showValidationIcon?: boolean;
  [key: string]: any; // For other TextField props
}

export const ValidatedTextField: React.FC<ValidatedTextFieldProps> = ({
  name,
  error,
  touched = false,
  helperText,
  showValidationIcon = true,
  ...textFieldProps
}) => {
  const hasError = Boolean(error && touched);
  const errorMessage = hasError ? getErrorMessage(error!) : '';
  const displayHelperText = hasError ? errorMessage : helperText;

  return (
    <TextField
      {...textFieldProps}
      name={name}
      error={hasError}
      helperText={displayHelperText}
      FormHelperTextProps={{
        role: 'alert',
        'aria-live': 'polite',
        ...textFieldProps.FormHelperTextProps,
      }}
      InputProps={{
        endAdornment: showValidationIcon && hasError ? (
          <ErrorIcon color="error" fontSize="small" />
        ) : textFieldProps.InputProps?.endAdornment,
        ...textFieldProps.InputProps,
      }}
      sx={{
        '& .MuiFormHelperText-root.Mui-error': {
          backgroundColor: 'error.light',
          color: 'error.contrastText',
          px: 1,
          py: 0.5,
          borderRadius: 1,
          mt: 1,
        },
        ...textFieldProps.sx,
      }}
    />
  );
};

/**
 * Form control with validation state
 */
interface ValidatedFormControlProps {
  name: string;
  label: string;
  error?: FieldError;
  touched?: boolean;
  required?: boolean;
  children: React.ReactNode;
}

export const ValidatedFormControl: React.FC<ValidatedFormControlProps> = ({
  name,
  label,
  error,
  touched = false,
  required = false,
  children,
}) => {
  const hasError = Boolean(error && touched);
  const errorMessage = hasError ? getErrorMessage(error!) : '';

  return (
    <FormControl error={hasError} fullWidth>
      <Typography
        variant="body2"
        component="label"
        htmlFor={name}
        sx={{
          mb: 1,
          fontWeight: 500,
          color: hasError ? 'error.main' : 'text.primary',
        }}
      >
        {label}
        {required && (
          <Typography component="span" color="error.main" sx={{ ml: 0.5 }}>
            *
          </Typography>
        )}
      </Typography>

      {children}

      {hasError && (
        <FormHelperText
          role="alert"
          aria-live="polite"
          sx={{
            backgroundColor: 'error.light',
            color: 'error.contrastText',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            mt: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ErrorIcon fontSize="small" />
            {errorMessage}
          </Box>
        </FormHelperText>
      )}
    </FormControl>
  );
};

/**
 * Utility functions
 */
function getErrorMessage(error: FieldError): string {
  if (typeof error.message === 'string') {
    return error.message;
  }

  // Handle different error types
  switch (error.type) {
    case 'required':
      return 'This field is required';
    case 'minLength':
      return `Minimum length is ${error.ref}`;
    case 'maxLength':
      return `Maximum length is ${error.ref}`;
    case 'min':
      return `Minimum value is ${error.ref}`;
    case 'max':
      return `Maximum value is ${error.ref}`;
    case 'pattern':
      return 'Invalid format';
    case 'email':
      return 'Please enter a valid email address';
    case 'url':
      return 'Please enter a valid URL';
    default:
      return 'Invalid input';
  }
}

function formatFieldName(fieldName: string): string {
  // Convert camelCase to Title Case
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Hook for form validation state management
 */
export function useFormValidation() {
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const markAsTouched = React.useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const markAllAsTouched = React.useCallback((fields: string[]) => {
    const touchedFields = fields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(prev => ({ ...prev, ...touchedFields }));
  }, []);

  const resetTouched = React.useCallback(() => {
    setTouched({});
  }, []);

  return {
    touched,
    markAsTouched,
    markAllAsTouched,
    resetTouched,
  };
}

export default FormValidation;