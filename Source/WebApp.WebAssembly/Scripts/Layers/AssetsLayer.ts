class AssetsLayer extends Layer implements IAssetsLayer {
    readonly assets: IAsset[];

    constructor(assets: IAsset[]) {
        super("assets", document.querySelector<HTMLCanvasElement>(`#assets-layer`)!);
        this.assets = assets;
    }

    protected drawLayer(): void {
        this.assets.forEach(asset => this.drawAsset(asset));
    }

    private drawAsset(asset: IAsset): void {
        const position = this.calculateAssetPosition(asset);
        const size = this.calculateAssetSize(asset);
        if (asset.imageUrl) {
            this.renderAssetImage(asset, position, size);
        } else {
            this.renderAssetShape(asset, position, size);
        }
    }

    private calculateAssetPosition(asset: IAsset): IPoint {
        return {
            x: (asset.position?.x || 0) + RenderConstants.canvasPadding,
            y: (asset.position?.y || 0) + RenderConstants.canvasPadding
        };
    }

    private calculateAssetSize(asset: IAsset): ISize {
        const baseWidth = asset.size?.width || RenderConstants.defaultAssetSize;
        const baseHeight = asset.size?.height || RenderConstants.defaultAssetSize;
        const scale = asset.scale || 1;

        return {
            width: baseWidth * scale,
            height: baseHeight * scale
        };
    }

    private renderAssetImage(asset: IAsset, position: IPoint, size: ISize): void {
        ImageCache.loadImage(asset.imageUrl!, img => {
            this.ctx.drawImage(img, position.x - size.width / 2, position.y - size.height / 2, size.width, size.height);
            this.renderAssetDecorations(asset, position, size);
        });
    }

    private renderAssetShape(asset: IAsset, position: IPoint, size: ISize): void {
        this.ctx.beginPath();
        this.ctx.ellipse(position.x, position.y, size.width / 2, size.height / 2, 0, 0, Math.PI * 2);
        this.ctx.fillStyle = asset.color || RenderConstants.defaultAssetColor;
        this.ctx.fill();
        this.renderAssetDecorations(asset, position, size);
    }

    private renderAssetDecorations(asset: IAsset, position: IPoint, size: ISize): void {
        if (asset.isSelected) {
            this.renderSelectionBorder(asset, position, size);
        }

        if (asset.isLocked) {
            this.renderLockIcon(position, size);
        }

        this.renderAssetName(asset, position, size);
    }

    private renderSelectionBorder(asset: IAsset, position: IPoint, size: ISize): void {
        this.ctx.strokeStyle = RenderConstants.selectionStrokeStyle;
        this.ctx.lineWidth = RenderConstants.selectionBorderWidth;
        this.renderRectangularSelection(position, size);
    }

    private renderRectangularSelection(position: IPoint, size: ISize): void {
        const padding = RenderConstants.selectionBorderPadding;
        this.ctx.strokeRect(
            position.x - size.width / 2 - padding,
            position.y - size.height / 2 - padding,
            size.width + padding * 2,
            size.height + padding * 2
        );
    }

    private renderLockIcon(position: IPoint, size: ISize): void {
        this.ctx.font = RenderConstants.lockIconFont;
        this.ctx.fillStyle = RenderConstants.lockIconColor;
        this.ctx.fillText("🔒", position.x - RenderConstants.lockIconOffset, position.y - Math.max(size.width, size.height) / 2 - 5);
    }

    private renderAssetName(asset: IAsset, position: IPoint, size: ISize): void {
        this.ctx.font = RenderConstants.assetNameFont;
        this.ctx.fillStyle = RenderConstants.assetNameColor;
        this.ctx.textAlign = "center";
        this.ctx.fillText(asset.name || "Asset", position.x, position.y + Math.max(size.width, size.height) / 2 + 15);
    }
}
