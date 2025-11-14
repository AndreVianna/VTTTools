// GENERATED: 2025-10-03 by Claude Code Phase 2
// SPEC: Documents/Areas/Library/Features/EncounterManagement/UseCases/ConfigureStage/USE_CASE.md
// USE_CASE: ConfigureStage
// LAYER: UI (React Component)

/**
 * StageConfigPanel component
 * Material-UI form for configuring encounter stage properties
 * ACCEPTANCE_CRITERION: AC-01 - Stage configured successfully with all properties
 */

import { Alert, Box, Button, Divider, Paper, TextField, Typography } from '@mui/material';
import type React from 'react';
import { useState } from 'react';

/**
 * Stage configuration interface matching backend Stage value object
 */
export interface StageConfig {
  backgroundResourceId?: string;
  viewportX: number;
  viewportY: number;
  viewportWidth: number;
  viewportHeight: number;
  width: number;
  height: number;
}

export interface StageConfigPanelProps {
  initialStage: StageConfig;
  onSave: (stage: StageConfig) => Promise<void>;
  onCancel?: () => void;
}

/**
 * Validate stage configuration
 * INVARIANT: INV-09 - Stage dimensions must be positive
 * @param stage Stage configuration to validate
 * @returns Array of validation errors (empty if valid)
 */
const validateStage = (stage: StageConfig): string[] => {
  const errors: string[] = [];

  // INV-09: Width must be > 0
  if (stage.width <= 0) {
    errors.push('Stage width must be positive (INV-09)');
  }

  // INV-09: Height must be > 0
  if (stage.height <= 0) {
    errors.push('Stage height must be positive (INV-09)');
  }

  // Viewport dimensions must be positive
  if (stage.viewportWidth <= 0) {
    errors.push('Viewport width must be positive');
  }

  if (stage.viewportHeight <= 0) {
    errors.push('Viewport height must be positive');
  }

  // Validate GUID format if backgroundResourceId provided
  if (stage.backgroundResourceId) {
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!guidRegex.test(stage.backgroundResourceId)) {
      errors.push('Background resource ID must be valid GUID format');
    }
  }

  return errors;
};

/**
 * Stage configuration panel with Material-UI form
 * Configures encounter stage dimensions, viewport, and background image
 * QUALITY_GATE: Configuration updates in <500ms (Phase 4 requirement)
 */
export const StageConfigPanel: React.FC<StageConfigPanelProps> = ({ initialStage, onSave, onCancel }) => {
  const [stage, setStage] = useState<StageConfig>(initialStage);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Real-time validation
  const validationErrors = validateStage(stage);
  const hasErrors = validationErrors.length > 0;

  const handleNumberChange = (field: keyof StageConfig, value: string) => {
    const numValue = parseInt(value, 10);
    if (!Number.isNaN(numValue)) {
      setStage((prev) => ({ ...prev, [field]: numValue }));
    }
  };

  const handleBackgroundChange = (value: string) => {
    setStage((prev) => {
      const updated = { ...prev };
      if (value) {
        updated.backgroundResourceId = value;
      } else {
        delete updated.backgroundResourceId;
      }
      return updated;
    });
  };

  const handleSave = async () => {
    // Validate before saving (INV-09, viewport dimensions)
    const validationErrors = validateStage(stage);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      // Call backend API: PATCH /api/library/encounters/{id}/stage
      await onSave(stage);
    } catch (_error) {
      const errorMessage = _error instanceof Error ? _error.message : 'Failed to save stage configuration';
      setErrors([errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant='h6' gutterBottom>
        Stage Configuration
      </Typography>

      {errors.length > 0 && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {errors.map((error) => (
            <div key={error}>{error}</div>
          ))}
        </Alert>
      )}

      <Box component='form' sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Stage Dimensions - Validation INV-09: Must be > 0 */}
        <Typography variant='subtitle2' color='text.secondary'>
          Stage Dimensions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label='Width (px)'
            type='number'
            value={stage.width}
            onChange={(e) => handleNumberChange('width', e.target.value)}
            error={stage.width <= 0}
            helperText={stage.width <= 0 ? 'Must be positive (INV-09)' : ''}
            fullWidth
            inputProps={{ min: 1 }}
          />
          <TextField
            label='Height (px)'
            type='number'
            value={stage.height}
            onChange={(e) => handleNumberChange('height', e.target.value)}
            error={stage.height <= 0}
            helperText={stage.height <= 0 ? 'Must be positive (INV-09)' : ''}
            fullWidth
            inputProps={{ min: 1 }}
          />
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Viewport Configuration */}
        <Typography variant='subtitle2' color='text.secondary'>
          Viewport Settings
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label='Viewport X'
            type='number'
            value={stage.viewportX}
            onChange={(e) => handleNumberChange('viewportX', e.target.value)}
            fullWidth
          />
          <TextField
            label='Viewport Y'
            type='number'
            value={stage.viewportY}
            onChange={(e) => handleNumberChange('viewportY', e.target.value)}
            fullWidth
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label='Viewport Width'
            type='number'
            value={stage.viewportWidth}
            onChange={(e) => handleNumberChange('viewportWidth', e.target.value)}
            error={stage.viewportWidth <= 0}
            helperText={stage.viewportWidth <= 0 ? 'Must be positive' : ''}
            fullWidth
            inputProps={{ min: 1 }}
          />
          <TextField
            label='Viewport Height'
            type='number'
            value={stage.viewportHeight}
            onChange={(e) => handleNumberChange('viewportHeight', e.target.value)}
            error={stage.viewportHeight <= 0}
            helperText={stage.viewportHeight <= 0 ? 'Must be positive' : ''}
            fullWidth
            inputProps={{ min: 1 }}
          />
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Background Image */}
        <Typography variant='subtitle2' color='text.secondary'>
          Background Image
        </Typography>
        <TextField
          label='Background Resource ID'
          value={stage.backgroundResourceId || ''}
          onChange={(e) => handleBackgroundChange(e.target.value)}
          fullWidth
          helperText='GUID of background image resource (optional)'
          placeholder='Leave empty for no background'
        />

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
          {onCancel && (
            <Button variant='outlined' onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button variant='contained' onClick={handleSave} disabled={isLoading || hasErrors}>
            {isLoading ? 'Saving...' : 'Save Stage'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};
