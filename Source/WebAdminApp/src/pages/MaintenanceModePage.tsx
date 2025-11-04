import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Switch,
    TextField,
    Button,
    Alert,
    FormControlLabel,
    Grid,
    Skeleton,
    Chip,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import {
    maintenanceModeService,
    type MaintenanceModeStatusResponse,
    type EnableMaintenanceModeRequest,
    type UpdateMaintenanceModeRequest,
} from '@services/maintenanceModeService';

export function MaintenanceModePage() {
    const [status, setStatus] = useState<MaintenanceModeStatusResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [message, setMessage] = useState('');
    const [scheduledStart, setScheduledStart] = useState<Dayjs | null>(null);
    const [scheduledEnd, setScheduledEnd] = useState<Dayjs | null>(null);

    const loadStatus = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await maintenanceModeService.getStatus();
            setStatus(response);

            if (response.isEnabled) {
                setMessage(response.message || '');
                setScheduledStart(response.scheduledStartTime ? dayjs(response.scheduledStartTime) : null);
                setScheduledEnd(response.scheduledEndTime ? dayjs(response.scheduledEndTime) : null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load maintenance mode status');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStatus();
    }, []);

    const handleEnable = async () => {
        if (!message.trim()) {
            setError('Maintenance message is required');
            return;
        }

        if (scheduledStart && scheduledEnd && scheduledEnd.isBefore(scheduledStart)) {
            setError('End time must be after start time');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            setSuccess(null);

            const request: EnableMaintenanceModeRequest = {
                message: message.trim(),
                ...(scheduledStart && { scheduledStartTime: scheduledStart.toISOString() }),
                ...(scheduledEnd && { scheduledEndTime: scheduledEnd.toISOString() }),
            };

            const response = await maintenanceModeService.enable(request);
            setStatus(response);
            setSuccess('Maintenance mode enabled successfully');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to enable maintenance mode');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDisable = async () => {
        try {
            setSubmitting(true);
            setError(null);
            setSuccess(null);

            const response = await maintenanceModeService.disable();
            setStatus(response);
            setSuccess('Maintenance mode disabled successfully');
            setMessage('');
            setScheduledStart(null);
            setScheduledEnd(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to disable maintenance mode');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!status?.id) {
            setError('No active maintenance mode to update');
            return;
        }

        if (!message.trim()) {
            setError('Maintenance message is required');
            return;
        }

        if (scheduledStart && scheduledEnd && scheduledEnd.isBefore(scheduledStart)) {
            setError('End time must be after start time');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            setSuccess(null);

            const request: UpdateMaintenanceModeRequest = {
                message: message.trim(),
                ...(scheduledStart && { scheduledStartTime: scheduledStart.toISOString() }),
                ...(scheduledEnd && { scheduledEndTime: scheduledEnd.toISOString() }),
            };

            const response = await maintenanceModeService.update(status.id, request);
            setStatus(response);
            setSuccess('Maintenance mode updated successfully');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update maintenance mode');
        } finally {
            setSubmitting(false);
        }
    };

    const isActive =
        status?.isEnabled &&
        (!status.scheduledStartTime || dayjs().isAfter(dayjs(status.scheduledStartTime))) &&
        (!status.scheduledEndTime || dayjs().isBefore(dayjs(status.scheduledEndTime)));

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h4">Maintenance Mode</Typography>
                    {status && (
                        <Chip
                            label={isActive ? 'ACTIVE' : status.isEnabled ? 'SCHEDULED' : 'DISABLED'}
                            color={isActive ? 'error' : status.isEnabled ? 'warning' : 'success'}
                            size="medium"
                        />
                    )}
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
                        {success}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Paper sx={{ p: 3 }}>
                            {loading ? (
                                <>
                                    <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
                                    <Skeleton variant="rectangular" height={120} sx={{ mb: 2 }} />
                                    <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
                                </>
                            ) : (
                                <>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={status?.isEnabled || false}
                                                onChange={
                                                    status?.isEnabled ? handleDisable : handleEnable
                                                }
                                                disabled={submitting}
                                            />
                                        }
                                        label={status?.isEnabled ? 'Enabled' : 'Disabled'}
                                    />

                                    <TextField
                                        fullWidth
                                        label="Maintenance Message"
                                        multiline
                                        rows={4}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        disabled={status?.isEnabled || submitting}
                                        required
                                        helperText="Message displayed to users during maintenance"
                                        sx={{ mt: 2, mb: 2 }}
                                    />

                                    <Typography variant="h6" sx={{ mb: 2 }}>
                                        Schedule (Optional)
                                    </Typography>

                                    <Grid container spacing={2} sx={{ mb: 2 }}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <DateTimePicker
                                                label="Start Time"
                                                value={scheduledStart}
                                                onChange={(newValue) => setScheduledStart(newValue)}
                                                disabled={status?.isEnabled || submitting}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        helperText: 'Leave empty for immediate start',
                                                    },
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <DateTimePicker
                                                label="End Time"
                                                value={scheduledEnd}
                                                onChange={(newValue) => setScheduledEnd(newValue)}
                                                disabled={status?.isEnabled || submitting}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        helperText: 'Leave empty for indefinite duration',
                                                    },
                                                }}
                                            />
                                        </Grid>
                                    </Grid>

                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        {!status?.isEnabled ? (
                                            <Button
                                                variant="contained"
                                                color="error"
                                                onClick={handleEnable}
                                                disabled={submitting || !message.trim()}
                                            >
                                                Enable Maintenance Mode
                                            </Button>
                                        ) : (
                                            <>
                                                <Button
                                                    variant="contained"
                                                    onClick={handleUpdate}
                                                    disabled={submitting || !message.trim()}
                                                >
                                                    Update Settings
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="success"
                                                    onClick={handleDisable}
                                                    disabled={submitting}
                                                >
                                                    Disable Maintenance Mode
                                                </Button>
                                            </>
                                        )}
                                    </Box>
                                </>
                            )}
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Current Status
                            </Typography>

                            {loading ? (
                                <>
                                    <Skeleton variant="text" />
                                    <Skeleton variant="text" />
                                    <Skeleton variant="text" />
                                </>
                            ) : status && status.isEnabled ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Status:{' '}
                                        <strong>
                                            {isActive ? 'Active' : 'Scheduled'}
                                        </strong>
                                    </Typography>
                                    {status.enabledAt && (
                                        <Typography variant="body2" color="text.secondary">
                                            Enabled:{' '}
                                            {new Date(status.enabledAt).toLocaleString()}
                                        </Typography>
                                    )}
                                    {status.scheduledStartTime && (
                                        <Typography variant="body2" color="text.secondary">
                                            Starts:{' '}
                                            {new Date(status.scheduledStartTime).toLocaleString()}
                                        </Typography>
                                    )}
                                    {status.scheduledEndTime && (
                                        <Typography variant="body2" color="text.secondary">
                                            Ends:{' '}
                                            {new Date(status.scheduledEndTime).toLocaleString()}
                                        </Typography>
                                    )}
                                </Box>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No active maintenance mode
                                </Typography>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </LocalizationProvider>
    );
}
