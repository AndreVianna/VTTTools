import { useCallback, useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import type { JobProgressEvent, JobCompletedEvent } from '@/types/jobs';

export interface UseJobsHubOptions {
    onProgress?: (event: JobProgressEvent) => void;
    onJobCompleted?: (event: JobCompletedEvent) => void;
    onConnectionStateChanged?: (state: signalR.HubConnectionState) => void;
    autoConnect?: boolean;
}

export interface UseJobsHubReturn {
    connectionState: signalR.HubConnectionState;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    subscribeToJob: (jobId: string) => Promise<void>;
    unsubscribeFromJob: (jobId: string) => Promise<void>;
    error: Error | null;
}

export function useJobsHub(options: UseJobsHubOptions = {}): UseJobsHubReturn {
    const {
        onProgress,
        onJobCompleted,
        onConnectionStateChanged,
        autoConnect = false,
    } = options;

    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const [connectionState, setConnectionState] = useState<signalR.HubConnectionState>(
        signalR.HubConnectionState.Disconnected
    );
    const [error, setError] = useState<Error | null>(null);
    const subscribedJobsRef = useRef<Set<string>>(new Set());

    const updateConnectionState = useCallback((state: signalR.HubConnectionState) => {
        setConnectionState(state);
        onConnectionStateChanged?.(state);
    }, [onConnectionStateChanged]);

    const createConnection = useCallback(() => {
        if (connectionRef.current) {
            return connectionRef.current;
        }

        const token = localStorage.getItem('vtttools_admin_token');
        const connection = new signalR.HubConnectionBuilder()
            .withUrl('/hubs/jobs', {
                accessTokenFactory: () => token ?? '',
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    if (retryContext.previousRetryCount >= 5) {
                        return null;
                    }
                    return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
                },
            })
            .configureLogging(signalR.LogLevel.Warning)
            .build();

        connection.onreconnecting(() => {
            updateConnectionState(signalR.HubConnectionState.Reconnecting);
        });

        connection.onreconnected(() => {
            updateConnectionState(signalR.HubConnectionState.Connected);
            for (const jobId of subscribedJobsRef.current) {
                connection.invoke('SubscribeToJob', jobId).catch(console.error);
            }
        });

        connection.onclose(() => {
            updateConnectionState(signalR.HubConnectionState.Disconnected);
        });

        connection.on('ReceiveProgress', (event: JobProgressEvent) => {
            onProgress?.(event);
        });

        connection.on('JobCompleted', (event: JobCompletedEvent) => {
            onJobCompleted?.(event);
        });

        connectionRef.current = connection;
        return connection;
    }, [onProgress, onJobCompleted, updateConnectionState]);

    const connect = useCallback(async () => {
        try {
            setError(null);
            const connection = createConnection();

            if (connection.state === signalR.HubConnectionState.Disconnected) {
                updateConnectionState(signalR.HubConnectionState.Connecting);
                await connection.start();
                updateConnectionState(signalR.HubConnectionState.Connected);
            }
        } catch (err) {
            const connectionError = err instanceof Error ? err : new Error('Failed to connect');
            setError(connectionError);
            updateConnectionState(signalR.HubConnectionState.Disconnected);
            throw connectionError;
        }
    }, [createConnection, updateConnectionState]);

    const disconnect = useCallback(async () => {
        const connection = connectionRef.current;
        if (connection && connection.state !== signalR.HubConnectionState.Disconnected) {
            subscribedJobsRef.current.clear();
            await connection.stop();
            updateConnectionState(signalR.HubConnectionState.Disconnected);
        }
    }, [updateConnectionState]);

    const subscribeToJob = useCallback(async (jobId: string) => {
        const connection = connectionRef.current;
        if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
            throw new Error('Not connected to hub');
        }

        await connection.invoke('SubscribeToJob', jobId);
        subscribedJobsRef.current.add(jobId);
    }, []);

    const unsubscribeFromJob = useCallback(async (jobId: string) => {
        const connection = connectionRef.current;
        if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
            return;
        }

        await connection.invoke('UnsubscribeFromJob', jobId);
        subscribedJobsRef.current.delete(jobId);
    }, []);

    useEffect(() => {
        if (autoConnect) {
            connect().catch(console.error);
        }

        return () => {
            const connection = connectionRef.current;
            if (connection) {
                connection.stop().catch(console.error);
                connectionRef.current = null;
            }
        };
    }, [autoConnect, connect]);

    return {
        connectionState,
        connect,
        disconnect,
        subscribeToJob,
        unsubscribeFromJob,
        error,
    };
}
