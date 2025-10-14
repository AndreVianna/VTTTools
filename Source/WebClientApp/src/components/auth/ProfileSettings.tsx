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
} from '@mui/material';
import {
  PhotoCamera,
  Edit,
  Save,
  Cancel,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { handleValidationError } from '@/utils/errorHandling';
import { renderAuthError } from '@/utils/renderError';

export const ProfileSettings: React.FC = () => {
  const { user, updateProfile, isLoading, error } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    userName: user?.userName || '',
    phoneNumber: user?.phoneNumber || '',
    profilePictureUrl: user?.profilePictureUrl || '',
  });

  const [validationErrors, setValidationErrors] = useState<{
    userName?: string;
    phoneNumber?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    // Username validation
    if (!formData.userName) {
      errors.userName = 'Username is required';
    } else if (formData.userName.length < 3) {
      errors.userName = 'Username must be at least 3 characters';
    } else if (formData.userName.length > 50) {
      errors.userName = 'Username must be less than 50 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.userName)) {
      errors.userName = 'Username can only contain letters, numbers, underscores, and hyphens';
    }

    // Phone number validation (optional)
    if (formData.phoneNumber && !/^\+?[\d\s()-]+$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Invalid phone number format';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));

    // Clear validation error when user starts typing
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
      const updates: any = {};
      if (formData.userName !== user?.userName) updates.userName = formData.userName;
      if (formData.phoneNumber !== user?.phoneNumber) updates.phoneNumber = formData.phoneNumber || undefined;
      if (formData.profilePictureUrl !== user?.profilePictureUrl) updates.profilePictureUrl = formData.profilePictureUrl || undefined;

      if (Object.keys(updates).length > 0) {
        await updateProfile(updates);
      }

      setIsEditing(false);
    } catch (_error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      userName: user?.userName || '',
      phoneNumber: user?.phoneNumber || '',
      profilePictureUrl: user?.profilePictureUrl || '',
    });
    setValidationErrors({});
    setIsEditing(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // For now, we'll just create a local URL. In production, this would upload to blob storage
    const url = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, profilePictureUrl: url }));
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

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
          {renderAuthError(error)}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
        {/* Profile Picture */}
        <Box sx={{ flex: '0 0 auto', textAlign: 'center' }}>
          <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
            <Avatar
              {...(formData.profilePictureUrl ? { src: formData.profilePictureUrl } : {})}
              alt={user.userName}
              sx={{ width: 120, height: 120, mx: 'auto' }}
            >
              {user.userName.charAt(0).toUpperCase()}
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
        </Box>

        {/* Profile Information */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Email Address"
              value={user.email}
              disabled
              helperText="Email cannot be changed. Contact support if you need to update your email."
              margin="normal"
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Username"
              value={formData.userName}
              onChange={handleInputChange('userName')}
              error={!!validationErrors.userName}
              helperText={validationErrors.userName || ''}
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
                {isLoading ? <CircularProgress size={20} /> : 'Save Changes'}
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

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="h6" gutterBottom>
          Account Information
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Box sx={{ flex: '1 1 45%' }}>
            <Typography variant="body2" color="text.secondary">
              Account Created:
            </Typography>
            <Typography variant="body1">
              {new Date(user.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 45%' }}>
            <Typography variant="body2" color="text.secondary">
              Last Login:
            </Typography>
            <Typography variant="body1">
              {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 45%' }}>
            <Typography variant="body2" color="text.secondary">
              Email Verified:
            </Typography>
            <Typography variant="body1" color={user.emailConfirmed ? 'success.main' : 'error.main'}>
              {user.emailConfirmed ? 'Yes' : 'No'}
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 45%' }}>
            <Typography variant="body2" color="text.secondary">
              Two-Factor Authentication:
            </Typography>
            <Typography variant="body1" color={user.twoFactorEnabled ? 'success.main' : 'text.primary'}>
              {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};