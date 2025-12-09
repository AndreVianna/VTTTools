import { GroupName } from '@services/layerManager';
import type Konva from 'konva';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { Group, Image as KonvaImage, Rect } from 'react-konva';
import useImage from 'use-image';
import { useAuthenticatedImageUrl } from '@/hooks/useAuthenticatedImageUrl';

export interface BackgroundLayerProps {
  imageUrl?: string;
  backgroundColor?: string;
  stageWidth: number;
  stageHeight: number;
  onImageLoaded?: (dimensions: { width: number; height: number }) => void;
}

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({
  imageUrl,
  backgroundColor = '#f5f5f5',
  stageWidth,
  stageHeight,
  onImageLoaded,
}) => {
  const groupRef = useRef<Konva.Group>(null);
  const { blobUrl } = useAuthenticatedImageUrl(imageUrl);
  const [image, status] = useImage(blobUrl || '', 'anonymous');
  const hasNotifiedRef = useRef(false);

  useEffect(() => {
    if (status === 'loaded' && image && !hasNotifiedRef.current) {
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
  }, [status, image, onImageLoaded]);

  // Reset notification flag when URL changes
  useEffect(() => {
    hasNotifiedRef.current = false;
  }, [imageUrl]);

  return (
    <Group ref={groupRef} name={GroupName.Background}>
      {image && status === 'loaded' ? (
        <KonvaImage image={image} x={0} y={0} width={image.width} height={image.height} listening={false} />
      ) : (
        <Rect x={0} y={0} width={stageWidth} height={stageHeight} fill={backgroundColor} listening={false} />
      )}
    </Group>
  );
};
