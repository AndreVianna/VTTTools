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
  Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
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
  const theme = useTheme();
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Set Up Two-Factor Authentication
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Add an extra layer of security to your account by enabling two-factor authentication.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
            ? String(error.data.message)
            : 'An error occurred during two-factor authentication setup'}
        </Alert>
      )}

      <Stepper activeStep={activeStep} orientation="horizontal" sx={{ mb: 4 }}>
        <Step>
          <StepLabel>Install App</StepLabel>
        </Step>
        <Step>
          <StepLabel>Scan & Verify</StepLabel>
        </Step>
        <Step>
          <StepLabel>Save Codes</StepLabel>
        </Step>
      </Stepper>

      {/* Step Content */}
      {activeStep === 0 && (
        <Box>
          <Typography gutterBottom sx={{ mb: 2 }}>
            First, install an authenticator app on your mobile device:
          </Typography>
          <List disablePadding sx={{ mb: 3 }}>
            <ListItem sx={{ py: 1 }}>
              <ListItemIcon>
                <CheckCircle color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Google Authenticator"
                secondary="iOS App Store / Google Play Store"
              />
            </ListItem>
            <ListItem sx={{ py: 1 }}>
              <ListItemIcon>
                <CheckCircle color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Microsoft Authenticator"
                secondary="iOS App Store / Google Play Store"
              />
            </ListItem>
            <ListItem sx={{ py: 1 }}>
              <ListItemIcon>
                <CheckCircle color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Authy"
                secondary="iOS App Store / Google Play Store"
              />
            </ListItem>
          </List>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => setActiveStep(1)}
            >
              Continue
            </Button>
            <Button onClick={onCancel}>
              Cancel
            </Button>
          </Box>
        </Box>
      )}

      {/* Step 2: Scan QR Code & Verify - 2 Column Layout */}
      {activeStep === 1 && (
        <Box>
          <Typography gutterBottom sx={{ mb: 2 }}>
            Scan the QR code below with your authenticator app:
          </Typography>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Left Column: QR Code */}
            <Grid
              xs={12}
              md={5}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start'
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  backgroundColor: theme.palette.background.default,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  display: 'inline-block'
                }}
              >
                <img
                  src={setupData.qrCodeUri}
                  alt="2FA QR Code"
                  style={{ width: '200px', height: '200px', display: 'block' }}
                />
              </Paper>
            </Grid>

            {/* Right Column: Manual Key and Verification Code */}
            <Grid xs={12} md={7}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Manual Key Box */}
                <Box>
                  <Typography variant="body2" gutterBottom sx={{ mb: 1 }}>
                    Can&apos;t scan the code? Enter this key manually:
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      backgroundColor: theme.palette.mode === 'dark'
                        ? theme.palette.grey[900]
                        : theme.palette.grey[100],
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.9rem',
                          wordBreak: 'break-all',
                          flex: 1,
                          color: theme.palette.text.primary
                        }}
                      >
                        {setupData.sharedKey}
                      </Typography>
                      <IconButton
                        onClick={() => copyToClipboard(setupData.sharedKey)}
                        size="small"
                        sx={{ flexShrink: 0 }}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Box>
                  </Paper>
                </Box>

                {/* Verification Code Input */}
                <Box>
                  <Typography gutterBottom sx={{ mb: 1 }}>
                    Enter the 6-digit code from your authenticator app:
                  </Typography>
                  <TextField
                    fullWidth
                    label="Verification Code"
                    value={verificationCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '').replace(/(\d{3})(\d{3})/, '$1 $2');
                      if (value.replace(/\s/g, '').length <= 6) {
                        setVerificationCode(value);
                        if (validationErrors.verificationCode) {
                          setValidationErrors({});
                        }
                      }
                    }}
                    error={!!validationErrors.verificationCode}
                    helperText={validationErrors.verificationCode || ''}
                    disabled={isLoading}
                    autoComplete="one-time-code"
                    inputProps={{
                      style: { textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.5em' }
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleVerifyCode}
              disabled={isLoading || !verificationCode}
            >
              {isLoading ? <CircularProgress size={20} /> : 'Verify & Enable'}
            </Button>
            <Button onClick={() => setActiveStep(0)}>
              Back
            </Button>
          </Box>
        </Box>
      )}

      {/* Step 3: Save Recovery Codes */}
      {activeStep === 2 && (
        <Box>
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

          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              onClick={() => setShowRecoveryDialog(true)}
              startIcon={<Warning />}
              fullWidth
            >
              View Recovery Codes
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleComplete}
              disabled={!recoveryCodesSaved}
              fullWidth
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
        </Box>
      )}

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
          <Alert severity="warning" sx={{ mb: 3 }}>
            These codes can be used to access your account if you lose your authenticator device.
            Each code can only be used once. Store them in a safe place!
          </Alert>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              backgroundColor: theme.palette.mode === 'dark'
                ? theme.palette.grey[900]
                : theme.palette.grey[100],
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1
            }}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {recoveryCodes.map((code, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      textAlign: 'center',
                      color: theme.palette.text.primary
                    }}
                  >
                    {code}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
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