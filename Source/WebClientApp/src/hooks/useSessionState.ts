import { useState, useCallback, useEffect, useRef } from 'react';

interface SessionStateOptions<T> {
  key: string;
  defaultValue: T;
  encounterId: string | undefined;
}

export function useSessionState<T>({ key, defaultValue, encounterId }: SessionStateOptions<T>): [T, (value: T | ((prev: T) => T)) => void] {
  const storageKey = encounterId ? `${key}_${encounterId}` : key;

  const getStoredValue = useCallback((): T => {
    try {
      const item = sessionStorage.getItem(storageKey);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  }, [storageKey, defaultValue]);

  const [value, setValue] = useState<T>(getStoredValue);
  const prevStorageKeyRef = useRef(storageKey);

  useEffect(() => {
    // Reload value when storage key changes (e.g., switching encounters)
    if (prevStorageKeyRef.current !== storageKey) {
      const newValue = getStoredValue();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(newValue);
      prevStorageKeyRef.current = storageKey;
    }
  }, [storageKey, getStoredValue]);

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const valueToStore = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue;
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(valueToStore));
      } catch {
        console.warn(`Failed to store ${storageKey} in sessionStorage`);
      }
      return valueToStore;
    });
  }, [storageKey]);

  return [value, setStoredValue];
}
