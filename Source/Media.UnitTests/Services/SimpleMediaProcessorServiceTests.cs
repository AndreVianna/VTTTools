namespace VttTools.Media.Services;

public class SimpleMediaProcessorServiceTests {
    private readonly ILogger<MediaProcessorService> _logger = Substitute.For<ILogger<MediaProcessorService>>();
    private readonly MediaProcessorService _service;
    private readonly CancellationToken _ct;

    public SimpleMediaProcessorServiceTests() {
        _service = new(_logger);
        _ct = TestContext.Current.CancellationToken;
    }

    [Fact]
    public async Task GenerateThumbnailAsync_WithValidImage_ReturnsThumbnail() {
        var imageBytes = CreateValidPngImage(512, 512);
        var input = new MemoryStream(imageBytes);

        var thumbnail = await _service.GenerateThumbnailAsync("image/png", input, 256, _ct);

        thumbnail.Should().NotBeNull();
        thumbnail.Length.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task GenerateThumbnailAsync_WithInvalidImage_ReturnsNull() {
        var input = new MemoryStream("not an image"u8.ToArray());

        var thumbnail = await _service.GenerateThumbnailAsync("image/png", input, 256, _ct);

        thumbnail.Should().BeNull();
    }

    [Fact]
    public async Task GenerateThumbnailAsync_WithAudioContent_ReturnsNull() {
        var input = new MemoryStream("audio content"u8.ToArray());

        var thumbnail = await _service.GenerateThumbnailAsync("audio/mpeg", input, 256, _ct);

        thumbnail.Should().BeNull();
    }

    [Fact]
    public async Task GenerateThumbnailAsync_WithUnsupportedContentType_ReturnsNull() {
        var input = new MemoryStream("test content"u8.ToArray());

        var thumbnail = await _service.GenerateThumbnailAsync("application/pdf", input, 256, _ct);

        thumbnail.Should().BeNull();
    }

    [Fact]
    public async Task GenerateThumbnailAsync_WithLandscapeImage_CropsFromCenter() {
        // Arrange
        var imageBytes = CreateValidPngImage(1920, 1080);
        var input = new MemoryStream(imageBytes);

        // Act
        var thumbnailBytes = await _service.GenerateThumbnailAsync("image/png", input, 256, _ct);

        // Assert
        thumbnailBytes.Should().NotBeNull();
        using var thumbnail = Image.Load(thumbnailBytes!);
        thumbnail.Width.Should().Be(256);
        thumbnail.Height.Should().Be(256);
    }

    [Fact]
    public async Task GenerateThumbnailAsync_WithPortraitImage_CropsFromCenter() {
        // Arrange
        var imageBytes = CreateValidPngImage(1080, 1920);
        var input = new MemoryStream(imageBytes);

        // Act
        var thumbnailBytes = await _service.GenerateThumbnailAsync("image/png", input, 256, _ct);

        // Assert
        thumbnailBytes.Should().NotBeNull();
        using var thumbnail = Image.Load(thumbnailBytes!);
        thumbnail.Width.Should().Be(256);
        thumbnail.Height.Should().Be(256);
    }

    [Fact]
    public async Task GenerateThumbnailAsync_WithSquareImage_ResizesWithoutCropping() {
        // Arrange
        var imageBytes = CreateValidPngImage(500, 500);
        var input = new MemoryStream(imageBytes);

        // Act
        var thumbnailBytes = await _service.GenerateThumbnailAsync("image/png", input, 256, _ct);

        // Assert
        thumbnailBytes.Should().NotBeNull();
        using var thumbnail = Image.Load(thumbnailBytes!);
        thumbnail.Width.Should().Be(256);
        thumbnail.Height.Should().Be(256);
    }

    [Fact]
    public async Task GenerateThumbnailAsync_WithValidImage_ReturnsPngFormat() {
        // Arrange
        var imageBytes = CreateValidJpegImage(800, 600);
        var input = new MemoryStream(imageBytes);

        // Act
        var thumbnailBytes = await _service.GenerateThumbnailAsync("image/jpeg", input, 256, _ct);

        // Assert
        thumbnailBytes.Should().NotBeNull();
        using var thumbnail = Image.Load(thumbnailBytes!);
        thumbnail.Metadata.DecodedImageFormat.Should().NotBeNull();
        thumbnail.Metadata.DecodedImageFormat!.DefaultMimeType.Should().Be("image/png");
    }

    private static byte[] CreateValidPngImage(int width, int height) {
        using var image = new Image<Rgba32>(width, height);
        image.Mutate(x => x.BackgroundColor(Color.Blue));
        using var ms = new MemoryStream();
        image.SaveAsPng(ms);
        return ms.ToArray();
    }

    private static byte[] CreateValidJpegImage(int width, int height) {
        using var image = new Image<Rgba32>(width, height);
        image.Mutate(x => x.BackgroundColor(Color.Red));
        using var ms = new MemoryStream();
        image.SaveAsJpeg(ms);
        return ms.ToArray();
    }
}
