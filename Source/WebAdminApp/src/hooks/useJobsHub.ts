import { useCallback, useMemo } from 'react';
import * as signalR from '@microsoft/signalr';
import { useSignalRHub } from '@vtttools/web-components';
import type {
    JobCreatedEvent,
    JobCompletedEvent,
    JobCanceledEvent,
    JobRetriedEvent,
    JobItemStartedEvent,
    JobItemCompletedEvent,
    JobEvent,
    JobItemEvent,
} from '@/types/jobs';

/** Event types for the Jobs hub (camelCase to match SignalR wire format) */
type JobHubEvents = {
    publishJobEvent: JobEvent;
    publishJobItemEvent: JobItemEvent;
    [key: string]: unknown;
};

export interface UseJobsHubOptions {
    onJobCreated?: (event: JobCreatedEvent) => void;
    onJobCompleted?: (event: JobCompletedEvent) => void;
    onJobCanceled?: (event: JobCanceledEvent) => void;
    onJobRetried?: (event: JobRetriedEvent) => void;
    onJobItemStarted?: (event: JobItemStartedEvent) => void;
    onJobItemCompleted?: (event: JobItemCompletedEvent) => void;
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
    failedSubscriptions: string[];
    isResubscribing: boolean;
    retryFailedSubscriptions: () => Promise<void>;
}

/**
 * Hook for managing SignalR connection to the Jobs hub.
 * Provides real-time job event subscriptions with automatic reconnection.
 *
 * This hook wraps the generic useSignalRHub from @vtttools/web-components
 * with Jobs-specific event handling.
 */
export function useJobsHub(options: UseJobsHubOptions = {}): UseJobsHubReturn {
    const {
        onJobCreated,
        onJobCompleted,
        onJobCanceled,
        onJobRetried,
        onJobItemStarted,
        onJobItemCompleted,
        onConnectionStateChanged,
        autoConnect = false,
    } = options;

    // Handle JobEvent dispatch to specific callbacks
    const handleJobEvent = useCallback((event: JobEvent) => {
        switch (event.eventType) {
            case 'JobCreated':
                onJobCreated?.(event);
                break;
            case 'JobCompleted':
                onJobCompleted?.(event);
                break;
            case 'JobCanceled':
                onJobCanceled?.(event);
                break;
            case 'JobRetried':
                onJobRetried?.(event);
                break;
        }
    }, [onJobCreated, onJobCompleted, onJobCanceled, onJobRetried]);

    // Handle JobItemEvent dispatch to specific callbacks
    const handleJobItemEvent = useCallback((event: JobItemEvent) => {
        switch (event.eventType) {
            case 'JobItemStarted':
                onJobItemStarted?.(event);
                break;
            case 'JobItemCompleted':
                onJobItemCompleted?.(event);
                break;
        }
    }, [onJobItemStarted, onJobItemCompleted]);

    // Memoize event handlers to prevent unnecessary re-renders
    // Note: SignalR sends method names in camelCase
    const eventHandlers = useMemo(() => ({
        publishJobEvent: handleJobEvent as (event: unknown) => void,
        publishJobItemEvent: handleJobItemEvent as (event: unknown) => void,
    }), [handleJobEvent, handleJobItemEvent]);

    const {
        connectionState,
        connect,
        disconnect,
        subscribeToGroup,
        unsubscribeFromGroup,
        error,
        failedSubscriptions,
        isResubscribing,
        retryFailedSubscriptions,
    } = useSignalRHub<JobHubEvents>({
        config: {
            hubUrl: '/hubs/jobs',
        },
        eventHandlers,
        onConnectionStateChanged,
        autoConnect,
    });

    // Wrap subscribeToGroup/unsubscribeFromGroup with Jobs-specific method names
    const subscribeToJob = useCallback(async (jobId: string) => {
        await subscribeToGroup('SubscribeToJob', jobId);
    }, [subscribeToGroup]);

    const unsubscribeFromJob = useCallback(async (jobId: string) => {
        await unsubscribeFromGroup('UnsubscribeFromJob', jobId);
    }, [unsubscribeFromGroup]);

    return {
        connectionState,
        connect,
        disconnect,
        subscribeToJob,
        unsubscribeFromJob,
        error,
        failedSubscriptions,
        isResubscribing,
        retryFailedSubscriptions,
    };
}
