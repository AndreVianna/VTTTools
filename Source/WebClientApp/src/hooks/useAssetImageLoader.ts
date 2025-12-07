import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiEndpoints } from '@/config/development';
import type { Asset, PlacedAsset } from '@/types/domain';

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
    const [imageCache, setImageCache] = useState<Map<string, HTMLImageElement>>(new Map());
    const onImagesLoadedRef = useRef(onImagesLoaded);

    useEffect(() => {
        onImagesLoadedRef.current = onImagesLoaded;
    }, [onImagesLoaded]);

    const loadImage = useCallback((url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            img.crossOrigin = 'use-credentials';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }, []);

    useEffect(() => {
        const loadImages = async () => {
            setImageCache((prevCache) => {
                const newCache = new Map(prevCache);
                const assetsToLoad: Array<{ id: string; url: string }> = [];

                for (const placedAsset of placedAssets) {
                    const imageUrl = getTokenImageUrl(placedAsset.asset);
                    if (imageUrl && !prevCache.has(placedAsset.assetId)) {
                        assetsToLoad.push({ id: placedAsset.assetId, url: imageUrl });
                    }
                }

                if (draggedAsset) {
                    const imageUrl = getTokenImageUrl(draggedAsset);
                    if (imageUrl && !prevCache.has(draggedAsset.id)) {
                        assetsToLoad.push({ id: draggedAsset.id, url: imageUrl });
                    }
                }

                if (assetsToLoad.length > 0) {
                    Promise.all(
                        assetsToLoad.map(async ({ id, url }) => {
                            try {
                                const img = await loadImage(url);
                                return { id, img, success: true };
                            } catch (error) {
                                console.error(`Failed to load image for asset ${id}:`, error);
                                return { id, img: null, success: false };
                            }
                        })
                    ).then((results) => {
                        setImageCache((cache) => {
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
                    });
                } else if (placedAssets.length === 0) {
                    onImagesLoadedRef.current?.();
                }

                return newCache;
            });
        };

        loadImages();
    }, [placedAssets, draggedAsset, loadImage]);

    return imageCache;
};
