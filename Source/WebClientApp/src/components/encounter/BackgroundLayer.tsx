import { GroupName } from '@services/layerManager';
import type React from 'react';
import { Group, Image as KonvaImage, Rect } from 'react-konva';
import useImage from 'use-image';
import { useAuthenticatedImageUrl } from '@/hooks/useAuthenticatedImageUrl';

export interface BackgroundLayerProps {
  imageUrl?: string;
  backgroundColor?: string;
  stageWidth: number;
  stageHeight: number;
}

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({
  imageUrl,
  backgroundColor = '#f5f5f5',
  stageWidth,
  stageHeight,
}) => {
  const { blobUrl } = useAuthenticatedImageUrl(imageUrl);
  const [image, status] = useImage(blobUrl || '', 'anonymous');

  return (
    <Group name={GroupName.Background}>
      {image && status === 'loaded' ? (
        <KonvaImage image={image} x={0} y={0} width={image.width} height={image.height} listening={false} />
      ) : (
        <Rect x={0} y={0} width={stageWidth} height={stageHeight} fill={backgroundColor} listening={false} />
      )}
    </Group>
  );
};
