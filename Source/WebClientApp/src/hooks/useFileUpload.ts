import { useCallback, useRef, useState } from 'react';
import type { MediaResource } from '@/types/domain';
import { uploadFileWithProgress, type UploadProgressEvent } from '@/utils/uploadWithProgress';

export interface UploadState {
  isUploading: boolean;
  progress: number;
  fileName: string | null;
  error: string | null;
}

export interface UseFileUploadOptions {
  resourceType?: string;
  entityId?: string;
  onSuccess?: (resource: MediaResource) => void;
  onError?: (error: string) => void;
}

export interface UseFileUploadReturn {
  uploadState: UploadState;
  uploadFile: (file: File) => Promise<MediaResource | null>;
  cancelUpload: () => void;
  resetState: () => void;
}

const initialState: UploadState = {
  isUploading: false,
  progress: 0,
  fileName: null,
  error: null,
};

export const useFileUpload = (options: UseFileUploadOptions = {}): UseFileUploadReturn => {
  const { resourceType, entityId, onSuccess, onError } = options;
  const [state, setState] = useState<UploadState>(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleProgress = useCallback((event: UploadProgressEvent) => {
    setState((prev) => ({
      ...prev,
      progress: event.percent,
    }));
  }, []);

  const uploadFile = useCallback(
    async (file: File): Promise<MediaResource | null> => {
      abortControllerRef.current = new AbortController();

      setState({
        isUploading: true,
        progress: 0,
        fileName: file.name,
        error: null,
      });

      try {
        const result = await uploadFileWithProgress(
          {
            file,
            resourceType,
            entityId,
            onProgress: handleProgress,
          },
          abortControllerRef.current.signal
        );

        if (result.aborted) {
          setState(initialState);
          return null;
        }

        setState((prev) => ({
          ...prev,
          isUploading: false,
          progress: 100,
        }));

        onSuccess?.(result.resource);
        return result.resource;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setState((prev) => ({
          ...prev,
          isUploading: false,
          error: errorMessage,
        }));
        onError?.(errorMessage);
        return null;
      } finally {
        abortControllerRef.current = null;
      }
    },
    [resourceType, entityId, onSuccess, onError, handleProgress]
  );

  const cancelUpload = useCallback(() => {
    abortControllerRef.current?.abort();
    setState(initialState);
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    uploadState: state,
    uploadFile,
    cancelUpload,
    resetState,
  };
};
