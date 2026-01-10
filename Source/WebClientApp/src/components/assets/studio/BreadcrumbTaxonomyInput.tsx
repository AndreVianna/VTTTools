import React, { useState } from 'react';
import {
  Autocomplete,
  Box,
  Breadcrumbs,
  Chip,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { NavigateNext as SeparatorIcon } from '@mui/icons-material';
import { AssetKind, type AssetClassification } from '@/types/domain';

export interface BreadcrumbTaxonomyInputProps {
  classification: AssetClassification;
  onChange: (classification: AssetClassification) => void;
  kindOptions?: AssetKind[];
  categoryOptions?: string[];
  typeOptions?: string[];
  subtypeOptions?: string[];
}

const ASSET_KINDS: AssetKind[] = [
  AssetKind.Character,
  AssetKind.Creature,
  AssetKind.Effect,
  AssetKind.Object,
];

export const BreadcrumbTaxonomyInput: React.FC<BreadcrumbTaxonomyInputProps> = ({
  classification,
  onChange,
  kindOptions = ASSET_KINDS,
  categoryOptions = [],
  typeOptions = [],
  subtypeOptions = [],
}) => {
  const theme = useTheme();
  const [editingLevel, setEditingLevel] = useState<number | null>(null);

  const levels = [
    { label: 'Kind', value: classification.kind, options: kindOptions },
    { label: 'Category', value: classification.category, options: categoryOptions },
    { label: 'Type', value: classification.type, options: typeOptions },
    { label: 'Subtype', value: classification.subtype, options: subtypeOptions },
  ];

  const handleChange = (level: number, value: string | null) => {
    const newClassification = { ...classification };
    switch (level) {
      case 0:
        newClassification.kind = (value as AssetKind) || AssetKind.Creature;
        newClassification.category = '';
        newClassification.type = '';
        newClassification.subtype = null;
        break;
      case 1:
        newClassification.category = value || '';
        newClassification.type = '';
        newClassification.subtype = null;
        break;
      case 2:
        newClassification.type = value || '';
        newClassification.subtype = null;
        break;
      case 3:
        newClassification.subtype = value || null;
        break;
    }
    onChange(newClassification);
    setEditingLevel(null);
  };

  const renderBreadcrumbItem = (level: number, label: string, value: string | null | undefined) => {
    if (editingLevel === level) {
      const options = levels[level]?.options || [];
      return (
        <Autocomplete
          key={level}
          size="small"
          freeSolo
          autoFocus
          openOnFocus
          options={options as string[]}
          value={value || ''}
          onChange={(_, newValue) => handleChange(level, newValue)}
          onBlur={() => setEditingLevel(null)}
          renderInput={(params) => {
            const { InputLabelProps: _, ...restParams } = params;
            return (
              <TextField
                {...restParams}
                size="small"
                placeholder={label}
                variant="standard"
                sx={{ minWidth: 100 }}
                autoFocus
              />
            );
          }}
          sx={{ minWidth: 120 }}
        />
      );
    }

    if (!value && level > 0) {
      const prevValue = levels[level - 1]?.value;
      if (!prevValue) return null;
    }

    return (
      <Chip
        key={level}
        label={value || `Select ${label}`}
        size="small"
        onClick={() => setEditingLevel(level)}
        sx={{
          cursor: 'pointer',
          backgroundColor: value ? theme.palette.action.selected : 'transparent',
          border: value ? 'none' : `1px dashed ${theme.palette.divider}`,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        }}
      />
    );
  };

  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          mb: 1,
          color: theme.palette.text.secondary,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        Classification
      </Typography>

      <Breadcrumbs
        separator={<SeparatorIcon fontSize="small" />}
        sx={{
          '& .MuiBreadcrumbs-ol': {
            flexWrap: 'nowrap',
          },
        }}
      >
        {renderBreadcrumbItem(0, 'Kind', classification.kind)}
        {classification.kind && renderBreadcrumbItem(1, 'Category', classification.category)}
        {classification.category && renderBreadcrumbItem(2, 'Type', classification.type)}
        {classification.type && renderBreadcrumbItem(3, 'Subtype', classification.subtype)}
      </Breadcrumbs>
    </Box>
  );
};

export default BreadcrumbTaxonomyInput;
