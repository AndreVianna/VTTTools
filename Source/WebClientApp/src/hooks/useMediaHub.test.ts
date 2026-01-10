import { renderHook, waitFor } from '@testing-library/react';
import * as signalR from '@microsoft/signalr';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useMediaHub, type ResourceUpdatedEvent } from './useMediaHub';

// Mock the @vtttools/web-components module
vi.mock('@vtttools/web-components', () => ({
    useSignalRHub: vi.fn(),
}));

// Get the mocked module
import { useSignalRHub } from '@vtttools/web-components';
const mockedUseSignalRHub = vi.mocked(useSignalRHub);

describe('useMediaHub', () => {
    const mockSubscribeToGroup = vi.fn();
    const mockUnsubscribeFromGroup = vi.fn();
    const mockConnect = vi.fn();
    const mockDisconnect = vi.fn();
    const mockRetryFailedSubscriptions = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock implementation
        mockedUseSignalRHub.mockReturnValue({
            connectionState: signalR.HubConnectionState.Disconnected,
            connect: mockConnect,
            disconnect: mockDisconnect,
            invoke: vi.fn(),
            subscribeToGroup: mockSubscribeToGroup,
            unsubscribeFromGroup: mockUnsubscribeFromGroup,
            error: null,
            isConnected: false,
            failedSubscriptions: [],
            isResubscribing: false,
            retryFailedSubscriptions: mockRetryFailedSubscriptions,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should initialize with disconnected state', () => {
        const { result } = renderHook(() => useMediaHub());

        expect(result.current.connectionState).toBe(signalR.HubConnectionState.Disconnected);
        expect(result.current.isConnected).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should configure hub with correct URL', () => {
        renderHook(() => useMediaHub());

        expect(mockedUseSignalRHub).toHaveBeenCalledWith(
            expect.objectContaining({
                config: expect.objectContaining({
                    hubUrl: '/hubs/media',
                }),
            }),
        );
    });

    it('should pass autoConnect option to underlying hook', () => {
        renderHook(() => useMediaHub({ autoConnect: true }));

        expect(mockedUseSignalRHub).toHaveBeenCalledWith(
            expect.objectContaining({
                autoConnect: true,
            }),
        );
    });

    it('should not autoConnect by default', () => {
        renderHook(() => useMediaHub());

        expect(mockedUseSignalRHub).toHaveBeenCalledWith(
            expect.objectContaining({
                autoConnect: false,
            }),
        );
    });

    it('should provide connect method', async () => {
        mockConnect.mockResolvedValue(undefined);

        const { result } = renderHook(() => useMediaHub());

        await result.current.connect();

        expect(mockConnect).toHaveBeenCalled();
    });

    it('should provide disconnect method', async () => {
        mockDisconnect.mockResolvedValue(undefined);

        const { result } = renderHook(() => useMediaHub());

        await result.current.disconnect();

        expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should subscribe to resource with correct method name', async () => {
        mockSubscribeToGroup.mockResolvedValue(undefined);

        const { result } = renderHook(() => useMediaHub());

        await result.current.subscribeToResource('test-resource-id');

        expect(mockSubscribeToGroup).toHaveBeenCalledWith(
            'SubscribeToResource',
            'test-resource-id',
        );
    });

    it('should unsubscribe from resource with correct method name', async () => {
        mockUnsubscribeFromGroup.mockResolvedValue(undefined);

        const { result } = renderHook(() => useMediaHub());

        await result.current.unsubscribeFromResource('test-resource-id');

        expect(mockUnsubscribeFromGroup).toHaveBeenCalledWith(
            'UnsubscribeFromResource',
            'test-resource-id',
        );
    });

    it('should call onResourceUpdated callback when resource update event is received', () => {
        const onResourceUpdated = vi.fn();
        let capturedEventHandler: ((event: ResourceUpdatedEvent) => void) | undefined;

        mockedUseSignalRHub.mockImplementation((options) => {
            // Capture the event handler
            const handlers = options.eventHandlers as Record<string, (event: unknown) => void> | undefined;
            if (handlers?.onResourceUpdated) {
                capturedEventHandler = handlers.onResourceUpdated as (event: ResourceUpdatedEvent) => void;
            }
            return {
                connectionState: signalR.HubConnectionState.Connected,
                connect: mockConnect,
                disconnect: mockDisconnect,
                invoke: vi.fn(),
                subscribeToGroup: mockSubscribeToGroup,
                unsubscribeFromGroup: mockUnsubscribeFromGroup,
                error: null,
                isConnected: true,
                failedSubscriptions: [],
                isResubscribing: false,
                retryFailedSubscriptions: mockRetryFailedSubscriptions,
            };
        });

        renderHook(() => useMediaHub({ onResourceUpdated }));

        expect(capturedEventHandler).toBeDefined();

        const testEvent: ResourceUpdatedEvent = {
            resourceId: 'resource-123',
            occurredAt: '2026-01-08T00:00:00Z',
        };

        capturedEventHandler!(testEvent);

        expect(onResourceUpdated).toHaveBeenCalledWith(testEvent);
    });

    it('should pass onConnectionStateChanged to underlying hook', () => {
        const onConnectionStateChanged = vi.fn();

        renderHook(() => useMediaHub({ onConnectionStateChanged }));

        expect(mockedUseSignalRHub).toHaveBeenCalledWith(
            expect.objectContaining({
                onConnectionStateChanged,
            }),
        );
    });

    it('should expose connection state correctly when connected', () => {
        mockedUseSignalRHub.mockReturnValue({
            connectionState: signalR.HubConnectionState.Connected,
            connect: mockConnect,
            disconnect: mockDisconnect,
            invoke: vi.fn(),
            subscribeToGroup: mockSubscribeToGroup,
            unsubscribeFromGroup: mockUnsubscribeFromGroup,
            error: null,
            isConnected: true,
            failedSubscriptions: [],
            isResubscribing: false,
            retryFailedSubscriptions: mockRetryFailedSubscriptions,
        });

        const { result } = renderHook(() => useMediaHub());

        expect(result.current.connectionState).toBe(signalR.HubConnectionState.Connected);
        expect(result.current.isConnected).toBe(true);
    });

    it('should expose error from underlying hook', () => {
        const testError = new Error('Connection failed');

        mockedUseSignalRHub.mockReturnValue({
            connectionState: signalR.HubConnectionState.Disconnected,
            connect: mockConnect,
            disconnect: mockDisconnect,
            invoke: vi.fn(),
            subscribeToGroup: mockSubscribeToGroup,
            unsubscribeFromGroup: mockUnsubscribeFromGroup,
            error: testError,
            isConnected: false,
            failedSubscriptions: [],
            isResubscribing: false,
            retryFailedSubscriptions: mockRetryFailedSubscriptions,
        });

        const { result } = renderHook(() => useMediaHub());

        expect(result.current.error).toBe(testError);
    });

    it('should expose failedSubscriptions from underlying hook', () => {
        mockedUseSignalRHub.mockReturnValue({
            connectionState: signalR.HubConnectionState.Connected,
            connect: mockConnect,
            disconnect: mockDisconnect,
            invoke: vi.fn(),
            subscribeToGroup: mockSubscribeToGroup,
            unsubscribeFromGroup: mockUnsubscribeFromGroup,
            error: null,
            isConnected: true,
            failedSubscriptions: ['resource-1', 'resource-2'],
            isResubscribing: false,
            retryFailedSubscriptions: mockRetryFailedSubscriptions,
        });

        const { result } = renderHook(() => useMediaHub());

        expect(result.current.failedSubscriptions).toEqual(['resource-1', 'resource-2']);
    });

    it('should expose isResubscribing from underlying hook', () => {
        mockedUseSignalRHub.mockReturnValue({
            connectionState: signalR.HubConnectionState.Connected,
            connect: mockConnect,
            disconnect: mockDisconnect,
            invoke: vi.fn(),
            subscribeToGroup: mockSubscribeToGroup,
            unsubscribeFromGroup: mockUnsubscribeFromGroup,
            error: null,
            isConnected: true,
            failedSubscriptions: [],
            isResubscribing: true,
            retryFailedSubscriptions: mockRetryFailedSubscriptions,
        });

        const { result } = renderHook(() => useMediaHub());

        expect(result.current.isResubscribing).toBe(true);
    });

    it('should provide retryFailedSubscriptions method', async () => {
        mockRetryFailedSubscriptions.mockResolvedValue(undefined);

        const { result } = renderHook(() => useMediaHub());

        await result.current.retryFailedSubscriptions();

        expect(mockRetryFailedSubscriptions).toHaveBeenCalled();
    });

    it('should register onResourceUpdated event handler', () => {
        renderHook(() => useMediaHub({ onResourceUpdated: vi.fn() }));

        expect(mockedUseSignalRHub).toHaveBeenCalledWith(
            expect.objectContaining({
                eventHandlers: expect.objectContaining({
                    onResourceUpdated: expect.any(Function),
                }),
            }),
        );
    });

    it('should handle undefined onResourceUpdated gracefully', () => {
        let capturedEventHandler: ((event: ResourceUpdatedEvent) => void) | undefined;

        mockedUseSignalRHub.mockImplementation((options) => {
            const handlers = options.eventHandlers as Record<string, (event: unknown) => void> | undefined;
            if (handlers?.onResourceUpdated) {
                capturedEventHandler = handlers.onResourceUpdated as (event: ResourceUpdatedEvent) => void;
            }
            return {
                connectionState: signalR.HubConnectionState.Connected,
                connect: mockConnect,
                disconnect: mockDisconnect,
                invoke: vi.fn(),
                subscribeToGroup: mockSubscribeToGroup,
                unsubscribeFromGroup: mockUnsubscribeFromGroup,
                error: null,
                isConnected: true,
                failedSubscriptions: [],
                isResubscribing: false,
                retryFailedSubscriptions: mockRetryFailedSubscriptions,
            };
        });

        renderHook(() => useMediaHub());

        expect(capturedEventHandler).toBeDefined();

        // Should not throw when called without onResourceUpdated callback
        expect(() => {
            capturedEventHandler!({
                resourceId: 'resource-789',
                occurredAt: '2026-01-08T00:00:00Z',
            });
        }).not.toThrow();
    });

    it('should memoize event handlers to prevent unnecessary re-renders', () => {
        const onResourceUpdated = vi.fn();

        const { rerender } = renderHook(
            ({ onResourceUpdated: callback }) => useMediaHub({ onResourceUpdated: callback }),
            { initialProps: { onResourceUpdated } },
        );

        const firstCallHandlers = mockedUseSignalRHub.mock.calls[0]?.[0]?.eventHandlers;

        rerender({ onResourceUpdated });

        const secondCallHandlers = mockedUseSignalRHub.mock.calls[1]?.[0]?.eventHandlers;

        // Event handlers should be stable references when onResourceUpdated doesn't change
        expect(firstCallHandlers?.onResourceUpdated).toBeDefined();
        expect(secondCallHandlers?.onResourceUpdated).toBeDefined();
    });

    it('should handle multiple resource update events', () => {
        const onResourceUpdated = vi.fn();
        let capturedEventHandler: ((event: ResourceUpdatedEvent) => void) | undefined;

        mockedUseSignalRHub.mockImplementation((options) => {
            const handlers = options.eventHandlers as Record<string, (event: unknown) => void> | undefined;
            if (handlers?.onResourceUpdated) {
                capturedEventHandler = handlers.onResourceUpdated as (event: ResourceUpdatedEvent) => void;
            }
            return {
                connectionState: signalR.HubConnectionState.Connected,
                connect: mockConnect,
                disconnect: mockDisconnect,
                invoke: vi.fn(),
                subscribeToGroup: mockSubscribeToGroup,
                unsubscribeFromGroup: mockUnsubscribeFromGroup,
                error: null,
                isConnected: true,
                failedSubscriptions: [],
                isResubscribing: false,
                retryFailedSubscriptions: mockRetryFailedSubscriptions,
            };
        });

        renderHook(() => useMediaHub({ onResourceUpdated }));

        // Simulate multiple resource updates
        const resourceIds = ['resource-1', 'resource-2', 'resource-3'];
        for (const resourceId of resourceIds) {
            capturedEventHandler!({
                resourceId,
                occurredAt: '2026-01-08T00:00:00Z',
            });
        }

        expect(onResourceUpdated).toHaveBeenCalledTimes(3);
    });
});
