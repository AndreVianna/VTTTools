"use strict";
class RenderConstants {
}
RenderConstants.canvasPadding = 0;
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
    static initializeCanvas(container, builder) {
        this.builder = builder;
        this.container = container;
        this.setupExistingCanvasLayers();
        this.centerCanvas();
    }
    static setupExistingCanvasLayers() {
        const layers = ["background", "grid", "assets"];
        layers.forEach(layer => {
            const canvas = this.container.querySelector(`#scene-canvas-${layer}`);
            if (!canvas) {
                console.error(`Canvas element #scene-canvas-${layer} not found`);
                return;
            }
            this.setupSingleCanvas(canvas);
            const ctx = canvas.getContext("2d");
            if (ctx)
                this.builder.layers[layer] = { canvas, ctx };
        });
    }
    static setupSingleCanvas(canvas) {
        canvas.width = this.builder.state.canvasSize.width;
        canvas.height = this.builder.state.canvasSize.height;
    }
    static centerCanvas() {
        if (!this.container)
            return;
        this.container.scrollLeft = Math.max(0, (this.builder.state.canvasSize.width - this.container.clientWidth) / 2);
        this.container.scrollTop = Math.max(0, (this.builder.state.canvasSize.height - this.container.clientHeight) / 2);
    }
}
class BackgroundRenderer {
    static render(layer, currentState, newState) {
        const ctx = layer?.ctx;
        if (!ctx)
            return;
        this.clearLayer(layer);
        if (!newState.imageUrl)
            return;
        this.applyZoomTransform(ctx, currentState, newState);
        this.drawImage(ctx, newState.imageUrl);
        layer.ctx.strokeStyle = "red";
        layer.ctx.strokeRect(0, 0, 100, 100);
        layer.ctx.strokeRect(0, 0, 200, 200);
    }
    static clearLayer(layer) {
        const ctx = layer.ctx;
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset to identity matrix
        ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
    }
    static applyZoomTransform(ctx, currentState, newState) {
        ctx.translate(newState.zoomCenter.x, newState.zoomCenter.y);
        ctx.scale(newState.zoomLevel, newState.zoomLevel);
        ctx.translate(-newState.zoomCenter.x, -newState.zoomCenter.y);
    }
    static drawImage(ctx, imageUrl) {
        ImageCache.loadImage(imageUrl, img => {
            ctx.drawImage(img, RenderConstants.canvasPadding, RenderConstants.canvasPadding, img.width, img.height);
        });
    }
}
class GridRenderer {
    static render(layer, currentState, newState) {
        const ctx = layer?.ctx;
        if (!ctx)
            return;
        this.clearLayer(layer);
        if (newState.grid.type === 0 /* GridType.NoGrid */)
            return;
        this.applyZoomTransform(ctx, currentState, newState);
        this.drawGrid(ctx, newState.grid, newState.zoomLevel);
    }
    static clearLayer(layer) {
        const ctx = layer.ctx;
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset to identity matrix
        ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
    }
    static applyZoomTransform(ctx, currentState, newState) {
        ctx.translate(newState.zoomCenter.x, newState.zoomCenter.y);
        ctx.scale(newState.zoomLevel, newState.zoomLevel);
        ctx.translate(-newState.zoomCenter.x, -newState.zoomCenter.y);
    }
    static drawGrid(ctx, grid, zoomLevel) {
        const offsetX = grid.offset?.x || 0;
        const offsetY = grid.offset?.y || 0;
        const cellWidth = grid.cell?.width || RenderConstants.defaultGridCellSize;
        const cellHeight = grid.cell?.height || RenderConstants.defaultGridCellSize;
        switch (grid.type) {
            case 1 /* GridType.Square */:
                this.renderSquareGrid(ctx, offsetX, offsetY, cellWidth, cellHeight);
                break;
            case 2 /* GridType.HexV */:
            case 3 /* GridType.HexH */:
            case 4 /* GridType.Isometric */:
                this.renderUnsupportedGridMessage(ctx, "Grid type not yet implemented", zoomLevel);
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
    static renderUnsupportedGridMessage(ctx, message, zoomLevel) {
        ctx.font = RenderConstants.gridMessageFont;
        ctx.fillStyle = RenderConstants.gridMessageColor;
        // Adjust font size for zoom level
        const fontSize = 20 / zoomLevel;
        ctx.font = `${fontSize}px Arial`;
        ctx.fillText(message, 20, 60);
    }
}
class AssetRenderer {
    static render(layer, currentState, newState) {
        const ctx = layer?.ctx;
        if (!ctx)
            return;
        this.clearLayer(layer);
        if (newState.assets.length === 0)
            return;
        this.applyZoomTransform(ctx, currentState, newState);
        this.drawAssets(ctx, newState.assets, newState.zoomLevel);
    }
    static clearLayer(layer) {
        layer.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset to identity matrix
        layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
    }
    static applyZoomTransform(ctx, currentState, newState) {
        ctx.translate(newState.zoomCenter.x, newState.zoomCenter.y);
        ctx.scale(newState.zoomLevel, newState.zoomLevel);
        ctx.translate(-newState.zoomCenter.x, -newState.zoomCenter.y);
    }
    static drawAssets(ctx, assets, zoomLevel) {
        assets.forEach(asset => this.drawAsset(ctx, asset, zoomLevel));
    }
    static drawAsset(ctx, asset, zoomLevel) {
        const position = this.calculateAssetPosition(asset);
        const size = this.calculateAssetSize(asset);
        if (asset.imageUrl) {
            this.renderAssetImage(ctx, asset, position, size, zoomLevel);
        }
        else {
            this.renderAssetShape(ctx, asset, position, size, zoomLevel);
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
    static renderAssetImage(ctx, asset, position, size, zoomLevel) {
        ImageCache.loadImage(asset.imageUrl, img => {
            ctx.drawImage(img, position.x - size.width / 2, position.y - size.height / 2, size.width, size.height);
            this.renderAssetDecorations(ctx, asset, position, size, zoomLevel);
        });
    }
    static renderAssetShape(ctx, asset, position, size, zoomLevel) {
        ctx.beginPath();
        ctx.ellipse(position.x, position.y, size.width / 2, size.height / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = asset.color || RenderConstants.defaultAssetColor;
        ctx.fill();
        this.renderAssetDecorations(ctx, asset, position, size, zoomLevel);
    }
    static renderAssetDecorations(ctx, asset, position, size, zoomLevel) {
        if (asset.isSelected) {
            this.renderSelectionBorder(ctx, asset, position, size, zoomLevel);
        }
        if (asset.isLocked) {
            this.renderLockIcon(ctx, position, size, zoomLevel);
        }
        this.renderAssetName(ctx, asset, position, size, zoomLevel);
    }
    static renderSelectionBorder(ctx, asset, position, size, zoomLevel) {
        ctx.strokeStyle = RenderConstants.selectionStrokeStyle;
        ctx.lineWidth = RenderConstants.selectionBorderWidth / zoomLevel; // Adjust line width for zoom
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
    static renderLockIcon(ctx, position, size, zoomLevel) {
        const fontSize = 16 / zoomLevel; // Adjust font size for zoom level
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = RenderConstants.lockIconColor;
        ctx.fillText("🔒", position.x - RenderConstants.lockIconOffset, position.y - Math.max(size.width, size.height) / 2 - 5);
    }
    static renderAssetName(ctx, asset, position, size, zoomLevel) {
        const fontSize = 12 / zoomLevel; // Adjust font size for zoom level
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = RenderConstants.assetNameColor;
        ctx.textAlign = "center";
        ctx.fillText(asset.name || "Asset", position.x, position.y + Math.max(size.width, size.height) / 2 + 15);
    }
}
class SceneBuilder {
    static initialize() {
        this.builder = window;
        this.initializeProperties();
        this.bindMethods();
    }
    static initializeProperties() {
        this.builder.layers = {
            background: null,
            grid: null,
            assets: null
        };
        this.builder.state = {
            id: undefined,
            imageUrl: undefined,
            imageSize: { width: 0, height: 0 }, // 4K resolution
            canvasSize: { width: 3840, height: 2160 }, // 4K resolution
            zoomLevel: 1.0,
            zoomCenter: { x: 0, y: 0 },
            offset: { x: 0, y: 0 },
            grid: {
                type: 0 /* GridType.NoGrid */,
                cell: { width: 50, height: 50 },
                offset: { x: 0, y: 0 },
                snap: false,
            },
            assets: []
        };
    }
    static bindMethods() {
        this.builder.resetZoom = this.resetZoom.bind(this);
        this.builder.initStage = this.initStage.bind(this);
        this.builder.drawStage = this.drawStage.bind(this);
        this.builder.getImageDimensionsFromUrl = ImageCache.getImageDimensions.bind(ImageCache);
        this.builder.getCanvasBoundingRect = DomUtils.getCanvasBoundingRect.bind(DomUtils);
        this.builder.getScrollPosition = DomUtils.getScrollPosition.bind(DomUtils);
        this.builder.setScrollPosition = DomUtils.setScrollPosition.bind(DomUtils);
        this.builder.setCursor = DomUtils.setCursor.bind(DomUtils);
        this.builder.setupCanvasWheelPrevention = this.setupCanvasWheelHandler.bind(this);
    }
    static initStage(canvasContainer, initialState) {
        this.builder.state = initialState;
        CanvasManager.initializeCanvas(canvasContainer, this.builder);
        this.setupCanvasWheelHandler(canvasContainer);
        this.drawStage(initialState);
    }
    static setupCanvasWheelHandler(canvasContainer) {
        canvasContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleZoom(e.deltaY, e.clientX, e.clientY, canvasContainer);
        }, { passive: false });
    }
    static handleZoom(deltaY, clientX, clientY, canvasContainer) {
        const MIN_ZOOM = 0.1;
        const MAX_ZOOM = 4.0;
        const ZOOM_STEP = 0.1;
        const currentZoom = this.builder.state.zoomLevel ?? 1.0;
        const currentZoomCenter = this.builder.state.zoomCenter;

        const zoomDirection = deltaY > 0 ? -1 : 1;
        let newZoom = currentZoom + (zoomDirection * ZOOM_STEP);
        newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
        if (Math.abs(newZoom - currentZoom) < (ZOOM_STEP / 2))
            return;
        const rect = canvasContainer.getBoundingClientRect();
        const canvasRect = DomUtils.getCanvasBoundingRect(canvasContainer);
        console.log(`currentZoom: ${currentZoom}`);
        console.log(`client: ${clientX}, ${clientY}`);
        console.log(`container rect: ${rect.left}, ${rect.top} => ${rect.width}, ${rect.height}`);
        console.log(`canvas rect: ${canvasRect.left}, ${canvasRect.top} => ${canvasRect.width}, ${canvasRect.height}`);
        console.log(`scroll: ${canvasContainer.scrollLeft}, ${canvasContainer.scrollTop}`);
        const mouseX = clientX - rect.left + canvasContainer.scrollLeft;
        const mouseY = clientY - rect.top + canvasContainer.scrollTop;
        console.log(`currentZoomCenter: ${currentZoomCenter.x}, ${currentZoomCenter.y}`);
        console.log(`mouse: ${mouseX}, ${mouseY}`);
        console.log(`delta: ${mouseX - (mouseX * newZoom)}, ${mouseY - (mouseY * newZoom)}`);
        console.log(`newZoom: ${newZoom}`);
        const newZoomCenter = {
            x: mouseX,
            y: mouseY
        };
        console.log(`newZoomCenter: ${newZoomCenter.x}, ${newZoomCenter.y}`);
        const newState = {
            ...this.builder.state,
            zoomLevel: newZoomLevel,
            zoomCenter: newZoomCenter
        };
        this.redrawAllLayers(newState);
        this.updateZoomIndicator(newZoomLevel);
        this.builder.state.zoomLevel = newZoomLevel;
        this.builder.state.zoomCenter = newZoomCenter;
    }
    static redrawAllLayers(newState) {
        this.clearAllLayers();
        BackgroundRenderer.render(this.builder.layers.background, this.builder.state, newState);
        GridRenderer.render(this.builder.layers.grid, this.builder.state, newState);
        AssetRenderer.render(this.builder.layers.assets, this.builder.state, newState);
    }
    static clearAllLayers() {
        for (const layerKey in this.builder.layers) {
            const layer = this.builder.layers[layerKey];
            if (!layer)
                continue;
            const ctx = layer.ctx;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
        }
    }
    static updateZoomIndicator(zoomLevel) {
        const zoomIndicator = document.querySelector('.zoom-indicator');
        if (zoomIndicator)
            zoomIndicator.textContent = `${Math.round(zoomLevel * 100)}%`;
    }
    static resetZoom() {
        const newState = {
            ...this.builder.state,
            zoomLevel: 1.0,
            zoomCenter: { x: 0, y: 0 }
        };
        this.redrawAllLayers(newState);
        this.updateZoomIndicator(1.0);
        this.builder.state.zoomLevel = newState.zoomLevel;
        this.builder.state.zoomCenter = newState.zoomCenter;
    }
    static drawStage(newState) {
        BackgroundRenderer.render(this.builder.layers.background, this.builder.state, newState);
        GridRenderer.render(this.builder.layers.grid, this.builder.state, newState);
        AssetRenderer.render(this.builder.layers.assets, this.builder.state, newState);
        this.builder.state.zoomLevel = newState.zoomLevel;
        this.builder.state.zoomCenter = newState.zoomCenter;
    }
}
// Initialize the SceneBuilder when the script loads
SceneBuilder.initialize();
//# sourceMappingURL=builder.js.map
