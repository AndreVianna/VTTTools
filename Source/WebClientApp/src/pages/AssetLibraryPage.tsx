import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  Grid,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import {
  AssetBrowserLayout,
  AssetCardCompact,
  AssetInspectorPanel,
  AssetTableView,
  AttributeRangeSlider,
  BrowserToolbar,
  TaxonomyTree,
} from '@/components/assets/browser';
import { LetterFilterBar } from '@/components/common/LetterFilterBar';
import { useAssetBrowser } from '@/hooks/useAssetBrowser';
import { useLetterFilter } from '@/hooks/useLetterFilter';
import { useGetAssetsQuery, useDeleteAssetMutation, useCloneAssetMutation } from '@/services/assetsApi';
import type { Asset } from '@/types/domain';

export const AssetLibraryPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const browser = useAssetBrowser();
  const [deleteAsset] = useDeleteAssetMutation();
  const [cloneAsset] = useCloneAssetMutation();

  const { data: allAssets, isLoading, error, refetch } = useGetAssetsQuery(browser.queryParams);

  const { availableLetters } = useLetterFilter({
    items: allAssets,
    getName: (asset) => asset.name,
  });

  const filteredAssets = useMemo(() => {
    if (!allAssets) return [];
    return browser.filterAssets(allAssets);
  }, [allAssets, browser]);

  const selectedAsset = useMemo(() => {
    if (!browser.selectedAssetId || !filteredAssets) return null;
    return filteredAssets.find((a) => a.id === browser.selectedAssetId) || null;
  }, [browser.selectedAssetId, filteredAssets]);

  const handleAssetClick = (asset: Asset) => {
    browser.setSelectedAssetId(asset.id);
  };

  const handleAssetDoubleClick = (asset: Asset) => {
    navigate(`/assets/${asset.id}/edit`);
  };

  const handleCreateNew = () => {
    navigate('/assets/new');
  };

  const handleEditAsset = () => {
    if (selectedAsset) {
      navigate(`/assets/${selectedAsset.id}/edit`);
    }
  };

  const handleDeleteAsset = async () => {
    if (selectedAsset && window.confirm(`Delete "${selectedAsset.name}"?`)) {
      await deleteAsset(selectedAsset.id);
      browser.setSelectedAssetId(null);
    }
  };

  const handleCloneAsset = async () => {
    if (selectedAsset) {
      const result = await cloneAsset(selectedAsset.id);
      if ('data' in result && result.data) {
        navigate(`/assets/${result.data.id}/edit`);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (browser.selectedAssetIds.length === 0) return;
    if (window.confirm(`Delete ${browser.selectedAssetIds.length} selected assets?`)) {
      for (const id of browser.selectedAssetIds) {
        await deleteAsset(id);
      }
      browser.clearSelection();
    }
  };

  const leftSidebar = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 1.5 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
          sx={{ mb: 2 }}
        >
          New Asset
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 1 }}>
        <Accordion defaultExpanded disableGutters elevation={0}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Classification
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <TaxonomyTree
              assets={allAssets || []}
              selectedPath={browser.selectedPath}
              onPathChange={browser.setSelectedPath}
              expandedNodes={browser.expandedTreeNodes}
              onExpandedChange={browser.setExpandedTreeNodes}
            />
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters elevation={0}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Attributes
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <AttributeRangeSlider
              label="HP"
              min={0}
              max={500}
              value={browser.attributeFilters['HP'] || [0, 500]}
              onChange={(v) => browser.setAttributeFilter('HP', v)}
            />
            <AttributeRangeSlider
              label="AC"
              min={0}
              max={30}
              value={browser.attributeFilters['AC'] || [0, 30]}
              onChange={(v) => browser.setAttributeFilter('AC', v)}
            />
            <AttributeRangeSlider
              label="CR"
              min={0}
              max={30}
              value={browser.attributeFilters['CR'] || [0, 30]}
              onChange={(v) => browser.setAttributeFilter('CR', v)}
            />
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters elevation={0}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Ownership
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={browser.ownershipFilter === 'mine' || browser.ownershipFilter === 'all'}
                    onChange={(e) =>
                      browser.setOwnershipFilter(
                        e.target.checked
                          ? browser.ownershipFilter === 'others'
                            ? 'all'
                            : 'mine'
                          : 'others'
                      )
                    }
                  />
                }
                label={<Typography variant="body2">Mine</Typography>}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={browser.ownershipFilter === 'others' || browser.ownershipFilter === 'all'}
                    onChange={(e) =>
                      browser.setOwnershipFilter(
                        e.target.checked
                          ? browser.ownershipFilter === 'mine'
                            ? 'all'
                            : 'others'
                          : 'mine'
                      )
                    }
                  />
                }
                label={<Typography variant="body2">Others</Typography>}
              />
            </FormGroup>
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters elevation={0}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Status
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={browser.statusFilter === 'all' || browser.statusFilter === 'published'}
                    onChange={(e) =>
                      browser.setStatusFilter(
                        e.target.checked
                          ? browser.statusFilter === 'draft'
                            ? 'all'
                            : 'published'
                          : 'draft'
                      )
                    }
                  />
                }
                label={<Typography variant="body2">Published</Typography>}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={browser.statusFilter === 'all' || browser.statusFilter === 'draft'}
                    onChange={(e) =>
                      browser.setStatusFilter(
                        e.target.checked
                          ? browser.statusFilter === 'published'
                            ? 'all'
                            : 'draft'
                          : 'published'
                      )
                    }
                  />
                }
                label={<Typography variant="body2">Draft</Typography>}
              />
            </FormGroup>
          </AccordionDetails>
        </Accordion>

        {(browser.selectedPath.length > 0 ||
          browser.searchQuery ||
          browser.letterFilter ||
          Object.keys(browser.attributeFilters).length > 0) && (
          <Box sx={{ p: 1, pt: 2 }}>
            <Button
              size="small"
              startIcon={<FilterListIcon />}
              onClick={browser.resetFilters}
              fullWidth
              variant="outlined"
            >
              Reset Filters
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );

  const mainContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <BrowserToolbar
        searchQuery={browser.searchQuery}
        onSearchChange={browser.setSearchQuery}
        sortField={browser.sortField}
        sortDirection={browser.sortDirection}
        onSortChange={browser.setSort}
        viewMode={browser.viewMode}
        onViewModeChange={browser.setViewMode}
        selectedCount={browser.selectedAssetIds.length}
        onBulkDelete={handleBulkDelete}
        totalCount={filteredAssets.length}
      />

      <LetterFilterBar
        selectedLetter={browser.letterFilter}
        onLetterChange={browser.setLetterFilter}
        availableLetters={availableLetters}
        compact
      />

      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
                Retry
              </Button>
            }
          >
            Failed to load assets. Please try again.
          </Alert>
        )}

        {!isLoading && !error && filteredAssets.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: theme.palette.text.secondary,
            }}
          >
            <Typography variant="h6">No assets found</Typography>
            <Typography variant="body2">Try adjusting your filters or create a new asset</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateNew} sx={{ mt: 2 }}>
              Create Asset
            </Button>
          </Box>
        )}

        {!isLoading && !error && filteredAssets.length > 0 && browser.viewMode === 'table' && (
          <AssetTableView
            assets={filteredAssets}
            selectedIds={browser.selectedAssetIds}
            onSelectionChange={browser.setSelectedAssetIds}
            onRowClick={handleAssetClick}
            onRowDoubleClick={handleAssetDoubleClick}
          />
        )}

        {!isLoading && !error && filteredAssets.length > 0 && browser.viewMode !== 'table' && (
          <Grid container spacing={1.5}>
            {filteredAssets.map((asset) => (
              <Grid key={asset.id}>
                <AssetCardCompact
                  asset={asset}
                  isSelected={browser.selectedAssetId === asset.id}
                  isMultiSelectMode={browser.isMultiSelectMode}
                  isChecked={browser.selectedAssetIds.includes(asset.id)}
                  onClick={() => handleAssetClick(asset)}
                  onDoubleClick={() => handleAssetDoubleClick(asset)}
                  onCheckChange={() => browser.toggleAssetSelection(asset.id)}
                  size={browser.viewMode === 'grid-large' ? 'large' : 'small'}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );

  const rightSidebar = selectedAsset ? (
    <AssetInspectorPanel asset={selectedAsset} onEdit={handleEditAsset} onDelete={handleDeleteAsset} onClone={handleCloneAsset} />
  ) : null;

  return (
    <AssetBrowserLayout
      leftSidebar={leftSidebar}
      mainContent={mainContent}
      rightSidebar={rightSidebar}
      rightSidebarOpen={browser.inspectorOpen}
    />
  );
};

export default AssetLibraryPage;
