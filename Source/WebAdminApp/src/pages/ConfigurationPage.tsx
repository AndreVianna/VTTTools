import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Alert,
    Tabs,
    Tab,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Button,
    IconButton,
    Skeleton,
    useTheme,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Lock as LockIcon,
    ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import {
    configurationService,
    ConfigurationResponse,
    ConfigEntry,
    ConfigSourceType,
} from '@services/configurationService';
import { RevealValueModal } from '@components/configuration/RevealValueModal';

const SERVICES = [
    { value: 'WebAdminApp', label: 'Admin App' },
    { value: 'Admin', label: 'Admin' },
    { value: 'WebClientApp', label: 'Main App' },
    { value: 'Library', label: 'Library' },
    { value: 'Assets', label: 'Assets' },
    { value: 'Media', label: 'Media' },
    { value: 'Game', label: 'Game' },
    { value: 'Auth', label: 'Auth' },
];

export function ConfigurationPage() {
    const theme = useTheme();
    const [selectedTab, setSelectedTab] = useState<number>(0);
    const [configuration, setConfiguration] = useState<ConfigurationResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [revealModalOpen, setRevealModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<{ entry: ConfigEntry; serviceName: string } | null>(null);

    const selectedService = SERVICES[selectedTab]?.value ?? 'Admin';

    useEffect(() => {
        const loadConfiguration = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await configurationService.getConfiguration(selectedService);
                setConfiguration(response);
            } catch (err) {
                setError('Failed to load configuration. Please try again.');
                setConfiguration(null);
            } finally {
                setLoading(false);
            }
        };

        loadConfiguration();
    }, [selectedService]);

    const groupByCategory = (entries: ConfigEntry[] | undefined): Record<string, ConfigEntry[]> => {
        if (!entries || entries.length === 0) {
            return {};
        }
        return entries.reduce((acc, entry) => {
            const category = entry.category || 'General';
            if (!acc[category]) acc[category] = [];
            acc[category].push(entry);
            return acc;
        }, {} as Record<string, ConfigEntry[]>);
    };

    const handleReveal = (entry: ConfigEntry, serviceName: string) => {
        setSelectedEntry({ entry, serviceName });
        setRevealModalOpen(true);
    };

    const handleCopy = (value: string) => {
        navigator.clipboard.writeText(value);
    };

    const getSourceColor = (sourceType: ConfigSourceType): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
        switch (sourceType) {
            case ConfigSourceType.EnvironmentVariable:
                return 'success';
            case ConfigSourceType.JsonFile:
                return 'primary';
            case ConfigSourceType.UserSecrets:
                return 'warning';
            case ConfigSourceType.AzureKeyVault:
            case ConfigSourceType.AzureAppConfiguration:
                return 'info';
            case ConfigSourceType.CommandLine:
                return 'secondary';
            default:
                return 'default';
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3 }}>
                Configuration Viewer
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
                Configuration is read-only. Edit appsettings.json or environment variables to change values.
            </Alert>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={selectedTab}
                    onChange={(_, newValue) => setSelectedTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    {SERVICES.map((service) => (
                        <Tab key={service.value} label={service.label} />
                    ))}
                </Tabs>
            </Paper>

            {loading ? (
                <Paper sx={{ p: 3 }}>
                    <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={200} />
                </Paper>
            ) : configuration ? (
                (() => {
                    const groupedEntries = groupByCategory(configuration.entries || []);
                    const categories = Object.keys(groupedEntries).sort();

                    if (categories.length === 0) {
                        return (
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography color="text.secondary">
                                    No configuration entries found for {SERVICES[selectedTab]?.label ?? selectedService}
                                </Typography>
                            </Paper>
                        );
                    }

                    return (
                        <>
                            {categories.map((category) => {
                                const entries = groupedEntries[category];
                                return (
                                    <Accordion key={category} defaultExpanded>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            sx={{
                                                backgroundColor: theme.palette.mode === 'dark'
                                                    ? theme.palette.grey[800]
                                                    : theme.palette.grey[100],
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Typography variant="h6">{category}</Typography>
                                                <Chip
                                                    label={`${entries?.length ?? 0} ${entries?.length === 1 ? 'item' : 'items'}`}
                                                    size="small"
                                                />
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ p: 0 }}>
                                            <TableContainer>
                                                <Table>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell sx={{ fontWeight: 'bold' }}>Key</TableCell>
                                                            <TableCell sx={{ fontWeight: 'bold' }}>Value</TableCell>
                                                            <TableCell sx={{ fontWeight: 'bold' }}>Source</TableCell>
                                                            <TableCell sx={{ fontWeight: 'bold' }} align="right">
                                                                Actions
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {entries?.map((entry) => (
                                                            <TableRow
                                                                key={`${entry.key}-${entry.source.path || entry.source.type}`}
                                                                sx={{
                                                                    '&:hover': {
                                                                        backgroundColor: theme.palette.action.hover,
                                                                    },
                                                                }}
                                                            >
                                                                <TableCell>
                                                                    <Typography
                                                                        variant="body2"
                                                                        sx={{
                                                                            fontFamily: 'monospace',
                                                                            fontSize: '0.875rem',
                                                                        }}
                                                                    >
                                                                        {entry.key}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {entry.isRedacted ? (
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                            <LockIcon
                                                                                fontSize="small"
                                                                                color="action"
                                                                            />
                                                                            <Typography
                                                                                variant="body2"
                                                                                color="text.secondary"
                                                                                sx={{ fontStyle: 'italic' }}
                                                                            >
                                                                                ***REDACTED***
                                                                            </Typography>
                                                                        </Box>
                                                                    ) : (
                                                                        <Typography
                                                                            variant="body2"
                                                                            sx={{
                                                                                fontFamily: 'monospace',
                                                                                fontSize: '0.875rem',
                                                                                wordBreak: 'break-word',
                                                                            }}
                                                                        >
                                                                            {entry.value || <em style={{ color: theme.palette.text.disabled }}>empty</em>}
                                                                        </Typography>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                                        <Chip
                                                                            label={entry.source.type}
                                                                            color={getSourceColor(entry.source.type)}
                                                                            size="small"
                                                                            sx={{ width: 'fit-content' }}
                                                                        />
                                                                        {entry.source.path && (
                                                                            <Typography
                                                                                variant="caption"
                                                                                color="text.secondary"
                                                                                sx={{
                                                                                    fontFamily: 'monospace',
                                                                                    fontSize: '0.75rem',
                                                                                    wordBreak: 'break-word',
                                                                                }}
                                                                            >
                                                                                {entry.source.path}
                                                                            </Typography>
                                                                        )}
                                                                    </Box>
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    {entry.isRedacted ? (
                                                                        <Button
                                                                            variant="outlined"
                                                                            size="small"
                                                                            onClick={() => handleReveal(entry, selectedService)}
                                                                            startIcon={<LockIcon />}
                                                                        >
                                                                            Reveal
                                                                        </Button>
                                                                    ) : (
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handleCopy(entry.value)}
                                                                            title="Copy to clipboard"
                                                                        >
                                                                            <ContentCopyIcon fontSize="small" />
                                                                        </IconButton>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </AccordionDetails>
                                    </Accordion>
                                );
                            })}
                        </>
                    );
                })()
            ) : null}

            {selectedEntry && (
                <RevealValueModal
                    open={revealModalOpen}
                    onClose={() => setRevealModalOpen(false)}
                    serviceName={selectedEntry.serviceName}
                    configKey={selectedEntry.entry.key}
                />
            )}
        </Box>
    );
}
