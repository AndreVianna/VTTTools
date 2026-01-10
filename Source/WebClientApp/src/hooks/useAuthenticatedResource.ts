import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

interface UseAuthenticatedResourceOptions {
    enabled?: boolean;
}

interface UseAuthenticatedResourceResult {
    url: string | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}

function normalizeToRelativeUrl(url: string): string {
    if (url.startsWith('/')) {
        return url;
    }

    try {
        const parsed = new URL(url);
        return parsed.pathname + parsed.search + parsed.hash;
    } catch {
        return url;
    }
}

export function useAuthenticatedResource(
    resourcePath: string | null | undefined,
    options: UseAuthenticatedResourceOptions = {}
): UseAuthenticatedResourceResult {
    const { enabled = true } = options;
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const previousUrlRef = useRef<string | null>(null);

    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    const fetchResource = useCallback(async () => {
        if (!resourcePath || !enabled || !isAuthenticated) {
            setBlobUrl(null);
            return;
        }

        const normalizedPath = normalizeToRelativeUrl(resourcePath);
        const fullUrl = normalizedPath.startsWith('/api/')
            ? normalizedPath
            : `/api/resources/${normalizedPath}`;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(fullUrl, {
                credentials: 'include',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch resource: ${response.status}`);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            if (previousUrlRef.current) {
                URL.revokeObjectURL(previousUrlRef.current);
            }
            previousUrlRef.current = url;

            setBlobUrl(url);
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                return;
            }
            setError(err instanceof Error ? err : new Error('Unknown error'));
            setBlobUrl(null);
        } finally {
            setIsLoading(false);
        }
    }, [resourcePath, enabled, isAuthenticated]);

    useEffect(() => {
        fetchResource();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (previousUrlRef.current) {
                URL.revokeObjectURL(previousUrlRef.current);
                previousUrlRef.current = null;
            }
        };
    }, [fetchResource]);

    return {
        url: blobUrl,
        isLoading,
        error,
        refetch: fetchResource,
    };
}

const resourceCache = new Map<string, { url: string; refCount: number }>();

export function useAuthenticatedResourceCached(
    resourcePath: string | null | undefined,
    options: UseAuthenticatedResourceOptions = {}
): UseAuthenticatedResourceResult {
    const { enabled = true } = options;
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const resourcePathRef = useRef(resourcePath);

    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    const fetchResource = useCallback(async () => {
        if (!resourcePath || !enabled || !isAuthenticated) {
            setBlobUrl(null);
            return;
        }

        const cacheKey = resourcePath;
        const cached = resourceCache.get(cacheKey);
        if (cached) {
            cached.refCount++;
            setBlobUrl(cached.url);
            return;
        }

        const normalizedPath = normalizeToRelativeUrl(resourcePath);
        const fullUrl = normalizedPath.startsWith('/api/')
            ? normalizedPath
            : `/api/resources/${normalizedPath}`;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(fullUrl, {
                credentials: 'include',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch resource: ${response.status}`);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            resourceCache.set(cacheKey, { url, refCount: 1 });
            setBlobUrl(url);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
            setBlobUrl(null);
        } finally {
            setIsLoading(false);
        }
    }, [resourcePath, enabled, isAuthenticated]);

    useEffect(() => {
        resourcePathRef.current = resourcePath;
        fetchResource();

        return () => {
            const path = resourcePathRef.current;
            if (path) {
                const cached = resourceCache.get(path);
                if (cached) {
                    cached.refCount--;
                    if (cached.refCount <= 0) {
                        URL.revokeObjectURL(cached.url);
                        resourceCache.delete(path);
                    }
                }
            }
        };
    }, [fetchResource, resourcePath]);

    return {
        url: blobUrl,
        isLoading,
        error,
        refetch: fetchResource,
    };
}

export default useAuthenticatedResource;
