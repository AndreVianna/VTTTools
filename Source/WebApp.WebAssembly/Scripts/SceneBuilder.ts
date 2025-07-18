class SceneBuilder {
    private static builder: IBuilderHandler = window as unknown as IBuilderHandler;
    private static defaultState: IBuilderState = {
        id: "",
        imageSize: { width: 0, height: 0 },
        containerRect: { x: 0, y: 0, width: 0, height: 0 },
        containerScroll: { x: 0, y: 0 },
        layerRect: { x: 0, y: 0, width: 0, height: 0 },
        zoomLevel: 1.0,
        layers: [],
    };

    static initialize(): void {
        this.initializeProperties();
        this.bindMethods();
        this.captureDomElements();
        this.bindMouseEvents();
    }

    private static initializeProperties(): void {
        this.builder.state = this.defaultState;
    }

    private static bindMethods(): void {
        this.builder.setup = this.setup.bind(this);
        this.builder.render = this.render.bind(this);
        this.builder.setLayer = this.setLayer.bind(this);
        this.builder.setZoom = this.setZoom.bind(this);

        this.builder.getImageSize = ImageCache.getImageSize.bind(ImageCache);
        this.builder.getContainerRect = DomUtilities.getContainerRect.bind(DomUtilities);
        this.builder.getContainerScroll = DomUtilities.getContainerScroll.bind(DomUtilities);
        this.builder.setContainerScroll = DomUtilities.setContainerScroll.bind(DomUtilities);
        this.builder.getCanvasRect = DomUtilities.getCanvasRect.bind(DomUtilities);
        this.builder.setCanvasRect = DomUtilities.setCanvasRect.bind(DomUtilities);
        this.builder.setCursor = DomUtilities.setCursor.bind(DomUtilities);
        this.builder.setZoomDisplay = DomUtilities.setZoomDisplay.bind(DomUtilities);
    }

    private static captureDomElements(): void {
        this.builder.state = this.defaultState;
        this.builder.container = document.querySelector<HTMLElement>('#layers-container')!;
        this.builder.layers = [];
        const layers = document.querySelectorAll<HTMLCanvasElement>(".builder-layer");
        layers.forEach(layer => {
            this.builder.layers.push(new Layer(layer.id.replace("-layer", ""), layer));
        });
        this.builder.zoomDisplay = document.querySelector<HTMLElement>("#zoom-level-display")!;
    }

    private static bindMouseEvents(): void {
        this.builder.container.addEventListener('wheel', (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleWheel(e.clientX, e.clientY, e.deltaY);
        }, { passive: false });
    }

    static async setup(id: string, setup: ILayersSetup): Promise<void> {
        await this.calculateInitialState(id, setup);
        this.initializeLayers(setup);
        this.resetZoom();
        this.updateDomElements();
        this.render();
        return;
    }

    private static async calculateInitialState(id: string, setup: ILayersSetup): Promise<void> {
        this.builder.state = {
            ...this.builder.state,
            id: id,
            containerRect: DomUtilities.getContainerRect(this.builder.container),
            imageSize: await ImageCache.getImageSize(setup.imageUrl),
        };
    }

    private static initializeLayers(setup: ILayersSetup): void {
        const layers = this.builder.layers;
        layers.length = 0;
        layers.push(new BackgroundLayer(setup.imageUrl));
        layers.push(new GridLayer(setup.grid));
        layers.push(new AssetsLayer(setup.assets));

        this.builder.state.containerScroll = setup.stage.panning;
    }

    private static handleWheel(clientX: number, clientY: number, deltaY: number): void {
        const state = this.builder.state;
        state.containerScroll = DomUtilities.getContainerScroll(this.builder.container);
        const mouseX = clientX - state.containerRect.x;
        const mouseY = clientY - state.containerRect.y;
        const zoomLevel = deltaY > 0
            ? Math.ceil((state.zoomLevel - RenderConstants.zoomStep) * 10) / 10
            : Math.floor((state.zoomLevel + RenderConstants.zoomStep) * 10) / 10;
        this.updateZoom(mouseX, mouseY, zoomLevel);
        this.updateDomElements();
        this.render();

    }

    private static setLayer(layer: ILayer): void {
    }

    static render(data?: ILayersSetup): void {
        if (data) {
            this.initializeLayers(data);
        }

        const state = this.builder.state;
        for (const layer of this.builder.layers) {
            layer.render(state.zoomLevel);
        }
    }

    private static updateDomElements(): void {
        const state = this.builder.state;
        for (const layer of this.builder.layers)
            DomUtilities.setCanvasRect(layer.canvas, state.layerRect);
        DomUtilities.setContainerScroll(this.builder.container, state.containerScroll);
        DomUtilities.setZoomDisplay(this.builder.zoomDisplay, state.zoomLevel);
    }

    static openChangeImageModal(): void {
        const modal = document.querySelector('[data-modal="change-image"]') as HTMLElement;
        if (modal) {
            modal.style.display = 'block';
            modal.classList.add('show');
        }

        const backdrop = document.querySelector('[data-backdrop="change-image"]') as HTMLElement;
        if (backdrop) {
            backdrop.style.display = 'block';
            backdrop.classList.add('show');
        }
    }

    static openGridSettingsModal(): void {
        const modal = document.querySelector('[data-modal="grid-settings"]') as HTMLElement;
        if (modal) {
            modal.style.display = 'block';
            modal.classList.add('show');
        }

        const backdrop = document.querySelector('[data-backdrop="grid-settings"]') as HTMLElement;
        if (backdrop) {
            backdrop.style.display = 'block';
            backdrop.classList.add('show');
        }
    }

    static startAssetPlacement(assetType: string): void {
        const assetTypeInput = document.querySelector('[data-asset-type]') as HTMLInputElement;
        if (assetTypeInput) {
            assetTypeInput.value = assetType;
        }

        const modal = document.querySelector('[data-modal="asset-selector"]') as HTMLElement;
        if (modal) {
            modal.style.display = 'block';
            modal.classList.add('show');
        }

        const backdrop = document.querySelector('[data-backdrop="asset-selector"]') as HTMLElement;
        if (backdrop) {
            backdrop.style.display = 'block';
            backdrop.classList.add('show');
        }
    }

    static closeModal(modalType: string): void {
        const modal = document.querySelector(`[data-modal="${modalType}"]`) as HTMLElement;
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
        }

        const backdrop = document.querySelector(`[data-backdrop="${modalType}"]`) as HTMLElement;
        if (backdrop) {
            backdrop.style.display = 'none';
            backdrop.classList.remove('show');
        }
    }

    static setZoom(zoomAction: string): void {
        const state = this.builder.state;
        let centerX: number = state.containerRect.width / 2;
        let centerY: number = state.containerRect.height / 2;
        let zoomLevel: number = 1;
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

    static resetZoom(): void {
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

    static updateZoom(mouseX: number, mouseY: number, zoomLevel: number): void {
        zoomLevel = Math.max(RenderConstants.minZoomLevel, Math.min(RenderConstants.maxZoomLevel, zoomLevel));
        const state = this.builder.state;
        const layerWidth = state.imageSize.width + (2 * RenderConstants.canvasPadding);
        const layerHeight = state.imageSize.height + (2 * RenderConstants.canvasPadding);

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
