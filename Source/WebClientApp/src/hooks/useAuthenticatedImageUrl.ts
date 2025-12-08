import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

interface UseAuthenticatedImageUrlResult {
    blobUrl: string | null;
    isLoading: boolean;
    error: Error | null;
}

const imageCache = new Map<string, { blobUrl: string; refCount: number }>();

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

export function useAuthenticatedImageUrl(
    resourceUrl: string | null | undefined
): UseAuthenticatedImageUrlResult {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const urlRef = useRef(resourceUrl);
    const abortControllerRef = useRef<AbortController | null>(null);

    const token = useSelector((state: RootState) => state.auth.token);

    useEffect(() => {
        urlRef.current = resourceUrl;

        if (!resourceUrl) {
            setBlobUrl(null);
            setIsLoading(false);
            setError(null);
            return;
        }

        const cached = imageCache.get(resourceUrl);
        if (cached) {
            cached.refCount++;
            setBlobUrl(cached.blobUrl);
            setIsLoading(false);
            return;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        const fetchImage = async () => {
            if (!token) {
                setError(new Error('Not authenticated'));
                return;
            }

            setIsLoading(true);
            setError(null);

            const fetchUrl = normalizeToRelativeUrl(resourceUrl);

            try {
                const response = await fetch(fetchUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    signal: abortControllerRef.current?.signal,
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch image: ${response.status}`);
                }

                const blob = await response.blob();
                const url = URL.createObjectURL(blob);

                imageCache.set(resourceUrl, { blobUrl: url, refCount: 1 });

                if (urlRef.current === resourceUrl) {
                    setBlobUrl(url);
                }
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') {
                    return;
                }
                if (urlRef.current === resourceUrl) {
                    setError(err instanceof Error ? err : new Error('Unknown error'));
                    setBlobUrl(null);
                }
            } finally {
                if (urlRef.current === resourceUrl) {
                    setIsLoading(false);
                }
            }
        };

        fetchImage();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            const url = urlRef.current;
            if (url) {
                const cached = imageCache.get(url);
                if (cached) {
                    cached.refCount--;
                    if (cached.refCount <= 0) {
                        URL.revokeObjectURL(cached.blobUrl);
                        imageCache.delete(url);
                    }
                }
            }
        };
    }, [resourceUrl, token]);

    return { blobUrl, isLoading, error };
}

export function clearImageCache(): void {
    imageCache.forEach((cached) => {
        URL.revokeObjectURL(cached.blobUrl);
    });
    imageCache.clear();
}

export default useAuthenticatedImageUrl;
