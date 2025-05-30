class ImageCache {
    private static readonly cache = new Map<string, HTMLImageElement>();

    static loadImage(src: string, onLoad: (img: HTMLImageElement) => void): void {
        if (this.cache.has(src)) {
            const cached = this.cache.get(src)!;
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

    static async getImageDimensions(url: string): Promise<IMageDimensions> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.width, height: img.height });
            img.onerror = () => reject("Failed to load image");
            img.src = url;
        });
    }
}