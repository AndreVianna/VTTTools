"use strict";
class RenderConstants {
}
RenderConstants.canvasPadding = 200;
RenderConstants.defaultAssetSize = 40;
RenderConstants.defaultGridCellSize = 50;
RenderConstants.selectionBorderWidth = 2;
RenderConstants.selectionBorderPadding = 3;
RenderConstants.lockIconOffset = 8;
RenderConstants.assetNameFont = "12px Arial";
RenderConstants.lockIconFont = "16px Arial";
RenderConstants.gridMessageFont = "20px Arial";
RenderConstants.gridStrokeStyle = "rgba(0, 0, 0, 0.3)";
RenderConstants.selectionStrokeStyle = "rgba(0, 126, 255, 0.8)";
RenderConstants.defaultAssetColor = "rgba(100, 100, 100, 0.7)";
RenderConstants.lockIconColor = "rgba(255, 0, 0, 0.7)";
RenderConstants.assetNameColor = "black";
RenderConstants.gridMessageColor = "rgba(0, 0, 0, 0.5)";
class ImageCache {
    static loadImage(src, onLoad) {
        if (this.cache.has(src)) {
            const cached = this.cache.get(src);
            if (cached.complete) {
                onLoad(cached);
                return;
            }
        }
        const img = new Image();
        img.onload = () => onLoad(img);
        img.onerror = () => console.error("Failed to load image:", src);
        img.src = src;
        this.cache.set(src, img);
    }
    static async getImageDimensions(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.width, height: img.height });
            img.onerror = () => reject("Failed to load image");
            img.src = url;
        });
    }
}
ImageCache.cache = new Map();
class DomUtils {
    static getCanvasBoundingRect(canvasContainer) {
        const canvas = canvasContainer.querySelector(".scene-canvas-layer");
        if (!canvas)
            return null;
        const rect = canvas.getBoundingClientRect();
        return {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
        };
    }
    static getScrollPosition(container) {
        return {
            left: container.scrollLeft,
            top: container.scrollTop
        };
    }
    static setScrollPosition(container, position) {
        container.scrollLeft = position.left;
        container.scrollTop = position.top;
    }
    static setCursor(container, cursor) {
        container.style.cursor = cursor;
    }
}
class CanvasManager {
    static initializeCanvas(container, canvasSize, sceneLayers) {
        this.clearContainer(container);
        this.createCanvasLayers(container, canvasSize, sceneLayers);
        this.centerCanvas(container, canvasSize);
    }
    static clearContainer(container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }
    static createCanvasLayers(container, canvasSize, sceneLayers) {
        const layers = ["background", "grid", "assets"];
        layers.forEach(layer => {
            const canvas = this.createSingleCanvas(layer, canvasSize);
            container.appendChild(canvas);
            const ctx = canvas.getContext("2d");
            if (ctx) {
                sceneLayers[layer] = { canvas, ctx };
            }
        });
    }
    static createSingleCanvas(layer, canvasSize) {
        const canvas = document.createElement("canvas");
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;
        canvas.id = `scene-canvas-${layer}`;
        canvas.className = "scene-canvas-layer";
        return canvas;
    }
    static centerCanvas(container, canvasSize) {
        if (!container)
            return;
        container.scrollLeft = Math.max(0, (canvasSize.width - container.clientWidth) / 2);
        container.scrollTop = Math.max(0, (canvasSize.height - container.clientHeight) / 2);
    }
}
class BackgroundRenderer {
    static render(imageUrl, layer, renderState) {
        if (!imageUrl || !layer?.ctx)
            return;
        if (!this.hasBackgroundChanged(imageUrl, renderState))
            return;
        this.updateRenderState(imageUrl, renderState);
        this.clearLayer(layer);
        this.drawBackgroundImage(imageUrl, layer.ctx);
    }
    static hasBackgroundChanged(imageUrl, renderState) {
        return renderState.lastBackgroundUrl !== imageUrl;
    }
    static updateRenderState(imageUrl, renderState) {
        renderState.lastBackgroundUrl = imageUrl;
    }
    static clearLayer(layer) {
        const ctx = layer.ctx;
        ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
    }
    static drawBackgroundImage(imageUrl, ctx) {
        ImageCache.loadImage(imageUrl, img => {
            ctx.drawImage(img, RenderConstants.canvasPadding, RenderConstants.canvasPadding, img.width, img.height);
        });
    }
}
class GridRenderer {
    static render(grid, layer) {
        if (!layer?.ctx)
            return;
        if (!grid || grid.type === 0 /* GridType.NoGrid */) {
            this.clearLayer(layer);
            return;
        }
        this.setupGridRendering(layer.ctx);
        this.renderGridByType(grid, layer.ctx);
    }
    static clearLayer(layer) {
        layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
    }
    static setupGridRendering(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.strokeStyle = RenderConstants.gridStrokeStyle;
        ctx.lineWidth = 1;
    }
    static renderGridByType(grid, ctx) {
        const offsetX = grid.offset?.x || 0;
        const offsetY = grid.offset?.y || 0;
        const cellWidth = grid.cellSize?.width || RenderConstants.defaultGridCellSize;
        const cellHeight = grid.cellSize?.height || RenderConstants.defaultGridCellSize;
        switch (grid.type) {
            case 1 /* GridType.Square */:
                this.renderSquareGrid(ctx, offsetX, offsetY, cellWidth, cellHeight);
                break;
            case 2 /* GridType.HexV */:
            case 3 /* GridType.HexH */:
            case 4 /* GridType.Isometric */:
                this.renderUnsupportedGridMessage(ctx, "Grid type not yet implemented");
                break;
        }
    }
    static renderSquareGrid(ctx, offsetX, offsetY, cellWidth, cellHeight) {
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        this.drawVerticalLines(ctx, offsetX, cellWidth, canvasWidth, canvasHeight);
        this.drawHorizontalLines(ctx, offsetY, cellHeight, canvasWidth, canvasHeight);
    }
    static drawVerticalLines(ctx, offsetX, cellWidth, canvasWidth, canvasHeight) {
        for (let x = offsetX; x < canvasWidth; x += cellWidth) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasHeight);
            ctx.stroke();
        }
    }
    static drawHorizontalLines(ctx, offsetY, cellHeight, canvasWidth, canvasHeight) {
        for (let y = offsetY; y < canvasHeight; y += cellHeight) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvasWidth, y);
            ctx.stroke();
        }
    }
    static renderUnsupportedGridMessage(ctx, message) {
        ctx.font = RenderConstants.gridMessageFont;
        ctx.fillStyle = RenderConstants.gridMessageColor;
        ctx.fillText(message, 20, 60);
    }
}
class AssetRenderer {
    static render(assets, layer) {
        if (!layer?.ctx)
            return;
        this.clearLayer(layer);
        if (!assets || assets.length === 0)
            return;
        assets.forEach(asset => this.renderSingleAsset(layer.ctx, asset));
    }
    static clearLayer(layer) {
        layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
    }
    static renderSingleAsset(ctx, asset) {
        const position = this.calculateAssetPosition(asset);
        const size = this.calculateAssetSize(asset);
        if (asset.imageUrl) {
            this.renderAssetImage(ctx, asset, position, size);
        }
        else {
            this.renderAssetShape(ctx, asset, position, size);
        }
    }
    static calculateAssetPosition(asset) {
        return {
            x: (asset.position?.x || 0) + RenderConstants.canvasPadding,
            y: (asset.position?.y || 0) + RenderConstants.canvasPadding
        };
    }
    static calculateAssetSize(asset) {
        const baseWidth = asset.size?.width || RenderConstants.defaultAssetSize;
        const baseHeight = asset.size?.height || RenderConstants.defaultAssetSize;
        const scale = asset.scale || 1;
        return {
            width: baseWidth * scale,
            height: baseHeight * scale
        };
    }
    static renderAssetImage(ctx, asset, position, size) {
        ImageCache.loadImage(asset.imageUrl, img => {
            ctx.drawImage(img, position.x - size.width / 2, position.y - size.height / 2, size.width, size.height);
            this.renderAssetDecorations(ctx, asset, position, size);
        });
    }
    static renderAssetShape(ctx, asset, position, size) {
        ctx.beginPath();
        ctx.ellipse(position.x, position.y, size.width / 2, size.height / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = asset.color || RenderConstants.defaultAssetColor;
        ctx.fill();
        this.renderAssetDecorations(ctx, asset, position, size);
    }
    static renderAssetDecorations(ctx, asset, position, size) {
        if (asset.isSelected) {
            this.renderSelectionBorder(ctx, asset, position, size);
        }
        if (asset.isLocked) {
            this.renderLockIcon(ctx, position, size);
        }
        this.renderAssetName(ctx, asset, position, size);
    }
    static renderSelectionBorder(ctx, asset, position, size) {
        ctx.strokeStyle = RenderConstants.selectionStrokeStyle;
        ctx.lineWidth = RenderConstants.selectionBorderWidth;
        if (asset.imageUrl) {
            this.renderRectangularSelection(ctx, position, size);
        }
        else {
            this.renderEllipticalSelection(ctx, position, size);
        }
    }
    static renderRectangularSelection(ctx, position, size) {
        const padding = RenderConstants.selectionBorderPadding;
        ctx.strokeRect(position.x - size.width / 2 - padding, position.y - size.height / 2 - padding, size.width + padding * 2, size.height + padding * 2);
    }
    static renderEllipticalSelection(ctx, position, size) {
        const padding = RenderConstants.selectionBorderPadding;
        ctx.beginPath();
        ctx.ellipse(position.x, position.y, size.width / 2 + padding, size.height / 2 + padding, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
    static renderLockIcon(ctx, position, size) {
        ctx.font = RenderConstants.lockIconFont;
        ctx.fillStyle = RenderConstants.lockIconColor;
        ctx.fillText("🔒", position.x - RenderConstants.lockIconOffset, position.y - Math.max(size.width, size.height) / 2 - 5);
    }
    static renderAssetName(ctx, asset, position, size) {
        ctx.font = RenderConstants.assetNameFont;
        ctx.fillStyle = RenderConstants.assetNameColor;
        ctx.textAlign = "center";
        ctx.fillText(asset.name || "Asset", position.x, position.y + Math.max(size.width, size.height) / 2 + 15);
    }
}
class SceneBuilder {
    static initialize() {
        this.sceneWindow = window;
        this.initializeWindowState();
        this.bindWindowMethods();
    }
    static initializeWindowState() {
        this.sceneWindow.sceneLayers = {
            background: null,
            grid: null,
            assets: null
        };
        this.sceneWindow.renderState = {
            lastBackgroundUrl: null
        };
    }
    static bindWindowMethods() {
        this.sceneWindow.initStage = this.initStage.bind(this);
        this.sceneWindow.drawStage = this.drawStage.bind(this);
        this.sceneWindow.getImageDimensionsFromUrl = ImageCache.getImageDimensions.bind(ImageCache);
        this.sceneWindow.getCanvasBoundingRect = DomUtils.getCanvasBoundingRect.bind(DomUtils);
        this.sceneWindow.getScrollPosition = DomUtils.getScrollPosition.bind(DomUtils);
        this.sceneWindow.setScrollPosition = DomUtils.setScrollPosition.bind(DomUtils);
        this.sceneWindow.setCursor = DomUtils.setCursor.bind(DomUtils);
    }
    static initStage(canvasContainer, renderData) {
        CanvasManager.initializeCanvas(canvasContainer, renderData.canvasSize, this.sceneWindow.sceneLayers);
        this.drawStage(renderData);
    }
    static drawStage(renderData) {
        BackgroundRenderer.render(renderData.imageUrl, this.sceneWindow.sceneLayers.background, this.sceneWindow.renderState);
        GridRenderer.render(renderData.grid, this.sceneWindow.sceneLayers.grid);
        AssetRenderer.render(renderData.assets, this.sceneWindow.sceneLayers.assets);
    }
}
// Initialize the SceneBuilder when the script loads
SceneBuilder.initialize();
//# sourceMappingURL=builder.js.map