import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MediaResource } from '@/types/domain';
import { ResourceRole } from '@/types/domain';
import { uploadFileWithProgress, type UploadOptions } from './uploadWithProgress';

// Type for mutable XHR mock
interface MockXHR {
  open: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
  abort: ReturnType<typeof vi.fn>;
  setRequestHeader: ReturnType<typeof vi.fn>;
  status: number;
  responseText: string;
  withCredentials: boolean;
  upload: XMLHttpRequestUpload;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
}

describe('uploadWithProgress', () => {
  let mockXhr: MockXHR;
  let xhrEventListeners: Record<string, EventListener>;
  let xhrUploadEventListeners: Record<string, EventListener>;

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

  beforeEach(() => {
    xhrEventListeners = {};
    xhrUploadEventListeners = {};

    mockXhr = {
      open: vi.fn(),
      send: vi.fn(),
      abort: vi.fn(),
      setRequestHeader: vi.fn(),
      status: 200,
      responseText: JSON.stringify(mockResource),
      withCredentials: false,
      upload: {
        addEventListener: vi.fn((event: string, listener: EventListener) => {
          xhrUploadEventListeners[event] = listener;
        }),
        removeEventListener: vi.fn(),
      } as unknown as XMLHttpRequestUpload,
      addEventListener: vi.fn((event: string, listener: EventListener) => {
        xhrEventListeners[event] = listener;
      }),
      removeEventListener: vi.fn(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.XMLHttpRequest = vi.fn(() => mockXhr) as any;
  });

  describe('successful upload', () => {
    it('should upload file and return resource on success', async () => {
      const file = new File(['test content'], 'test.png', { type: 'image/png' });
      const options: UploadOptions = {
        file,
        resourceType: 'token',
      };

      const uploadPromise = uploadFileWithProgress(options);

      xhrEventListeners['load']?.({} as Event);

      const result = await uploadPromise;

      expect(result.aborted).toBe(false);
      expect(result.resource).toEqual(mockResource);
    });

    it('should call onProgress callback during upload', async () => {
      const file = new File(['test content'], 'test.png', { type: 'image/png' });
      const onProgress = vi.fn();
      const options: UploadOptions = {
        file,
        resourceType: 'token',
        onProgress,
      };

      const uploadPromise = uploadFileWithProgress(options);

      const progressEvent = {
        lengthComputable: true,
        loaded: 512,
        total: 1024,
      } as ProgressEvent;

      xhrUploadEventListeners['progress']?.(progressEvent);

      expect(onProgress).toHaveBeenCalledWith({
        loaded: 512,
        total: 1024,
        percent: 50,
      });

      xhrEventListeners['load']?.({} as Event);
      await uploadPromise;
    });

    it('should send file with correct form data', async () => {
      const file = new File(['test content'], 'test.png', { type: 'image/png' });
      const options: UploadOptions = {
        file,
        resourceType: 'portrait',
        entityId: 'entity-123',
      };

      const uploadPromise = uploadFileWithProgress(options);

      expect(mockXhr.open).toHaveBeenCalledWith('POST', '/api/resources');
      expect(mockXhr.withCredentials).toBe(true);
      expect(mockXhr.send).toHaveBeenCalled();

      const formData = (mockXhr.send as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as FormData;
      expect(formData).toBeInstanceOf(FormData);
      expect(formData.get('file')).toBe(file);
      expect(formData.get('resourceType')).toBe('portrait');
      expect(formData.get('entityId')).toBe('entity-123');

      xhrEventListeners['load']?.({} as Event);
      await uploadPromise;
    });

    it('should not include entityId when not provided', async () => {
      const file = new File(['test content'], 'test.png', { type: 'image/png' });
      const options: UploadOptions = {
        file,
        resourceType: 'token',
      };

      const uploadPromise = uploadFileWithProgress(options);

      const formData = (mockXhr.send as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as FormData;
      expect(formData.get('entityId')).toBeNull();

      xhrEventListeners['load']?.({} as Event);
      await uploadPromise;
    });

    it('should calculate progress percentage correctly', async () => {
      const file = new File(['test content'], 'test.png', { type: 'image/png' });
      const onProgress = vi.fn();
      const options: UploadOptions = {
        file,
        onProgress,
      };

      const uploadPromise = uploadFileWithProgress(options);

      const progressEvent = {
        lengthComputable: true,
        loaded: 750,
        total: 1000,
      } as ProgressEvent;

      xhrUploadEventListeners['progress']?.(progressEvent);

      expect(onProgress).toHaveBeenCalledWith({
        loaded: 750,
        total: 1000,
        percent: 75,
      });

      xhrEventListeners['load']?.({} as Event);
      await uploadPromise;
    });
  });

  describe('abort handling', () => {
    it('should handle abort signal', async () => {
      const file = new File(['test content'], 'test.png', { type: 'image/png' });
      const abortController = new AbortController();
      const onAbort = vi.fn();

      const options: UploadOptions = {
        file,
        onAbort,
      };

      const uploadPromise = uploadFileWithProgress(options, abortController.signal);

      abortController.abort();
      expect(mockXhr.abort).toHaveBeenCalled();

      xhrEventListeners['abort']?.({} as Event);

      const result = await uploadPromise;
      expect(result.aborted).toBe(true);
      expect(result.resource).toBeNull();
      expect(onAbort).toHaveBeenCalled();
    });

    it('should return aborted result when xhr is aborted', async () => {
      const file = new File(['test content'], 'test.png', { type: 'image/png' });
      const options: UploadOptions = {
        file,
      };

      const uploadPromise = uploadFileWithProgress(options);

      xhrEventListeners['abort']?.({} as Event);

      const result = await uploadPromise;
      expect(result.aborted).toBe(true);
      expect(result.resource).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should reject on network error', async () => {
      const file = new File(['test content'], 'test.png', { type: 'image/png' });
      const options: UploadOptions = {
        file,
      };

      const uploadPromise = uploadFileWithProgress(options);

      xhrEventListeners['error']?.({} as Event);

      await expect(uploadPromise).rejects.toThrow('Network error during upload');
    });

    it('should reject with error message from response', async () => {
      mockXhr.status = 400;
      mockXhr.responseText = JSON.stringify({
        detail: 'Invalid file format',
      });

      const file = new File(['test content'], 'test.png', { type: 'image/png' });
      const options: UploadOptions = {
        file,
      };

      const uploadPromise = uploadFileWithProgress(options);

      xhrEventListeners['load']?.({} as Event);

      await expect(uploadPromise).rejects.toThrow('Invalid file format');
    });

    it('should reject with title from error response when detail is missing', async () => {
      mockXhr.status = 500;
      mockXhr.responseText = JSON.stringify({
        title: 'Internal Server Error',
      });

      const file = new File(['test content'], 'test.png', { type: 'image/png' });
      const options: UploadOptions = {
        file,
      };

      const uploadPromise = uploadFileWithProgress(options);

      xhrEventListeners['load']?.({} as Event);

      await expect(uploadPromise).rejects.toThrow('Internal Server Error');
    });

    it('should reject with status code when error response cannot be parsed', async () => {
      mockXhr.status = 404;
      mockXhr.responseText = 'Invalid JSON';

      const file = new File(['test content'], 'test.png', { type: 'image/png' });
      const options: UploadOptions = {
        file,
      };

      const uploadPromise = uploadFileWithProgress(options);

      xhrEventListeners['load']?.({} as Event);

      await expect(uploadPromise).rejects.toThrow('Upload failed with status 404');
    });

    it('should reject when response JSON parsing fails', async () => {
      mockXhr.status = 200;
      mockXhr.responseText = 'Not valid JSON';

      const file = new File(['test content'], 'test.png', { type: 'image/png' });
      const options: UploadOptions = {
        file,
      };

      const uploadPromise = uploadFileWithProgress(options);

      xhrEventListeners['load']?.({} as Event);

      await expect(uploadPromise).rejects.toThrow('Failed to parse upload response');
    });
  });

  describe('progress events', () => {
    it('should not call onProgress when lengthComputable is false', async () => {
      const file = new File(['test content'], 'test.png', { type: 'image/png' });
      const onProgress = vi.fn();
      const options: UploadOptions = {
        file,
        onProgress,
      };

      const uploadPromise = uploadFileWithProgress(options);

      const progressEvent = {
        lengthComputable: false,
        loaded: 512,
        total: 1024,
      } as ProgressEvent;

      xhrUploadEventListeners['progress']?.(progressEvent);

      expect(onProgress).not.toHaveBeenCalled();

      xhrEventListeners['load']?.({} as Event);
      await uploadPromise;
    });

    it('should not call onProgress when callback is not provided', async () => {
      const file = new File(['test content'], 'test.png', { type: 'image/png' });
      const options: UploadOptions = {
        file,
      };

      const uploadPromise = uploadFileWithProgress(options);

      const progressEvent = {
        lengthComputable: true,
        loaded: 512,
        total: 1024,
      } as ProgressEvent;

      xhrUploadEventListeners['progress']?.(progressEvent);

      xhrEventListeners['load']?.({} as Event);
      await uploadPromise;
    });
  });

  describe('default values', () => {
    it('should use default resourceType when not provided', async () => {
      const file = new File(['test content'], 'test.png', { type: 'image/png' });
      const options: UploadOptions = {
        file,
      };

      const uploadPromise = uploadFileWithProgress(options);

      const formData = (mockXhr.send as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as FormData;
      expect(formData.get('resourceType')).toBe('token');

      xhrEventListeners['load']?.({} as Event);
      await uploadPromise;
    });
  });
});
