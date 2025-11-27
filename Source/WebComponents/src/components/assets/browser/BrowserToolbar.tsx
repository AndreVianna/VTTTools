import React from 'react';
import {
  Box,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  useTheme,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  GridView as GridViewIcon,
  ViewModule as ViewModuleIcon,
  TableRows as TableRowsIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon,
  Label as LabelIcon,
} from '@mui/icons-material';

export type ViewMode = 'grid-large' | 'grid-small' | 'table';
export type SortField = 'name' | 'category' | 'type' | 'createdAt';
export type SortDirection = 'asc' | 'desc';

export interface BrowserToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField, direction: SortDirection) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedCount: number;
  onBulkDelete?: () => void;
  onBulkPublish?: () => void;
  onBulkTags?: () => void;
  totalCount?: number;
}

export const BrowserToolbar: React.FC<BrowserToolbarProps> = ({
  searchQuery,
  onSearchChange,
  sortField,
  sortDirection,
  onSortChange,
  viewMode,
  onViewModeChange,
  selectedCount,
  onBulkDelete,
  onBulkPublish,
  onBulkTags,
  totalCount,
}) => {
  const theme = useTheme();

  const handleViewModeChange = (_: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode) {
      onViewModeChange(newMode);
    }
  };

  const handleSortFieldChange = (event: { target: { value: string } }) => {
    onSortChange(event.target.value as SortField, sortDirection);
  };

  const handleSortDirectionToggle = () => {
    onSortChange(sortField, sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const showBulkActions = selectedCount > 0;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        flexWrap: 'wrap',
      }}
    >
      <TextField
        size="small"
        placeholder="Search assets..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => onSearchChange('')} edge="end">
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
            sx: { height: 32 },
          },
        }}
        sx={{ minWidth: 200, flexGrow: 1, maxWidth: 300 }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Select
          size="small"
          value={sortField}
          onChange={handleSortFieldChange}
          sx={{
            height: 32,
            minWidth: 100,
            '& .MuiSelect-select': {
              py: 0.5,
              fontSize: '0.875rem',
            },
          }}
        >
          <MenuItem value="name">Name</MenuItem>
          <MenuItem value="category">Category</MenuItem>
          <MenuItem value="type">Type</MenuItem>
          <MenuItem value="createdAt">Date</MenuItem>
        </Select>
        <Tooltip title={`Sort ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}>
          <IconButton size="small" onClick={handleSortDirectionToggle}>
            <Box
              component="span"
              sx={{
                fontSize: '0.75rem',
                fontWeight: 600,
                transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            >
              ↑
            </Box>
          </IconButton>
        </Tooltip>
      </Box>

      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={handleViewModeChange}
        size="small"
        sx={{
          '& .MuiToggleButton-root': {
            height: 32,
            px: 1,
          },
        }}
      >
        <ToggleButton value="grid-large">
          <Tooltip title="Large Grid">
            <GridViewIcon fontSize="small" />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="grid-small">
          <Tooltip title="Small Grid">
            <ViewModuleIcon fontSize="small" />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="table">
          <Tooltip title="Table View">
            <TableRowsIcon fontSize="small" />
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>

      <Box sx={{ flexGrow: 1 }} />

      {showBulkActions && (
        <>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: theme.palette.primary.main,
              fontSize: '0.875rem',
            }}
          >
            <strong>{selectedCount}</strong> selected
          </Box>
          <Tooltip title="Edit Tags">
            <IconButton size="small" onClick={onBulkTags} color="primary">
              <LabelIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Publish/Unpublish">
            <IconButton size="small" onClick={onBulkPublish} color="primary">
              <PublishIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Selected">
            <IconButton size="small" onClick={onBulkDelete} color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      )}

      {!showBulkActions && totalCount !== undefined && (
        <Box sx={{ color: theme.palette.text.secondary, fontSize: '0.75rem' }}>
          {totalCount} assets
        </Box>
      )}
    </Box>
  );
};

export default BrowserToolbar;
