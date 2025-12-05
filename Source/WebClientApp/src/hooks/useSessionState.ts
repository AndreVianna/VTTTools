import { useState, useCallback, useEffect } from 'react';

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

  useEffect(() => {
    setValue(getStoredValue());
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
