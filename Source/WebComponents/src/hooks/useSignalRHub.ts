import { useCallback, useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';

/**
 * Configuration options for the SignalR hub connection.
 */
export interface SignalRHubConfig {
    /** The hub URL path (e.g., '/hubs/jobs') */
    hubUrl: string;
    /** Function to get the current access token (optional - uses cookies if not provided) */
    getAccessToken?: (() => string | null) | undefined;
    /** Maximum number of reconnection attempts (default: 5) */
    maxReconnectAttempts?: number;
    /** Log level for SignalR (default: Warning) */
    logLevel?: signalR.LogLevel;
}

/**
 * Event handler map type - maps event names to their handler functions.
 */
export type EventHandlers<TEvents extends Record<string, unknown>> = {
    [K in keyof TEvents]?: (event: TEvents[K]) => void;
};

/**
 * Options for the useSignalRHub hook.
 */
export interface UseSignalRHubOptions<TEvents extends Record<string, unknown>> {
    /** Hub configuration */
    config: SignalRHubConfig;
    /** Event handlers for hub events */
    eventHandlers?: EventHandlers<TEvents> | undefined;
    /** Callback when connection state changes */
    onConnectionStateChanged?: ((state: signalR.HubConnectionState) => void) | undefined;
    /** Auto-connect on mount (default: false) */
    autoConnect?: boolean | undefined;
}

/**
 * Return type for the useSignalRHub hook.
 */
export interface UseSignalRHubReturn {
    /** Current connection state */
    connectionState: signalR.HubConnectionState;
    /** Connect to the hub */
    connect: () => Promise<void>;
    /** Disconnect from the hub */
    disconnect: () => Promise<void>;
    /** Invoke a hub method */
    invoke: <T = void>(methodName: string, ...args: unknown[]) => Promise<T>;
    /** Subscribe to a group */
    subscribeToGroup: (methodName: string, groupId: string) => Promise<void>;
    /** Unsubscribe from a group */
    unsubscribeFromGroup: (methodName: string, groupId: string) => Promise<void>;
    /** Current error, if any */
    error: Error | null;
    /** Whether currently connected */
    isConnected: boolean;
    /** Group IDs that failed to resubscribe after reconnection */
    failedSubscriptions: string[];
    /** Whether resubscription is in progress */
    isResubscribing: boolean;
    /** Retry failed subscriptions */
    retryFailedSubscriptions: () => Promise<void>;
}

/**
 * Generic hook for managing SignalR hub connections.
 * Provides automatic reconnection, token refresh, and proper cleanup.
 *
 * @example
 * ```typescript
 * interface JobEvents {
 *   JobEvent: JobEvent;
 *   JobItemEvent: JobItemEvent;
 * }
 *
 * const { connect, subscribeToGroup, connectionState } = useSignalRHub<JobEvents>({
 *   config: {
 *     hubUrl: '/hubs/jobs',
 *     getAccessToken: () => localStorage.getItem('token'),
 *   },
 *   eventHandlers: {
 *     JobEvent: (event) => dispatch(handleJobEvent(event)),
 *     JobItemEvent: (event) => dispatch(handleJobItemEvent(event)),
 *   },
 *   autoConnect: true,
 * });
 * ```
 */
export function useSignalRHub<TEvents extends Record<string, unknown> = Record<string, unknown>>(
    options: UseSignalRHubOptions<TEvents>
): UseSignalRHubReturn {
    const {
        config,
        eventHandlers = {},
        onConnectionStateChanged,
        autoConnect = false,
    } = options;

    const {
        hubUrl,
        getAccessToken = undefined,
        maxReconnectAttempts = 5,
        logLevel = signalR.LogLevel.Warning,
    } = config;

    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const [connectionState, setConnectionState] = useState<signalR.HubConnectionState>(
        signalR.HubConnectionState.Disconnected
    );
    const [error, setError] = useState<Error | null>(null);
    const [failedSubscriptions, setFailedSubscriptions] = useState<string[]>([]);
    const [isResubscribing, setIsResubscribing] = useState(false);
    const subscribedGroupsRef = useRef<Map<string, Set<string>>>(new Map());

    // Store callbacks in refs to avoid dependency issues
    const callbacksRef = useRef({
        eventHandlers,
        onConnectionStateChanged,
        getAccessToken,
    });

    // Keep refs updated with latest callbacks
    useEffect(() => {
        callbacksRef.current = {
            eventHandlers,
            onConnectionStateChanged,
            getAccessToken,
        };
    }, [eventHandlers, onConnectionStateChanged, getAccessToken]);

    const updateConnectionState = useCallback((state: signalR.HubConnectionState) => {
        setConnectionState(state);
        callbacksRef.current.onConnectionStateChanged?.(state);
    }, []);

    // Create stable event handler functions
    const createEventHandler = useCallback((eventName: string) => {
        return (event: unknown) => {
            const handlers = callbacksRef.current.eventHandlers as Record<string, ((e: unknown) => void) | undefined>;
            const handler = handlers[eventName];
            if (handler) {
                handler(event);
            }
        };
    }, []);

    const createConnection = useCallback(() => {
        if (connectionRef.current) {
            return connectionRef.current;
        }

        const httpConnectionOptions: signalR.IHttpConnectionOptions = getAccessToken
            ? {
                accessTokenFactory: () => {
                    const tokenFn = callbacksRef.current.getAccessToken;
                    return typeof tokenFn === 'function' ? tokenFn() ?? '' : '';
                }
            }
            : { withCredentials: true };

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, httpConnectionOptions)
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext: signalR.RetryContext) => {
                    if (retryContext.previousRetryCount >= maxReconnectAttempts) {
                        return null;
                    }
                    return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
                },
            })
            .configureLogging(logLevel)
            .build();

        connection.onreconnecting(() => {
            updateConnectionState(signalR.HubConnectionState.Reconnecting);
        });

        connection.onreconnected(async () => {
            updateConnectionState(signalR.HubConnectionState.Connected);
            setIsResubscribing(true);
            const failures: string[] = [];

            for (const [methodName, groupIds] of subscribedGroupsRef.current) {
                for (const groupId of groupIds) {
                    try {
                        await connection.invoke(methodName, groupId);
                    } catch (err: unknown) {
                        console.error(`Failed to resubscribe to ${methodName}(${groupId}):`, err);
                        failures.push(groupId);
                        subscribedGroupsRef.current.get(methodName)?.delete(groupId);
                    }
                }
            }

            setFailedSubscriptions(failures);
            setIsResubscribing(false);

            if (failures.length > 0) {
                setError(new Error(`Failed to resubscribe to ${failures.length} group(s)`));
            }
        });

        connection.onclose(() => {
            updateConnectionState(signalR.HubConnectionState.Disconnected);
        });

        // Register event handlers
        const eventNames = Object.keys(callbacksRef.current.eventHandlers);
        for (const eventName of eventNames) {
            connection.on(eventName, createEventHandler(eventName));
        }

        connectionRef.current = connection;
        return connection;
    }, [hubUrl, getAccessToken, maxReconnectAttempts, logLevel, updateConnectionState, createEventHandler]);

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
            subscribedGroupsRef.current.clear();
            await connection.stop();
            updateConnectionState(signalR.HubConnectionState.Disconnected);
        }
    }, [updateConnectionState]);

    const invoke = useCallback(async <T = void>(methodName: string, ...args: unknown[]): Promise<T> => {
        const connection = connectionRef.current;
        if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
            throw new Error('Not connected to hub');
        }
        return await connection.invoke<T>(methodName, ...args);
    }, []);

    const subscribeToGroup = useCallback(async (methodName: string, groupId: string) => {
        const connection = connectionRef.current;
        if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
            throw new Error('Not connected to hub');
        }

        await connection.invoke(methodName, groupId);

        // Track subscription for reconnection
        if (!subscribedGroupsRef.current.has(methodName)) {
            subscribedGroupsRef.current.set(methodName, new Set());
        }
        subscribedGroupsRef.current.get(methodName)!.add(groupId);
    }, []);

    const unsubscribeFromGroup = useCallback(async (methodName: string, groupId: string) => {
        const connection = connectionRef.current;
        if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
            return;
        }

        await connection.invoke(methodName, groupId);
        subscribedGroupsRef.current.get(methodName)?.delete(groupId);
    }, []);

    const retryFailedSubscriptions = useCallback(async () => {
        if (failedSubscriptions.length === 0) return;

        const stillFailing: string[] = [];
        for (const groupId of failedSubscriptions) {
            try {
                await subscribeToGroup('SubscribeToJob', groupId);
            } catch {
                stillFailing.push(groupId);
            }
        }
        setFailedSubscriptions(stillFailing);
        if (stillFailing.length === 0) {
            setError(null);
        }
    }, [failedSubscriptions, subscribeToGroup]);

    useEffect(() => {
        if (autoConnect) {
            connect().catch(console.error);
        }

        // Clean up on unmount
        return () => {
            const connection = connectionRef.current;
            if (connection) {
                // Remove all event handlers
                const eventNames = Object.keys(callbacksRef.current.eventHandlers);
                for (const eventName of eventNames) {
                    connection.off(eventName);
                }
                connection.stop().catch(console.error);
                connectionRef.current = null;
            }
        };
    }, [autoConnect, connect]);

    return {
        connectionState,
        connect,
        disconnect,
        invoke,
        subscribeToGroup,
        unsubscribeFromGroup,
        error,
        isConnected: connectionState === signalR.HubConnectionState.Connected,
        failedSubscriptions,
        isResubscribing,
        retryFailedSubscriptions,
    };
}
