import { useState, useEffect, useCallback } from 'react';

export interface ConnectionStatus {
    isOnline: boolean;
    lastSync: Date | null;
    checkConnection: () => Promise<void>;
}

export interface UseConnectionStatusOptions {
    healthEndpoint?: string;
    pollInterval?: number;
    onStatusChange?: (isOnline: boolean) => void;
}

const DEFAULT_HEALTH_ENDPOINT = '/api/health';
const DEFAULT_POLL_INTERVAL = 5000;

export const useConnectionStatus = (
    options: UseConnectionStatusOptions = {}
): ConnectionStatus => {
    const {
        healthEndpoint = DEFAULT_HEALTH_ENDPOINT,
        pollInterval = DEFAULT_POLL_INTERVAL,
        onStatusChange
    } = options;

    const [isOnline, setIsOnline] = useState(true);
    const [lastSync, setLastSync] = useState<Date | null>(null);

    const checkConnection = useCallback(async () => {
        try {
            const response = await fetch(healthEndpoint, {
                method: 'HEAD',
                cache: 'no-store',
                signal: AbortSignal.timeout(3000)
            });

            const wasOffline = !isOnline;
            const nowOnline = response.ok;

            setIsOnline(nowOnline);

            if (nowOnline) {
                setLastSync(new Date());
            }

            if (wasOffline && nowOnline) {
                onStatusChange?.(true);
            } else if (!wasOffline && !nowOnline) {
                onStatusChange?.(false);
            }
        } catch (_error) {
            const wasOnline = isOnline;
            setIsOnline(false);

            if (wasOnline) {
                onStatusChange?.(false);
            }
        }
    }, [healthEndpoint, isOnline, onStatusChange]);

    useEffect(() => {
        const interval = setInterval(checkConnection, pollInterval);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        checkConnection();

        return () => clearInterval(interval);
    }, [checkConnection, pollInterval]);

    return { isOnline, lastSync, checkConnection };
};
