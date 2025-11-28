import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { useState, useEffect } from 'react';

export interface ContentFormData {
  name: string;
  description: string;
  isPublished: boolean;
  isPublic: boolean;
}

export interface ContentEditorDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ContentFormData) => Promise<void>;
  title: string;
  contentTypeName: string;
  initialData?: Partial<ContentFormData> | undefined;
  isLoading?: boolean | undefined;
  showVisibility?: boolean | undefined;
}

const DEFAULT_FORM_DATA: ContentFormData = {
  name: '',
  description: '',
  isPublished: false,
  isPublic: false,
};

export function ContentEditorDialog({
  open,
  onClose,
  onSave,
  title,
  contentTypeName,
  initialData,
  isLoading = false,
  showVisibility = true,
}: ContentEditorDialogProps) {
  const [formData, setFormData] = useState<ContentFormData>(DEFAULT_FORM_DATA);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && initialData) {
      setFormData({
        name: initialData.name ?? '',
        description: initialData.description ?? '',
        isPublished: initialData.isPublished ?? false,
        isPublic: initialData.isPublic ?? false,
      });
    } else if (!open) {
      setFormData(DEFAULT_FORM_DATA);
      setError(null);
    }
  }, [open, initialData]);

  const handleChange = (field: keyof ContentFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSwitchChange = (field: 'isPublished' | 'isPublic') => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.checked,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving && !isLoading) {
      onClose();
    }
  };

  const isDisabled = saving || isLoading;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="content-editor-dialog-title"
    >
      <DialogTitle id="content-editor-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            autoFocus
            fullWidth
            label="Name"
            value={formData.name}
            onChange={handleChange('name')}
            disabled={isDisabled}
            required
            error={!!error && !formData.name.trim()}
            helperText={error && !formData.name.trim() ? error : `Enter the ${contentTypeName.toLowerCase()} name`}
          />

          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={handleChange('description')}
            disabled={isDisabled}
            multiline
            rows={4}
            helperText={`Optional description for the ${contentTypeName.toLowerCase()}`}
          />

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPublished}
                  onChange={handleSwitchChange('isPublished')}
                  disabled={isDisabled}
                />
              }
              label="Published"
            />

            {showVisibility && (
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPublic}
                    onChange={handleSwitchChange('isPublic')}
                    disabled={isDisabled}
                  />
                }
                label="Public"
              />
            )}
          </Box>

          {error && formData.name.trim() && (
            <Box sx={{ color: 'error.main', fontSize: '0.875rem' }}>
              {error}
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isDisabled}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isDisabled || !formData.name.trim()}
          startIcon={saving ? <CircularProgress size={16} /> : undefined}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
