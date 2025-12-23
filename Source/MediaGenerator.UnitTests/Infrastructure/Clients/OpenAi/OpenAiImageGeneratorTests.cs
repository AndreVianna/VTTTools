using VttTools.AssetImageManager.Mocks;
using VttTools.MediaGenerator.Infrastructure.Clients.OpenAi;

namespace VttTools.AssetImageManager.Infrastructure.Clients.OpenAi;

public sealed class OpenAiImageGeneratorTests : IDisposable {
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;
    private readonly OpenAiImageGenerator _generator;
    private readonly MockHttpMessageHandler _mockHandler;
    private readonly CancellationToken _ct;

    public OpenAiImageGeneratorTests() {
        _httpClientFactory = Substitute.For<IHttpClientFactory>();
        _config = Substitute.For<IConfiguration>();
        _mockHandler = new();
        _ct = TestContext.Current.CancellationToken;

        _config["Providers:OpenAI:BaseUrl"].Returns("https://api.openai.com");
        _config["Providers:OpenAI:ApiKey"].Returns("test-key");
        _config["Providers:OpenAI:gpt-image-1"].Returns("/v1/images/generations");
        _config["Images:TopDown:AspectRatio"].Returns("1:1");
        _config["Images:TopDown:Background"].Returns("transparent");

        var client = new HttpClient(_mockHandler, disposeHandler: false) {
            BaseAddress = new("https://api.openai.com")
        };
        _httpClientFactory.CreateClient(Arg.Any<string>()).Returns(client);

        _generator = new(_httpClientFactory, _config);
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
    public async Task GenerateImageFileAsync_WithValidRequest_ReturnsSuccessResponse() {
        var imageData = Convert.ToBase64String(CreateTestImageBytes());
        var responseJson = $$"""
        {
            "id": "img-123",
            "data": [{ "b64_json": "{{imageData}}" }],
            "usage": { "input_tokens": 100, "output_tokens": 200 }
        }
        """;
        _mockHandler.SetResponse(HttpStatusCode.OK, responseJson);

        var result = await _generator.GenerateImageFileAsync("gpt-image-1", "TopDown", "A fantasy dragon", _ct);

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeEmpty();
        result.TotalTokens.Should().Be(300);
        result.TotalCost.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task GenerateImageFileAsync_WithNetworkError_ReturnsErrorResponse() {
        _mockHandler.SetException(new HttpRequestException("Network error"));

        var result = await _generator.GenerateImageFileAsync("gpt-image-1", "TopDown", "A fantasy dragon", _ct);

        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Contain("Network error");
    }

    [Fact]
    public async Task GenerateImageFileAsync_WithInvalidJson_ReturnsErrorResponse() {
        _mockHandler.SetResponse(HttpStatusCode.OK, "invalid json");

        var result = await _generator.GenerateImageFileAsync("gpt-image-1", "TopDown", "A fantasy dragon", _ct);

        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Contain("JSON deserialization error");
    }

    [Fact]
    public async Task GenerateImageFileAsync_WithEmptyResponse_ReturnsErrorResponse() {
        const string responseJson = """
        {
            "id": "img-123",
            "data": [],
            "usage": { "input_tokens": 100, "output_tokens": 200 }
        }
        """;
        _mockHandler.SetResponse(HttpStatusCode.OK, responseJson);

        var result = await _generator.GenerateImageFileAsync("gpt-image-1", "TopDown", "A fantasy dragon", _ct);

        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Contain("empty response");
    }

    [Fact]
    public async Task GenerateImageFileAsync_WithNullData_ReturnsErrorResponse() {
        const string responseJson = """
        {
            "id": "img-123",
            "usage": { "input_tokens": 100, "output_tokens": 200 }
        }
        """;
        _mockHandler.SetResponse(HttpStatusCode.OK, responseJson);

        var result = await _generator.GenerateImageFileAsync("gpt-image-1", "TopDown", "A fantasy dragon", _ct);

        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Contain("empty response");
    }

    [Fact]
    public async Task GenerateImageFileAsync_WithAspectRatio1x1_UsesCorrectSize() {
        _config["Images:Portrait:AspectRatio"].Returns("1:1");
        var imageData = Convert.ToBase64String(CreateTestImageBytes());
        var responseJson = $$"""
        {
            "id": "img-123",
            "data": [{ "b64_json": "{{imageData}}" }],
            "usage": { "input_tokens": 100, "output_tokens": 200 }
        }
        """;
        _mockHandler.SetResponse(HttpStatusCode.OK, responseJson);

        await _generator.GenerateImageFileAsync("gpt-image-1", "Portrait", "A wizard", _ct);

        var requestContent = _mockHandler.LastRequestContent;
        requestContent.Should().Contain("\"size\":\"1024x1024\"");
    }

    [Fact]
    public async Task GenerateImageFileAsync_WithAspectRatio2x3_UsesCorrectSize() {
        _config["Images:CloseUp:AspectRatio"].Returns("2:3");
        var imageData = Convert.ToBase64String(CreateTestImageBytes());
        var responseJson = $$"""
        {
            "id": "img-123",
            "data": [{ "b64_json": "{{imageData}}" }],
            "usage": { "input_tokens": 100, "output_tokens": 200 }
        }
        """;
        _mockHandler.SetResponse(HttpStatusCode.OK, responseJson);

        await _generator.GenerateImageFileAsync("gpt-image-1", "CloseUp", "A knight", _ct);

        var requestContent = _mockHandler.LastRequestContent;
        requestContent.Should().Contain("\"size\":\"1024x1536\"");
    }

    [Fact]
    public async Task GenerateImageFileAsync_WithUnsupportedAspectRatio_ThrowsException() {
        _config["Images:Custom:AspectRatio"].Returns("16:9");
        var imageData = Convert.ToBase64String(CreateTestImageBytes());
        var responseJson = $$"""
        {
            "id": "img-123",
            "data": [{ "b64_json": "{{imageData}}" }],
            "usage": { "input_tokens": 100, "output_tokens": 200 }
        }
        """;
        _mockHandler.SetResponse(HttpStatusCode.OK, responseJson);

        var result = await _generator.GenerateImageFileAsync("gpt-image-1", "Custom", "A dragon", _ct);

        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Contain("Unsupported aspect ratio");
    }

    [Fact]
    public async Task GenerateImageFileAsync_IncludesBackgroundInRequest() {
        _config["Images:TopDown:Background"].Returns("transparent");
        var imageData = Convert.ToBase64String(CreateTestImageBytes());
        var responseJson = $$"""
        {
            "id": "img-123",
            "data": [{ "b64_json": "{{imageData}}" }],
            "usage": { "input_tokens": 100, "output_tokens": 200 }
        }
        """;
        _mockHandler.SetResponse(HttpStatusCode.OK, responseJson);

        await _generator.GenerateImageFileAsync("gpt-image-1", "TopDown", "A dragon", _ct);

        var requestContent = _mockHandler.LastRequestContent;
        requestContent.Should().Contain("\"background\":\"transparent\"");
    }

    [Fact]
    public async Task GenerateImageFileAsync_WithNoBackgroundConfig_UsesAuto() {
        _config["Images:Portrait:Background"].Returns((string?)null);
        var imageData = Convert.ToBase64String(CreateTestImageBytes());
        var responseJson = $$"""
        {
            "id": "img-123",
            "data": [{ "b64_json": "{{imageData}}" }],
            "usage": { "input_tokens": 100, "output_tokens": 200 }
        }
        """;
        _mockHandler.SetResponse(HttpStatusCode.OK, responseJson);

        await _generator.GenerateImageFileAsync("gpt-image-1", "Portrait", "A wizard", _ct);

        var requestContent = _mockHandler.LastRequestContent;
        requestContent.Should().Contain("\"background\":\"auto\"");
    }

    private static byte[] CreateTestImageBytes() {
        using var image = new Image<Rgba32>(64, 64);
        image.Mutate(x => x.BackgroundColor(Color.Red));
        using var ms = new MemoryStream();
        image.SaveAsPng(ms);
        return ms.ToArray();
    }
}
