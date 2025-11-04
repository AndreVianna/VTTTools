import { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Alert,
    Paper,
    IconButton,
    LinearProgress,
    Box,
    useTheme,
} from '@mui/material';
import {
    Close as CloseIcon,
    ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import {
    configurationService,
    RevealConfigValueRequest,
} from '@services/configurationService';

interface RevealValueModalProps {
    open: boolean;
    onClose: () => void;
    serviceName: string;
    configKey: string;
}

export function RevealValueModal({ open, onClose, serviceName, configKey }: RevealValueModalProps) {
    const theme = useTheme();
    const [totpCode, setTotpCode] = useState('');
    const [revealedValue, setRevealedValue] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timeRemaining, setTimeRemaining] = useState(100);
    const [copied, setCopied] = useState(false);

    const handleClose = useCallback(() => {
        setTotpCode('');
        setRevealedValue(null);
        setError(null);
        setTimeRemaining(100);
        setCopied(false);
        onClose();
    }, [onClose]);

    useEffect(() => {
        if (!revealedValue) return;

        let remaining = 100;
        const interval = setInterval(() => {
            remaining -= 100 / 30;
            setTimeRemaining(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
                handleClose();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [revealedValue, handleClose]);

    const handleReveal = async () => {
        try {
            setLoading(true);
            setError(null);

            const request: RevealConfigValueRequest = {
                serviceName: serviceName,
                key: configKey,
                totpCode: totpCode,
            };

            const response = await configurationService.revealConfigValue(request);
            setRevealedValue(response.value);
        } catch (err) {
            const error = err as { response?: { status?: number } };
            if (error.response?.status === 401) {
                setError('Invalid 2FA code. Please try again.');
            } else if (error.response?.status === 404) {
                setError('Configuration value not found.');
            } else {
                setError('Failed to reveal value. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (revealedValue) {
            await navigator.clipboard.writeText(revealedValue);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleTotpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 6) {
            setTotpCode(value);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Reveal Configuration Value</Typography>
                <IconButton
                    onClick={handleClose}
                    size="small"
                    sx={{ ml: 1 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Alert severity="warning" sx={{ mb: 3 }}>
                    This operation requires 2FA verification. The revealed value will be displayed for 30 seconds.
                </Alert>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Service
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            color: theme.palette.primary.main,
                        }}
                    >
                        {serviceName}
                    </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Key
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            color: theme.palette.primary.main,
                        }}
                    >
                        {configKey}
                    </Typography>
                </Box>

                {!revealedValue && (
                    <TextField
                        fullWidth
                        label="2FA Code"
                        value={totpCode}
                        onChange={handleTotpChange}
                        placeholder="000000"
                        inputProps={{
                            maxLength: 6,
                            pattern: '[0-9]*',
                            inputMode: 'numeric',
                        }}
                        helperText="Enter your 6-digit authenticator code"
                        error={!!error}
                        disabled={loading}
                        sx={{ mb: 2 }}
                    />
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {revealedValue && (
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                            Revealed Value
                        </Typography>
                        <Paper
                            sx={{
                                p: 2,
                                mb: 2,
                                backgroundColor: theme.palette.mode === 'dark'
                                    ? theme.palette.grey[900]
                                    : theme.palette.grey[50],
                                border: `1px solid ${theme.palette.divider}`,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography
                                    sx={{
                                        fontFamily: 'monospace',
                                        fontSize: '0.95rem',
                                        wordBreak: 'break-all',
                                        flex: 1,
                                        color: theme.palette.success.main,
                                    }}
                                >
                                    {revealedValue}
                                </Typography>
                                <IconButton
                                    onClick={handleCopy}
                                    size="small"
                                    color={copied ? 'success' : 'default'}
                                    title={copied ? 'Copied!' : 'Copy to clipboard'}
                                >
                                    <ContentCopyIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Paper>

                        <Box sx={{ mb: 1 }}>
                            <LinearProgress
                                variant="determinate"
                                value={timeRemaining}
                                sx={{
                                    height: 8,
                                    borderRadius: 1,
                                    backgroundColor: theme.palette.mode === 'dark'
                                        ? theme.palette.grey[800]
                                        : theme.palette.grey[200],
                                }}
                            />
                        </Box>

                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
                            Auto-hiding in {Math.ceil((timeRemaining / 100) * 30)} seconds
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} variant="outlined">
                    {revealedValue ? 'Close' : 'Cancel'}
                </Button>
                {!revealedValue && (
                    <Button
                        onClick={handleReveal}
                        disabled={totpCode.length !== 6 || loading}
                        variant="contained"
                    >
                        {loading ? 'Verifying...' : 'Reveal'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
