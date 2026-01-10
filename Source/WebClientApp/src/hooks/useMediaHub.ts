import { useCallback, useMemo } from 'react';
import * as signalR from '@microsoft/signalr';
import { useSignalRHub } from '@vtttools/web-components';

/**
 * Event received from the MediaHub when a resource is updated.
 * Matches backend VttTools.Media.Events.ResourceUpdatedEvent.
 *
 * NOTE: The backend no longer sends processing status in events.
 * This event simply notifies that the resource should be refreshed.
 * The backend handles placeholder/error fallback automatically via the resource path.
 */
export interface ResourceUpdatedEvent {
    resourceId: string;
    occurredAt: string;
}

/** Event types for the Media hub (camelCase to match SignalR wire format) */
type MediaHubEvents = {
    onResourceUpdated: ResourceUpdatedEvent;
    [key: string]: unknown;
};

export interface UseMediaHubOptions {
    /** Callback invoked when a resource update event is received - trigger a refresh */
    onResourceUpdated?: (event: ResourceUpdatedEvent) => void;
    /** Callback when connection state changes */
    onConnectionStateChanged?: (state: signalR.HubConnectionState) => void;
    /** Auto-connect on mount (default: false) */
    autoConnect?: boolean;
}

export interface UseMediaHubReturn {
    /** Current connection state */
    connectionState: signalR.HubConnectionState;
    /** Connect to the hub */
    connect: () => Promise<void>;
    /** Disconnect from the hub */
    disconnect: () => Promise<void>;
    /** Subscribe to updates for a specific resource */
    subscribeToResource: (resourceId: string) => Promise<void>;
    /** Unsubscribe from updates for a specific resource */
    unsubscribeFromResource: (resourceId: string) => Promise<void>;
    /** Current error, if any */
    error: Error | null;
    /** Whether currently connected */
    isConnected: boolean;
    /** Resource IDs that failed to resubscribe after reconnection */
    failedSubscriptions: string[];
    /** Whether resubscription is in progress */
    isResubscribing: boolean;
    /** Retry failed subscriptions */
    retryFailedSubscriptions: () => Promise<void>;
}

/**
 * Hook for managing SignalR connection to the Media hub.
 * Provides real-time resource update subscriptions with automatic reconnection.
 *
 * This hook wraps the generic useSignalRHub from @vtttools/web-components
 * with Media-specific event handling.
 *
 * NOTE: The backend no longer sends processing status. Events simply notify
 * that a resource has been updated and should be refreshed. The backend
 * automatically returns placeholder or error images via the resource path.
 *
 * @example
 * ```typescript
 * const { connect, subscribeToResource, connectionState } = useMediaHub({
 *     onResourceUpdated: (event) => {
 *         console.log(`Resource ${event.resourceId} updated at ${event.occurredAt}`);
 *         // Refresh resource data - no need to check status
 *         refetchResource(event.resourceId);
 *     },
 *     autoConnect: true,
 * });
 *
 * // Subscribe to a specific resource's updates
 * await subscribeToResource('resource-guid-here');
 * ```
 */
export function useMediaHub(options: UseMediaHubOptions = {}): UseMediaHubReturn {
    const {
        onResourceUpdated,
        onConnectionStateChanged,
        autoConnect = false,
    } = options;

    // Handle OnResourceUpdated event
    const handleResourceUpdated = useCallback((event: ResourceUpdatedEvent) => {
        onResourceUpdated?.(event);
    }, [onResourceUpdated]);

    // Memoize event handlers to prevent unnecessary re-renders
    // Note: SignalR sends method names in camelCase
    const eventHandlers = useMemo(() => ({
        onResourceUpdated: handleResourceUpdated as (event: unknown) => void,
    }), [handleResourceUpdated]);

    const {
        connectionState,
        connect,
        disconnect,
        subscribeToGroup,
        unsubscribeFromGroup,
        error,
        isConnected,
        failedSubscriptions,
        isResubscribing,
        retryFailedSubscriptions,
    } = useSignalRHub<MediaHubEvents>({
        config: {
            hubUrl: '/hubs/media',
        },
        eventHandlers,
        onConnectionStateChanged,
        autoConnect,
    });

    // Wrap subscribeToGroup/unsubscribeFromGroup with Media-specific method names
    const subscribeToResource = useCallback(async (resourceId: string) => {
        await subscribeToGroup('SubscribeToResource', resourceId);
    }, [subscribeToGroup]);

    const unsubscribeFromResource = useCallback(async (resourceId: string) => {
        await unsubscribeFromGroup('UnsubscribeFromResource', resourceId);
    }, [unsubscribeFromGroup]);

    return {
        connectionState,
        connect,
        disconnect,
        subscribeToResource,
        unsubscribeFromResource,
        error,
        isConnected,
        failedSubscriptions,
        isResubscribing,
        retryFailedSubscriptions,
    };
}
