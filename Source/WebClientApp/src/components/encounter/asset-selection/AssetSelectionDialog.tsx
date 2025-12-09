import React, { useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import type { Asset, AssetKind } from '@/types/domain';
import type { PlacementSettings } from './types';
import { useAssetSelection } from './useAssetSelection';
import { AssetSelectionResultsTable } from './AssetSelectionResultsTable';
import { AssetSelectionPreviewPanel } from './AssetSelectionPreviewPanel';
import { ALPHABET_LETTERS } from './types';

export interface AssetSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onPlace: (asset: Asset, settings: PlacementSettings, tokenIndex: number) => void;
  kind?: AssetKind;
  title?: string;
}

export const AssetSelectionDialog: React.FC<AssetSelectionDialogProps> = ({
  open,
  onClose,
  onPlace,
  kind,
  title = 'Place Asset',
}) => {
  const theme = useTheme();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const {
    searchQuery,
    letterFilter,
    categoryFilter,
    typeFilter,
    subtypeFilter,
    selectedAsset,
    selectedTokenIndex,
    placementSettings,
    highlightedIndex,
    filteredResults,
    availableLetters,
    availableCategories,
    availableTypes,
    availableSubtypes,
    isLoading,
    setSearchQuery,
    setLetterFilter,
    setCategoryFilter,
    setTypeFilter,
    setSubtypeFilter,
    selectAsset,
    setSelectedTokenIndex,
    setHighlightedIndex,
    navigateList,
    recordRecentAsset,
    reset,
  } = useAssetSelection(kind ? { kind } : {});

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

  useEffect(() => {
    if (open && !selectedAsset && filteredResults.length > 0 && filteredResults[0]) {
      selectAsset(filteredResults[0].asset);
    }
  }, [open, selectedAsset, filteredResults, selectAsset]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handlePlace = useCallback(() => {
    if (selectedAsset) {
      recordRecentAsset(selectedAsset);
      onPlace(selectedAsset, placementSettings, selectedTokenIndex);
      handleClose();
    }
  }, [selectedAsset, recordRecentAsset, onPlace, placementSettings, selectedTokenIndex, handleClose]);

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
    [navigateList, selectedAsset, handlePlace, handleClose]
  );

  const handleDoubleClick = (asset: Asset) => {
    selectAsset(asset);
    recordRecentAsset(asset);
    onPlace(asset, placementSettings, selectedTokenIndex);
    handleClose();
  };

  const letterButtonSx = (isActive: boolean, isEnabled: boolean) => ({
    minWidth: 28,
    height: 24,
    px: 0.5,
    fontSize: '0.7rem',
    fontWeight: isActive ? 700 : 500,
    borderRadius: 0.5,
    backgroundColor: isActive
      ? theme.palette.primary.main
      : 'transparent',
    color: isActive
      ? theme.palette.primary.contrastText
      : isEnabled
        ? theme.palette.text.primary
        : theme.palette.text.disabled,
    cursor: isEnabled ? 'pointer' : 'default',
    opacity: isEnabled ? 1 : 0.4,
    '&:hover': isEnabled ? {
      backgroundColor: isActive
        ? theme.palette.primary.dark
        : theme.palette.action.hover,
    } : {},
  });

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
          placeholder="Search by name, type, or description..."
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

        {/* Alphabet Filter Row */}
        <Box
          sx={{
            display: 'flex',
            gap: 0.25,
            flexWrap: 'wrap',
            mb: 1.5,
          }}
        >
          {ALPHABET_LETTERS.map((letter) => {
            const isEnabled = availableLetters.has(letter);
            const isActive = letterFilter === letter;
            return (
              <Box
                key={letter}
                component="button"
                onClick={() => {
                  if (isEnabled) {
                    setLetterFilter(isActive ? null : letter);
                  }
                }}
                sx={letterButtonSx(isActive, isEnabled)}
              >
                {letter}
              </Box>
            );
          })}
        </Box>

        {/* Dropdowns Row */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150, flex: 1 }}>
            <InputLabel sx={{ fontSize: '0.85rem' }}>Category</InputLabel>
            <Select
              value={categoryFilter || ''}
              onChange={(e) => setCategoryFilter(e.target.value || null)}
              label="Category"
              sx={{ fontSize: '0.85rem' }}
            >
              <MenuItem value="">
                <em>All Categories</em>
              </MenuItem>
              {availableCategories.map((cat) => (
                <MenuItem key={cat} value={cat} sx={{ fontSize: '0.85rem' }}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150, flex: 1 }}>
            <InputLabel sx={{ fontSize: '0.85rem' }}>Type</InputLabel>
            <Select
              value={typeFilter || ''}
              onChange={(e) => setTypeFilter(e.target.value || null)}
              label="Type"
              sx={{ fontSize: '0.85rem' }}
              disabled={availableTypes.length === 0}
            >
              <MenuItem value="">
                <em>All Types</em>
              </MenuItem>
              {availableTypes.map((type) => (
                <MenuItem key={type} value={type} sx={{ fontSize: '0.85rem' }}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150, flex: 1 }}>
            <InputLabel sx={{ fontSize: '0.85rem' }}>Subtype</InputLabel>
            <Select
              value={subtypeFilter || ''}
              onChange={(e) => setSubtypeFilter(e.target.value || null)}
              label="Subtype"
              sx={{ fontSize: '0.85rem' }}
              disabled={availableSubtypes.length === 0}
            >
              <MenuItem value="">
                <em>All Subtypes</em>
              </MenuItem>
              {availableSubtypes.map((subtype) => (
                <MenuItem key={subtype} value={subtype} sx={{ fontSize: '0.85rem' }}>
                  {subtype}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
            <AssetSelectionResultsTable
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

        {/* Right Pane - Preview Area */}
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
          <AssetSelectionPreviewPanel
            asset={selectedAsset}
            selectedTokenIndex={selectedTokenIndex}
            onTokenIndexChange={setSelectedTokenIndex}
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
          {filteredResults.length} assets found
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

export default AssetSelectionDialog;
