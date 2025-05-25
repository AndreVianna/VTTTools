window.initCanvas = function (canvas, width, height) {
    // Default canvas size with padding
    const canvasWidth = width + 400; // 200px on each side
    const canvasHeight = height + 400; // 200px on each side

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d");

    // Store context and dimensions in global vars for later use
    window.sceneCanvasCtx = ctx;
    window.sceneCanvasWidth = canvasWidth;
    window.sceneCanvasHeight = canvasHeight;

    // Setup tracking variables for panning detection
    window.isPanning = false;
    window.hasMoved = false;

    // Initialize panning and center the canvas
    initPanning(canvas.parentElement);
    centerCanvas(canvas.parentElement, canvas);
};

function centerCanvas(container, canvas) {
    if (!container || !canvas) return;

    // Center the image in the container initially
    setTimeout(() => {
        const scrollX = (canvas.width - container.clientWidth) / 2;
        const scrollY = (canvas.height - container.clientHeight) / 2;
        container.scrollLeft = scrollX;
        container.scrollTop = scrollY;
    }, 100);
}

function initPanning(container) {
    if (!container) return;

    let startX, startY;
    let scrollLeft, scrollTop;
    const moveThreshold = 5; // pixels to consider as a move vs. a click

    // Track mouse down for panning with right button
    document.addEventListener('mousedown', function (e) {
        if (e.button === 2 && e.target.closest('.scene-canvas-container')) { // Right mouse button inside container
            window.isPanning = true;
            window.hasMoved = false;
            startX = e.pageX;
            startY = e.pageY;
            scrollLeft = container.scrollLeft;
            scrollTop = container.scrollTop;

            // Change cursor to indicate panning mode
            container.style.cursor = 'grabbing';
        }
    });

    // Track mouse move for panning
    document.addEventListener('mousemove', function (e) {
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
    document.addEventListener('mouseup', function (e) {
        if (e.button === 2 && window.isPanning) { // Right mouse button release
            window.isPanning = false;
            container.style.cursor = 'default';
        }
    });

    // Stop panning if mouse leaves document
    document.addEventListener('mouseleave', function () {
        if (window.isPanning) {
            window.isPanning = false;
            container.style.cursor = 'default';
        }
    });
}

// Function to check if user was panning (moved the mouse while right button was down)
window.wasPanning = function () {
    const wasPanning = window.hasMoved === true;
    return wasPanning;
};

window.drawScene = function (sceneData) {
    const ctx = window.sceneCanvasCtx;
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, window.sceneCanvasWidth, window.sceneCanvasHeight);

    // Draw background if there's a source
    if (sceneData.imageUrl) {
        const img = new Image();
        img.onload = function () {
            console.log("Image loaded successfully: ", sceneData.imageUrl);
            console.log("Canvas size: ", window.sceneCanvasWidth, ", ", window.sceneCanvasHeight);

            // Calculate positioning to center the image on the canvas (with 200px padding on all sides)
            const imgX = (window.sceneCanvasWidth - img.width) / 2;
            const imgY = (window.sceneCanvasHeight - img.height) / 2;

            // Draw the image centered
            ctx.drawImage(img, imgX, imgY, img.width, img.height);

            // Draw grid on top of background
            if (sceneData.grid && sceneData.grid.type !== 0) { // 0 = NoGrid
                drawGrid(sceneData.grid);
            }

            // Draw assets
            if (sceneData.assets && sceneData.assets.length) {
                drawAssets(sceneData.assets);
            }
        };
        img.onerror = function () {
            console.error("Failed to load image:", sceneData.imageUrl);
            // Fallback to drawing grid and assets without background
            if (sceneData.grid && sceneData.grid.type !== 0) {
                drawGrid(sceneData.grid);
            }
            if (sceneData.assets && sceneData.assets.length) {
                drawAssets(sceneData.assets);
            }
        };
        img.src = sceneData.imageUrl;
    } else {
        // No background, draw grid and assets directly
        if (sceneData.grid && sceneData.grid.type !== 0) {
            drawGrid(sceneData.grid);
        }

        if (sceneData.assets && sceneData.assets.length) {
            drawAssets(sceneData.assets);
        }
    }
};

window.drawGrid = function(grid) {
    const ctx = window.sceneCanvasCtx;
    const width = window.sceneCanvasWidth;
    const height = window.sceneCanvasHeight;

    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.lineWidth = 1;

    const offsetX = grid.offset?.left || 0;
    const offsetY = grid.offset?.top || 0;
    const cellWidth = grid.cellSize?.width || 50;
    const cellHeight = grid.cellSize?.height || 50;

    switch(grid.type) {
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
};

window.drawAssets = function(assets) {
    const ctx = window.sceneCanvasCtx;

    assets.forEach(asset => {
        // Draw a placeholder circle for assets without images
        const x = asset.position?.left || 0;
        const y = asset.position?.top || 0;
        const scale = asset.scale || 1;
        const size = 40 * scale; // Default size

        if (asset.imageSrc) {
            const img = new Image();
            img.onload = function() {
                ctx.drawImage(img, x - size/2, y - size/2, size, size);

                // Draw border for selected asset
                if (asset.isSelected) {
                    ctx.strokeStyle = "rgba(0, 126, 255, 0.8)";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x - size/2 - 3, y - size/2 - 3, size + 6, size + 6);
                }

                // Draw lock icon if asset is locked
                if (asset.isLocked) {
                    ctx.font = "16px Arial";
                    ctx.fillStyle = "rgba(255, 0, 0, 0.7)";
                    ctx.fillText("🔒", x - 8, y - size/2 - 5);
                }

                // Draw asset name beneath
                ctx.font = "12px Arial";
                ctx.fillStyle = "black";
                ctx.textAlign = "center";
                ctx.fillText(asset.name || "Asset", x, y + size/2 + 15);
            };
            img.src = asset.imageSrc;
        } else {
            ctx.beginPath();
            ctx.arc(x, y, size/2, 0, Math.PI * 2);
            ctx.fillStyle = asset.color || "rgba(100, 100, 100, 0.7)";
            ctx.fill();

            // Draw border for selected asset
            if (asset.isSelected) {
                ctx.strokeStyle = "rgba(0, 126, 255, 0.8)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(x, y, size/2 + 3, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Draw lock icon if asset is locked
            if (asset.isLocked) {
                ctx.font = "16px Arial";
                ctx.fillStyle = "rgba(255, 0, 0, 0.7)";
                ctx.fillText("🔒", x - 8, y - size/2 - 5);
            }

            // Draw asset name beneath
            ctx.font = "12px Arial";
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.fillText(asset.name || "Asset", x, y + size/2 + 15);
        }
    });
};

window.getCanvasMousePosition = function(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
};

window.findAssetAt = function(x, y, assets) {
    // Check in reverse order (top-most asset first)
    for (let i = assets.length - 1; i >= 0; i--) {
        const asset = assets[i];
        const assetX = asset.position?.left || 0;
        const assetY = asset.position?.top || 0;
        const scale = asset.scale || 1;
        const size = 40 * scale;

        // Check if point is within asset bounds
        const left = assetX - size/2;
        const top = assetY - size/2;
        const right = assetX + size/2;
        const bottom = assetY + size/2;

        if (x >= left && x <= right && y >= top && y <= bottom) {
            return asset;
        }
    }
    return null;
};
