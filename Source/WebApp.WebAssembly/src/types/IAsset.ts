interface IAsset {
    id: string;
    number: number;
    name: string;
    position: IPoint;
    scale: number;
    size: ISize;
    isSelected: boolean;
    isLocked: boolean;
    imageUrl?: string;
    color?: string;
}
