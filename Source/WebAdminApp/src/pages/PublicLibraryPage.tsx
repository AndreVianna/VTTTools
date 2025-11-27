import { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
} from '@mui/x-data-grid';
import {
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SwapHoriz as TransferIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import {
  libraryService,
  type ContentType,
  type OwnerType,
  type LibrarySearchRequest,
  type LibraryContentResponse,
  type CreateContentRequest,
  type UpdateContentRequest,
  type TransferOwnershipRequest,
} from '@services/libraryService';

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: 'world', label: 'Worlds' },
  { value: 'campaign', label: 'Campaigns' },
  { value: 'adventure', label: 'Adventures' },
  { value: 'encounter', label: 'Encounters' },
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

const DEFAULT_FILTERS: FilterState = {
  search: '',
  ownerType: '',
  isPublished: '',
  isPublic: '',
};

function filtersToRequest(filters: FilterState): Omit<LibrarySearchRequest, 'skip' | 'take'> {
  const request: Omit<LibrarySearchRequest, 'skip' | 'take'> = {};
  if (filters.search) request.search = filters.search;
  if (filters.ownerType) request.ownerType = filters.ownerType;
  if (filters.isPublished !== '') request.isPublished = filters.isPublished;
  if (filters.isPublic !== '') request.isPublic = filters.isPublic;
  return request;
}

export function PublicLibraryPage() {
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

  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateContentRequest>({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LibraryContentResponse | null>(null);
  const [editForm, setEditForm] = useState<UpdateContentRequest>({});
  const [updating, setUpdating] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<LibraryContentResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferringItem, setTransferringItem] = useState<LibraryContentResponse | null>(null);
  const [transferForm, setTransferForm] = useState<TransferOwnershipRequest>({ action: 'take' });
  const [transferring, setTransferring] = useState(false);

  const currentContentType = CONTENT_TYPES[activeTab]?.value ?? 'world';
  const currentContentLabel = CONTENT_TYPES[activeTab]?.label ?? 'Worlds';

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

  const loadContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const request: LibrarySearchRequest = {
        skip: paginationModel.page * paginationModel.pageSize,
        take: paginationModel.pageSize,
        ...filtersToRequest(filters),
      };

      const response = await libraryService.searchContent(currentContentType, request);
      setContent(response.content);
      setTotalCount(response.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [currentContentType, paginationModel, filters]);

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

  const handleCreate = async () => {
    try {
      setCreating(true);
      setError(null);

      const serviceMethod = {
        world: libraryService.createWorld,
        campaign: libraryService.createCampaign,
        adventure: libraryService.createAdventure,
        encounter: libraryService.createEncounter,
        asset: libraryService.createAsset,
      }[currentContentType];

      await serviceMethod(createForm);
      setCreateDialogOpen(false);
      setCreateForm({ name: '', description: '' });
      loadContent();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create content');
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (item: LibraryContentResponse) => {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      description: item.description,
      isPublished: item.isPublished,
      isPublic: item.isPublic,
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingItem) return;

    try {
      setUpdating(true);
      setError(null);

      await libraryService.updateContent(currentContentType, editingItem.id, editForm);
      setEditDialogOpen(false);
      setEditingItem(null);
      setEditForm({});
      loadContent();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update content');
    } finally {
      setUpdating(false);
    }
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
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 200,
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
      renderCell: (params: GridRenderCellParams<LibraryContentResponse>) => (
        getOwnerChip(params.row.ownerId, params.row.ownerName)
      ),
    },
    {
      field: 'isPublished',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams<LibraryContentResponse>) => (
        getPublishedChip(params.row.isPublished)
      ),
    },
    {
      field: 'isPublic',
      headerName: 'Visibility',
      width: 100,
      renderCell: (params: GridRenderCellParams<LibraryContentResponse>) => (
        getPublicChip(params.row.isPublic)
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 150,
      renderCell: (params: GridRenderCellParams<LibraryContentResponse>) => (
        <Typography variant="body2">
          {dayjs(params.value).format('MM/DD/YYYY')}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params: GridRenderCellParams<LibraryContentResponse>) => (
        <Stack direction="row" spacing={0.5}>
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
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            {filtersOpen ? 'Hide Filters' : 'Show Filters'}
          </Button>
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

      {filtersOpen && renderFilters()}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

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

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New {currentContentLabel.slice(0, -1)}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Name"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={createForm.description || ''}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              multiline
              rows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!createForm.name || creating}
          >
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit {currentContentLabel.slice(0, -1)}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Name"
              value={editForm.name || ''}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Description"
              value={editForm.description || ''}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              multiline
              rows={3}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editForm.isPublished?.toString() || 'false'}
                label="Status"
                onChange={(e) =>
                  setEditForm({ ...editForm, isPublished: e.target.value === 'true' })
                }
              >
                <MenuItem value="false">Draft</MenuItem>
                <MenuItem value="true">Published</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Visibility</InputLabel>
              <Select
                value={editForm.isPublic?.toString() || 'false'}
                label="Visibility"
                onChange={(e) =>
                  setEditForm({ ...editForm, isPublic: e.target.value === 'true' })
                }
              >
                <MenuItem value="false">Private</MenuItem>
                <MenuItem value="true">Public</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate} disabled={updating}>
            {updating ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deletingItem?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

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
