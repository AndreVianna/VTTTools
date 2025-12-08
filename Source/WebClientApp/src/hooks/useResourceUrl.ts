import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

interface UseResourceUrlResult {
    url: string | null;
    isLoading: boolean;
    error: Error | null;
}

interface CacheEntry {
    blobUrl: string;
    refCount: number;
    promise?: Promise<string>;
}

const resourceCache = new Map<string, CacheEntry>();

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

export function useResourceUrl(resourceId: string | null | undefined): UseResourceUrlResult {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const resourceIdRef = useRef(resourceId);

    const token = useSelector((state: RootState) => state.auth.token);

    useEffect(() => {
        resourceIdRef.current = resourceId;

        if (!resourceId) {
            setBlobUrl(null);
            setIsLoading(false);
            setError(null);
            return;
        }

        if (!token) {
            setError(new Error('Not authenticated'));
            return;
        }

        const cacheKey = resourceId;
        const cached = resourceCache.get(cacheKey);

        if (cached?.blobUrl) {
            cached.refCount++;
            setBlobUrl(cached.blobUrl);
            setIsLoading(false);
            return;
        }

        if (cached?.promise) {
            setIsLoading(true);
            cached.refCount++;
            cached.promise
                .then((url) => {
                    if (resourceIdRef.current === resourceId) {
                        setBlobUrl(url);
                        setIsLoading(false);
                    }
                })
                .catch((err) => {
                    if (resourceIdRef.current === resourceId) {
                        setError(err instanceof Error ? err : new Error('Unknown error'));
                        setIsLoading(false);
                    }
                });
            return;
        }

        setIsLoading(true);
        setError(null);

        const fetchUrl = normalizeToRelativeUrl(`/api/resources/${resourceId}`);

        const fetchPromise = fetch(fetchUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch resource: ${response.status}`);
                }
                return response.blob();
            })
            .then((blob) => {
                const url = URL.createObjectURL(blob);
                const entry = resourceCache.get(cacheKey);
                if (entry) {
                    entry.blobUrl = url;
                    delete entry.promise;
                }
                return url;
            });

        resourceCache.set(cacheKey, { blobUrl: '', refCount: 1, promise: fetchPromise });

        fetchPromise
            .then((url) => {
                if (resourceIdRef.current === resourceId) {
                    setBlobUrl(url);
                }
            })
            .catch((err) => {
                if (resourceIdRef.current === resourceId) {
                    setError(err instanceof Error ? err : new Error('Unknown error'));
                    setBlobUrl(null);
                }
                resourceCache.delete(cacheKey);
            })
            .finally(() => {
                if (resourceIdRef.current === resourceId) {
                    setIsLoading(false);
                }
            });

        return () => {
            const entry = resourceCache.get(cacheKey);
            if (entry) {
                entry.refCount--;
                if (entry.refCount <= 0 && entry.blobUrl) {
                    URL.revokeObjectURL(entry.blobUrl);
                    resourceCache.delete(cacheKey);
                }
            }
        };
    }, [resourceId, token]);

    return { url: blobUrl, isLoading, error };
}

export function clearResourceCache(): void {
    resourceCache.forEach((cached) => {
        URL.revokeObjectURL(cached.blobUrl);
    });
    resourceCache.clear();
}

interface UseResourceImageResult {
    image: HTMLImageElement | null;
    isLoading: boolean;
    error: Error | null;
}

export function useResourceImage(resourceId: string | null | undefined): UseResourceImageResult {
    const { url, isLoading: urlLoading, error: urlError } = useResourceUrl(resourceId);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState<Error | null>(null);

    useEffect(() => {
        if (!url) {
            setImage(null);
            setImageLoading(false);
            setImageError(null);
            return;
        }

        let isMounted = true;
        setImageLoading(true);
        const img = new window.Image();

        img.onload = () => {
            if (!isMounted) return;
            setImage(img);
            setImageLoading(false);
            setImageError(null);
        };

        img.onerror = () => {
            if (!isMounted) return;
            setImage(null);
            setImageLoading(false);
            setImageError(new Error('Failed to load image'));
        };

        img.src = url;

        return () => {
            isMounted = false;
            img.onload = null;
            img.onerror = null;
        };
    }, [url]);

    return {
        image,
        isLoading: urlLoading || imageLoading,
        error: urlError || imageError,
    };
}

export default useResourceUrl;
