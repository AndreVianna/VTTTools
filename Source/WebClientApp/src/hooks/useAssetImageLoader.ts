import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { getApiEndpoints } from '@/config/development';
import type { RootState } from '@/store';
import type { Asset, PlacedAsset } from '@/types/domain';

const imageCache = new Map<string, { img: HTMLImageElement; blobUrl: string; refCount: number }>();

const getTokenImageUrl = (asset: Asset): string | null => {
    const mediaBaseUrl = getApiEndpoints().media;

    if (asset.tokens.length > 0 && asset.tokens[0]) {
        return `${mediaBaseUrl}/${asset.tokens[0].id}`;
    }

    if (asset.portrait) {
        return `${mediaBaseUrl}/${asset.portrait.id}`;
    }

    return null;
};

interface UseAssetImageLoaderProps {
    placedAssets: PlacedAsset[];
    draggedAsset: Asset | null;
    onImagesLoaded?: (() => void) | undefined;
}

export const useAssetImageLoader = ({
    placedAssets,
    draggedAsset,
    onImagesLoaded,
}: UseAssetImageLoaderProps) => {
    const [localImageCache, setLocalImageCache] = useState<Map<string, HTMLImageElement>>(new Map());
    const onImagesLoadedRef = useRef(onImagesLoaded);
    const loadedAssetIdsRef = useRef<Set<string>>(new Set());

    const token = useSelector((state: RootState) => state.auth.token);

    useEffect(() => {
        onImagesLoadedRef.current = onImagesLoaded;
    }, [onImagesLoaded]);

    const loadImage = useCallback(async (url: string, token: string): Promise<HTMLImageElement> => {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Requested-With': 'XMLHttpRequest',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        return new Promise((resolve, reject) => {
            const img = new window.Image();
            img.onload = () => resolve(img);
            img.onerror = () => {
                URL.revokeObjectURL(blobUrl);
                reject(new Error('Failed to load image from blob'));
            };
            img.src = blobUrl;
            (img as HTMLImageElement & { _blobUrl: string })._blobUrl = blobUrl;
        });
    }, []);

    useEffect(() => {
        if (!token) return;

        const loadImages = async () => {
            const assetsToLoad: Array<{ id: string; url: string }> = [];

            for (const placedAsset of placedAssets) {
                const imageUrl = getTokenImageUrl(placedAsset.asset);
                if (imageUrl && !loadedAssetIdsRef.current.has(placedAsset.assetId)) {
                    const cached = imageCache.get(placedAsset.assetId);
                    if (cached) {
                        cached.refCount++;
                        setLocalImageCache((prev) => {
                            const newCache = new Map(prev);
                            newCache.set(placedAsset.assetId, cached.img);
                            return newCache;
                        });
                        loadedAssetIdsRef.current.add(placedAsset.assetId);
                    } else {
                        assetsToLoad.push({ id: placedAsset.assetId, url: imageUrl });
                    }
                }
            }

            if (draggedAsset) {
                const imageUrl = getTokenImageUrl(draggedAsset);
                if (imageUrl && !loadedAssetIdsRef.current.has(draggedAsset.id)) {
                    const cached = imageCache.get(draggedAsset.id);
                    if (cached) {
                        cached.refCount++;
                        setLocalImageCache((prev) => {
                            const newCache = new Map(prev);
                            newCache.set(draggedAsset.id, cached.img);
                            return newCache;
                        });
                        loadedAssetIdsRef.current.add(draggedAsset.id);
                    } else {
                        assetsToLoad.push({ id: draggedAsset.id, url: imageUrl });
                    }
                }
            }

            if (assetsToLoad.length > 0) {
                const results = await Promise.all(
                    assetsToLoad.map(async ({ id, url }) => {
                        try {
                            const img = await loadImage(url, token);
                            const blobUrl = (img as HTMLImageElement & { _blobUrl: string })._blobUrl;
                            imageCache.set(id, { img, blobUrl, refCount: 1 });
                            loadedAssetIdsRef.current.add(id);
                            return { id, img, success: true };
                        } catch (error) {
                            console.error(`Failed to load image for asset ${id}:`, error);
                            return { id, img: null, success: false };
                        }
                    })
                );

                setLocalImageCache((cache) => {
                    const updated = new Map(cache);
                    for (const result of results) {
                        if (result.success && result.img) {
                            updated.set(result.id, result.img);
                        }
                    }
                    return updated;
                });

                const allSuccessful = results.every((r) => r.success);
                if (allSuccessful || placedAssets.length === 0) {
                    onImagesLoadedRef.current?.();
                }
            } else if (placedAssets.length === 0) {
                onImagesLoadedRef.current?.();
            }
        };

        loadImages();
    }, [placedAssets, draggedAsset, loadImage, token]);

    useEffect(() => {
        return () => {
            loadedAssetIdsRef.current.forEach((id) => {
                const cached = imageCache.get(id);
                if (cached) {
                    cached.refCount--;
                    if (cached.refCount <= 0) {
                        URL.revokeObjectURL(cached.blobUrl);
                        imageCache.delete(id);
                    }
                }
            });
        };
    }, []);

    return localImageCache;
};
