import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Avatar,
  IconButton,
  Divider,
  Stack,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  PhotoCamera,
  Edit,
  Save,
  Cancel,
  Delete,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '@/hooks/useAuth';
import { handleValidationError } from '@/utils/errorHandling';
import { renderAuthError } from '@/utils/renderError';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useDeleteAvatarMutation,
} from '@/api/profileApi';
import { useResendEmailConfirmationMutation } from '@/services/authApi';
import { getApiEndpoints } from '@/config/development';

const getAvatarUrl = (avatarId?: string): string | undefined => {
  if (!avatarId) return undefined;
  const apiEndpoints = getApiEndpoints();
  return `${apiEndpoints.media}/${avatarId}`;
};

export const ProfileSettings: React.FC = () => {
  const theme = useTheme();
  const { user, error: authError } = useAuth();

  const { data: profileData, isLoading: isLoadingProfile, error: profileError } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();
  const [deleteAvatar, { isLoading: isDeletingAvatar }] = useDeleteAvatarMutation();
  const [resendEmailConfirmation, { isLoading: isResendingConfirmation }] = useResendEmailConfirmationMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [confirmationEmailSent, setConfirmationEmailSent] = useState(false);
  const [editedValues, setEditedValues] = useState<{
    name?: string;
    displayName?: string;
    phoneNumber?: string;
  }>({});

  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    displayName?: string;
    phoneNumber?: string;
  }>({});

  const [localError, setLocalError] = useState<string | null>(null);

  const formData = {
    name: editedValues.name ?? profileData?.name ?? '',
    displayName: editedValues.displayName ?? profileData?.displayName ?? '',
    phoneNumber: editedValues.phoneNumber ?? profileData?.phoneNumber ?? '',
  };

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    if (!formData.name) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 3) {
      errors.name = 'Name must be at least 3 characters';
    } else if (formData.name.length > 100) {
      errors.name = 'Name must be less than 100 characters';
    }

    if (!formData.displayName) {
      errors.displayName = 'Display name is required';
    } else if (formData.displayName.length < 3) {
      errors.displayName = 'Display name must be at least 3 characters';
    } else if (formData.displayName.length > 50) {
      errors.displayName = 'Display name must be less than 50 characters';
    }

    if (formData.phoneNumber && !/^\+?[\d\s()-]+$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Invalid phone number format';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof typeof editedValues) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditedValues(prev => ({ ...prev, [field]: e.target.value }));

    if (validationErrors[field as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      handleValidationError(new Error('Form validation failed'), {
        component: 'ProfileSettings',
        validationErrors
      });
      return;
    }

    try {
      setLocalError(null);
      const updates: {
        name?: string;
        displayName?: string;
        phoneNumber?: string;
      } = {};

      if (formData.name !== profileData?.name) updates.name = formData.name;
      if (formData.displayName !== profileData?.displayName) updates.displayName = formData.displayName;
      if (formData.phoneNumber !== profileData?.phoneNumber) updates.phoneNumber = formData.phoneNumber || undefined;

      if (Object.keys(updates).length > 0) {
        await updateProfile(updates).unwrap();
      }

      setIsEditing(false);
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Failed to update profile';
      setLocalError(errorMessage);
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    setEditedValues({});
    setValidationErrors({});
    setLocalError(null);
    setIsEditing(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLocalError('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLocalError('Image size must be less than 5MB');
      return;
    }

    try {
      setLocalError(null);
      await uploadAvatar(file).unwrap();
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Failed to upload avatar';
      setLocalError(errorMessage);
      console.error('Failed to upload avatar:', error);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      setLocalError(null);
      await deleteAvatar().unwrap();
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Failed to delete avatar';
      setLocalError(errorMessage);
      console.error('Failed to delete avatar:', error);
    }
  };

  const handleResendConfirmation = async () => {
    if (!user?.email) return;

    try {
      setLocalError(null);
      await resendEmailConfirmation({ email: user.email }).unwrap();
      setConfirmationEmailSent(true);
      setTimeout(() => setConfirmationEmailSent(false), 5000);
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Failed to send confirmation email';
      setLocalError(errorMessage);
      console.error('Failed to send confirmation email:', error);
    }
  };

  const isLoading = isLoadingProfile || isUpdating || isUploadingAvatar || isDeletingAvatar;
  const error = authError || profileError || localError;

  if (isLoadingProfile || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const avatarUrl = getAvatarUrl(profileData?.avatarId);

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Profile Settings
        </Typography>
        {!isEditing && (
          <Button
            startIcon={<Edit />}
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {typeof error === 'string' ? error : renderAuthError(error)}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
        <Box sx={{ flex: '0 0 auto', textAlign: 'center' }}>
          <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
            <Avatar
              {...(avatarUrl ? { src: avatarUrl } : {})}
              alt={profileData?.displayName || user.displayName}
              sx={{ width: 120, height: 120, mx: 'auto' }}
            >
              {(profileData?.displayName || user.displayName).charAt(0).toUpperCase()}
            </Avatar>
            {isEditing && (
              <IconButton
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                }}
                disabled={isUploadingAvatar}
              >
                <PhotoCamera />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileUpload}
                />
              </IconButton>
            )}
          </Box>
          {isEditing && avatarUrl && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<Delete />}
              onClick={handleDeleteAvatar}
              disabled={isDeletingAvatar}
              sx={{ mt: 1 }}
            >
              Remove Avatar
            </Button>
          )}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Email Address"
              value={user.email}
              disabled
              helperText="Email cannot be changed. Contact support if you need to update your email."
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip
                      title={user.emailConfirmed ? 'Email verified' : 'Email not verified'}
                      arrow
                    >
                      {user.emailConfirmed ? (
                        <CheckCircle
                          sx={{
                            color: theme.palette.success.main,
                            fontSize: '1.5rem',
                          }}
                        />
                      ) : (
                        <Warning
                          sx={{
                            color: theme.palette.warning.main,
                            fontSize: '1.5rem',
                          }}
                        />
                      )}
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {!user.emailConfirmed && (
            <Box sx={{ mb: 2 }}>
              {confirmationEmailSent && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Confirmation email sent to {user.email}. Please check your inbox.
                </Alert>
              )}
              <Button
                variant="outlined"
                size="small"
                onClick={handleResendConfirmation}
                disabled={isResendingConfirmation}
              >
                {isResendingConfirmation ? <CircularProgress size={20} /> : 'Resend Confirmation Email'}
              </Button>
            </Box>
          )}

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.name}
              onChange={handleInputChange('name')}
              error={!!validationErrors.name}
              helperText={validationErrors.name || 'Your full name (e.g., John Doe)'}
              disabled={!isEditing || isLoading}
              margin="normal"
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Display Name"
              value={formData.displayName}
              onChange={handleInputChange('displayName')}
              error={!!validationErrors.displayName}
              helperText={validationErrors.displayName || 'Name shown to other users (e.g., John)'}
              disabled={!isEditing || isLoading}
              margin="normal"
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phoneNumber}
              onChange={handleInputChange('phoneNumber')}
              error={!!validationErrors.phoneNumber}
              helperText={validationErrors.phoneNumber || 'Optional - used for account recovery'}
              disabled={!isEditing || isLoading}
              margin="normal"
              placeholder="+1 (555) 123-4567"
            />
          </Box>

          {isEditing && (
            <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={isLoading}
              >
                {isUpdating ? <CircularProgress size={20} /> : 'Save Changes'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>
      </Stack>
    </Paper>
  );
};
