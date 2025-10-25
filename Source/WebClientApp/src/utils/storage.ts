const QUOTA_WARNING_THRESHOLD = 5 * 1024 * 1024;

export const storage = {
    getItem: <T = any>(key: string): T | null => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Failed to get item from storage: ${key}`, error);
            return null;
        }
    },

    setItem: <T = any>(key: string, value: T): boolean => {
        try {
            const serialized = JSON.stringify(value);
            const size = new Blob([serialized]).size;

            if (size > QUOTA_WARNING_THRESHOLD) {
                console.warn(`Storage quota warning: ${key} is ${size} bytes`);
            }

            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            if (error instanceof Error && error.name === 'QuotaExceededError') {
                console.error('Storage quota exceeded', error);
            } else {
                console.error(`Failed to set item in storage: ${key}`, error);
            }
            return false;
        }
    },

    removeItem: (key: string): void => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Failed to remove item from storage: ${key}`, error);
        }
    },

    clear: (): void => {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Failed to clear storage', error);
        }
    },

    getSize: (key: string): number => {
        try {
            const item = localStorage.getItem(key);
            return item ? new Blob([item]).size : 0;
        } catch (_error) {
            return 0;
        }
    },

    getTotalSize: (): number => {
        try {
            let total = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    total += storage.getSize(key);
                }
            }
            return total;
        } catch (_error) {
            return 0;
        }
    }
};
