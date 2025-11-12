import { CheckCircle, Close, Download, Key, Refresh, Warning } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import type React from 'react';
import { useState } from 'react';
import { useGenerateNewRecoveryCodesMutation, useGetRecoveryCodesStatusQuery } from '@/api/recoveryCodesApi';
import { handleMutationError } from '@/services/enhancedBaseQuery';

interface RecoveryCodesManagerProps {
  onClose?: () => void;
}

export const RecoveryCodesManager: React.FC<RecoveryCodesManagerProps> = ({ onClose }) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [newRecoveryCodes, setNewRecoveryCodes] = useState<string[]>([]);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [apiError, setApiError] = useState('');

  const { data: statusData, isLoading: isLoadingStatus } = useGetRecoveryCodesStatusQuery();
  const [generateNewCodes, { isLoading: isGenerating }] = useGenerateNewRecoveryCodesMutation();

  const downloadRecoveryCodes = (codes: string[]) => {
    const content = codes.map((code, index) => `${index + 1}. ${code}`).join('\n');
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

  const handleGenerateNewCodes = async () => {
    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    setApiError('');

    try {
      const result = await generateNewCodes({ password }).unwrap();
      if (result.success && result.recoveryCodes) {
        setNewRecoveryCodes(result.recoveryCodes);
        setShowConfirmDialog(false);
        setPassword('');
        setPasswordError('');
      } else {
        setApiError(result.message || 'Failed to generate recovery codes');
      }
    } catch (error) {
      console.error('Failed to generate recovery codes:', error);
      const errorInfo = handleMutationError(error, 'generateRecoveryCodes');
      setApiError(errorInfo.message);
    }
  };

  return (
    <Box>
      <Typography variant='h5' component='h1' gutterBottom>
        Recovery Codes Management
      </Typography>

      <Typography variant='body2' color='text.secondary' gutterBottom sx={{ mb: 3 }}>
        Recovery codes are used to access your account when you don&apos;t have access to your authenticator device.
      </Typography>

      {apiError && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {apiError}
        </Alert>
      )}

      {newRecoveryCodes.length > 0 && (
        <Alert severity='success' sx={{ mb: 2 }}>
          <Typography variant='body2' gutterBottom>
            New recovery codes have been generated successfully!
          </Typography>
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Key sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant='h6'>Recovery Codes</Typography>
        </Box>

        {newRecoveryCodes.length > 0 ? (
          <Box>
            <Alert severity='warning' sx={{ mb: 2 }}>
              <Typography variant='body2'>
                Save these new recovery codes in a safe place. Your old recovery codes are no longer valid.
              </Typography>
            </Alert>

            <Paper sx={{ p: 2, backgroundColor: 'grey.50', mb: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                {newRecoveryCodes.map((code, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 1,
                      backgroundColor: 'white',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'grey.300',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
                      {code}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant='contained'
                startIcon={<Download />}
                onClick={() => downloadRecoveryCodes(newRecoveryCodes)}
              >
                Download Codes
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            {isLoadingStatus ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {statusData && (
                  <Alert severity='info' sx={{ mb: 2 }}>
                    <Typography variant='body2'>
                      You have {statusData.remainingCount} recovery code
                      {statusData.remainingCount !== 1 ? 's' : ''} remaining.
                    </Typography>
                  </Alert>
                )}

                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Warning color='warning' />
                    </ListItemIcon>
                    <ListItemText
                      primary='Important Security Information'
                      secondary='Each recovery code can only be used once. If you&apos;ve used some codes or suspect they may be compromised, generate new ones.'
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color='success' />
                    </ListItemIcon>
                    <ListItemText
                      primary='When to Generate New Codes'
                      secondary='Generate new recovery codes if you&apos;ve used some of your existing codes, or if you believe they may have been compromised.'
                    />
                  </ListItem>
                </List>

                <Box sx={{ mt: 2 }}>
                  <Button
                    variant='outlined'
                    startIcon={<Refresh />}
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? <CircularProgress size={20} /> : 'Generate New Recovery Codes'}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        )}
      </Paper>

      {onClose && (
        <Box sx={{ textAlign: 'right' }}>
          <Button onClick={onClose}>Close</Button>
        </Box>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            Generate New Recovery Codes?
            <IconButton onClick={() => setShowConfirmDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity='warning' sx={{ mb: 2 }}>
            <Typography variant='body2'>
              Generating new recovery codes will invalidate all of your existing recovery codes. Make sure you&apos;ve
              saved the new codes before continuing.
            </Typography>
          </Alert>

          <Typography variant='body2' color='text.secondary' gutterBottom>
            This action cannot be undone. Your current recovery codes will no longer work and you&apos;ll need to save
            the new ones in a safe place.
          </Typography>

          <TextField
            fullWidth
            type='password'
            label='Confirm Password'
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError('');
              if (apiError) setApiError('');
            }}
            error={!!passwordError}
            helperText={passwordError || 'Enter your password to confirm'}
            margin='normal'
            autoComplete='current-password'
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowConfirmDialog(false);
              setPassword('');
              setPasswordError('');
              setApiError('');
            }}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            color='warning'
            onClick={handleGenerateNewCodes}
            disabled={isGenerating || !password}
          >
            {isGenerating ? <CircularProgress size={20} /> : 'Generate New Codes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
