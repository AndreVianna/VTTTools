using VttTools.MediaGenerator.Infrastructure;

namespace VttTools.AssetImageManager.Infrastructure;

public class ImageProcessorTests {
    [Fact]
    public void ResizeIfNeeded_WithZeroTargetSize_ReturnsOriginalImage() {
        var originalImage = CreateTestImage(512, 512);

        var result = ImageProcessor.ResizeIfNeeded(originalImage, 0);

        result.Should().BeSameAs(originalImage);
    }

    [Fact]
    public void ResizeIfNeeded_WithNegativeTargetSize_ReturnsOriginalImage() {
        var originalImage = CreateTestImage(512, 512);

        var result = ImageProcessor.ResizeIfNeeded(originalImage, -100);

        result.Should().BeSameAs(originalImage);
    }

    [Fact]
    public void ResizeIfNeeded_WithSameSize_ReturnsOriginalImage() {
        var originalImage = CreateTestImage(256, 256);

        var result = ImageProcessor.ResizeIfNeeded(originalImage, 256);

        result.Should().BeSameAs(originalImage);
    }

    [Fact]
    public void ResizeIfNeeded_WithDifferentSize_ResizesImage() {
        var originalImage = CreateTestImage(512, 512);

        var result = ImageProcessor.ResizeIfNeeded(originalImage, 256);

        result.Should().NotBeSameAs(originalImage);
        using var image = Image.Load(result);
        image.Width.Should().Be(256);
        image.Height.Should().Be(256);
    }

    [Fact]
    public void ResizeIfNeeded_WithLargerTargetSize_EnlargesImage() {
        var originalImage = CreateTestImage(128, 128);

        var result = ImageProcessor.ResizeIfNeeded(originalImage, 512);

        result.Should().NotBeSameAs(originalImage);
        using var image = Image.Load(result);
        image.Width.Should().Be(512);
        image.Height.Should().Be(512);
    }

    [Fact]
    public void ResizeIfNeeded_PreservesImageFormat() {
        var originalImage = CreateTestImage(512, 512);

        var result = ImageProcessor.ResizeIfNeeded(originalImage, 256);

        using var image = Image.Load(result);
        image.Should().NotBeNull();
    }

    [Fact]
    public void ResizeIfNeeded_WithNonSquareImage_ResizesToSquare() {
        var originalImage = CreateTestImage(800, 600);

        var result = ImageProcessor.ResizeIfNeeded(originalImage, 256);

        using var image = Image.Load(result);
        image.Width.Should().Be(256);
        image.Height.Should().Be(256);
    }

    private static byte[] CreateTestImage(int width, int height) {
        using var image = new Image<Rgba32>(width, height);
        image.Mutate(x => x.BackgroundColor(Color.Blue));

        using var ms = new MemoryStream();
        image.SaveAsPng(ms);
        return ms.ToArray();
    }
}