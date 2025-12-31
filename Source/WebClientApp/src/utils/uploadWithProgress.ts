import type { MediaResource } from '@/types/domain';

export interface UploadProgressEvent {
  loaded: number;
  total: number;
  percent: number;
}

export interface UploadOptions {
  file: File;
  resourceType?: string | undefined;
  entityId?: string | undefined;
  onProgress?: (event: UploadProgressEvent) => void;
  onAbort?: () => void;
}

export interface UploadResult {
  resource: MediaResource | null;
  aborted: boolean;
}

export const uploadFileWithProgress = (
  options: UploadOptions,
  signal?: AbortSignal
): Promise<UploadResult> => {
  const { file, resourceType = 'token', entityId, onProgress, onAbort } = options;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (signal) {
      signal.addEventListener('abort', () => {
        xhr.abort();
      });
    }

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percent: Math.round((event.loaded / event.total) * 100),
        });
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const resource = JSON.parse(xhr.responseText) as MediaResource;
          resolve({ resource, aborted: false });
        } catch {
          reject(new Error('Failed to parse upload response'));
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.detail || errorData.title || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      onAbort?.();
      resolve({ resource: null, aborted: true });
    });

    const formData = new FormData();
    formData.append('resourceType', resourceType);
    formData.append('file', file);

    if (entityId) {
      formData.append('entityId', entityId);
    }

    xhr.open('POST', '/api/resources');
    xhr.withCredentials = true;
    xhr.send(formData);
  });
};
