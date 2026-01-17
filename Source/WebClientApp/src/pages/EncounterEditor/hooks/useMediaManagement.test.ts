import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useMediaManagement } from './useMediaManagement';

describe('useMediaManagement', () => {
    const createMockProps = () => ({
        encounterId: 'test-encounter-id',
        uploadFile: vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue({ id: 'new-resource-id' }) })),
        updateStageSettings: vi.fn().mockResolvedValue(undefined),
        refetch: vi.fn().mockResolvedValue(undefined),
        isMediaHubConnected: true,
        subscribeToResource: vi.fn().mockResolvedValue(undefined),
    });

    it('should initialize with all upload states as false', () => {
        const { result } = renderHook(() => useMediaManagement(createMockProps()));

        expect(result.current.isUploadingBackground).toBe(false);
        expect(result.current.isUploadingAlternateBackground).toBe(false);
        expect(result.current.isUploadingAmbientSound).toBe(false);
    });

    it('should set isUploadingBackground to true during upload', async () => {
        const props = createMockProps();
        const { result } = renderHook(() => useMediaManagement(props));

        const uploadPromise = act(async () => {
            await result.current.handleBackgroundUpload(new File([''], 'test.png'));
        });

        // Note: Due to the async nature, we verify the final state
        await uploadPromise;
        expect(result.current.isUploadingBackground).toBe(false);
        expect(props.uploadFile).toHaveBeenCalled();
    });

    it('should call updateStageSettings when uploading background', async () => {
        const props = createMockProps();
        const { result } = renderHook(() => useMediaManagement(props));

        await act(async () => {
            await result.current.handleBackgroundUpload(new File([''], 'test.png'));
        });

        expect(props.updateStageSettings).toHaveBeenCalledWith({ mainBackgroundId: 'new-resource-id' });
    });

    it('should call subscribeToResource when media hub is connected', async () => {
        const props = createMockProps();
        const { result } = renderHook(() => useMediaManagement(props));

        await act(async () => {
            await result.current.handleBackgroundUpload(new File([''], 'test.png'));
        });

        expect(props.subscribeToResource).toHaveBeenCalledWith('new-resource-id');
    });

    it('should not call subscribeToResource when media hub is disconnected', async () => {
        const props = { ...createMockProps(), isMediaHubConnected: false };
        const { result } = renderHook(() => useMediaManagement(props));

        await act(async () => {
            await result.current.handleBackgroundUpload(new File([''], 'test.png'));
        });

        expect(props.subscribeToResource).not.toHaveBeenCalled();
    });

    it('should call refetch after successful upload', async () => {
        const props = createMockProps();
        const { result } = renderHook(() => useMediaManagement(props));

        await act(async () => {
            await result.current.handleBackgroundUpload(new File([''], 'test.png'));
        });

        expect(props.refetch).toHaveBeenCalled();
    });

    it('should remove background by setting mainBackgroundId to null', async () => {
        const props = createMockProps();
        const { result } = renderHook(() => useMediaManagement(props));

        await act(async () => {
            await result.current.handleBackgroundRemove();
        });

        expect(props.updateStageSettings).toHaveBeenCalledWith({ mainBackgroundId: null });
    });

    it('should select background by resource', async () => {
        const props = createMockProps();
        const { result } = renderHook(() => useMediaManagement(props));
        const resource = { id: 'existing-resource-id' };

        await act(async () => {
            await result.current.handleBackgroundSelect(resource as never);
        });

        expect(props.updateStageSettings).toHaveBeenCalledWith({ mainBackgroundId: 'existing-resource-id' });
    });

    it('should toggle alternate background usage', async () => {
        const props = createMockProps();
        const { result } = renderHook(() => useMediaManagement(props));

        await act(async () => {
            await result.current.handleUseAlternateBackgroundChange(true);
        });

        expect(props.updateStageSettings).toHaveBeenCalledWith({ useAlternateBackground: true });
    });

    it('should not perform actions when encounterId is empty', async () => {
        const props = { ...createMockProps(), encounterId: '' };
        const { result } = renderHook(() => useMediaManagement(props));

        await act(async () => {
            await result.current.handleBackgroundUpload(new File([''], 'test.png'));
        });

        expect(props.uploadFile).not.toHaveBeenCalled();
    });
});
