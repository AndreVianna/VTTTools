import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ContentCopy,
  CheckCircle,
  Warning,
  Download,
  Close,
} from '@mui/icons-material';
import { useInitiateSetupMutation, useVerifySetupMutation } from '@/api/twoFactorApi';
import { handleValidationError } from '@/utils/errorHandling';

interface TwoFactorSetupFormProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

interface SetupData {
  sharedKey: string;
  authenticatorUri: string;
  qrCodeUri: string;
}

export const TwoFactorSetupForm: React.FC<TwoFactorSetupFormProps> = ({
  onComplete,
  onCancel
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [recoveryCodesSaved, setRecoveryCodesSaved] = useState(false);

  const [initiateSetup, { isLoading: isInitiating, error: initiateError }] = useInitiateSetupMutation();
  const [verifySetup, { isLoading: isVerifying, error: verifyError }] = useVerifySetupMutation();

  const isLoading = isInitiating || isVerifying;
  const error = initiateError || verifyError;

  const [validationErrors, setValidationErrors] = useState<{
    verificationCode?: string;
  }>({});

  // Initialize 2FA setup
  useEffect(() => {
    const initializeSetup = async () => {
      try {
        const result = await initiateSetup().unwrap();
        if (result.success) {
          const qrCodeUri = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(result.authenticatorUri)}`;

          setSetupData({
            sharedKey: result.sharedKey,
            authenticatorUri: result.authenticatorUri,
            qrCodeUri,
          });
        }
      } catch (_error) {
        console.error('Failed to initialize 2FA setup:', _error);
      }
    };

    initializeSetup();
  }, [initiateSetup]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const downloadRecoveryCodes = () => {
    const content = recoveryCodes.map(code => `${code}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vtt-tools-recovery-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const validateVerificationCode = (): boolean => {
    const errors: { verificationCode?: string } = {};

    if (!verificationCode) {
      errors.verificationCode = 'Verification code is required';
    } else if (!/^\d{6}$/.test(verificationCode.replace(/\s/g, ''))) {
      errors.verificationCode = 'Verification code must be 6 digits';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleVerifyCode = async () => {
    if (!validateVerificationCode()) {
      handleValidationError(new Error('Form validation failed'), {
        component: 'TwoFactorSetupForm',
        validationErrors
      });
      return;
    }

    try {
      const result = await verifySetup({
        code: verificationCode.replace(/\s/g, ''),
      }).unwrap();

      if (result.success && result.recoveryCodes) {
        setRecoveryCodes(result.recoveryCodes);
        setActiveStep(2);
        setShowRecoveryDialog(true);
      }
    } catch (_error) {
      console.error('Failed to enable 2FA:', _error);
    }
  };

  const handleComplete = () => {
    if (!recoveryCodesSaved) {
      setShowRecoveryDialog(true);
      return;
    }
    onComplete?.();
  };

  if (!setupData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" component="h1" gutterBottom>
        Set Up Two-Factor Authentication
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Add an extra layer of security to your account by enabling two-factor authentication.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
            ? String(error.data.message)
            : 'An error occurred during two-factor authentication setup'}
        </Alert>
      )}

      <Stepper activeStep={activeStep} orientation="vertical">
        {/* Step 1: Install Authenticator App */}
        <Step>
          <StepLabel>Install Authenticator App</StepLabel>
          <StepContent>
            <Typography gutterBottom>
              First, install an authenticator app on your mobile device:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Google Authenticator"
                  secondary="iOS App Store / Google Play Store"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Microsoft Authenticator"
                  secondary="iOS App Store / Google Play Store"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Authy"
                  secondary="iOS App Store / Google Play Store"
                />
              </ListItem>
            </List>
            <Box sx={{ mb: 1, mt: 2 }}>
              <Button
                variant="contained"
                onClick={() => setActiveStep(1)}
                sx={{ mr: 1 }}
              >
                Continue
              </Button>
              <Button onClick={onCancel}>
                Cancel
              </Button>
            </Box>
          </StepContent>
        </Step>

        {/* Step 2: Scan QR Code & Verify */}
        <Step>
          <StepLabel>Scan QR Code & Verify</StepLabel>
          <StepContent>
            <Typography gutterBottom>
              Scan the QR code below with your authenticator app:
            </Typography>

            <Paper sx={{ p: 2, textAlign: 'center', mb: 2 }}>
              <img
                src={setupData.qrCodeUri}
                alt="2FA QR Code"
                style={{ maxWidth: '200px', maxHeight: '200px' }}
              />
            </Paper>

            <Typography variant="body2" gutterBottom>
              Can&apos;t scan the code? Enter this key manually:
            </Typography>
            <Paper sx={{ p: 2, mb: 2, backgroundColor: 'grey.50' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {setupData.sharedKey}
                </Typography>
                <IconButton onClick={() => copyToClipboard(setupData.sharedKey)} size="small">
                  <ContentCopy />
                </IconButton>
              </Box>
            </Paper>

            <Typography gutterBottom>
              Enter the 6-digit code from your authenticator app:
            </Typography>
            <TextField
              fullWidth
              label="Verification Code"
              value={verificationCode}
              onChange={(e) => {
                // Format as XXX XXX for better readability
                const value = e.target.value.replace(/\s/g, '').replace(/(\d{3})(\d{3})/, '$1 $2');
                if (value.replace(/\s/g, '').length <= 6) {
                  setVerificationCode(value);
                  // Clear validation error when user starts typing
                  if (validationErrors.verificationCode) {
                    setValidationErrors({});
                  }
                }
              }}
              error={!!validationErrors.verificationCode}
              helperText={validationErrors.verificationCode || ''}
              disabled={isLoading}
              margin="normal"
              autoComplete="one-time-code"
              inputProps={{
                style: { textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.5em' }
              }}
            />

            <Box sx={{ mb: 1, mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleVerifyCode}
                disabled={isLoading || !verificationCode}
                sx={{ mr: 1 }}
              >
                {isLoading ? <CircularProgress size={20} /> : 'Verify & Enable'}
              </Button>
              <Button onClick={() => setActiveStep(0)}>
                Back
              </Button>
            </Box>
          </StepContent>
        </Step>

        {/* Step 3: Save Recovery Codes */}
        <Step>
          <StepLabel>Save Recovery Codes</StepLabel>
          <StepContent>
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Two-factor authentication has been successfully enabled!
              </Typography>
            </Alert>

            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Make sure to save your recovery codes in a safe place.
                You&apos;ll need them to access your account if you lose your authenticator device.
              </Typography>
            </Alert>

            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setShowRecoveryDialog(true)}
                startIcon={<Warning />}
              >
                View Recovery Codes
              </Button>
            </Box>

            <Box sx={{ mb: 1 }}>
              <Button
                variant="contained"
                onClick={handleComplete}
                disabled={!recoveryCodesSaved}
                sx={{ mr: 1 }}
              >
                Complete Setup
              </Button>
              <Chip
                icon={recoveryCodesSaved ? <CheckCircle /> : <Warning />}
                label={recoveryCodesSaved ? "Recovery codes saved" : "Save recovery codes first"}
                color={recoveryCodesSaved ? "success" : "warning"}
                variant="outlined"
              />
            </Box>
          </StepContent>
        </Step>
      </Stepper>

      {/* Recovery Codes Dialog */}
      <Dialog
        open={showRecoveryDialog}
        onClose={() => setShowRecoveryDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Recovery Codes
            <IconButton onClick={() => setShowRecoveryDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            These codes can be used to access your account if you lose your authenticator device.
            Each code can only be used once. Store them in a safe place!
          </Alert>

          <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              {recoveryCodes.map((code, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    textAlign: 'center',
                    p: 1,
                    backgroundColor: 'white',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'grey.300'
                  }}
                >
                  {code}
                </Typography>
              ))}
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={downloadRecoveryCodes}
            startIcon={<Download />}
            variant="outlined"
          >
            Download Codes
          </Button>
          <Button
            onClick={() => {
              setRecoveryCodesSaved(true);
              setShowRecoveryDialog(false);
            }}
            variant="contained"
          >
            I&apos;ve Saved These Codes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};