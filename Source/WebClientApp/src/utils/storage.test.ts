import { beforeEach, describe, expect, it, vi } from 'vitest';
import { storage } from './storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('getItem', () => {
    it('should retrieve and parse stored item', () => {
      localStorage.setItem('test', JSON.stringify({ value: 123 }));

      const result = storage.getItem<{ value: number }>('test');

      expect(result).toEqual({ value: 123 });
    });

    it('should return null for non-existent key', () => {
      const result = storage.getItem('nonexistent');

      expect(result).toBeNull();
    });

    it('should return null for corrupted data', () => {
      localStorage.setItem('corrupted', 'invalid json {');

      const result = storage.getItem('corrupted');

      expect(result).toBeNull();
    });

    it('should handle complex objects', () => {
      const complexObj = {
        nested: { deep: { value: 'test' } },
        array: [1, 2, 3],
        date: '2025-01-01',
      };

      localStorage.setItem('complex', JSON.stringify(complexObj));

      const result = storage.getItem('complex');

      expect(result).toEqual(complexObj);
    });
  });

  describe('setItem', () => {
    it('should store serialized item', () => {
      const data = { test: 'value', number: 42 };

      const success = storage.setItem('test', data);

      expect(success).toBe(true);
      expect(JSON.parse(localStorage.getItem('test') || '{}')).toEqual(data);
    });

    it('should warn about large items', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const largeData = { data: 'x'.repeat(6 * 1024 * 1024) };

      storage.setItem('large', largeData);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Storage quota warning'));
    });

    it('should handle quota exceeded error', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        const error = new Error('Quota exceeded');
        error.name = 'QuotaExceededError';
        throw error;
      });

      const success = storage.setItem('test', { data: 'test' });

      expect(success).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Storage quota exceeded', expect.any(Error));
    });

    it('should return false on other errors', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Generic error');
      });

      const success = storage.setItem('test', { data: 'test' });

      expect(success).toBe(false);
    });

    it('should handle primitive types', () => {
      expect(storage.setItem('string', 'test')).toBe(true);
      expect(storage.setItem('number', 123)).toBe(true);
      expect(storage.setItem('boolean', true)).toBe(true);
      expect(storage.setItem('null', null)).toBe(true);

      expect(storage.getItem('string')).toBe('test');
      expect(storage.getItem('number')).toBe(123);
      expect(storage.getItem('boolean')).toBe(true);
      expect(storage.getItem('null')).toBeNull();
    });
  });

  describe('removeItem', () => {
    it('should remove item from storage', () => {
      localStorage.setItem('test', 'value');

      storage.removeItem('test');

      expect(localStorage.getItem('test')).toBeNull();
    });

    it('should handle removal of non-existent item', () => {
      expect(() => storage.removeItem('nonexistent')).not.toThrow();
    });

    it('should handle errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Remove error');
      });

      storage.removeItem('test');

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should clear all items', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');

      storage.clear();

      expect(localStorage.length).toBe(0);
    });

    it('should handle errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'clear').mockImplementation(() => {
        throw new Error('Clear error');
      });

      storage.clear();

      expect(consoleErrorSpy).toHaveBeenCalled();
      vi.restoreAllMocks();
    });
  });

  describe('getSize', () => {
    beforeEach(() => {
      localStorage.clear();
      vi.restoreAllMocks();
    });

    it('should return size of stored item', () => {
      const data = { test: 'value' };
      localStorage.setItem('test', JSON.stringify(data));

      const size = storage.getSize('test');

      expect(size).toBeGreaterThan(0);
    });

    it('should return 0 for non-existent item', () => {
      const size = storage.getSize('nonexistent');

      expect(size).toBe(0);
    });

    it('should handle errors gracefully', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Get error');
      });

      const size = storage.getSize('test');

      expect(size).toBe(0);
      vi.restoreAllMocks();
    });
  });

  describe('getTotalSize', () => {
    beforeEach(() => {
      localStorage.clear();
      vi.restoreAllMocks();
    });

    it('should calculate total size of all items', () => {
      storage.setItem('item1', { data: 'test1' });
      storage.setItem('item2', { data: 'test2' });

      const totalSize = storage.getTotalSize();

      expect(totalSize).toBeGreaterThan(0);
    });

    it('should return 0 for empty storage', () => {
      const totalSize = storage.getTotalSize();

      expect(totalSize).toBe(0);
    });

    it('should handle errors gracefully', () => {
      storage.setItem('test', { data: 'value' });
      vi.spyOn(storage, 'getSize').mockImplementation(() => {
        throw new Error('Size error');
      });

      const totalSize = storage.getTotalSize();

      expect(totalSize).toBe(0);
      vi.restoreAllMocks();
    });
  });
});
