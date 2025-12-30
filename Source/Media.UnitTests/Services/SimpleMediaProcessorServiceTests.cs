using Microsoft.Extensions.Logging;

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
    public async Task ProcessAsync_WithInvalidRole_ReturnsFailure() {
        var input = new MemoryStream("test"u8.ToArray());

        var result = await _service.ProcessAsync(ResourceRole.Undefined, "image/png", "test.png", input, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Contain("Invalid resource role");
    }

    [Fact]
    public async Task ProcessAsync_WithInvalidContentType_ReturnsFailure() {
        var input = new MemoryStream("test"u8.ToArray());

        var result = await _service.ProcessAsync(ResourceRole.Background, "application/pdf", "test.pdf", input, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Contain("not allowed");
    }

    [Fact]
    public async Task ProcessAsync_WithFileTooLarge_ReturnsFailure() {
        var largeContent = new byte[51 * 1024 * 1024];
        var input = new MemoryStream(largeContent);

        var result = await _service.ProcessAsync(ResourceRole.Background, "image/png", "test.png", input, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Contain("exceeds maximum");
    }

    [Fact]
    public async Task ProcessAsync_WithValidImageUnderMaxSize_ProcessesSuccessfully() {
        var imageBytes = CreateValidPngImage(100, 100);
        var input = new MemoryStream(imageBytes);

        var result = await _service.ProcessAsync(ResourceRole.Token, "image/png", "test.png", input, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.ContentType.Should().Be("image/png");
        result.Value.Dimensions.Width.Should().BeLessThanOrEqualTo(1024);
        result.Value.Dimensions.Height.Should().BeLessThanOrEqualTo(1024);
    }

    [Fact]
    public async Task ProcessAsync_WithOversizedImage_ResizesImage() {
        var imageBytes = CreateValidPngImage(2048, 2048);
        var input = new MemoryStream(imageBytes);

        var result = await _service.ProcessAsync(ResourceRole.Token, "image/png", "test.png", input, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Dimensions.Width.Should().BeLessThanOrEqualTo(1024);
        result.Value.Dimensions.Height.Should().BeLessThanOrEqualTo(1024);
    }

    [Fact]
    public async Task ProcessAsync_WithImageRequiringThumbnail_GeneratesThumbnail() {
        var imageBytes = CreateValidPngImage(256, 256);
        var input = new MemoryStream(imageBytes);

        var result = await _service.ProcessAsync(ResourceRole.Token, "image/png", "test.png", input, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Thumbnail.Should().NotBeNull();
        result.Value.Thumbnail!.Length.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task ProcessAsync_WithInvalidImageData_ReturnsFailure() {
        var input = new MemoryStream("not an image"u8.ToArray());

        var result = await _service.ProcessAsync(ResourceRole.Background, "image/png", "test.png", input, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Contain("Failed to process image");
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
    public async Task ProcessAsync_WithJpegImage_ConvertsToPng() {
        var imageBytes = CreateValidJpegImage(256, 256);
        var input = new MemoryStream(imageBytes);

        var result = await _service.ProcessAsync(ResourceRole.Token, "image/jpeg", "test.jpg", input, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.ContentType.Should().Be("image/png");
        result.Value.FileName.Should().EndWith(".png");
    }

    [Fact]
    public async Task ProcessAsync_WithGifImage_ConvertsToPng() {
        var imageBytes = CreateValidGifImage(128, 128);
        var input = new MemoryStream(imageBytes);

        var result = await _service.ProcessAsync(ResourceRole.Token, "image/gif", "test.gif", input, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.ContentType.Should().Be("image/png");
    }

    [Fact]
    public async Task ProcessAsync_WithWebPImage_ConvertsToPng() {
        var imageBytes = CreateValidWebPImage(200, 200);
        var input = new MemoryStream(imageBytes);

        var result = await _service.ProcessAsync(ResourceRole.Illustration, "image/webp", "test.webp", input, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.ContentType.Should().Be("image/png");
    }

    [Theory]
    [InlineData(ResourceRole.Token, 1024, 1024)]
    [InlineData(ResourceRole.Portrait, 1024, 1024)]
    [InlineData(ResourceRole.Illustration, 1024, 1024)]
    public async Task ProcessAsync_RespectsRoleConstraints(ResourceRole resourceType, int maxWidth, int maxHeight) {
        var imageBytes = CreateValidPngImage(maxWidth * 2, maxHeight * 2);
        var input = new MemoryStream(imageBytes);

        var result = await _service.ProcessAsync(resourceType, "image/png", "test.png", input, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Dimensions.Width.Should().BeLessThanOrEqualTo(maxWidth);
        result.Value.Dimensions.Height.Should().BeLessThanOrEqualTo(maxHeight);
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

    private static byte[] CreateValidGifImage(int width, int height) {
        using var image = new Image<Rgba32>(width, height);
        image.Mutate(x => x.BackgroundColor(Color.Green));
        using var ms = new MemoryStream();
        image.SaveAsGif(ms);
        return ms.ToArray();
    }

    private static byte[] CreateValidWebPImage(int width, int height) {
        using var image = new Image<Rgba32>(width, height);
        image.Mutate(x => x.BackgroundColor(Color.Yellow));
        using var ms = new MemoryStream();
        image.SaveAsWebp(ms);
        return ms.ToArray();
    }
}
