namespace VttTools.MediaGenerator.Infrastructure;

public static class ImageProcessor {
    public static byte[] ResizeIfNeeded(byte[] imageBytes, int targetSize) {
        if (targetSize <= 0)
            return imageBytes;

        using var image = Image.Load(imageBytes);

        if (image.Width == targetSize && image.Height == targetSize)
            return imageBytes;

        image.Mutate(x => x.Resize(targetSize, targetSize));

        using var ms = new MemoryStream();
        image.SaveAsPng(ms);
        return ms.ToArray();
    }
}