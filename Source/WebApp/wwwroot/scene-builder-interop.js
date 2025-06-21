// Scene Builder Navigation Interop
// Handles communication between main navigation and Scene Builder WebAssembly component

window.sceneBuilderInterop = {
    // Reference to the Scene Builder component instance
    sceneBuilderInstance: null,

    // Register the Scene Builder component instance
    registerSceneBuilder: function (componentInstance) {
        this.sceneBuilderInstance = componentInstance;
    },

    // Unregister the Scene Builder component instance
    unregisterSceneBuilder: function () {
        this.sceneBuilderInstance = null;
    },

    // Navigation action triggers
    triggerChangeImage: function () {
        if (this.sceneBuilderInstance) {
            this.sceneBuilderInstance.invokeMethodAsync('OpenChangeImageModal');
        }
    },

    triggerGridSettings: function () {
        if (this.sceneBuilderInstance) {
            this.sceneBuilderInstance.invokeMethodAsync('OpenGridSettingsModal');
        }
    },

    triggerAssetPlacement: function (assetType) {
        if (this.sceneBuilderInstance) {
            this.sceneBuilderInstance.invokeMethodAsync('StartAssetPlacement', assetType);
        }
    },

    triggerResetZoom: function () {
        if (this.sceneBuilderInstance) {
            this.sceneBuilderInstance.invokeMethodAsync('ResetZoom');
        }
    },

    triggerFitHorizontally: function () {
        if (this.sceneBuilderInstance) {
            this.sceneBuilderInstance.invokeMethodAsync('FitHorizontally');
        }
    },

    triggerFitVertically: function () {
        if (this.sceneBuilderInstance) {
            this.sceneBuilderInstance.invokeMethodAsync('FitVertically');
        }
    },

    triggerZoomIn: function () {
        if (this.sceneBuilderInstance) {
            this.sceneBuilderInstance.invokeMethodAsync('ZoomIn');
        }
    },

    triggerZoomOut: function () {
        if (this.sceneBuilderInstance) {
            this.sceneBuilderInstance.invokeMethodAsync('ZoomOut');
        }
    },

    // Update zoom level display in main navigation
    updateZoomLevel: function (zoomLevel) {
        // This would be called by Scene Builder to update the main nav
        const zoomDisplay = document.querySelector('.navbar .text-light.me-2');
        if (zoomDisplay) {
            zoomDisplay.textContent = Math.round(zoomLevel * 100) + '%';
        }
    }
};