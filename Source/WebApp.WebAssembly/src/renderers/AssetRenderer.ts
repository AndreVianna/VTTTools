class AssetRenderer {
    static render(assets: IAsset[], layer: ICanvasLayer | null): void {
        if (!layer?.ctx) return;

        this.clearLayer(layer!);
        
        if (!assets || assets.length === 0) return;

        assets.forEach(asset => this.renderSingleAsset(layer!.ctx, asset));
    }

    private static clearLayer(layer: ICanvasLayer): void {
        layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
    }

    private static renderSingleAsset(ctx: CanvasRenderingContext2D, asset: IAsset): void {
        const position = this.calculateAssetPosition(asset);
        const size = this.calculateAssetSize(asset);

        if (asset.imageUrl) {
            this.renderAssetImage(ctx, asset, position, size);
        } else {
            this.renderAssetShape(ctx, asset, position, size);
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

    private static renderAssetImage(ctx: CanvasRenderingContext2D, asset: IAsset, position: IPoint, size: ISize): void {
        ImageCache.loadImage(asset.imageUrl!, img => {
            ctx.drawImage(img, position.x - size.width / 2, position.y - size.height / 2, size.width, size.height);
            this.renderAssetDecorations(ctx, asset, position, size);
        });
    }

    private static renderAssetShape(ctx: CanvasRenderingContext2D, asset: IAsset, position: IPoint, size: ISize): void {
        ctx.beginPath();
        ctx.ellipse(position.x, position.y, size.width / 2, size.height / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = asset.color || RenderConstants.defaultAssetColor;
        ctx.fill();
        this.renderAssetDecorations(ctx, asset, position, size);
    }

    private static renderAssetDecorations(ctx: CanvasRenderingContext2D, asset: IAsset, position: IPoint, size: ISize): void {
        if (asset.isSelected) {
            this.renderSelectionBorder(ctx, asset, position, size);
        }

        if (asset.isLocked) {
            this.renderLockIcon(ctx, position, size);
        }

        this.renderAssetName(ctx, asset, position, size);
    }

    private static renderSelectionBorder(ctx: CanvasRenderingContext2D, asset: IAsset, position: IPoint, size: ISize): void {
        ctx.strokeStyle = RenderConstants.selectionStrokeStyle;
        ctx.lineWidth = RenderConstants.selectionBorderWidth;

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

    private static renderLockIcon(ctx: CanvasRenderingContext2D, position: IPoint, size: ISize): void {
        ctx.font = RenderConstants.lockIconFont;
        ctx.fillStyle = RenderConstants.lockIconColor;
        ctx.fillText("🔒", position.x - RenderConstants.lockIconOffset, position.y - Math.max(size.width, size.height) / 2 - 5);
    }

    private static renderAssetName(ctx: CanvasRenderingContext2D, asset: IAsset, position: IPoint, size: ISize): void {
        ctx.font = RenderConstants.assetNameFont;
        ctx.fillStyle = RenderConstants.assetNameColor;
        ctx.textAlign = "center";
        ctx.fillText(asset.name || "Asset", position.x, position.y + Math.max(size.width, size.height) / 2 + 15);
    }
}
