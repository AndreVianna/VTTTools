class ImageCache {
    private static readonly cache = new Map<string, HTMLImageElement>();

    static loadImage(url: string, onLoad: (img: HTMLImageElement) => void): void {
        if (this.cache.has(url)) {
            const cached = this.cache.get(url)!;
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

    static async getImageSize(src: string): Promise<ISize> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.width, height: img.height });
            img.onerror = () => reject(`Failed to load image '${src}'`);
            img.src = src;
        });
    }
}
