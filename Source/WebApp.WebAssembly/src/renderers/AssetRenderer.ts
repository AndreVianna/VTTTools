class AssetRenderer {
    static render(layer: ICanvasLayer | null, currentState: IBuilderState, newState: IBuilderState): void {
        const ctx = layer?.ctx;
        if (!ctx) return;
        this.clearLayer(layer!);
        if (newState.assets.length === 0) return;
        this.applyZoomTransform(ctx, currentState, newState);
        this.drawAssets(ctx, newState.assets, newState.zoomLevel);
    }

    private static clearLayer(layer: ICanvasLayer): void {
        layer.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset to identity matrix
        layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
    }

    private static applyZoomTransform(ctx: CanvasRenderingContext2D, currentState: IBuilderState, newState: IBuilderState): void {
        ctx.translate(newState.zoomCenter.x, newState.zoomCenter.y);
        ctx.scale(newState.zoomLevel, newState.zoomLevel);
        ctx.translate(-newState.zoomCenter.x, -newState.zoomCenter.y);
    }

    private static drawAssets(ctx: CanvasRenderingContext2D, assets: IAsset[], zoomLevel: number): void {
        assets.forEach(asset => this.drawAsset(ctx, asset, zoomLevel));
    }

    private static drawAsset(ctx: CanvasRenderingContext2D, asset: IAsset, zoomLevel: number): void {
        const position = this.calculateAssetPosition(asset);
        const size = this.calculateAssetSize(asset);
        if (asset.imageUrl) {
            this.renderAssetImage(ctx, asset, position, size, zoomLevel);
        } else {
            this.renderAssetShape(ctx, asset, position, size, zoomLevel);
        }
    }

    private static calculateAssetPosition(asset: IAsset): IPoint {
        return {
            x: (asset.position?.x || 0) + RenderConstants.canvasPadding,
            y: (asset.position?.y || 0) + RenderConstants.canvasPadding
        };
    }

    private static calculateAssetSize(asset: IAsset): ISize {
        const baseWidth = asset.size?.width || RenderConstants.defaultAssetSize;
        const baseHeight = asset.size?.height || RenderConstants.defaultAssetSize;
        const scale = asset.scale || 1;

        return {
            width: baseWidth * scale,
            height: baseHeight * scale
        };
    }

    private static renderAssetImage(ctx: CanvasRenderingContext2D, asset: IAsset, position: IPoint, size: ISize, zoomLevel: number): void {
        ImageCache.loadImage(asset.imageUrl!, img => {
            ctx.drawImage(img, position.x - size.width / 2, position.y - size.height / 2, size.width, size.height);
            this.renderAssetDecorations(ctx, asset, position, size, zoomLevel);
        });
    }

    private static renderAssetShape(ctx: CanvasRenderingContext2D, asset: IAsset, position: IPoint, size: ISize, zoomLevel: number): void {
        ctx.beginPath();
        ctx.ellipse(position.x, position.y, size.width / 2, size.height / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = asset.color || RenderConstants.defaultAssetColor;
        ctx.fill();
        this.renderAssetDecorations(ctx, asset, position, size, zoomLevel);
    }

    private static renderAssetDecorations(ctx: CanvasRenderingContext2D, asset: IAsset, position: IPoint, size: ISize, zoomLevel: number): void {
        if (asset.isSelected) {
            this.renderSelectionBorder(ctx, asset, position, size, zoomLevel);
        }

        if (asset.isLocked) {
            this.renderLockIcon(ctx, position, size, zoomLevel);
        }

        this.renderAssetName(ctx, asset, position, size, zoomLevel);
    }

    private static renderSelectionBorder(ctx: CanvasRenderingContext2D, asset: IAsset, position: IPoint, size: ISize, zoomLevel: number): void {
        ctx.strokeStyle = RenderConstants.selectionStrokeStyle;
        ctx.lineWidth = RenderConstants.selectionBorderWidth / zoomLevel; // Adjust line width for zoom

        if (asset.imageUrl) {
            this.renderRectangularSelection(ctx, position, size);
        } else {
            this.renderEllipticalSelection(ctx, position, size);
        }
    }

    private static renderRectangularSelection(ctx: CanvasRenderingContext2D, position: IPoint, size: ISize): void {
        const padding = RenderConstants.selectionBorderPadding;
        ctx.strokeRect(
            position.x - size.width / 2 - padding,
            position.y - size.height / 2 - padding,
            size.width + padding * 2,
            size.height + padding * 2
        );
    }

    private static renderEllipticalSelection(ctx: CanvasRenderingContext2D, position: IPoint, size: ISize): void {
        const padding = RenderConstants.selectionBorderPadding;
        ctx.beginPath();
        ctx.ellipse(position.x, position.y, size.width / 2 + padding, size.height / 2 + padding, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    private static renderLockIcon(ctx: CanvasRenderingContext2D, position: IPoint, size: ISize, zoomLevel: number): void {
        const fontSize = 16 / zoomLevel; // Adjust font size for zoom level
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = RenderConstants.lockIconColor;
        ctx.fillText("🔒", position.x - RenderConstants.lockIconOffset, position.y - Math.max(size.width, size.height) / 2 - 5);
    }

    private static renderAssetName(ctx: CanvasRenderingContext2D, asset: IAsset, position: IPoint, size: ISize, zoomLevel: number): void {
        const fontSize = 12 / zoomLevel; // Adjust font size for zoom level
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = RenderConstants.assetNameColor;
        ctx.textAlign = "center";
        ctx.fillText(asset.name || "Asset", position.x, position.y + Math.max(size.width, size.height) / 2 + 15);
    }
}
