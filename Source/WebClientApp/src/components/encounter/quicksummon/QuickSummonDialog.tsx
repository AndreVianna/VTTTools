import React, { useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  Link,
  Menu,
  MenuItem,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import type { Asset, AssetKind } from '@/types/domain';
import type { PlacementSettings } from './types';
import { useQuickSummon } from './useQuickSummon';
import { QuickSummonResultsTable } from './QuickSummonResultsTable';
import { QuickSummonStagingPanel } from './QuickSummonStagingPanel';
import { CR_VALUES, parseCrToNumeric } from './types';

export interface QuickSummonDialogProps {
  open: boolean;
  onClose: () => void;
  onPlace: (asset: Asset, settings: PlacementSettings, tokenIndex: number) => void;
  kind?: AssetKind;
  title?: string;
}

export const QuickSummonDialog: React.FC<QuickSummonDialogProps> = ({
  open,
  onClose,
  onPlace,
  kind,
  title = 'Place Asset',
}) => {
  const theme = useTheme();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const [typeMenuAnchor, setTypeMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [crMenuAnchor, setCrMenuAnchor] = React.useState<null | HTMLElement>(null);

  const {
    scopeTab,
    searchQuery,
    typeFilter,
    crRangeFilter,
    selectedAsset,
    selectedTokenIndex,
    placementSettings,
    highlightedIndex,
    filteredResults,
    availableTypes,
    isLoading,
    setScopeTab,
    setSearchQuery,
    setTypeFilter,
    setCrRangeFilter,
    selectAsset,
    setSelectedTokenIndex,
    setHighlightedIndex,
    updatePlacementSettings,
    navigateList,
    recordRecentAsset,
    reset,
  } = useQuickSummon(kind ? { kind } : {});

  useEffect(() => {
    if (open) {
      reset();
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [open, reset]);

  useEffect(() => {
    if (tableContainerRef.current && filteredResults.length > 0) {
      const row = tableContainerRef.current.querySelector(`[data-index="${highlightedIndex}"]`);
      if (row) {
        row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex, filteredResults.length]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          navigateList('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          navigateList('down');
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedAsset) {
            handlePlace();
          }
          break;
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
      }
    },
    [navigateList, selectedAsset]
  );

  const handlePlace = () => {
    if (selectedAsset) {
      recordRecentAsset(selectedAsset);
      onPlace(selectedAsset, placementSettings, selectedTokenIndex);
      handleClose();
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleDoubleClick = (asset: Asset) => {
    selectAsset(asset);
    recordRecentAsset(asset);
    onPlace(asset, placementSettings, selectedTokenIndex);
    handleClose();
  };

  const handleCrFilterSelect = (value: string | null) => {
    setCrMenuAnchor(null);
    if (value === null) {
      setCrRangeFilter(null);
    } else {
      const cr = parseCrToNumeric(value);
      if (cr !== null) {
        setCrRangeFilter([cr, cr]);
      }
    }
  };

  const handleTypeFilterSelect = (value: string | null) => {
    setTypeMenuAnchor(null);
    setTypeFilter(value);
  };

  const filterChipSx = {
    height: 28,
    borderRadius: '14px',
    backgroundColor: theme.palette.action.hover,
    border: `1px solid ${theme.palette.divider}`,
    '&:hover': {
      backgroundColor: theme.palette.action.selected,
    },
    '& .MuiChip-label': {
      px: 1.5,
      fontSize: '0.8rem',
    },
    '& .MuiChip-deleteIcon': {
      fontSize: '1rem',
    },
  };

  const activeFilterChipSx = {
    ...filterChipSx,
    backgroundColor: theme.palette.primary.dark,
    borderColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
    },
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '85vh',
          maxHeight: 700,
          backgroundColor: theme.palette.background.paper,
        },
      }}
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Search & Filters Bar */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* Search Input */}
        <TextField
          inputRef={searchInputRef}
          fullWidth
          placeholder="Search (e.g., 'Goblin', 'CR:1', 'Undead')..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: theme.palette.text.secondary }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 1.5,
            '& .MuiOutlinedInput-root': {
              backgroundColor: theme.palette.background.default,
            },
          }}
        />

        {/* Filter Chips Row */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Type Filter Chip */}
          <Chip
            label={typeFilter ? `Type: ${typeFilter}` : 'Type ▾'}
            {...(typeFilter ? { onDelete: () => setTypeFilter(null) } : {})}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => setTypeMenuAnchor(e.currentTarget)}
            sx={typeFilter ? activeFilterChipSx : filterChipSx}
          />
          <Menu
            anchorEl={typeMenuAnchor}
            open={Boolean(typeMenuAnchor)}
            onClose={() => setTypeMenuAnchor(null)}
          >
            <MenuItem onClick={() => handleTypeFilterSelect(null)} sx={{ fontSize: '0.85rem' }}>
              <em>All Types</em>
            </MenuItem>
            {availableTypes.map((type) => (
              <MenuItem
                key={type}
                onClick={() => handleTypeFilterSelect(type)}
                selected={typeFilter === type}
                sx={{ fontSize: '0.85rem' }}
              >
                {type}
              </MenuItem>
            ))}
          </Menu>

          {/* CR Range Filter Chip */}
          <Chip
            label={crRangeFilter ? `CR: ${crRangeFilter[0]}` : 'CR Range ▾'}
            {...(crRangeFilter ? { onDelete: () => setCrRangeFilter(null) } : {})}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => setCrMenuAnchor(e.currentTarget)}
            sx={crRangeFilter ? activeFilterChipSx : filterChipSx}
          />
          <Menu
            anchorEl={crMenuAnchor}
            open={Boolean(crMenuAnchor)}
            onClose={() => setCrMenuAnchor(null)}
            slotProps={{
              paper: {
                sx: { maxHeight: 300 },
              },
            }}
          >
            <MenuItem onClick={() => handleCrFilterSelect(null)} sx={{ fontSize: '0.85rem' }}>
              <em>Any CR</em>
            </MenuItem>
            {CR_VALUES.map((cr) => (
              <MenuItem
                key={cr}
                onClick={() => handleCrFilterSelect(cr)}
                selected={crRangeFilter !== null && crRangeFilter[0] === parseCrToNumeric(cr)}
                sx={{ fontSize: '0.85rem' }}
              >
                CR {cr}
              </MenuItem>
            ))}
          </Menu>

          {/* Favorites Toggle Chip */}
          <Chip
            icon={<StarIcon sx={{ fontSize: '1rem !important' }} />}
            label="Favorites"
            onClick={() => setScopeTab(scopeTab === 'favorites' ? 'all' : 'favorites')}
            sx={scopeTab === 'favorites' ? activeFilterChipSx : filterChipSx}
          />
        </Box>
      </Box>

      {/* Main Content - Split Pane */}
      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          overflow: 'hidden',
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Left Pane - Results Table */}
        <Box
          sx={{
            width: '60%',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRight: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden',
            pl: 3,
            pr: 1,
            pb: 1,
          }}
        >
          {isLoading ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <QuickSummonResultsTable
              results={filteredResults}
              selectedAsset={selectedAsset}
              highlightedIndex={highlightedIndex}
              onSelect={selectAsset}
              onHighlight={setHighlightedIndex}
              onDoubleClick={handleDoubleClick}
              tableRef={tableContainerRef}
            />
          )}
        </Box>

        {/* Right Pane - Staging Area */}
        <Box
          sx={{
            width: '40%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(0,0,0,0.2)'
              : theme.palette.grey[50],
          }}
        >
          <QuickSummonStagingPanel
            asset={selectedAsset}
            selectedTokenIndex={selectedTokenIndex}
            onTokenIndexChange={setSelectedTokenIndex}
            placementSettings={placementSettings}
            onSettingsChange={updatePlacementSettings}
          />
        </Box>
      </DialogContent>

      {/* Footer */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 1.5,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(0,0,0,0.2)'
            : theme.palette.grey[50],
        }}
      >
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
          Drag row to map to place instantly
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Link
            component="button"
            variant="body2"
            onClick={handleClose}
            sx={{
              color: theme.palette.text.secondary,
              textDecoration: 'none',
              fontWeight: 600,
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Cancel
          </Link>
          <Button
            onClick={handlePlace}
            variant="contained"
            disabled={!selectedAsset}
            sx={{
              minWidth: 140,
              fontWeight: 600,
            }}
          >
            PLACE (Enter)
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default QuickSummonDialog;
