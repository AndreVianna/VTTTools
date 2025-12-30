using VttTools.AssetImageManager.Mocks;
using VttTools.MediaGenerator.Infrastructure.Clients.StabilityAi;

namespace VttTools.AssetImageManager.Infrastructure.Clients.StabilityAi;

public sealed class StabilityClientTests : IDisposable {
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;
    private readonly StabilityClient _client;
    private readonly MockHttpMessageHandler _mockHandler;
    private readonly CancellationToken _ct;

    public StabilityClientTests() {
        _httpClientFactory = Substitute.For<IHttpClientFactory>();
        _config = Substitute.For<IConfiguration>();
        _mockHandler = new();
        _ct = TestContext.Current.CancellationToken;

        _config["Providers:Stability:BaseUrl"].Returns("https://api.stability.ai");
        _config["Providers:Stability:ApiKey"].Returns("test-key");
        _config["Providers:Stability:sd3"].Returns("/v2beta/stable-image/generate/sd3");
        _config["Images:Token:AspectRatio"].Returns("1:1");
        _config["Images:Token:OtherNegativePromptFor"].Returns("extra negative");

        var httpClient = new HttpClient(_mockHandler, disposeHandler: false) {
            BaseAddress = new("https://api.stability.ai")
        };
        _httpClientFactory.CreateClient(Arg.Any<string>()).Returns(httpClient);

        _client = new(_httpClientFactory, _config);
    }

    private bool _isDisposed;
    public void Dispose() {
        if (_isDisposed)
            return;
        _mockHandler.Dispose();
        GC.SuppressFinalize(this);
        _isDisposed = true;
    }

    [Fact]
    public async Task GenerateImageFileAsync_WithValidequest_ReturnsImageData() {
        var imageBytes = CreateTestImageBytes();
        _mockHandler.SetResponse(HttpStatusCode.OK, imageBytes, "image/png");

        var result = await _client.GenerateImageFileAsync("sd3", "Token", "A fantasy dragon", _ct);

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeEmpty();
        result.Data.Should().BeEquivalentTo(imageBytes);
    }

    [Fact]
    public async Task GenerateImageFileAsync_WithErrorResponse_ThrowsException() {
        _mockHandler.SetResponse(HttpStatusCode.BadRequest, "{\"error\":\"Invalid prompt\"}");

        var act = () => _client.GenerateImageFileAsync("sd3", "Token", "A dragon", _ct);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Stability API error*");
    }

    [Fact]
    public async Task GenerateImageFileAsync_IncludesPromptInRequest() {
        var imageBytes = CreateTestImageBytes();
        _mockHandler.SetResponse(HttpStatusCode.OK, imageBytes, "image/png");

        await _client.GenerateImageFileAsync("sd3", "Token", "A magical forest", _ct);

        var requestContent = _mockHandler.LastRequestContent;
        requestContent.Should().Contain("A magical forest");
    }

    [Fact]
    public async Task GenerateImageFileAsync_IncludesAspectRatioInRequest() {
        _config["Images:Portrait:AspectRatio"].Returns("2:3");
        var imageBytes = CreateTestImageBytes();
        _mockHandler.SetResponse(HttpStatusCode.OK, imageBytes, "image/png");

        await _client.GenerateImageFileAsync("sd3", "Portrait", "A wizard", _ct);

        var requestContent = _mockHandler.LastRequestContent;
        requestContent.Should().Contain("2:3");
    }

    [Fact]
    public async Task GenerateImageFileAsync_WithDefaultAspectRatio_Uses1x1() {
        _config["Images:Custom:AspectRatio"].Returns((string?)null);
        var imageBytes = CreateTestImageBytes();
        _mockHandler.SetResponse(HttpStatusCode.OK, imageBytes, "image/png");

        await _client.GenerateImageFileAsync("sd3", "Custom", "A castle", _ct);

        var requestContent = _mockHandler.LastRequestContent;
        requestContent.Should().Contain("1:1");
    }

    [Fact]
    public async Task GenerateImageFileAsync_IncludesNegativePromptInRequest() {
        _config["Images:Token:OtherNegativePromptFor"].Returns("extra negative");
        var imageBytes = CreateTestImageBytes();
        _mockHandler.SetResponse(HttpStatusCode.OK, imageBytes, "image/png");

        await _client.GenerateImageFileAsync("sd3", "Token", "A dragon", _ct);

        var requestContent = _mockHandler.LastRequestContent;
        requestContent.Should().Contain("border, frame, text, watermark");
        requestContent.Should().Contain("extra negative");
    }

    [Fact]
    public async Task GenerateImageFileAsync_WithNoExtraNegativePrompt_UsesGenericOnly() {
        _config["Images:Token:OtherNegativePromptFor"].Returns((string?)null);
        var imageBytes = CreateTestImageBytes();
        _mockHandler.SetResponse(HttpStatusCode.OK, imageBytes, "image/png");

        await _client.GenerateImageFileAsync("sd3", "Token", "A knight", _ct);

        var requestContent = _mockHandler.LastRequestContent;
        requestContent.Should().Contain("border, frame, text, watermark");
        requestContent.Should().NotContain("extra negative");
    }

    [Fact]
    public async Task GenerateImageFileAsync_UsesTextToImageMode() {
        var imageBytes = CreateTestImageBytes();
        _mockHandler.SetResponse(HttpStatusCode.OK, imageBytes, "image/png");

        await _client.GenerateImageFileAsync("sd3", "Token", "A dragon", _ct);

        var requestContent = _mockHandler.LastRequestContent;
        requestContent.Should().Contain("text-to-image");
    }

    [Fact]
    public async Task GenerateImageFileAsync_UsesPngFormat() {
        var imageBytes = CreateTestImageBytes();
        _mockHandler.SetResponse(HttpStatusCode.OK, imageBytes, "image/png");

        await _client.GenerateImageFileAsync("sd3", "Token", "A dragon", _ct);

        var requestContent = _mockHandler.LastRequestContent;
        requestContent.Should().Contain("png");
    }

    [Fact]
    public async Task GenerateImageFileAsync_IncludesCfgScaleInRequest() {
        var imageBytes = CreateTestImageBytes();
        _mockHandler.SetResponse(HttpStatusCode.OK, imageBytes, "image/png");

        await _client.GenerateImageFileAsync("sd3", "Token", "A dragon", _ct);

        var requestContent = _mockHandler.LastRequestContent;
        requestContent.Should().Contain("10");
    }

    [Fact]
    public async Task Constructor_WithMissingBaseUrl_ThrowsWhenCreatingClient() {
        _config["Providers:Stability:BaseUrl"].Returns((string?)null);

        var act = () => _client.GenerateImageFileAsync("sd3", "Token", "A dragon", _ct);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*base url not configured*");
    }

    [Fact]
    public async Task Constructor_WithMissingApiKey_ThrowsWhenCreatingClient() {
        _config["Providers:Stability:ApiKey"].Returns((string?)null);

        var act = () => _client.GenerateImageFileAsync("sd3", "Token", "A dragon", _ct);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*API key is not configured*");
    }

    [Fact]
    public async Task GenerateImageFileAsync_WithMissingEndpoint_ThrowsException() {
        _config["Providers:Stability:unknown-model"].Returns((string?)null);

        var act = () => _client.GenerateImageFileAsync("unknown-model", "Token", "A dragon", _ct);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*endpoint is not configured*");
    }

    private static byte[] CreateTestImageBytes() {
        using var image = new Image<Rgba32>(64, 64);
        image.Mutate(x => x.BackgroundColor(Color.Blue));
        using var ms = new MemoryStream();
        image.SaveAsPng(ms);
        return ms.ToArray();
    }
}
