class DomUtils {
    static getCanvasBoundingRect(canvasContainer: HTMLElement): ICanvasBounds | null {
        const canvas = canvasContainer.querySelector(".scene-canvas-layer") as HTMLCanvasElement;
        if (!canvas) return null;

        const rect = canvas.getBoundingClientRect();
        return {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
        };
    }

    static getScrollPosition(container: HTMLElement): IScrollPosition {
        return {
            left: container.scrollLeft,
            top: container.scrollTop
        };
    }

    static setScrollPosition(container: HTMLElement, position: IScrollPosition): void {
        container.scrollLeft = position.left;
        container.scrollTop = position.top;
    }

    static setCursor(container: HTMLElement, cursor: string): void {
        container.style.cursor = cursor;
    }
}