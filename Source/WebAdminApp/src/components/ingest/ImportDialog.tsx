import React, { useState, useCallback, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Alert,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Chip,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Download as DownloadIcon } from '@mui/icons-material';
import { downloadIngestTemplate } from '@/utils/ingestTemplate';
import { AssetKind, type IngestAssetsRequest, type IngestAssetItem } from '@/types/ingest';

interface ImportDialogProps {
    open: boolean;
    onClose: () => void;
    onImport: (request: IngestAssetsRequest) => Promise<void>;
    isSubmitting: boolean;
}

interface ParsedData {
    items: IngestAssetItem[];
    errors: string[];
}

export function ImportDialog({ open, onClose, onImport, isSubmitting }: ImportDialogProps) {
    const [parsedData, setParsedData] = useState<ParsedData | null>(null);
    const [parseError, setParseError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = useCallback(() => {
        setParsedData(null);
        setParseError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const handleClose = useCallback(() => {
        resetState();
        onClose();
    }, [onClose, resetState]);

    const validateItem = (item: unknown, index: number): { valid: IngestAssetItem | null; errors: string[] } => {
        const errors: string[] = [];
        const obj = item as Record<string, unknown>;

        if (!obj.name || typeof obj.name !== 'string') {
            errors.push(`Item ${index + 1}: Missing or invalid 'name'`);
        }
        if (!obj.category || typeof obj.category !== 'string') {
            errors.push(`Item ${index + 1}: Missing or invalid 'category'`);
        }
        if (!obj.type || typeof obj.type !== 'string') {
            errors.push(`Item ${index + 1}: Missing or invalid 'type'`);
        }
        if (!obj.description || typeof obj.description !== 'string') {
            errors.push(`Item ${index + 1}: Missing or invalid 'description'`);
        }

        // Validate AssetKind (required)
        const validKinds = Object.values(AssetKind).filter(k => k !== AssetKind.Undefined);
        const kindValue = obj.kind as string | undefined;
        if (!kindValue) {
            errors.push(`Item ${index + 1}: Missing required 'kind'. Valid values: ${validKinds.join(', ')}`);
        } else if (!validKinds.includes(kindValue as AssetKind)) {
            errors.push(`Item ${index + 1}: Invalid 'kind' value '${kindValue}'. Valid values: ${validKinds.join(', ')}`);
        }

        if (errors.length > 0) {
            return { valid: null, errors };
        }

        return {
            valid: {
                name: obj.name as string,
                kind: kindValue as AssetKind,
                category: obj.category as string,
                type: obj.type as string,
                subtype: obj.subtype as string | undefined,
                size: (obj.size as string) ?? 'medium',
                environment: obj.environment as string | undefined,
                description: obj.description as string,
                tags: Array.isArray(obj.tags) ? obj.tags.filter((t): t is string => typeof t === 'string') : [],
            },
            errors: [],
        };
    };

    const parseJsonFile = useCallback((content: string) => {
        try {
            const data = JSON.parse(content);
            const items: IngestAssetItem[] = [];
            const errors: string[] = [];

            const arrayToProcess = Array.isArray(data) ? data : data.items;

            if (!Array.isArray(arrayToProcess)) {
                setParseError('JSON must be an array or contain an "items" array');
                return;
            }

            for (let i = 0; i < arrayToProcess.length; i++) {
                const result = validateItem(arrayToProcess[i], i);
                if (result.valid) {
                    items.push(result.valid);
                }
                errors.push(...result.errors);
            }

            if (items.length === 0 && errors.length > 0) {
                setParseError(`No valid items found. Errors: ${errors.slice(0, 3).join('; ')}`);
                return;
            }

            setParsedData({ items, errors });
            setParseError(null);
        } catch (e) {
            setParseError(`Invalid JSON: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
    }, []);

    const handleFileSelect = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            parseJsonFile(content);
        };
        reader.onerror = () => {
            setParseError('Failed to read file');
        };
        reader.readAsText(file);
    }, [parseJsonFile]);

    const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    }, [handleFileSelect]);

    const handleDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files[0];
        if (file && file.type === 'application/json') {
            handleFileSelect(file);
        } else {
            setParseError('Please drop a JSON file');
        }
    }, [handleFileSelect]);

    const handleClickUpload = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleImport = useCallback(async () => {
        if (!parsedData || parsedData.items.length === 0) return;
        await onImport({ items: parsedData.items });
    }, [parsedData, onImport]);

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>Import Assets</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Upload a JSON file containing asset definitions. Each asset will be created
                    and queued for AI image generation.
                </Typography>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/json,.json"
                    onChange={handleInputChange}
                    style={{ display: 'none' }}
                />

                <Box
                    sx={{
                        border: '2px dashed',
                        borderColor: isDragging ? 'primary.main' : 'divider',
                        borderRadius: 2,
                        p: 4,
                        textAlign: 'center',
                        cursor: 'pointer',
                        bgcolor: isDragging ? 'action.hover' : 'background.paper',
                        transition: 'all 0.2s',
                        '&:hover': {
                            bgcolor: 'action.hover',
                        },
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleClickUpload}
                >
                    <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body1" color="text.secondary">
                        Drag and drop a JSON file here, or click to browse
                    </Typography>
                </Box>

                <Box sx={{ mt: 1, textAlign: 'center' }}>
                    <Typography variant="body2" component="span" color="text.secondary">
                        Need a template?{' '}
                    </Typography>
                    <Button
                        id="btn-download-template"
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={downloadIngestTemplate}
                        sx={{ textTransform: 'none' }}
                    >
                        Download Sample JSON
                    </Button>
                </Box>

                {parseError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {parseError}
                    </Alert>
                )}

                {parsedData && (
                    <Box sx={{ mt: 2 }}>
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Found {parsedData.items.length} valid asset{parsedData.items.length !== 1 ? 's' : ''}
                            {parsedData.errors.length > 0 && ` (${parsedData.errors.length} items had errors)`}
                        </Alert>

                        {parsedData.errors.length > 0 && (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                <Typography variant="body2" fontWeight="medium">Validation warnings:</Typography>
                                <List dense disablePadding>
                                    {parsedData.errors.slice(0, 5).map((error, i) => (
                                        <ListItem key={i} disablePadding>
                                            <ListItemText primary={error} primaryTypographyProps={{ variant: 'body2' }} />
                                        </ListItem>
                                    ))}
                                    {parsedData.errors.length > 5 && (
                                        <ListItem disablePadding>
                                            <ListItemText
                                                primary={`... and ${parsedData.errors.length - 5} more`}
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            />
                                        </ListItem>
                                    )}
                                </List>
                            </Alert>
                        )}

                        <Typography variant="subtitle2" gutterBottom>
                            Preview (first 5 items):
                        </Typography>
                        <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                            {parsedData.items.slice(0, 5).map((item, i) => (
                                <ListItem key={i} divider={i < Math.min(parsedData.items.length, 5) - 1}>
                                    <ListItemText
                                        primary={item.name}
                                        secondary={
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                                                <Chip label={item.category} size="small" variant="outlined" />
                                                <Chip label={item.type} size="small" variant="outlined" />
                                                {item.subtype && <Chip label={item.subtype} size="small" variant="outlined" />}
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            ))}
                            {parsedData.items.length > 5 && (
                                <ListItem>
                                    <ListItemText
                                        primary={`... and ${parsedData.items.length - 5} more`}
                                        primaryTypographyProps={{ color: 'text.secondary' }}
                                    />
                                </ListItem>
                            )}
                        </List>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button
                    onClick={handleImport}
                    variant="contained"
                    disabled={!parsedData || parsedData.items.length === 0 || isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}
                >
                    {isSubmitting ? 'Importing...' : `Import ${parsedData?.items.length ?? 0} Assets`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
