"use strict";
class RenderConstants {
}
RenderConstants.canvasPadding = 200;
RenderConstants.selectionBorderWidth = 2;
RenderConstants.selectionBorderPadding = 3;
RenderConstants.selectionStrokeStyle = "rgba(0, 126, 255, 0.8)";
RenderConstants.minZoomLevel = 0.1;
RenderConstants.maxZoomLevel = 4.0;
RenderConstants.zoomStep = 0.1 + Number.EPSILON;
RenderConstants.defaultAssetColor = "rgba(100, 100, 100, 0.7)";
RenderConstants.defaultAssetSize = 40;
RenderConstants.assetNameFont = "12px Arial";
RenderConstants.assetNameColor = "black";
RenderConstants.defaultGridCellSize = 50;
RenderConstants.gridMessageFont = "20px Arial";
RenderConstants.gridMessageColor = "rgba(0, 0, 0, 0.5)";
RenderConstants.gridStrokeStyle = "rgba(0, 0, 0, 0.3)";
RenderConstants.lockIconFont = "16px Arial";
RenderConstants.lockIconColor = "rgba(255, 0, 0, 0.7)";
RenderConstants.lockIconOffset = 8;
class Layer {
    constructor(id, canvas) {
        this.id = id;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }
    render(zoomLevel) {
        this.clear();
        this.ctx.scale(zoomLevel, zoomLevel);
        this.drawLayer();
    }
    drawLayer() {
    }
    clear() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
class BackgroundLayer extends Layer {
    //imageSize: ISize = null!;
    constructor(imageUrl) {
        super("background", document.querySelector(`#background-layer`));
        this.imageUrl = imageUrl;
    }
    drawLayer() {
        ImageCache.loadImage(this.imageUrl, img => {
            this.ctx.drawImage(img, RenderConstants.canvasPadding, RenderConstants.canvasPadding, img.width, img.height);
        });
    }
}
class GridLayer extends Layer {
    constructor(grid) {
        super("grid", document.querySelector(`#grid-layer`));
        this.grid = grid;
    }
    drawLayer() {
        const offsetX = this.grid.offset?.x || 0;
        const offsetY = this.grid.offset?.y || 0;
        const cellWidth = this.grid.cell?.width || RenderConstants.defaultGridCellSize;
        const cellHeight = this.grid.cell?.height || RenderConstants.defaultGridCellSize;
        console.log("Drawing Grid:", this.grid);
        switch (this.grid.type) {
            case 1 /* GridType.Square */:
                this.renderSquareGrid(offsetX, offsetY, cellWidth, cellHeight);
                break;
            case 2 /* GridType.HexV */:
            case 3 /* GridType.HexH */:
            case 4 /* GridType.Isometric */:
                this.renderUnsupportedGridMessage("Grid type not supported.");
                break;
        }
    }
    renderSquareGrid(offsetX, offsetY, cellWidth, cellHeight) {
        const canvasWidth = this.ctx.canvas.width;
        const canvasHeight = this.ctx.canvas.height;
        this.drawVerticalLines(offsetX, cellWidth, canvasWidth, canvasHeight);
        this.drawHorizontalLines(offsetY, cellHeight, canvasWidth, canvasHeight);
    }
    drawVerticalLines(offsetX, cellWidth, canvasWidth, canvasHeight) {
        for (let x = offsetX; x < canvasWidth; x += cellWidth) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, canvasHeight);
            this.ctx.stroke();
        }
    }
    drawHorizontalLines(offsetY, cellHeight, canvasWidth, canvasHeight) {
        for (let y = offsetY; y < canvasHeight; y += cellHeight) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(canvasWidth, y);
            this.ctx.stroke();
        }
    }
    renderUnsupportedGridMessage(message) {
        this.ctx.font = RenderConstants.gridMessageFont;
        this.ctx.fillStyle = RenderConstants.gridMessageColor;
        this.ctx.fillText(message, 20, 60);
    }
}
class AssetsLayer extends Layer {
    constructor(assets) {
        super("assets", document.querySelector(`#assets-layer`));
        this.assets = assets;
    }
    drawLayer() {
        this.assets.forEach(asset => this.drawAsset(asset));
    }
    drawAsset(asset) {
        const position = this.calculateAssetPosition(asset);
        const size = this.calculateAssetSize(asset);
        if (asset.imageUrl) {
            this.renderAssetImage(asset, position, size);
        }
        else {
            this.renderAssetShape(asset, position, size);
        }
    }
    calculateAssetPosition(asset) {
        return {
            x: (asset.position?.x || 0) + RenderConstants.canvasPadding,
            y: (asset.position?.y || 0) + RenderConstants.canvasPadding
        };
    }
    calculateAssetSize(asset) {
        const baseWidth = asset.size?.width || RenderConstants.defaultAssetSize;
        const baseHeight = asset.size?.height || RenderConstants.defaultAssetSize;
        const scale = asset.scale || 1;
        return {
            width: baseWidth * scale,
            height: baseHeight * scale
        };
    }
    renderAssetImage(asset, position, size) {
        ImageCache.loadImage(asset.imageUrl, img => {
            this.ctx.drawImage(img, position.x - size.width / 2, position.y - size.height / 2, size.width, size.height);
            this.renderAssetDecorations(asset, position, size);
        });
    }
    renderAssetShape(asset, position, size) {
        this.ctx.beginPath();
        this.ctx.ellipse(position.x, position.y, size.width / 2, size.height / 2, 0, 0, Math.PI * 2);
        this.ctx.fillStyle = asset.color || RenderConstants.defaultAssetColor;
        this.ctx.fill();
        this.renderAssetDecorations(asset, position, size);
    }
    renderAssetDecorations(asset, position, size) {
        if (asset.isSelected) {
            this.renderSelectionBorder(asset, position, size);
        }
        if (asset.isLocked) {
            this.renderLockIcon(position, size);
        }
        this.renderAssetName(asset, position, size);
    }
    renderSelectionBorder(asset, position, size) {
        this.ctx.strokeStyle = RenderConstants.selectionStrokeStyle;
        this.ctx.lineWidth = RenderConstants.selectionBorderWidth;
        this.renderRectangularSelection(position, size);
    }
    renderRectangularSelection(position, size) {
        const padding = RenderConstants.selectionBorderPadding;
        this.ctx.strokeRect(position.x - size.width / 2 - padding, position.y - size.height / 2 - padding, size.width + padding * 2, size.height + padding * 2);
    }
    renderLockIcon(position, size) {
        this.ctx.font = RenderConstants.lockIconFont;
        this.ctx.fillStyle = RenderConstants.lockIconColor;
        this.ctx.fillText("🔒", position.x - RenderConstants.lockIconOffset, position.y - Math.max(size.width, size.height) / 2 - 5);
    }
    renderAssetName(asset, position, size) {
        this.ctx.font = RenderConstants.assetNameFont;
        this.ctx.fillStyle = RenderConstants.assetNameColor;
        this.ctx.textAlign = "center";
        this.ctx.fillText(asset.name || "Asset", position.x, position.y + Math.max(size.width, size.height) / 2 + 15);
    }
}
class ImageCache {
    static loadImage(url, onLoad) {
        if (this.cache.has(url)) {
            const cached = this.cache.get(url);
            if (cached.complete) {
                onLoad(cached);
                return;
            }
        }
        const img = new Image();
        img.onload = () => onLoad(img);
        img.onerror = () => console.error("Failed to load image:", url);
        img.src = url;
        this.cache.set(url, img);
    }
    static async getImageSize(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.width, height: img.height });
            img.onerror = () => reject(`Failed to load image '${src}'`);
            img.src = src;
        });
    }
}
ImageCache.cache = new Map();
class DomUtils {
    static getContainerRect(container) {
        const rect = container.getBoundingClientRect();
        return {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
        };
    }
    static getContainerScroll(container) {
        return {
            x: container.scrollLeft,
            y: container.scrollTop
        };
    }
    static setContainerScroll(container, position) {
        container.scrollLeft = position.x;
        container.scrollTop = position.y;
    }
    static getCanvasRect(canvas) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
        };
    }
    static setCanvasRect(canvas, rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
        canvas.style.left = `${rect.x}px`;
        canvas.style.top = `${rect.y}px`;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
    }
    static setCursor(container, cursor) {
        container.style.cursor = cursor;
    }
    static setZoomDisplay(zoomDisplay, zoomLevel) {
        zoomDisplay.textContent = `${Math.round(zoomLevel * 100)}%`;
    }
}
class SceneBuilder {
    static initialize() {
        this.initializeProperties();
        this.bindMethods();
        this.captureDomElements();
        this.bindMouseEvents();
    }
    static initializeProperties() {
        this.builder.state = this.defaultState;
    }
    static bindMethods() {
        this.builder.setup = this.setup.bind(this);
        this.builder.render = this.render.bind(this);
        this.builder.setLayer = this.setLayer.bind(this);
        this.builder.setZoom = this.setZoom.bind(this);
        this.builder.getImageSize = ImageCache.getImageSize.bind(ImageCache);
        this.builder.getContainerRect = DomUtils.getContainerRect.bind(DomUtils);
        this.builder.getContainerScroll = DomUtils.getContainerScroll.bind(DomUtils);
        this.builder.setContainerScroll = DomUtils.setContainerScroll.bind(DomUtils);
        this.builder.getCanvasRect = DomUtils.getCanvasRect.bind(DomUtils);
        this.builder.setCanvasRect = DomUtils.setCanvasRect.bind(DomUtils);
        this.builder.setCursor = DomUtils.setCursor.bind(DomUtils);
        this.builder.setZoomDisplay = DomUtils.setZoomDisplay.bind(DomUtils);
    }
    static captureDomElements() {
        this.builder.state = this.defaultState;
        this.builder.container = document.querySelector('#layers-container');
        this.builder.layers = [];
        const layers = document.querySelectorAll(".builder-layer");
        layers.forEach(layer => {
            this.builder.layers.push(new Layer(layer.id.replace("-layer", ""), layer));
        });
        this.builder.zoomDisplay = document.querySelector("#zoom-level-display");
    }
    static bindMouseEvents() {
        this.builder.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleWheel(e.clientX, e.clientY, e.deltaY);
        }, { passive: false });
    }
    static async setup(id, setup) {
        await this.calculateInitialState(id, setup);
        this.initializeLayers(setup);
        this.resetZoom();
        this.updateDomElements();
        this.render();
        return;
    }
    static async calculateInitialState(id, setup) {
        this.builder.state = {
            ...this.builder.state,
            id: id,
            containerRect: DomUtils.getContainerRect(this.builder.container),
            imageSize: await ImageCache.getImageSize(setup.imageUrl),
        };
    }
    static initializeLayers(setup) {
        const layers = this.builder.layers;
        layers.length = 0;
        layers.push(new BackgroundLayer(setup.imageUrl));
        layers.push(new GridLayer(setup.grid));
        layers.push(new AssetsLayer(setup.assets));
    }
    static handleWheel(clientX, clientY, deltaY) {
        const state = this.builder.state;
        state.containerScroll = DomUtils.getContainerScroll(this.builder.container);
        const mouseX = clientX - state.containerRect.x;
        const mouseY = clientY - state.containerRect.y;
        const zoomLevel = deltaY > 0
            ? Math.ceil((state.zoomLevel - RenderConstants.zoomStep) * 10) / 10
            : Math.floor((state.zoomLevel + RenderConstants.zoomStep) * 10) / 10;
        this.updateZoom(mouseX, mouseY, zoomLevel);
        this.updateDomElements();
        this.render();
    }
    static setLayer(layer) {
    }
    static render() {
        const state = this.builder.state;
        for (const layer of this.builder.layers) {
            layer.render(state.zoomLevel);
        }
    }
    static clearLayer(layer) {
        layer.ctx.setTransform(1, 0, 0, 1, 0, 0);
        layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
    }
    static updateDomElements() {
        const state = this.builder.state;
        for (const layer of this.builder.layers)
            DomUtils.setCanvasRect(layer.canvas, state.layerRect);
        DomUtils.setContainerScroll(this.builder.container, state.containerScroll);
        DomUtils.setZoomDisplay(this.builder.zoomDisplay, state.zoomLevel);
    }
    static openChangeImageModal() {
        // Find and show the change image modal by manipulating DOM directly
        const modal = document.querySelector('[data-modal="change-image"]');
        if (modal) {
            modal.style.display = 'block';
            modal.classList.add('show');
        }
        // Show backdrop
        const backdrop = document.querySelector('[data-backdrop="change-image"]');
        if (backdrop) {
            backdrop.style.display = 'block';
            backdrop.classList.add('show');
        }
    }
    static openGridSettingsModal() {
        // Find and show the grid settings modal by manipulating DOM directly
        const modal = document.querySelector('[data-modal="grid-settings"]');
        if (modal) {
            modal.style.display = 'block';
            modal.classList.add('show');
        }
        // Show backdrop
        const backdrop = document.querySelector('[data-backdrop="grid-settings"]');
        if (backdrop) {
            backdrop.style.display = 'block';
            backdrop.classList.add('show');
        }
    }
    static startAssetPlacement(assetType) {
        // Set the asset type and show the asset selector modal
        const assetTypeInput = document.querySelector('[data-asset-type]');
        if (assetTypeInput) {
            assetTypeInput.value = assetType;
        }
        const modal = document.querySelector('[data-modal="asset-selector"]');
        if (modal) {
            modal.style.display = 'block';
            modal.classList.add('show');
        }
        // Show backdrop
        const backdrop = document.querySelector('[data-backdrop="asset-selector"]');
        if (backdrop) {
            backdrop.style.display = 'block';
            backdrop.classList.add('show');
        }
    }
    static closeModal(modalType) {
        // Hide the specified modal
        const modal = document.querySelector(`[data-modal="${modalType}"]`);
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
        }
        // Hide backdrop
        const backdrop = document.querySelector(`[data-backdrop="${modalType}"]`);
        if (backdrop) {
            backdrop.style.display = 'none';
            backdrop.classList.remove('show');
        }
    }
    static setZoom(zoomAction) {
        const state = this.builder.state;
        let centerX = state.containerRect.width / 2;
        let centerY = state.containerRect.height / 2;
        let zoomLevel = 1;
        switch (zoomAction) {
            case "+":
                centerX = (state.containerRect.width / 2) + state.containerScroll.x - state.layerRect.x;
                centerY = (state.containerRect.height / 2) + state.containerScroll.y - state.layerRect.y;
                zoomLevel = Math.floor((state.zoomLevel + RenderConstants.zoomStep) * 10) / 10;
                break;
            case "-":
                centerX = (state.containerRect.width / 2) + state.containerScroll.x - state.layerRect.x;
                centerY = (state.containerRect.height / 2) + state.containerScroll.y - state.layerRect.y;
                zoomLevel = Math.ceil((state.zoomLevel - RenderConstants.zoomStep) * 10) / 10;
                break;
            case "X":
                this.resetZoom();
                break;
            case "H":
                zoomLevel = state.containerRect.width / state.imageSize.width;
                break;
            case "V":
                zoomLevel = state.containerRect.height / state.imageSize.height;
                break;
        }
        this.updateZoom(centerX, centerY, zoomLevel);
        this.updateDomElements();
        this.render();
    }
    static resetZoom() {
        const state = this.builder.state;
        state.zoomLevel = 1;
        const layerWidth = state.imageSize.width + (2 * RenderConstants.canvasPadding);
        const layerHeight = state.imageSize.height + (2 * RenderConstants.canvasPadding);
        const offsetLeft = (state.containerRect.width - layerWidth) / 2;
        const offsetTop = (state.containerRect.height - layerHeight) / 2;
        state.containerScroll = {
            x: offsetLeft <= 0 ? -offsetLeft : 0,
            y: offsetTop <= 0 ? -offsetTop : 0
        };
        state.layerRect = {
            x: offsetLeft > 0 ? offsetLeft : 0,
            y: offsetTop > 0 ? offsetTop : 0,
            width: layerWidth,
            height: layerHeight
        };
    }
    static updateZoom(mouseX, mouseY, zoomLevel) {
        zoomLevel = Math.max(RenderConstants.minZoomLevel, Math.min(RenderConstants.maxZoomLevel, zoomLevel));
        const state = this.builder.state;
        const layerWidth = (state.imageSize.width * zoomLevel) + (2 * RenderConstants.canvasPadding);
        const layerHeight = (state.imageSize.height * zoomLevel) + (2 * RenderConstants.canvasPadding);
        const originalMouseX = mouseX + state.containerScroll.x - state.layerRect.x;
        const originalMouseY = mouseY + state.containerScroll.y - state.layerRect.y;
        const offsetLeft = mouseX - (originalMouseX * (zoomLevel / state.zoomLevel));
        const offsetTop = mouseY - (originalMouseY * (zoomLevel / state.zoomLevel));
        state.zoomLevel = zoomLevel;
        state.containerScroll = {
            x: offsetLeft <= 0 ? -offsetLeft : 0,
            y: offsetTop <= 0 ? -offsetTop : 0
        };
        state.layerRect = {
            x: offsetLeft > 0 ? offsetLeft : 0,
            y: offsetTop > 0 ? offsetTop : 0,
            width: layerWidth,
            height: layerHeight,
        };
    }
}
SceneBuilder.builder = window;
SceneBuilder.defaultState = {
    id: "",
    imageSize: { width: 0, height: 0 },
    containerRect: { x: 0, y: 0, width: 0, height: 0 },
    containerScroll: { x: 0, y: 0 },
    layerRect: { x: 0, y: 0, width: 0, height: 0 },
    zoomLevel: 1.0,
    layers: [],
};
// Initialize the SceneBuilder when the script loads
SceneBuilder.initialize();
// Expose SceneBuilder methods globally for C# JavaScript interop
window.SceneBuilder = SceneBuilder;
//# sourceMappingURL=builder.js.map