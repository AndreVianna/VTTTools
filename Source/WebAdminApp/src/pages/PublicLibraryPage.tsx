import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  TextField,
  Button,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Skeleton,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Collapse,
  useTheme,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
  GRID_CHECKBOX_SELECTION_COL_DEF,
} from '@mui/x-data-grid';
import {
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SwapHoriz as TransferIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Category as CategoryIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { ConfirmDialog, ContentEditorDialog, type ContentFormData } from '@vtttools/web-components';
import {
  libraryService,
  type ContentType,
  type OwnerType,
  type LibrarySearchRequest,
  type LibraryContentResponse,
  type TransferOwnershipRequest,
  type AssetTaxonomyNode,
} from '@services/libraryService';

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: 'world', label: 'Worlds' },
  { value: 'campaign', label: 'Campaigns' },
  { value: 'adventure', label: 'Adventures' },
  { value: 'asset', label: 'Assets' },
];

const OWNER_TYPE_OPTIONS: { value: OwnerType | ''; label: string }[] = [
  { value: '', label: 'All Owners' },
  { value: 'master', label: 'Master User (Public Library)' },
  { value: 'user', label: 'Regular Users' },
];

interface FilterState {
  search: string;
  ownerType: OwnerType | '';
  isPublished: boolean | '';
  isPublic: boolean | '';
}

interface AssetFilterState {
  taxonomyPath: string[];
  ownerSearch: string;
  status: 'all' | 'published' | 'draft';
  visibility: 'all' | 'public' | 'private';
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  ownerType: '',
  isPublished: '',
  isPublic: '',
};

const DEFAULT_ASSET_FILTERS: AssetFilterState = {
  taxonomyPath: [],
  ownerSearch: '',
  status: 'all',
  visibility: 'all',
};

interface TaxonomyTreeNodeRowProps {
  node: AssetTaxonomyNode;
  depth: number;
  isSelected: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
}

const TaxonomyTreeNodeRow: React.FC<TaxonomyTreeNodeRowProps> = ({
  node,
  depth,
  isSelected,
  isExpanded,
  hasChildren,
  onSelect,
  onToggleExpand,
}) => {
  const theme = useTheme();
  const indentPx = depth * 12;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    if (hasChildren && !isExpanded) {
      onToggleExpand();
    }
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand();
  };

  const Icon = depth === 0 ? CategoryIcon : hasChildren ? (isExpanded ? FolderOpenIcon : FolderIcon) : FolderIcon;

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        py: 0.5,
        px: 1,
        pl: `${8 + indentPx}px`,
        cursor: 'pointer',
        borderRadius: 1,
        backgroundColor: isSelected ? theme.palette.action.selected : 'transparent',
        '&:hover': {
          backgroundColor: isSelected ? theme.palette.action.selected : theme.palette.action.hover,
        },
      }}
    >
      {hasChildren ? (
        <Box
          onClick={handleExpandClick}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          {isExpanded ? (
            <ExpandMoreIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
          ) : (
            <ChevronRightIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
          )}
        </Box>
      ) : (
        <Box sx={{ width: 20 }} />
      )}
      <Icon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
      <Typography variant="body2" sx={{ flexGrow: 1 }}>
        {node.label}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: theme.palette.text.secondary,
          backgroundColor: theme.palette.action.hover,
          borderRadius: 1,
          px: 0.75,
          minWidth: 24,
          textAlign: 'center',
        }}
      >
        {node.count}
      </Typography>
    </Box>
  );
};

interface TaxonomyTreeProps {
  taxonomy: AssetTaxonomyNode[];
  selectedPath: string[];
  onPathChange: (path: string[]) => void;
  expandedNodes: string[];
  onExpandedChange: (nodes: string[]) => void;
}

const TaxonomyTree: React.FC<TaxonomyTreeProps> = ({
  taxonomy,
  selectedPath,
  onPathChange,
  expandedNodes,
  onExpandedChange,
}) => {
  const isNodeExpanded = useCallback(
    (nodeId: string) => expandedNodes.includes(nodeId),
    [expandedNodes]
  );

  const toggleNodeExpansion = useCallback(
    (nodeId: string, depth: number) => {
      if (expandedNodes.includes(nodeId)) {
        onExpandedChange(expandedNodes.filter((id) => id !== nodeId && !id.startsWith(nodeId + '/')));
      } else {
        if (depth === 0) {
          const otherRootNodes = taxonomy.map((n) => n.id).filter((id) => id !== nodeId);
          const newExpanded = expandedNodes.filter(
            (id) => !otherRootNodes.some((rootId) => id === rootId || id.startsWith(rootId + '/'))
          );
          onExpandedChange([...newExpanded, nodeId]);
        } else {
          onExpandedChange([...expandedNodes, nodeId]);
        }
      }
    },
    [expandedNodes, onExpandedChange, taxonomy]
  );

  const handleSelect = useCallback(
    (node: AssetTaxonomyNode) => {
      const currentPath = selectedPath.join('/');
      const nodePath = node.path.join('/');
      if (currentPath === nodePath) {
        onPathChange([]);
      } else {
        onPathChange(node.path);
      }
    },
    [selectedPath, onPathChange]
  );

  const renderNode = (node: AssetTaxonomyNode, depth: number): React.ReactNode => {
    const nodeId = node.id;
    const isExpanded = isNodeExpanded(nodeId);
    const isSelected = selectedPath.join('/') === node.path.join('/');
    const hasChildren = node.children.length > 0;

    return (
      <Box key={nodeId}>
        <TaxonomyTreeNodeRow
          node={node}
          depth={depth}
          isSelected={isSelected}
          isExpanded={isExpanded}
          hasChildren={hasChildren}
          onSelect={() => handleSelect(node)}
          onToggleExpand={() => toggleNodeExpansion(nodeId, depth)}
        />
        {hasChildren && (
          <Collapse in={isExpanded}>
            {node.children.map((child) => renderNode(child, depth + 1))}
          </Collapse>
        )}
      </Box>
    );
  };

  return <Box>{taxonomy.map((node) => renderNode(node, 0))}</Box>;
};

function filtersToRequest(filters: FilterState): Omit<LibrarySearchRequest, 'skip' | 'take'> {
  const request: Omit<LibrarySearchRequest, 'skip' | 'take'> = {};
  if (filters.search) request.search = filters.search;
  if (filters.ownerType) request.ownerType = filters.ownerType;
  if (filters.isPublished !== '') request.isPublished = filters.isPublished;
  if (filters.isPublic !== '') request.isPublic = filters.isPublic;
  return request;
}

function assetFiltersToRequest(
  filters: AssetFilterState
): Omit<LibrarySearchRequest, 'skip' | 'take'> {
  const request: Omit<LibrarySearchRequest, 'skip' | 'take'> = {};

  if (filters.ownerSearch) {
    request.search = filters.ownerSearch;
  }

  if (filters.status === 'published') {
    request.isPublished = true;
  } else if (filters.status === 'draft') {
    request.isPublished = false;
  }

  if (filters.visibility === 'public') {
    request.isPublic = true;
  } else if (filters.visibility === 'private') {
    request.isPublic = false;
  }

  return request;
}

function taxonomyPathToFilters(path: string[]): Pick<LibrarySearchRequest, 'kind' | 'category' | 'type' | 'subtype'> {
  const filters: Pick<LibrarySearchRequest, 'kind' | 'category' | 'type' | 'subtype'> = {};
  if (path.length >= 1) filters.kind = path[0];
  if (path.length >= 2) filters.category = path[1];
  if (path.length >= 3) filters.type = path[2];
  if (path.length >= 4) filters.subtype = path[3];
  return filters;
}

export function PublicLibraryPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [content, setContent] = useState<LibraryContentResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [masterUserId, setMasterUserId] = useState<string | null>(null);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [tempFilters, setTempFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const [assetFilters, setAssetFilters] = useState<AssetFilterState>(DEFAULT_ASSET_FILTERS);
  const [taxonomyExpandedNodes, setTaxonomyExpandedNodes] = useState<string[]>([]);
  const [taxonomy, setTaxonomy] = useState<AssetTaxonomyNode[]>([]);
  const [taxonomyLoading, setTaxonomyLoading] = useState(false);

  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<LibraryContentResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferringItem, setTransferringItem] = useState<LibraryContentResponse | null>(null);
  const [transferForm, setTransferForm] = useState<TransferOwnershipRequest>({ action: 'take' });
  const [transferring, setTransferring] = useState(false);

  const currentContentType = CONTENT_TYPES[activeTab]?.value ?? 'world';
  const currentContentLabel = CONTENT_TYPES[activeTab]?.label ?? 'Worlds';
  const isAssetTab = currentContentType === 'asset';

  const loadConfig = useCallback(async () => {
    try {
      const config = await libraryService.getConfig();
      setMasterUserId(config.masterUserId);
    } catch (err) {
      console.error('Failed to load library config:', err);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const loadTaxonomy = useCallback(async () => {
    try {
      setTaxonomyLoading(true);
      const data = await libraryService.getAssetTaxonomy();
      setTaxonomy(data ?? []);
    } catch (err) {
      console.error('Failed to load asset taxonomy:', err);
      setTaxonomy([]);
    } finally {
      setTaxonomyLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAssetTab) {
      loadTaxonomy();
    }
  }, [isAssetTab, loadTaxonomy]);

  const loadContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let requestFilters: Omit<LibrarySearchRequest, 'skip' | 'take'>;

      if (isAssetTab) {
        requestFilters = {
          ...assetFiltersToRequest(assetFilters),
          ...taxonomyPathToFilters(assetFilters.taxonomyPath),
        };
      } else {
        requestFilters = filtersToRequest(filters);
      }

      const request: LibrarySearchRequest = {
        skip: paginationModel.page * paginationModel.pageSize,
        take: paginationModel.pageSize,
        ...requestFilters,
      };

      const response = await libraryService.searchContent(currentContentType, request);
      setContent(response.content);
      setTotalCount(response.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [currentContentType, paginationModel, filters, isAssetTab, assetFilters]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleClearFilters = () => {
    setTempFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleResetAssetFilters = () => {
    setAssetFilters(DEFAULT_ASSET_FILTERS);
    setTaxonomyExpandedNodes([]);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const hasActiveAssetFilters = useMemo(() => {
    return (
      assetFilters.taxonomyPath.length > 0 ||
      assetFilters.ownerSearch.length > 0 ||
      assetFilters.status !== 'all' ||
      assetFilters.visibility !== 'all'
    );
  }, [assetFilters]);

  const handleTaxonomyPathChange = (path: string[]) => {
    setAssetFilters({ ...assetFilters, taxonomyPath: path });
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleCreate = async (data: ContentFormData) => {
    const serviceMethodMap: Record<string, (request: { name: string; description?: string }) => Promise<LibraryContentResponse>> = {
      world: libraryService.createWorld,
      campaign: libraryService.createCampaign,
      adventure: libraryService.createAdventure,
      asset: libraryService.createAsset,
    };

    const serviceMethod = serviceMethodMap[currentContentType];
    if (!serviceMethod) return;

    await serviceMethod({ name: data.name, description: data.description });
    setCreateDialogOpen(false);
    loadContent();
  };

  const handleEdit = (item: LibraryContentResponse) => {
    navigate(`/admin/library/${currentContentType}s/${item.id}`);
  };

  const handleDelete = (item: LibraryContentResponse) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    try {
      setDeleting(true);
      setError(null);

      await libraryService.deleteContent(currentContentType, deletingItem.id);
      setDeleteDialogOpen(false);
      setDeletingItem(null);
      loadContent();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete content');
    } finally {
      setDeleting(false);
    }
  };

  const handleTransfer = (item: LibraryContentResponse) => {
    setTransferringItem(item);
    const isMasterOwned = masterUserId && item.ownerId === masterUserId;
    setTransferForm({ action: isMasterOwned ? 'grant' : 'take' });
    setTransferDialogOpen(true);
  };

  const handleConfirmTransfer = async () => {
    if (!transferringItem) return;

    try {
      setTransferring(true);
      setError(null);

      await libraryService.transferContentOwnership(
        currentContentType,
        transferringItem.id,
        transferForm
      );
      setTransferDialogOpen(false);
      setTransferringItem(null);
      setTransferForm({ action: 'take' });
      loadContent();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to transfer ownership');
    } finally {
      setTransferring(false);
    }
  };

  const getPublishedChip = (isPublished: boolean) => (
    <Chip
      label={isPublished ? 'Published' : 'Draft'}
      color={isPublished ? 'success' : 'default'}
      size="small"
    />
  );

  const getPublicChip = (isPublic: boolean) => (
    <Chip
      label={isPublic ? 'Public' : 'Private'}
      color={isPublic ? 'info' : 'default'}
      size="small"
      variant="outlined"
    />
  );

  const getOwnerChip = (ownerId: string, ownerName?: string) => {
    const isMaster = masterUserId && ownerId === masterUserId;
    return (
      <Chip
        label={isMaster ? 'Public Library' : ownerName || 'Unknown'}
        color={isMaster ? 'primary' : 'default'}
        size="small"
        variant={isMaster ? 'filled' : 'outlined'}
      />
    );
  };

  const columns: GridColDef<LibraryContentResponse>[] = [
    {
      ...GRID_CHECKBOX_SELECTION_COL_DEF,
      hideable: false,
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 200,
      hideable: false,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'ownerId',
      headerName: 'Owner',
      width: 150,
      display: 'flex',
      renderCell: (params: GridRenderCellParams<LibraryContentResponse>) => (
        getOwnerChip(params.row.ownerId, params.row.ownerName)
      ),
    },
    {
      field: 'isPublished',
      headerName: 'Status',
      width: 120,
      display: 'flex',
      renderCell: (params: GridRenderCellParams<LibraryContentResponse>) => (
        getPublishedChip(params.row.isPublished)
      ),
    },
    {
      field: 'isPublic',
      headerName: 'Visibility',
      width: 100,
      display: 'flex',
      renderCell: (params: GridRenderCellParams<LibraryContentResponse>) => (
        getPublicChip(params.row.isPublic)
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      display: 'flex',
      renderCell: (params: GridRenderCellParams<LibraryContentResponse>) => (
        <Typography variant="body2">
          {dayjs(params.value).format('MM/DD/YYYY')}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 130,
      sortable: false,
      disableColumnMenu: true,
      hideable: false,
      display: 'flex',
      renderCell: (params: GridRenderCellParams<LibraryContentResponse>) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleEdit(params.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Transfer Ownership">
            <IconButton size="small" onClick={() => handleTransfer(params.row)}>
              <TransferIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const renderFilters = () => (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            label="Search"
            placeholder="Search by name or description..."
            value={tempFilters.search || ''}
            onChange={(e) => setTempFilters({ ...tempFilters, search: e.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth>
            <InputLabel>Owner Type</InputLabel>
            <Select
              value={tempFilters.ownerType || ''}
              label="Owner Type"
              onChange={(e) =>
                setTempFilters({
                  ...tempFilters,
                  ownerType: (e.target.value as OwnerType) || undefined,
                })
              }
            >
              {OWNER_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Published</InputLabel>
            <Select
              value={tempFilters.isPublished === '' ? '' : tempFilters.isPublished.toString()}
              label="Published"
              onChange={(e) =>
                setTempFilters({
                  ...tempFilters,
                  isPublished: e.target.value === '' ? '' : e.target.value === 'true',
                })
              }
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Published</MenuItem>
              <MenuItem value="false">Draft</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Visibility</InputLabel>
            <Select
              value={tempFilters.isPublic === '' ? '' : tempFilters.isPublic.toString()}
              label="Visibility"
              onChange={(e) =>
                setTempFilters({
                  ...tempFilters,
                  isPublic: e.target.value === '' ? '' : e.target.value === 'true',
                })
              }
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Public</MenuItem>
              <MenuItem value="false">Private</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button variant="contained" onClick={handleApplyFilters}>
          Apply Filters
        </Button>
        <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleClearFilters}>
          Clear Filters
        </Button>
      </Stack>
    </Paper>
  );

  const renderTaxonomyPanel = () => (
    <Paper sx={{ p: 2, height: 'fit-content', position: 'sticky', top: 24 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CategoryIcon color="primary" />
          <Typography variant="h6">Categories</Typography>
        </Box>
        {assetFilters.taxonomyPath.length > 0 && (
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={() => handleTaxonomyPathChange([])}
          >
            Clear
          </Button>
        )}
      </Box>

      {taxonomyLoading ? (
        <Box sx={{ py: 2 }}>
          <Skeleton variant="rectangular" height={200} />
        </Box>
      ) : taxonomy.length > 0 ? (
        <TaxonomyTree
          taxonomy={taxonomy}
          selectedPath={assetFilters.taxonomyPath}
          onPathChange={handleTaxonomyPathChange}
          expandedNodes={taxonomyExpandedNodes}
          onExpandedChange={setTaxonomyExpandedNodes}
        />
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          No categories available
        </Typography>
      )}
    </Paper>
  );

  const renderAssetFilterRow = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          size="small"
          placeholder="Search by owner name..."
          value={assetFilters.ownerSearch}
          onChange={(e) => {
            setAssetFilters({ ...assetFilters, ownerSearch: e.target.value });
            setPaginationModel({ ...paginationModel, page: 0 });
          }}
          sx={{ minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={assetFilters.status}
            label="Status"
            onChange={(e) => {
              setAssetFilters({
                ...assetFilters,
                status: e.target.value as 'all' | 'published' | 'draft',
              });
              setPaginationModel({ ...paginationModel, page: 0 });
            }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Visibility</InputLabel>
          <Select
            value={assetFilters.visibility}
            label="Visibility"
            onChange={(e) => {
              setAssetFilters({
                ...assetFilters,
                visibility: e.target.value as 'all' | 'public' | 'private',
              });
              setPaginationModel({ ...paginationModel, page: 0 });
            }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="public">Public</MenuItem>
            <MenuItem value="private">Private</MenuItem>
          </Select>
        </FormControl>
        {hasActiveAssetFilters && (
          <Button size="small" startIcon={<ClearIcon />} onClick={handleResetAssetFilters}>
            Reset All
          </Button>
        )}
      </Stack>
    </Paper>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Public Library Management</Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create {currentContentLabel.slice(0, -1)}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadContent}
            disabled={loading}
          >
            Refresh
          </Button>
          {!isAssetTab && (
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              {filtersOpen ? 'Hide Filters' : 'Show Filters'}
            </Button>
          )}
        </Stack>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => {
            setActiveTab(newValue);
            setPaginationModel({ ...paginationModel, page: 0 });
            setSelectedRows([]);
          }}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {CONTENT_TYPES.map((type) => (
            <Tab key={type.value} label={type.label} />
          ))}
        </Tabs>
      </Paper>

      {!isAssetTab && filtersOpen && renderFilters()}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {isAssetTab ? (
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box sx={{ width: 280, flexShrink: 0 }}>
            {renderTaxonomyPanel()}
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            {renderAssetFilterRow()}
            {loading && !content.length ? (
              <Paper sx={{ p: 2 }}>
                <Skeleton variant="rectangular" height={400} />
              </Paper>
            ) : (
              <Paper sx={{ height: 600, width: '100%' }}>
                <DataGrid
                  rows={content}
                  columns={columns}
                  loading={loading}
                  pageSizeOptions={[10, 25, 50, 100]}
                  paginationMode="server"
                  rowCount={totalCount}
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  checkboxSelection
                  disableRowSelectionOnClick
                  rowSelectionModel={selectedRows}
                  onRowSelectionModelChange={setSelectedRows}
                  slots={{
                    noRowsOverlay: () => (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                        }}
                      >
                        <Typography variant="body1" color="text.secondary">
                          No {currentContentLabel.toLowerCase()} found
                        </Typography>
                      </Box>
                    ),
                  }}
                />
              </Paper>
            )}
          </Box>
        </Box>
      ) : (
        loading && !content.length ? (
          <Paper sx={{ p: 2 }}>
            <Skeleton variant="rectangular" height={400} />
          </Paper>
        ) : (
          <Paper sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={content}
              columns={columns}
              loading={loading}
              pageSizeOptions={[10, 25, 50, 100]}
              paginationMode="server"
              rowCount={totalCount}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              checkboxSelection
              disableRowSelectionOnClick
              rowSelectionModel={selectedRows}
              onRowSelectionModelChange={setSelectedRows}
              slots={{
                noRowsOverlay: () => (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      No {currentContentLabel.toLowerCase()} found
                    </Typography>
                  </Box>
                ),
              }}
            />
          </Paper>
        )
      )}

      <ContentEditorDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSave={handleCreate}
        title={`Create New ${currentContentLabel.slice(0, -1)}`}
        contentTypeName={currentContentLabel.slice(0, -1)}
        showVisibility={false}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
        isLoading={deleting}
      />

      <Dialog open={transferDialogOpen} onClose={() => setTransferDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Transfer Ownership</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Current owner: {transferringItem?.ownerName || 'Unknown'}
              {masterUserId && transferringItem?.ownerId === masterUserId && ' (Public Library)'}
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Action</InputLabel>
              <Select
                value={transferForm.action}
                label="Action"
                onChange={(e) =>
                  setTransferForm({ ...transferForm, action: e.target.value as 'take' | 'grant' })
                }
              >
                <MenuItem value="take">Take to Public Library (Master User)</MenuItem>
                <MenuItem value="grant">Grant to User</MenuItem>
              </Select>
            </FormControl>
            {transferForm.action === 'grant' && (
              <TextField
                fullWidth
                label="Target User ID"
                value={transferForm.targetUserId || ''}
                onChange={(e) =>
                  setTransferForm({ ...transferForm, targetUserId: e.target.value })
                }
                required
                helperText="Enter the user ID to transfer ownership to"
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleConfirmTransfer}
            disabled={transferring || (transferForm.action === 'grant' && !transferForm.targetUserId)}
          >
            {transferring ? 'Transferring...' : 'Transfer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
