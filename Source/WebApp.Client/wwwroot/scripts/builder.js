// Global layer references
window.sceneLayers = {
    background: null,   // Background image layer
    grid: null,         // Grid layer
    assets: null        // Assets layer
};

window.sceneState = {
    background: null,
    grid: null
};

window.initCanvas = function (canvasContainer, width, height) {
    // Clear any existing canvases
    while (canvasContainer.firstChild) {
        canvasContainer.removeChild(canvasContainer.firstChild);
    }

    // Default canvas size with padding
    const canvasWidth = width + 400; // 200px on each side
    const canvasHeight = height + 400; // 200px on each side

    // Create and set up each layer canvas
    const layers = ["background", "grid", "assets"];

    layers.forEach(layer => {
        const canvas = document.createElement("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.id = `scene-canvas-${layer}`;
        canvas.className = "scene-canvas-layer";

        // Set styles for all canvas layers - position them stacked on top of each other
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";

        canvasContainer.appendChild(canvas);

        // Store the canvas context reference
        window.sceneLayers[layer] = {
            canvas: canvas,
            ctx: canvas.getContext("2d")
        };
    });

    // Store dimensions
    window.sceneCanvasWidth = canvasWidth;
    window.sceneCanvasHeight = canvasHeight;

    // Setup tracking variables for panning detection
    window.isPanning = false;
    window.hasMoved = false;

    // Initialize panning and center the canvas container
    initPanning(canvasContainer);
    centerCanvas(canvasContainer);
};

function centerCanvas(container) {
    if (!container) return;

    // All canvases have the same dimensions, so we can use any of them
    const canvasWidth = window.sceneCanvasWidth;
    const canvasHeight = window.sceneCanvasHeight;

    // Center the container by setting scroll position
    setTimeout(() => {
        const scrollX = Math.max(0, (canvasWidth - container.clientWidth) / 2);
        const scrollY = Math.max(0, (canvasHeight - container.clientHeight) / 2);
        container.scrollLeft = scrollX;
        container.scrollTop = scrollY;
    }, 100);
}

// Panning logic remains mostly unchanged
function initPanning(container) {
    if (!container) return;

    let startX, startY;
    let scrollLeft, scrollTop;
    const moveThreshold = 5; // pixels to consider as a move vs. a click

    // Track mouse down for panning with right button
    document.addEventListener("mousedown", function (e) {
        if (e.button === 2 && e.target.closest(".scene-canvas-container")) { // Right mouse button inside container
            window.isPanning = true;
            window.hasMoved = false;
            startX = e.pageX;
            startY = e.pageY;
            scrollLeft = container.scrollLeft;
            scrollTop = container.scrollTop;

            // Change cursor to indicate panning mode
            container.style.cursor = "grabbing";
        }
    });

    // Track mouse move for panning
    document.addEventListener("mousemove",
        function(e) {
            if (!window.isPanning) return;

            const dx = Math.abs(e.pageX - startX);
            const dy = Math.abs(e.pageY - startY);

            if (dx > moveThreshold || dy > moveThreshold) {
                window.hasMoved = true;
            }

            // Scroll the container
            container.scrollLeft = scrollLeft - (e.pageX - startX);
            container.scrollTop = scrollTop - (e.pageY - startY);
        });

    // Stop panning on mouse up
    document.addEventListener("mouseup",
        function(e) {
            if (e.button === 2 && window.isPanning) { // Right mouse button release
                window.isPanning = false;
                container.style.cursor = "default";
            }
        });

    // Stop panning if mouse leaves document
    document.addEventListener("mouseleave",
        function() {
            if (window.isPanning) {
                window.isPanning = false;
                container.style.cursor = "default";
            }
        });
};

// Function to check if user was panning
window.wasPanning = function () {
    const wasPanning = window.hasMoved === true;
    return wasPanning;
};

// Main draw function that delegates to layer-specific functions
window.drawScene = function (sceneData) {
    // Draw each layer independently
    drawBackgroundLayer(sceneData.imageUrl);
    drawGridLayer(sceneData.grid);
    drawAssetsLayer(sceneData.assets);
};

// Draw the background image on the background layer
function drawBackgroundLayer(imageUrl) {
    const layer = window.sceneLayers.background;
    if (!layer || !layer.ctx) return;

    const backgroundChanged = window.sceneState.backgroundUrl !== imageUrl;
    if (!backgroundChanged) return;
    layer.ctx.clearRect(0, 0, window.sceneCanvasWidth, window.sceneCanvasHeight);
    if (!imageUrl) return;

    const img = new Image();
    img.onload = function () {
        // Calculate positioning to center the image on the canvas (with 200px padding on all sides)
        const imgX = (window.sceneCanvasWidth - img.width) / 2;
        const imgY = (window.sceneCanvasHeight - img.height) / 2;

        // Draw the image centered on the background layer
        layer.ctx.drawImage(img, imgX, imgY, img.width, img.height);
        window.sceneState.backgroundUrl = imageUrl;
    };
    img.onerror = function () {
        console.error("Failed to load image:", imageUrl);
        window.sceneState.backgroundUrl = null;
    };
    img.src = imageUrl;
}

// Draw the grid on the grid layer
function drawGridLayer(grid) {
    const layer = window.sceneLayers.grid;
    if (!layer || !layer.ctx) return;

    const gridChanged = !window.sceneState.grid ||
        JSON.stringify(window.sceneState.grid) !== JSON.stringify(grid);
    if (!gridChanged) return;

    layer.ctx.clearRect(0, 0, window.sceneCanvasWidth, window.sceneCanvasHeight);
    if (!grid || grid.type === 0) return;
    window.sceneState.grid = grid;

    const ctx = layer.ctx;
    const width = window.sceneCanvasWidth;
    const height = window.sceneCanvasHeight;

    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.lineWidth = 1;

    const offsetX = grid.offset?.left || 0;
    const offsetY = grid.offset?.top || 0;
    const cellWidth = grid.cellSize?.width || 50;
    const cellHeight = grid.cellSize?.height || 50;

    switch (grid.type) {
        case 1: // Square
            // Draw vertical lines
            for (let x = offsetX; x < width; x += cellWidth) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }

            // Draw horizontal lines
            for (let y = offsetY; y < height; y += cellHeight) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
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
}

// Draw the assets on the assets layer
function drawAssetsLayer(assets) {
    const layer = window.sceneLayers.assets;
    if (!layer || !layer.ctx) return;
    layer.ctx.clearRect(0, 0, window.sceneCanvasWidth, window.sceneCanvasHeight);
    if (!assets || assets.length === 0) return;

    assets.forEach(asset => drawSingleAsset(layer.ctx, asset));
}

function drawSingleAsset(ctx, asset) {
    const x = asset.position?.left || 0;
    const y = asset.position?.top || 0;
    const scale = asset.scale || 1;
    const size = 40 * scale; // Default size

    if (asset.imageSrc) {
        const img = new Image();
        img.onload = function () {
            ctx.drawImage(img, x - size / 2, y - size / 2, size, size);

            // Draw border for selected asset
            if (asset.isSelected) {
                ctx.strokeStyle = "rgba(0, 126, 255, 0.8)";
                ctx.lineWidth = 2;
                ctx.strokeRect(x - size / 2 - 3, y - size / 2 - 3, size + 6, size + 6);
            }

            // Draw lock icon if asset is locked
            if (asset.isLocked) {
                ctx.font = "16px Arial";
                ctx.fillStyle = "rgba(255, 0, 0, 0.7)";
                ctx.fillText("🔒", x - 8, y - size / 2 - 5);
            }

            // Draw asset name beneath
            ctx.font = "12px Arial";
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.fillText(asset.name || "Asset", x, y + size / 2 + 15);
        };
        img.onerror = function() {
            console.error("Failed to load image:", asset.imageSrc);
        };
        img.src = asset.imageSrc;
    } else {
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fillStyle = asset.color || "rgba(100, 100, 100, 0.7)";
        ctx.fill();

        // Draw border for selected asset
        if (asset.isSelected) {
            ctx.strokeStyle = "rgba(0, 126, 255, 0.8)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, size / 2 + 3, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw lock icon if asset is locked
        if (asset.isLocked) {
            ctx.font = "16px Arial";
            ctx.fillStyle = "rgba(255, 0, 0, 0.7)";
            ctx.fillText("🔒", x - 8, y - size / 2 - 5);
        }

        // Draw asset name beneath
        ctx.font = "12px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText(asset.name || "Asset", x, y + size / 2 + 15);
    }
}


window.getCanvasMousePosition = function (canvasRef, event) {
    // Check if we have layers initialized
    if (window.sceneLayers && window.sceneLayers.assets && window.sceneLayers.assets.canvas) {
        const canvas = window.sceneLayers.assets.canvas;
        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }
    // Fallback to using the provided canvasRef
    else if (canvasRef) {
        const rect = canvasRef.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }
    // If all else fails, return null values that can be easily checked in C#
    else {
        console.error("Cannot determine canvas position: no valid canvas reference");
        return {
            x: null,
            y: null
        };
    }
};

// Find asset at position
window.findAssetAt = function (x, y, assets) {
    // Check in reverse order (top-most asset first)
    for (let i = assets.length - 1; i >= 0; i--) {
        const asset = assets[i];
        const assetX = asset.position?.left || 0;
        const assetY = asset.position?.top || 0;
        const scale = asset.scale || 1;
        const size = 40 * scale;

        // Check if point is within asset bounds
        const left = assetX - size / 2;
        const top = assetY - size / 2;
        const right = assetX + size / 2;
        const bottom = assetY + size / 2;

        if (x >= left && x <= right && y >= top && y <= bottom) {
            return asset;
        }
    }
    return null;
};