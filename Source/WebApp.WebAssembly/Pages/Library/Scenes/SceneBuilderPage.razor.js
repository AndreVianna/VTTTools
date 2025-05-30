// Global layer references
window.sceneLayers = {
    background: null, // Background image layer
    grid: null, // Grid layer
    assets: null // Assets layer
};

window.stage = {
    id: null, // Current scene unique ID
    padding: 200,
    backgroundUrl: null, // Last drawn background
    size: { width: 0, height: 0 }, // Current canvas size
    offset: { x: 0, y: 0 }, // Current panning offset
    zoomLevel: 1.0, // Current zoom level
    grid: {
        type: 0,
        cellSize: { x: 50.0, y: 50.0 },
        offset: { x: 0, y: 0 },
        snap: false
    }
};

window.getFromLocalStoreOrDefault = function (key, defaultValue) {
    const itemKey = window.stage.id ? `sceneBuilder:${key}:${window.stage.id}` : `sceneBuilder:${key}`;
    const value = localStorage.getItem(itemKey);
    return value ? JSON.parse(value) : defaultValue;
}

window.initStage = function (canvasContainer, stageData) {
    window.stage.id = stageData.id;
    window.stage.size = {
        width: stageData.size.width + (2 * window.stage.padding),
        height: stageData.size.height + (2 * window.stage.padding)
    };
    window.stage.offset = window.getFromLocalStoreOrDefault("offset", window.stage.offset);
    window.stage.zoomLevel = window.getFromLocalStoreOrDefault("zoomLevel", stageData.zoomLevel ?? window.stage.zoomLevel);
    window.stage.grid = window.getFromLocalStoreOrDefault("grid", window.stage.grid);
    window.initCanvas(canvasContainer);
    window.drawStage(stageData);
};

window.saveToLocalStore = function (key, itemValue) {
    const itemKey = window.stage.id ? `sceneBuilder:${key}:${window.stage.id}` : `sceneBuilder:${key}`;
    localStorage.setItem(itemKey, JSON.stringify(itemValue));
}

window.saveState = function () {
    if (!window.stage.id) return;
    window.saveToLocalStore("offset", window.stage.offset);
    window.saveToLocalStore("zoomLevel", window.stage.zoomLevel);
    window.saveToLocalStore("grid", window.stage.grid);
}

window.initCanvas = function (container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    const layers = ["background", "grid", "assets"];
    layers.forEach(layer => {
        const canvas = document.createElement("canvas");
        canvas.width = window.stage.size.width;
        canvas.height = window.stage.size.height;
        canvas.id = `scene-canvas-${layer}`;
        canvas.className = "scene-canvas-layer";
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
        container.appendChild(canvas);
        window.sceneLayers[layer] = {
            canvas: canvas,
            ctx: canvas.getContext("2d")
        };
    });
    isMoving = false;
    hasMoved = false;
    window.initPanning(container);
    window.centerCanvas(container);
};

window.centerCanvas = function (container) {
    if (!container) return;
    container.scrollLeft = Math.max(0, (window.stage.size.width - container.clientWidth) / 2);
    container.scrollTop = Math.max(0, (window.stage.size.height - container.clientHeight) / 2);
}

const moveThreshold = 5;
let isMoving = false;
let hasMoved = false;
let panStart = { x: 0, y: 0 };
let panningListenersAdded = false;
let onPanEnter, onPanMove, onPanEnd, onPanLeave;

window.initPanning = function (container) {
    if (!container) return;
    if (panningListenersAdded) return;

    let startX, startY;
    let scrollLeft, scrollTop;
    const moveThreshold = 5;

    container.addEventListener("mousedown", function (e) {
        if (e.button !== 2 || !e.target.closest(".scene-canvas-container")) return;
        window.isMoving = true;
        window.hasMoved = false;
        startX = e.pageX;
        startY = e.pageY;
        scrollLeft = container.scrollLeft;
        scrollTop = container.scrollTop;
        container.style.cursor = "grabbing";
        e.preventDefault();
    });
    container.addEventListener("mousemove", function (e) {
        if (!window.isMoving) return;
        const dx = Math.abs(e.pageX - startX);
        const dy = Math.abs(e.pageY - startY);
        window.hasMoved = (dx > moveThreshold || dy > moveThreshold);
        container.scrollLeft = scrollLeft - (e.pageX - startX);
        container.scrollTop = scrollTop - (e.pageY - startY);
        window.stage.offset.x += dx;
        window.stage.offset.y += dy;
        window.saveState();
    });
    container.addEventListener("mouseup", function () {
        if (!window.isMoving) return;
        window.isMoving = false;
        container.style.cursor = "default";
    });
    container.addEventListener("mouseleave", window.onPanEnd = function (e) {
        if (e.button !== 2) return;
        window.onPanLeave();
    });
    panningListenersAdded = true;
};

window.isPanning = function () {
    return window.isMoving === true && window.hasMoved === true;
};

window.saveGridSettings = function (gridSettings) {
    window.stage.grid = gridSettings;
    window.saveState();
};
window.getGridSettings = function () {
    return window.stage.grid;
};

window.getSceneMousePosition = function (event) {
    const canvas = window.sceneLayers.assets.canvas;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return {
        x: (x - window.stage.offset.x) / window.stage.zoomLevel,
        y: (y - window.stage.offset.y) / window.stage.zoomLevel
    };
};

window.drawStage = function (sceneData) {
    drawBackgroundLayer(sceneData.imageUrl);
    drawGridLayer(sceneData.grid);
    drawAssetsLayer(sceneData.assets);
};

const imageCache = new Map();
window.drawImage = function (src, onSuccess) {
    if (imageCache.has(src)) {
        const cached = imageCache.get(src);
        console.log("Drawing from cache.");
        onSuccess(cached);
        return;
    }
    const img = new Image();
    img.onload = function () {
        console.log("Drawing loaded image.");
        onSuccess(img);
    }
    img.onerror = function () {
        console.error("Failed to load image.", src);
    }
    img.src = src;
    imageCache.set(src, img);
}

window.drawBackgroundLayer = function (imageUrl) {
    console.log("Drawing background.");
    if (!imageUrl) return;
    const backgroundChanged = window.stage.backgroundUrl !== imageUrl;
    if (!backgroundChanged) return;
    window.stage.backgroundUrl = imageUrl;

    const layer = window.sceneLayers.background;
    if (!layer || !layer.ctx) return;
    const ctx = layer.ctx;
    ctx.clearRect(0, 0, window.stage.size.width, window.stage.size.height);
    drawImage(imageUrl, img => {
        console.log("Drawing image:", `${imageUrl}`, `(${img.width}, ${img.height})`, ".");
        ctx.drawImage(img, 200, 200, img.width, img.height);
    });
}

window.drawGridLayer = function (grid) {
    if (!grid || grid.type === 0) return;

    const gridChanged = !window.stage.grid ||
        JSON.stringify(window.stage.grid) !== JSON.stringify(grid);
    if (!gridChanged) return;

    const layer = window.sceneLayers.grid;
    if (!layer || !layer.ctx) return;
    const ctx = layer.ctx;
    //ctx.save();
    ctx.clearRect(0, 0, window.stage.size.width, window.stage.size.height);

    window.stage.grid = grid;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.lineWidth = 1;
    const offsetX = grid.offset?.left || 0;
    const offsetY = grid.offset?.top || 0;
    const cellWidth = grid.cellSize?.width || 50;
    const cellHeight = grid.cellSize?.height || 50;

    switch (grid.type) {
        case 1: // Square
            for (let x = offsetX; x < window.stage.size.width; x += cellWidth) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, window.stage.size.height);
                ctx.stroke();
            }
            for (let y = offsetY; y < window.stage.size.height; y += cellHeight) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(window.stage.size.width, y);
                ctx.stroke();
            }
            break;

        case 2: // HexV
        case 3: // HexH
        case 4: // Isometric
            // These grid types will be implemented later
            ctx.font = "20px Arial";
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillText("Grid type not yet implemented", 20, 60);
            break;
    }
    //ctx.restore();
}

// Draw the assets on the assets layer
function drawAssetsLayer(assets) {
    if (!assets || assets.length === 0) return;
    const layer = window.sceneLayers.assets;
    if (!layer || !layer.ctx) return;
    const ctx = layer.ctx;
    ctx.clearRect(0, 0, window.stage.size.width, window.stage.size.height);
    assets.forEach(asset => drawSingleAsset(ctx, asset));
}

function drawSingleAsset(ctx, asset) {
    const x = asset.positionX || 0;
    const y = asset.positionY || 0;
    const width = asset.sizeX || 40;
    const height = asset.sizeX || 40;
    const scaleX = asset.scaleX || 1;
    const scaleY = asset.scaleY || 1;
    const sizeX = width * scaleX;
    const sizeY = height * scaleY;
    if (asset.imageSrc) {
        drawImage(asset.imageSrc, img => drawAssetImage(ctx, img, asset, x, y, sizeX, sizeY));
    } else {
        drawAssetShape(ctx, asset, x, y, sizeX, sizeY);
    }
}

function drawAssetImage(ctx, img, asset, x, y, sizeX, sizeY) {
    ctx.drawImage(img, x - sizeX / 2, y - sizeY / 2, sizeX, sizeY);
    drawAssetDecorations(ctx, asset, x, y, size);
}

function drawAssetShape(ctx, asset, x, y, sizeX, sizeY) {
    ctx.beginPath();
    ctx.ellipse(x, y, sizeX / 2, sizeY / 2, 0, Math.PI * 2);
    ctx.fillStyle = asset.color || "rgba(100, 100, 100, 0.7)";
    ctx.fill();
    drawAssetDecorations(ctx, asset, x, y, size);
}

function drawAssetDecorations(ctx, asset, x, y, sizeX, sizeY) {
    // Draw border for selected asset
    if (asset.isSelected) {
        ctx.strokeStyle = "rgba(0, 126, 255, 0.8)";
        ctx.lineWidth = 2;
        if (asset.imageSrc) {
            ctx.strokeRect(x - sizeX / 2 - 3, y - sizeY / 2 - 3, sizeX + 6, sizeY + 6);
        } else {
            ctx.beginPath();
            ctx.ellipse(x, y, sizeX / 2 + 3, sizeY / 2 + 3, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // Draw lock icon if asset is locked
    if (asset.isLocked) {
        ctx.font = "16px Arial";
        ctx.fillStyle = "rgba(255, 0, 0, 0.7)";
        ctx.fillText("??", x - 8, y - size / 2 - 5);
    }

    // Draw asset name beneath
    ctx.font = "12px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(asset.name || "Asset", x, y + size / 2 + 15);
}

window.getImageDimensionsFromUrl = async function (url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function () {
            resolve({
                width: img.width,
                height: img.height
            });
        };
        img.onerror = function () {
            reject("Failed to load image");
        };
        img.src = url;
    });
};
