import { useEffect, useRef, useState } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface UseAutoSaveOptions<T> {
  data: T;
  originalData: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave<T>({ data, originalData, onSave, delay = 3000, enabled = true }: UseAutoSaveOptions<T>) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }

    if (!enabled) {
      return;
    }

    const currentData = JSON.stringify(data);
    const serverData = JSON.stringify(originalData);
    const hasChanges = currentData !== serverData;

    if (!hasChanges) {
      return;
    }

    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await onSave(data);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        setSaveStatus('error');
        console.error('Auto-save failed:', error);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [data, originalData, delay, enabled, onSave]);

  return saveStatus;
}
