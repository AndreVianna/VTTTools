import { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Paper,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    IconButton,
    Chip,
    Typography,
    Grid,
    Card,
    CardContent,
    Alert,
    useTheme,
} from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
    GridSortModel,
} from '@mui/x-data-grid';
import {
    Search as SearchIcon,
    Lock as LockIcon,
    LockOpen as UnlockIcon,
    Visibility as ViewIcon,
    VerifiedUser as VerifiedIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { userService, UserListItem, UserStatsResponse } from '@services/userService';
import { UserDetailModal } from '@components/users/UserDetailModal';

export function UserListPage() {
    const theme = useTheme();
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<UserStatsResponse | null>(null);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('email');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);

    const TAKE = 50;

    useEffect(() => {
        loadStats();
    }, []);

    const loadUsers = useCallback(
        async (reset: boolean = false) => {
            setLoading(true);
            setError(null);
            try {
                const currentSkip = reset ? 0 : skip;
                const searchParams: any = {
                    skip: currentSkip,
                    take: TAKE,
                    sortBy: sortBy as 'email' | 'displayName',
                    sortOrder: sortOrder,
                };

                if (search) {
                    searchParams.search = search;
                }
                if (roleFilter) {
                    searchParams.role = roleFilter;
                }
                if (statusFilter) {
                    searchParams.status = statusFilter as 'active' | 'locked' | 'unconfirmed';
                }

                const response = await userService.searchUsers(searchParams);

                if (reset) {
                    setUsers(response.users);
                    setSkip(TAKE);
                } else {
                    setUsers((prev) => [...prev, ...response.users]);
                    setSkip(currentSkip + TAKE);
                }

                setHasMore(response.hasMore);
                setTotalCount(response.totalCount);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load users');
            } finally {
                setLoading(false);
            }
        },
        [skip, search, roleFilter, statusFilter, sortBy, sortOrder]
    );

    const loadStats = async () => {
        try {
            const data = await userService.getUserStats();
            setStats(data);
        } catch (err) {
            console.error('Failed to load user stats:', err);
        }
    };

    useEffect(() => {
        loadUsers(true);
    }, [search, roleFilter, statusFilter, sortBy, sortOrder, loadUsers]);

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            loadUsers(false);
        }
    };

    const handleSortChange = (model: GridSortModel) => {
        if (model.length > 0 && model[0]) {
            const sortField = model[0].field;
            const sortDirection = model[0].sort;
            if (sortField) {
                setSortBy(sortField);
            }
            if (sortDirection) {
                setSortOrder(sortDirection);
            }
        }
    };

    const handleLockUser = async (userId: string) => {
        try {
            await userService.lockUser(userId);
            loadUsers(true);
            loadStats();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to lock user');
        }
    };

    const handleUnlockUser = async (userId: string) => {
        try {
            await userService.unlockUser(userId);
            loadUsers(true);
            loadStats();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to unlock user');
        }
    };

    const handleVerifyEmail = async (userId: string) => {
        try {
            await userService.verifyEmail(userId);
            loadUsers(true);
            loadStats();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to verify email');
        }
    };

    const handleViewDetails = (userId: string) => {
        setSelectedUserId(userId);
        setDetailModalOpen(true);
    };

    const handleDetailModalClose = () => {
        setDetailModalOpen(false);
        setSelectedUserId(null);
    };

    const handleUserUpdated = () => {
        loadUsers(true);
        loadStats();
    };

    const columns: GridColDef[] = [
        {
            field: 'email',
            headerName: 'Email',
            flex: 1,
            minWidth: 200,
            sortable: true,
            hideable: false,
        },
        {
            field: 'displayName',
            headerName: 'Display Name',
            width: 150,
            sortable: true
        },
        {
            field: 'name',
            headerName: 'Full Name',
            flex: 1,
            minWidth: 180,
            sortable: false
        },
        {
            field: 'roles',
            headerName: 'Roles',
            width: 180,
            sortable: false,
            renderCell: (params: GridRenderCellParams<UserListItem, string[]>) => (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center', height: '100%' }}>
                    {params.value?.map((role) => (
                        <Chip key={role} label={role} size="small" />
                    ))}
                </Box>
            ),
        },
        {
            field: 'emailConfirmed',
            headerName: 'Email Verified',
            width: 120,
            sortable: false,
            renderCell: (params: GridRenderCellParams<UserListItem, boolean>) => (
                <Chip
                    label={params.value ? 'Yes' : 'No'}
                    color={params.value ? 'success' : 'default'}
                    size="small"
                />
            ),
        },
        {
            field: 'isLockedOut',
            headerName: 'Status',
            width: 100,
            sortable: false,
            renderCell: (params: GridRenderCellParams<UserListItem, boolean>) => (
                <Chip
                    label={params.value ? 'Locked' : 'Active'}
                    color={params.value ? 'error' : 'success'}
                    size="small"
                />
            ),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            sortable: false,
            hideable: false,
            renderCell: (params: GridRenderCellParams<UserListItem>) => (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
                    <IconButton
                        size="small"
                        onClick={() => handleViewDetails(params.row.id)}
                        title="View Details"
                    >
                        <ViewIcon />
                    </IconButton>
                    {params.row.isLockedOut ? (
                        <IconButton
                            size="small"
                            onClick={() => handleUnlockUser(params.row.id)}
                            title="Unlock User"
                        >
                            <UnlockIcon />
                        </IconButton>
                    ) : (
                        <IconButton
                            size="small"
                            onClick={() => handleLockUser(params.row.id)}
                            title="Lock User"
                        >
                            <LockIcon />
                        </IconButton>
                    )}
                    {!params.row.emailConfirmed && (
                        <IconButton
                            size="small"
                            onClick={() => handleVerifyEmail(params.row.id)}
                            title="Verify Email"
                        >
                            <VerifiedIcon />
                        </IconButton>
                    )}
                </Box>
            ),
        },
    ];

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                User Management
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {stats && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom variant="body2">
                                    Total Users
                                </Typography>
                                <Typography variant="h4">{stats.totalUsers}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom variant="body2">
                                    Administrators
                                </Typography>
                                <Typography variant="h4">{stats.totalAdministrators}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom variant="body2">
                                    Locked Users
                                </Typography>
                                <Typography variant="h4" color="error">
                                    {stats.lockedUsers}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom variant="body2">
                                    Unconfirmed Emails
                                </Typography>
                                <Typography variant="h4" color="warning.main">
                                    {stats.unconfirmedEmails}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                            fullWidth
                            label="Search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Email or display name"
                            InputProps={{
                                endAdornment: <SearchIcon />,
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={roleFilter}
                                label="Role"
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <MenuItem value="">All Roles</MenuItem>
                                <MenuItem value="Administrator">Administrator</MenuItem>
                                <MenuItem value="User">User</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Status"
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="">All Statuses</MenuItem>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="locked">Locked</MenuItem>
                                <MenuItem value="unconfirmed">Unconfirmed</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={() => loadUsers(true)}
                        >
                            Refresh
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={{ width: '100%', minWidth: 1080 }}>
                <DataGrid
                    rows={users}
                    columns={columns}
                    loading={loading}
                    sortingMode="server"
                    onSortModelChange={handleSortChange}
                    pageSizeOptions={[]}
                    hideFooterPagination
                    hideFooter={!hasMore}
                    disableRowSelectionOnClick
                    autoHeight
                    slots={{
                        footer: () =>
                            hasMore ? (
                                <Box
                                    sx={{
                                        p: 2,
                                        textAlign: 'center',
                                        borderTop: `1px solid ${theme.palette.divider}`,
                                    }}
                                >
                                    <Button onClick={handleLoadMore} disabled={loading}>
                                        Load More ({totalCount - users.length} remaining)
                                    </Button>
                                </Box>
                            ) : null,
                    }}
                    sx={{
                        '& .MuiDataGrid-row': {
                            cursor: 'default',
                        },
                        '& .MuiDataGrid-cell': {
                            borderBottom: `1px solid ${theme.palette.divider}`,
                        },
                    }}
                />
            </Paper>

            <UserDetailModal
                open={detailModalOpen}
                userId={selectedUserId}
                onClose={handleDetailModalClose}
                onUserUpdated={handleUserUpdated}
            />
        </Box>
    );
}
