import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MediaResource } from '@/types/domain';
import { ResourceRole } from '@/types/domain';
import { useFileUpload, type UseFileUploadOptions } from './useFileUpload';

vi.mock('@/utils/uploadWithProgress', () => ({
  uploadFileWithProgress: vi.fn(),
}));

describe('useFileUpload', () => {
  const mockUploadFileWithProgress = vi.fn();

  const mockResource: MediaResource = {
    id: 'resource-123',
    fileName: 'test.png',
    contentType: 'image/png',
    fileSize: 1024,
    role: ResourceRole.Token,
    path: 'resource-123',
    dimensions: { width: 256, height: 256 },
    duration: '',
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const { uploadFileWithProgress } = await import('@/utils/uploadWithProgress');
    vi.mocked(uploadFileWithProgress).mockImplementation(mockUploadFileWithProgress);

    mockUploadFileWithProgress.mockResolvedValue({
      resource: mockResource,
      aborted: false,
    });
  });

  describe('initial state', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useFileUpload());

      expect(result.current.uploadState).toEqual({
        isUploading: false,
        progress: 0,
        fileName: null,
        error: null,
      });
    });

    it('should provide uploadFile function', () => {
      const { result } = renderHook(() => useFileUpload());

      expect(typeof result.current.uploadFile).toBe('function');
    });

    it('should provide cancelUpload function', () => {
      const { result } = renderHook(() => useFileUpload());

      expect(typeof result.current.cancelUpload).toBe('function');
    });

    it('should provide resetState function', () => {
      const { result } = renderHook(() => useFileUpload());

      expect(typeof result.current.resetState).toBe('function');
    });
  });

  describe('uploadFile', () => {
    it('should update state to uploading when file upload starts', async () => {
      const { result } = renderHook(() => useFileUpload());

      const file = new File(['test content'], 'test.png', { type: 'image/png' });

      let resolveUpload: (value: { resource: MediaResource; aborted: boolean }) => void;
      mockUploadFileWithProgress.mockReturnValue(
        new Promise((resolve) => {
          resolveUpload = resolve;
        }),
      );

      act(() => {
        void result.current.uploadFile(file);
      });

      await waitFor(() => {
        expect(result.current.uploadState.isUploading).toBe(true);
        expect(result.current.uploadState.fileName).toBe('test.png');
        expect(result.current.uploadState.progress).toBe(0);
      });

      act(() => {
        resolveUpload({ resource: mockResource, aborted: false });
      });
    });

    it('should call uploadFileWithProgress with correct parameters', async () => {
      const options: UseFileUploadOptions = {
        resourceType: 'portrait',
        entityId: 'entity-123',
      };

      const { result } = renderHook(() => useFileUpload(options));

      const file = new File(['test content'], 'test.png', { type: 'image/png' });

      await act(async () => {
        await result.current.uploadFile(file);
      });

      expect(mockUploadFileWithProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          file,
          resourceType: 'portrait',
          entityId: 'entity-123',
          onProgress: expect.any(Function),
        }),
        expect.any(Object),
      );
    });

    it('should update progress when onProgress is called', async () => {
      let capturedOnProgress: ((event: { loaded: number; total: number; percent: number }) => void) | undefined;

      mockUploadFileWithProgress.mockImplementation((options) => {
        capturedOnProgress = options.onProgress;
        return new Promise(() => {});
      });

      const { result } = renderHook(() => useFileUpload());

      const file = new File(['test content'], 'test.png', { type: 'image/png' });

      act(() => {
        void result.current.uploadFile(file);
      });

      await waitFor(() => {
        expect(result.current.uploadState.isUploading).toBe(true);
      });

      act(() => {
        capturedOnProgress?.({ loaded: 512, total: 1024, percent: 50 });
      });

      expect(result.current.uploadState.progress).toBe(50);
    });

    it('should call onSuccess callback when upload succeeds', async () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(() => useFileUpload({ onSuccess }));

      const file = new File(['test content'], 'test.png', { type: 'image/png' });

      await act(async () => {
        await result.current.uploadFile(file);
      });

      expect(onSuccess).toHaveBeenCalledWith(mockResource);
    });

    it('should return resource when upload succeeds', async () => {
      const { result } = renderHook(() => useFileUpload());

      const file = new File(['test content'], 'test.png', { type: 'image/png' });

      let returnedResource: MediaResource | null = null;

      await act(async () => {
        returnedResource = await result.current.uploadFile(file);
      });

      expect(returnedResource).toEqual(mockResource);
    });

    it('should update state when upload succeeds', async () => {
      const { result } = renderHook(() => useFileUpload());

      const file = new File(['test content'], 'test.png', { type: 'image/png' });

      await act(async () => {
        await result.current.uploadFile(file);
      });

      await waitFor(() => {
        expect(result.current.uploadState.isUploading).toBe(false);
        expect(result.current.uploadState.progress).toBe(100);
        expect(result.current.uploadState.error).toBeNull();
      });
    });
  });

  describe('error handling', () => {
    it('should call onError callback when upload fails', async () => {
      const onError = vi.fn();
      const { result } = renderHook(() => useFileUpload({ onError }));

      mockUploadFileWithProgress.mockRejectedValue(new Error('Upload failed'));

      const file = new File(['test content'], 'test.png', { type: 'image/png' });

      await act(async () => {
        await result.current.uploadFile(file);
      });

      expect(onError).toHaveBeenCalledWith('Upload failed');
    });

    it('should update state with error when upload fails', async () => {
      const { result } = renderHook(() => useFileUpload());

      mockUploadFileWithProgress.mockRejectedValue(new Error('Network error'));

      const file = new File(['test content'], 'test.png', { type: 'image/png' });

      await act(async () => {
        await result.current.uploadFile(file);
      });

      await waitFor(() => {
        expect(result.current.uploadState.isUploading).toBe(false);
        expect(result.current.uploadState.error).toBe('Network error');
      });
    });

    it('should return null when upload fails', async () => {
      const { result } = renderHook(() => useFileUpload());

      mockUploadFileWithProgress.mockRejectedValue(new Error('Upload failed'));

      const file = new File(['test content'], 'test.png', { type: 'image/png' });

      let returnedResource: MediaResource | null = null;

      await act(async () => {
        returnedResource = await result.current.uploadFile(file);
      });

      expect(returnedResource).toBeNull();
    });

    it('should handle non-Error rejection', async () => {
      const { result } = renderHook(() => useFileUpload());

      mockUploadFileWithProgress.mockRejectedValue('String error');

      const file = new File(['test content'], 'test.png', { type: 'image/png' });

      await act(async () => {
        await result.current.uploadFile(file);
      });

      await waitFor(() => {
        expect(result.current.uploadState.error).toBe('Upload failed');
      });
    });
  });

  describe('abort handling', () => {
    it('should return null when upload is aborted', async () => {
      mockUploadFileWithProgress.mockResolvedValue({
        resource: null,
        aborted: true,
      });

      const { result } = renderHook(() => useFileUpload());

      const file = new File(['test content'], 'test.png', { type: 'image/png' });

      let returnedResource: MediaResource | null = null;

      await act(async () => {
        returnedResource = await result.current.uploadFile(file);
      });

      expect(returnedResource).toBeNull();
    });

    it('should reset state when upload is aborted', async () => {
      mockUploadFileWithProgress.mockResolvedValue({
        resource: null,
        aborted: true,
      });

      const { result } = renderHook(() => useFileUpload());

      const file = new File(['test content'], 'test.png', { type: 'image/png' });

      await act(async () => {
        await result.current.uploadFile(file);
      });

      await waitFor(() => {
        expect(result.current.uploadState).toEqual({
          isUploading: false,
          progress: 0,
          fileName: null,
          error: null,
        });
      });
    });

    it('should not call onSuccess when upload is aborted', async () => {
      const onSuccess = vi.fn();

      mockUploadFileWithProgress.mockResolvedValue({
        resource: null,
        aborted: true,
      });

      const { result } = renderHook(() => useFileUpload({ onSuccess }));

      const file = new File(['test content'], 'test.png', { type: 'image/png' });

      await act(async () => {
        await result.current.uploadFile(file);
      });

      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('cancelUpload', () => {
    it('should abort ongoing upload when cancelUpload is called', async () => {
      mockUploadFileWithProgress.mockReturnValue(
        new Promise(() => {
          // Promise intentionally never resolves to simulate ongoing upload
        }),
      );

      const { result } = renderHook(() => useFileUpload());

      const file = new File(['test content'], 'test.png', { type: 'image/png' });

      act(() => {
        void result.current.uploadFile(file);
      });

      await waitFor(() => {
        expect(result.current.uploadState.isUploading).toBe(true);
      });

      act(() => {
        result.current.cancelUpload();
      });

      expect(result.current.uploadState).toEqual({
        isUploading: false,
        progress: 0,
        fileName: null,
        error: null,
      });
    });
  });

  describe('resetState', () => {
    it('should reset state to initial values', async () => {
      const { result } = renderHook(() => useFileUpload());

      const file = new File(['test content'], 'test.png', { type: 'image/png' });

      await act(async () => {
        await result.current.uploadFile(file);
      });

      act(() => {
        result.current.resetState();
      });

      expect(result.current.uploadState).toEqual({
        isUploading: false,
        progress: 0,
        fileName: null,
        error: null,
      });
    });
  });

  describe('options handling', () => {
    it('should work without any options', async () => {
      const { result } = renderHook(() => useFileUpload());

      const file = new File(['test content'], 'test.png', { type: 'image/png' });

      await act(async () => {
        await result.current.uploadFile(file);
      });

      expect(mockUploadFileWithProgress).toHaveBeenCalled();
    });

    it('should pass resourceType to uploadFileWithProgress', async () => {
      const { result } = renderHook(() => useFileUpload({ resourceType: 'portrait' }));

      const file = new File(['test content'], 'test.png', { type: 'image/png' });

      await act(async () => {
        await result.current.uploadFile(file);
      });

      expect(mockUploadFileWithProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          resourceType: 'portrait',
        }),
        expect.any(Object),
      );
    });

    it('should pass entityId to uploadFileWithProgress', async () => {
      const { result } = renderHook(() => useFileUpload({ entityId: 'entity-456' }));

      const file = new File(['test content'], 'test.png', { type: 'image/png' });

      await act(async () => {
        await result.current.uploadFile(file);
      });

      expect(mockUploadFileWithProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          entityId: 'entity-456',
        }),
        expect.any(Object),
      );
    });
  });
});
