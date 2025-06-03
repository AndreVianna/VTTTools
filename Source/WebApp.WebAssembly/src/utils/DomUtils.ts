class DomUtils {
    static getContainerRect(container: HTMLElement): IRectangle {
        const rect = container.getBoundingClientRect();
        return {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
        };
    }

    static getContainerScroll(container: HTMLElement): IPoint {
        return {
            x: container.scrollLeft,
            y: container.scrollTop
        };
    }

    static setContainerScroll(container: HTMLElement, position: IPoint): void {
        container.scrollLeft = position.x;
        container.scrollTop = position.y;
    }

    static getCanvasRect(canvas: HTMLCanvasElement): IRectangle {
        const rect = canvas.getBoundingClientRect();
        return {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
        };
    }

    static setCanvasRect(canvas: HTMLCanvasElement, rect: IRectangle): void {
        canvas.width = rect.width;
        canvas.height = rect.height;
        canvas.style.left = `${rect.x}px`;
        canvas.style.top = `${rect.y}px`;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
    }

    static setCursor(container: HTMLElement, cursor: string): void {
        container.style.cursor = cursor;
    }

    static setZoomDisplay(zoomDisplay: HTMLElement, zoomLevel: number) {
        zoomDisplay.textContent = `${Math.round(zoomLevel * 100)}%`;
    }
}
