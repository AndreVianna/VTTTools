import { GroupName } from '@services/layerManager';
import type Konva from 'konva';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Group, Image as KonvaImage, Rect } from 'react-konva';
import useImage from 'use-image';
import { useAuthenticatedImageUrl } from '@/hooks/useAuthenticatedImageUrl';

export interface BackgroundLayerProps {
    imageUrl?: string;
    backgroundColor?: string;
    stageWidth: number;
    stageHeight: number;
    onImageLoaded?: (dimensions: { width: number; height: number }) => void;
    contentType?: string;
    /** Whether the video should be muted. Defaults to true for autoplay compatibility. */
    muted?: boolean;
}

const isVideoContentType = (contentType?: string): boolean => {
    return contentType?.startsWith('video/') ?? false;
};

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({
    imageUrl,
    backgroundColor = '#f5f5f5',
    stageWidth,
    stageHeight,
    onImageLoaded,
    contentType,
    muted = true,
}) => {
    const groupRef = useRef<Konva.Group>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
    const animationRef = useRef<number | null>(null);
    const { blobUrl } = useAuthenticatedImageUrl(imageUrl);
    const isVideo = isVideoContentType(contentType);

    // Only use image hook for non-video content
    const [image, status] = useImage(
        !isVideo && blobUrl ? blobUrl : '',
        'anonymous'
    );
    const hasNotifiedRef = useRef(false);

    // Handle video element setup
    useEffect(() => {
        if (isVideo && blobUrl) {
            const video = document.createElement('video');
            video.src = blobUrl;
            video.crossOrigin = 'anonymous';
            // Always start muted for autoplay compatibility, then update via useEffect on line 105
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.autoplay = true;

            video.addEventListener('loadedmetadata', () => {
                if (onImageLoaded && !hasNotifiedRef.current) {
                    hasNotifiedRef.current = true;
                    onImageLoaded({ width: video.videoWidth, height: video.videoHeight });
                }
            });

            video.addEventListener('canplay', () => {
                videoRef.current = video;
                setVideoElement(video);
                video.play().catch(() => {
                    // Autoplay might be blocked, that's okay
                });
            });

            return () => {
                video.pause();
                video.src = '';
                videoRef.current = null;
                setVideoElement(null);
            };
        }
        return undefined;
    }, [isVideo, blobUrl, onImageLoaded]);

    // Animation loop for video
    useEffect(() => {
        if (!videoElement || !groupRef.current) return;

        const animate = () => {
            const layer = groupRef.current?.getLayer();
            if (layer) {
                layer.batchDraw();
            }
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [videoElement]);

    // Handle dynamic muted changes (only after video is ready and playing)
    useEffect(() => {
        if (videoRef.current && videoElement) {
            videoRef.current.muted = muted;
        }
    }, [muted, videoElement]);

    // Handle image loaded callback
    useEffect(() => {
        if (!isVideo && status === 'loaded' && image && !hasNotifiedRef.current) {
            hasNotifiedRef.current = true;

            if (onImageLoaded) {
                onImageLoaded({ width: image.width, height: image.height });
            }

            requestAnimationFrame(() => {
                const stage = groupRef.current?.getStage();
                if (stage) {
                    stage.draw();
                }
            });
        }
    }, [isVideo, status, image, onImageLoaded]);

    // Reset notification flag when URL changes
    useEffect(() => {
        hasNotifiedRef.current = false;
    }, [imageUrl]);

    const renderBackground = () => {
        // Video background
        if (isVideo && videoElement) {
            return (
                <KonvaImage
                    image={videoElement}
                    x={0}
                    y={0}
                    width={videoElement.videoWidth || stageWidth}
                    height={videoElement.videoHeight || stageHeight}
                    listening={false}
                />
            );
        }

        // Image background
        if (!isVideo && image && status === 'loaded') {
            return (
                <KonvaImage
                    image={image}
                    x={0}
                    y={0}
                    width={image.width}
                    height={image.height}
                    listening={false}
                />
            );
        }

        // Default placeholder
        return (
            <Rect
                x={0}
                y={0}
                width={stageWidth}
                height={stageHeight}
                fill={backgroundColor}
                listening={false}
            />
        );
    };

    return (
        <Group ref={groupRef} name={GroupName.Background}>
            {renderBackground()}
        </Group>
    );
};
