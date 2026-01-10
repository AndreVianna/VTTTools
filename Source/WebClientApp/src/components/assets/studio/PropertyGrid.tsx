import React, { useState } from 'react';
import {
  Box,
  Collapse,
  IconButton,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  ChevronRight as CollapseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

export interface PropertyGridItem {
  key: string;
  value: string;
  type: 'text' | 'number' | 'boolean';
}

export interface PropertyGridSection {
  title: string;
  properties: PropertyGridItem[];
}

export interface PropertyGridProps {
  sections: PropertyGridSection[];
  onChange: (sections: PropertyGridSection[]) => void;
  allowAddProperty?: boolean;
  allowRemoveProperty?: boolean;
}

interface SectionHeaderProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  onAdd: (() => void) | null;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, expanded, onToggle, onAdd }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 0.5,
        px: 1,
        backgroundColor: theme.palette.action.hover,
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={onToggle}
    >
      {expanded ? <ExpandIcon fontSize="small" /> : <CollapseIcon fontSize="small" />}
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          flexGrow: 1,
          ml: 0.5,
        }}
      >
        {title}
      </Typography>
      {onAdd && (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          sx={{ p: 0.25 }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

interface PropertyRowProps {
  property: PropertyGridItem;
  onChange: (value: string) => void;
  onRemove: (() => void) | null;
}

const PropertyRow: React.FC<PropertyRowProps> = ({ property, onChange, onRemove }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: `1px solid ${theme.palette.divider}`,
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
      }}
    >
      <Box
        sx={{
          width: '40%',
          px: 1,
          py: 0.5,
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.action.hover,
        }}
      >
        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
          {property.key}
        </Typography>
      </Box>
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <TextField
          size="small"
          variant="standard"
          value={property.value}
          onChange={(e) => onChange(e.target.value)}
          type={property.type === 'number' ? 'number' : 'text'}
          fullWidth
          sx={{
            '& .MuiInput-root': {
              fontSize: '0.8rem',
              px: 1,
            },
            '& .MuiInput-root:before': {
              borderBottom: 'none',
            },
            '& .MuiInput-root:hover:before': {
              borderBottom: 'none !important',
            },
          }}
          slotProps={{
            input: {
              disableUnderline: true,
            },
          }}
        />
        {onRemove && (
          <IconButton size="small" onClick={onRemove} sx={{ p: 0.25, mr: 0.5 }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export const PropertyGrid: React.FC<PropertyGridProps> = ({
  sections,
  onChange,
  allowAddProperty = false,
  allowRemoveProperty = false,
}) => {
  const theme = useTheme();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sections.map((s) => [s.title, true]))
  );

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handlePropertyChange = (sectionIndex: number, propIndex: number, value: string) => {
    const section = sections[sectionIndex];
    if (!section) return;
    const newSections: PropertyGridSection[] = sections.map((s, i) =>
      i === sectionIndex
        ? {
            title: s.title,
            properties: s.properties.map((p, j) => (j === propIndex ? { ...p, value } : p)),
          }
        : s
    );
    onChange(newSections);
  };

  const handleAddProperty = (sectionIndex: number) => {
    const section = sections[sectionIndex];
    if (!section) return;
    const newSections: PropertyGridSection[] = sections.map((s, i) =>
      i === sectionIndex
        ? {
            title: s.title,
            properties: [...s.properties, { key: 'New Property', value: '', type: 'text' as const }],
          }
        : s
    );
    onChange(newSections);
  };

  const handleRemoveProperty = (sectionIndex: number, propIndex: number) => {
    const section = sections[sectionIndex];
    if (!section) return;
    const newSections: PropertyGridSection[] = sections.map((s, i) =>
      i === sectionIndex
        ? {
            title: s.title,
            properties: s.properties.filter((_, j) => j !== propIndex),
          }
        : s
    );
    onChange(newSections);
  };

  return (
    <Box
      role="group"
      aria-label="Property grid"
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      {sections.map((section, sectionIndex) => (
        <Box key={section.title}>
          <SectionHeader
            title={section.title}
            expanded={expandedSections[section.title] ?? true}
            onToggle={() => toggleSection(section.title)}
            onAdd={allowAddProperty ? () => handleAddProperty(sectionIndex) : null}
          />
          <Collapse in={expandedSections[section.title] ?? true}>
            {section.properties.map((prop, propIndex) => (
              <PropertyRow
                key={`${prop.key}-${propIndex}`}
                property={prop}
                onChange={(value) => handlePropertyChange(sectionIndex, propIndex, value)}
                onRemove={
                  allowRemoveProperty
                    ? () => handleRemoveProperty(sectionIndex, propIndex)
                    : null
                }
              />
            ))}
            {section.properties.length === 0 && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No properties
                </Typography>
              </Box>
            )}
          </Collapse>
        </Box>
      ))}
    </Box>
  );
};

export default PropertyGrid;
