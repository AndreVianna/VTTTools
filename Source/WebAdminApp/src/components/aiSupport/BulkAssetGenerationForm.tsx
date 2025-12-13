import { useState, useCallback, useRef, useEffect } from 'react';
import {
    Paper,
    Typography,
    TextField,
    Button,
    Stack,
    Box,
    FormControlLabel,
    Checkbox,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    Divider,
    FormHelperText,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    UploadFile as UploadFileIcon,
    Download as DownloadIcon,
    Clear as ClearIcon,
} from '@mui/icons-material';
import type { BulkAssetGenerationItem, BulkAssetGenerationRequest } from '@/types/jobs';
import { AssetKind } from '@/types/jobs';
import { downloadBulkGenerationTemplate } from '@/utils/bulkGenerationTemplate';
import {
    validateItems,
    parseImportedJson,
    getErrorMessages,
    type ValidationState,
    type ItemValidationErrors,
} from '@/utils/bulkGenerationValidation';

interface BulkAssetGenerationFormProps {
    onSubmit: (request: BulkAssetGenerationRequest) => void;
    isSubmitting?: boolean;
    disabled?: boolean;
}

const defaultItem: BulkAssetGenerationItem = {
    name: '',
    kind: AssetKind.Undefined,
    category: '',
    type: '',
    subtype: undefined,
    size: 'medium',
    environment: undefined,
    description: '',
    tags: [],
};

const STORAGE_KEY = 'bulkAssetGeneration';

interface StoredFormState {
    items: BulkAssetGenerationItem[];
    generatePortrait: boolean;
    generateToken: boolean;
}

function loadFromStorage(): StoredFormState | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored) as StoredFormState;
        }
    } catch {
        // Ignore parse errors
    }
    return null;
}

function saveToStorage(state: StoredFormState): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // Ignore storage errors
    }
}

function clearStorage(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // Ignore storage errors
    }
}

const inputSx = {
    fontSize: '0.875rem',
    '& input::placeholder': {
        fontSize: '0.75rem',
        color: 'text.disabled',
        opacity: 1,
    },
};

const labelSx = {
    fontSize: '0.65rem',
};

export function BulkAssetGenerationForm({
    onSubmit,
    isSubmitting = false,
    disabled = false,
}: BulkAssetGenerationFormProps) {
    const [items, setItems] = useState<BulkAssetGenerationItem[]>(() => {
        const stored = loadFromStorage();
        return stored?.items ?? [{ ...defaultItem }];
    });
    const [generatePortrait, setGeneratePortrait] = useState(() => {
        const stored = loadFromStorage();
        return stored?.generatePortrait ?? true;
    });
    const [generateToken, setGenerateToken] = useState(() => {
        const stored = loadFromStorage();
        return stored?.generateToken ?? true;
    });
    const [error, setError] = useState<string | null>(null);
    const [validation, setValidation] = useState<ValidationState>({ itemErrors: new Map(), hasErrors: false });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Validate items whenever they change
    useEffect(() => {
        const result = validateItems(items);
        setValidation(result);
    }, [items]);

    // Save to localStorage whenever state changes
    useEffect(() => {
        saveToStorage({ items, generatePortrait, generateToken });
    }, [items, generatePortrait, generateToken]);

    const updateItem = useCallback((index: number, field: keyof BulkAssetGenerationItem, value: unknown) => {
        setItems(prev => {
            const updated = [...prev];
            const existing = updated[index];
            if (existing) {
                updated[index] = { ...existing, [field]: value } as BulkAssetGenerationItem;
            }
            return updated;
        });
    }, []);

    const addItem = useCallback(() => {
        setItems(prev => [...prev, { ...defaultItem }]);
    }, []);

    const removeItem = useCallback((index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    }, []);

    const clearList = useCallback(() => {
        setItems([{ ...defaultItem }]);
        setGeneratePortrait(true);
        setGenerateToken(true);
        clearStorage();
        setError(null);
    }, []);

    const handleImportClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileSelected = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json: unknown = JSON.parse(e.target?.result as string);
                const result = parseImportedJson(json);

                if (result.parseError) {
                    setError(result.parseError);
                    return;
                }

                setItems(result.items);
                setGeneratePortrait(result.generatePortrait);
                setGenerateToken(result.generateToken);
                setError(null);
            } catch {
                setError('Invalid JSON file. Please check the file format.');
            }
        };
        reader.readAsText(file);

        // Reset input to allow re-selecting same file
        event.target.value = '';
    }, []);

    const handleSubmit = useCallback(() => {
        setError(null);

        if (items.length === 0) {
            setError('Please add at least one item');
            return;
        }

        if (items.length > 100) {
            setError('Maximum 100 items per batch');
            return;
        }

        if (!generatePortrait && !generateToken) {
            setError('Please select at least one generation option (Portrait or Token)');
            return;
        }

        // Run validation
        const validationResult = validateItems(items);
        setValidation(validationResult);

        if (validationResult.hasErrors) {
            setError('Please fix the validation errors before submitting');
            return;
        }

        const request: BulkAssetGenerationRequest = {
            items,
            generatePortrait,
            generateToken,
        };

        onSubmit(request);
    }, [items, generatePortrait, generateToken, onSubmit]);

    const getItemErrors = (index: number): ItemValidationErrors => {
        return validation.itemErrors.get(index) ?? {};
    };

    const hasFieldError = (index: number, field: keyof ItemValidationErrors): boolean => {
        const errors = getItemErrors(index);
        return !!errors[field];
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Bulk Asset Generation
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                Generate portraits and tokens for multiple assets at once.
            </Typography>

            {error && (
                <Alert severity="error" sx={{ my: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Box sx={{ my: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={generatePortrait}
                                onChange={(e) => setGeneratePortrait(e.target.checked)}
                                disabled={disabled}
                            />
                        }
                        label="Generate Portraits"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={generateToken}
                                onChange={(e) => setGenerateToken(e.target.checked)}
                                disabled={disabled}
                            />
                        }
                        label="Generate Tokens"
                    />
                </Stack>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1">
                    Items ({items.length}/100)
                </Typography>
                <Stack direction="row" spacing={1}>
                    <Button
                        id="btn-download-template"
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={downloadBulkGenerationTemplate}
                        disabled={disabled}
                    >
                        Download Template
                    </Button>
                    <Button
                        id="btn-import-json"
                        size="small"
                        startIcon={<UploadFileIcon />}
                        onClick={handleImportClick}
                        disabled={disabled}
                    >
                        Import JSON
                    </Button>
                    <Button
                        id="btn-add-item"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={addItem}
                        disabled={disabled || items.length >= 100}
                    >
                        Add Item
                    </Button>
                    <Button
                        id="btn-clear-list"
                        size="small"
                        startIcon={<ClearIcon />}
                        onClick={clearList}
                        disabled={disabled}
                        color="warning"
                    >
                        Clear List
                    </Button>
                </Stack>
            </Stack>

            <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                hidden
                onChange={handleFileSelected}
            />

            <Stack spacing={1} sx={{ maxHeight: 500, overflow: 'auto', pr: 1 }}>
                {items.map((item, index) => {
                    const itemErrors = getItemErrors(index);
                    const errorMessages = getErrorMessages(itemErrors);
                    const hasErrors = errorMessages.length > 0;

                    return (
                        <Paper
                            key={index}
                            variant="outlined"
                            sx={{
                                p: 1.5,
                                borderColor: hasErrors ? 'error.main' : undefined,
                            }}
                        >
                            <Stack spacing={1}>
                                {/* Row 1: Name, Kind, Category, Type, Subtype, Delete */}
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="caption" sx={{ minWidth: 20, color: 'text.secondary' }}>
                                        {index + 1}.
                                    </Typography>
                                    <TextField
                                        label="Name"
                                        size="small"
                                        required
                                        value={item.name}
                                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                                        disabled={disabled}
                                        placeholder="e.g. Ancient Dragon"
                                        error={hasFieldError(index, 'name')}
                                        sx={{ flex: 2 }}
                                        InputProps={{ sx: inputSx }}
                                        InputLabelProps={{ sx: labelSx }}
                                    />
                                    <FormControl size="small" sx={{ minWidth: 100 }} error={hasFieldError(index, 'kind')}>
                                        <InputLabel sx={labelSx}>Kind</InputLabel>
                                        <Select
                                            label="Kind"
                                            value={item.kind}
                                            onChange={(e) => updateItem(index, 'kind', e.target.value)}
                                            disabled={disabled}
                                            sx={{ fontSize: '0.875rem' }}
                                        >
                                            {Object.values(AssetKind).map((kind) => (
                                                <MenuItem key={kind} value={kind} sx={{ fontSize: '0.875rem' }}>{kind}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        label="Category"
                                        size="small"
                                        value={item.category}
                                        onChange={(e) => updateItem(index, 'category', e.target.value)}
                                        disabled={disabled}
                                        placeholder="e.g. Fantasy"
                                        error={hasFieldError(index, 'category')}
                                        sx={{ flex: 1 }}
                                        InputProps={{ sx: inputSx }}
                                        InputLabelProps={{ sx: labelSx }}
                                    />
                                    <TextField
                                        label="Type"
                                        size="small"
                                        value={item.type}
                                        onChange={(e) => updateItem(index, 'type', e.target.value)}
                                        disabled={disabled}
                                        placeholder="e.g. Dragon"
                                        error={hasFieldError(index, 'type')}
                                        sx={{ flex: 1 }}
                                        InputProps={{ sx: inputSx }}
                                        InputLabelProps={{ sx: labelSx }}
                                    />
                                    <TextField
                                        label="Subtype"
                                        size="small"
                                        value={item.subtype ?? ''}
                                        onChange={(e) => updateItem(index, 'subtype', e.target.value || undefined)}
                                        disabled={disabled}
                                        placeholder="e.g. Red"
                                        sx={{ flex: 1 }}
                                        InputProps={{ sx: inputSx }}
                                        InputLabelProps={{ sx: labelSx }}
                                    />
                                    <IconButton
                                        id={`btn-remove-item-${index}`}
                                        onClick={() => removeItem(index)}
                                        disabled={disabled || items.length <= 1}
                                        color="error"
                                        size="small"
                                        sx={{ p: 0.5 }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Stack>
                                {/* Row 2: Size, Environment, Tags, Description */}
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Box sx={{ minWidth: 20 }} />
                                    <FormControl size="small" sx={{ minWidth: 100 }} error={hasFieldError(index, 'size')}>
                                        <InputLabel sx={labelSx}>Size</InputLabel>
                                        <Select
                                            label="Size"
                                            value={item.size}
                                            onChange={(e) => updateItem(index, 'size', e.target.value)}
                                            disabled={disabled}
                                            sx={{ fontSize: '0.875rem' }}
                                        >
                                            <MenuItem value="tiny" sx={{ fontSize: '0.875rem' }}>Tiny</MenuItem>
                                            <MenuItem value="small" sx={{ fontSize: '0.875rem' }}>Small</MenuItem>
                                            <MenuItem value="medium" sx={{ fontSize: '0.875rem' }}>Medium</MenuItem>
                                            <MenuItem value="large" sx={{ fontSize: '0.875rem' }}>Large</MenuItem>
                                            <MenuItem value="huge" sx={{ fontSize: '0.875rem' }}>Huge</MenuItem>
                                            <MenuItem value="gargantuan" sx={{ fontSize: '0.875rem' }}>Gargantuan</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        label="Environment"
                                        size="small"
                                        value={item.environment ?? ''}
                                        onChange={(e) => updateItem(index, 'environment', e.target.value || undefined)}
                                        disabled={disabled}
                                        placeholder="e.g. Mountain"
                                        sx={{ width: 120 }}
                                        InputProps={{ sx: inputSx }}
                                        InputLabelProps={{ sx: labelSx }}
                                    />
                                    <TextField
                                        label="Tags"
                                        size="small"
                                        value={item.tags.join(', ')}
                                        onChange={(e) => updateItem(index, 'tags', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                                        disabled={disabled}
                                        placeholder="e.g. fire, boss"
                                        sx={{ flex: 1 }}
                                        InputProps={{ sx: inputSx }}
                                        InputLabelProps={{ sx: labelSx }}
                                    />
                                    <TextField
                                        label="Description"
                                        size="small"
                                        value={item.description}
                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                        disabled={disabled}
                                        placeholder="Brief description..."
                                        sx={{ flex: 2 }}
                                        InputProps={{ sx: inputSx }}
                                        InputLabelProps={{ sx: labelSx }}
                                    />
                                </Stack>
                                {/* Error messages */}
                                {hasErrors && (
                                    <Box sx={{ pl: '28px' }}>
                                        <FormHelperText error sx={{ m: 0, fontSize: '0.7rem' }}>
                                            {errorMessages.join(' • ')}
                                        </FormHelperText>
                                    </Box>
                                )}
                            </Stack>
                        </Paper>
                    );
                })}
            </Stack>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    id="btn-generate"
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={disabled || isSubmitting || validation.hasErrors}
                    size="large"
                >
                    {isSubmitting ? 'Starting...' : `Generate ${items.length} Assets`}
                </Button>
            </Box>
        </Paper>
    );
}
