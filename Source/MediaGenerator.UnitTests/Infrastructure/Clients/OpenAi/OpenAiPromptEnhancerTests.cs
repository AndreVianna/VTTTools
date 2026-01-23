using VttTools.AssetImageManager.Mocks;
using VttTools.MediaGenerator.Infrastructure.Clients.OpenAi;

namespace VttTools.AssetImageManager.Infrastructure.Clients.OpenAi;

public sealed class OpenAiPromptEnhancerTests : IDisposable {
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;
    private readonly OpenAiPromptEnhancer _enhancer;
    private readonly MockHttpMessageHandler _mockHandler;
    private readonly CancellationToken _ct;

    public OpenAiPromptEnhancerTests() {
        _httpClientFactory = Substitute.For<IHttpClientFactory>();
        _config = Substitute.For<IConfiguration>();
        _mockHandler = new();
        _ct = TestContext.Current.CancellationToken;

        _config["Providers:OpenAI:BaseUrl"].Returns("https://api.openai.com");
        _config["Providers:OpenAI:ApiKey"].Returns("test-key");
        _config["PromptEnhancer:Model"].Returns("gpt-5");
        _config["Providers:OpenAI:gpt-5"].Returns("/v1/chat/completions");

        var client = new HttpClient(_mockHandler, disposeHandler: false) {
            BaseAddress = new("https://api.openai.com")
        };
        _httpClientFactory.CreateClient(Arg.Any<string>()).Returns(client);

        _enhancer = new(_httpClientFactory, _config);
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
    public async Task EnhancePromptAsync_WithValidRequest_ReturnsEnhancedPrompt() {
        const string responseJson = """
        {
            "output": [
                {},
                {
                    "content": [{
                        "text": "A majestic red dragon with scales gleaming in sunlight"
                    }]
                }
            ],
            "usage": {
                "input_tokens": 100,
                "output_tokens": 50
            }
        }
        """;
        _mockHandler.SetResponse(HttpStatusCode.OK, responseJson);

        var asset = CreateTestAsset();
        var result = await _enhancer.EnhancePromptAsync("Token", asset, 0, _ct);

        result.IsSuccess.Should().BeTrue();
        result.Prompt.Should().Contain("majestic red dragon");
        result.TotalTokens.Should().Be(150);
        result.TotalCost.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task EnhancePromptAsync_WithNetworkError_ReturnsErrorResponse() {
        _mockHandler.SetException(new HttpRequestException("Network failure"));

        var asset = CreateTestAsset();
        var result = await _enhancer.EnhancePromptAsync("Token", asset, 0, _ct);

        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Contain("Network error");
    }

    [Fact]
    public async Task EnhancePromptAsync_WithInvalidJson_ReturnsErrorResponse() {
        _mockHandler.SetResponse(HttpStatusCode.OK, "invalid json");

        var asset = CreateTestAsset();
        var result = await _enhancer.EnhancePromptAsync("Token", asset, 0, _ct);

        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Contain("JSON deserialization error");
    }

    [Fact]
    public async Task EnhancePromptAsync_WithEmptyOutput_ReturnsErrorResponse() {
        const string responseJson = """
        {
            "output": [],
            "usage": {
                "input_tokens": 100,
                "output_tokens": 50
            }
        }
        """;
        _mockHandler.SetResponse(HttpStatusCode.OK, responseJson);

        var asset = CreateTestAsset();
        var result = await _enhancer.EnhancePromptAsync("Token", asset, 0, _ct);

        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Contain("empty response");
    }

    [Fact]
    public async Task EnhancePromptAsync_WithNullOutput_ReturnsErrorResponse() {
        const string responseJson = """
        {
            "usage": {
                "input_tokens": 100,
                "output_tokens": 50
            }
        }
        """;
        _mockHandler.SetResponse(HttpStatusCode.OK, responseJson);

        var asset = CreateTestAsset();
        var result = await _enhancer.EnhancePromptAsync("Token", asset, 0, _ct);

        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Contain("empty response");
    }

    [Fact]
    public async Task EnhancePromptAsync_WithEmptyContent_ReturnsErrorResponse() {
        const string responseJson = """
        {
            "output": [
                {},
                {
                    "content": []
                }
            ],
            "usage": {
                "input_tokens": 100,
                "output_tokens": 50
            }
        }
        """;
        _mockHandler.SetResponse(HttpStatusCode.OK, responseJson);

        var asset = CreateTestAsset();
        var result = await _enhancer.EnhancePromptAsync("Token", asset, 0, _ct);

        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Contain("empty content");
    }

    [Fact]
    public async Task EnhancePromptAsync_ForTokenImage_IncludesTokenDescription() {
        var responseJson = CreateSuccessResponse("Enhanced prompt");
        _mockHandler.SetResponse(HttpStatusCode.OK, responseJson);

        var asset = CreateTestAsset();
        await _enhancer.EnhancePromptAsync("Token", asset, 0, _ct);

        // Note: JSON encoding escapes apostrophes as \u0027
        var requestContent = _mockHandler.LastRequestContent;
        requestContent.Should().Contain("bird\\u0027s eye");
        requestContent.Should().Contain("top-down");
        requestContent.Should().Contain("transparent background");
    }

    [Fact]
    public async Task EnhancePromptAsync_ForUnknownImageType_ReturnsError() {
        // Source only supports Token and Portrait image types
        var asset = CreateTestAsset();
        var result = await _enhancer.EnhancePromptAsync("Unknown", asset, 0, _ct);

        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Contain("Unknown image type");
    }

    [Fact]
    public async Task EnhancePromptAsync_ForPortraitImage_IncludesPortraitDescription() {
        var responseJson = CreateSuccessResponse("Enhanced prompt");
        _mockHandler.SetResponse(HttpStatusCode.OK, responseJson);

        var asset = CreateTestAsset();
        await _enhancer.EnhancePromptAsync("Portrait", asset, 0, _ct);

        var requestContent = _mockHandler.LastRequestContent;
        requestContent.Should().Contain("portrait");
        requestContent.Should().Contain("full view");
    }

    [Fact]
    public async Task EnhancePromptAsync_IncludesAssetName() {
        var responseJson = CreateSuccessResponse("Enhanced prompt");
        _mockHandler.SetResponse(HttpStatusCode.OK, responseJson);

        var asset = CreateTestAsset();
        await _enhancer.EnhancePromptAsync("Token", asset, 0, _ct);

        var requestContent = _mockHandler.LastRequestContent;
        requestContent.Should().Contain("Red Dragon");
    }

    [Fact]
    public async Task EnhancePromptAsync_IncludesAssetType() {
        var responseJson = CreateSuccessResponse("Enhanced prompt");
        _mockHandler.SetResponse(HttpStatusCode.OK, responseJson);

        var asset = CreateTestAsset();
        await _enhancer.EnhancePromptAsync("Token", asset, 0, _ct);

        var requestContent = _mockHandler.LastRequestContent;
        requestContent.Should().Contain("Dragon");
    }

    [Fact]
    public async Task EnhancePromptAsync_IncludesAssetDescription() {
        var responseJson = CreateSuccessResponse("Enhanced prompt");
        _mockHandler.SetResponse(HttpStatusCode.OK, responseJson);

        var asset = CreateTestAsset();
        await _enhancer.EnhancePromptAsync("Token", asset, 0, _ct);

        var requestContent = _mockHandler.LastRequestContent;
        requestContent.Should().Contain("A powerful ancient dragon");
    }

    [Fact]
    public async Task EnhancePromptAsync_IncludesAssetDescriptionInRequest() {
        // NOTE: Source only includes asset-level Description, not individual token descriptions
        var responseJson = CreateSuccessResponse("Enhanced prompt");
        _mockHandler.SetResponse(HttpStatusCode.OK, responseJson);

        var asset = CreateTestAsset() with { Description = "Breathing fire" };
        await _enhancer.EnhancePromptAsync("Token", asset, 0, _ct);

        var requestContent = _mockHandler.LastRequestContent;
        requestContent.Should().Contain("Breathing fire");
    }

    [Fact]
    public async Task EnhancePromptAsync_ForPortraitWithPortraitDescription_UsesAssetDescription() {
        // NOTE: Source uses asset-level Description regardless of image type
        var responseJson = CreateSuccessResponse("Enhanced prompt");
        _mockHandler.SetResponse(HttpStatusCode.OK, responseJson);

        var asset = CreateTestAsset() with { Description = "Majestic pose with wings spread" };
        await _enhancer.EnhancePromptAsync("Portrait", asset, 0, _ct);

        var requestContent = _mockHandler.LastRequestContent;
        requestContent.Should().Contain("Majestic pose with wings spread");
    }

    [Fact]
    public async Task EnhancePromptAsync_WithMissingModel_ThrowsException() {
        _config["PromptEnhancer:Model"].Returns((string?)null);

        var asset = CreateTestAsset();
        var act = () => _enhancer.EnhancePromptAsync("Token", asset, 0, _ct);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*not configured*");
    }

    [Fact]
    public async Task EnhancePromptAsync_WithAssetSubtype_IncludesSubtype() {
        var responseJson = CreateSuccessResponse("Enhanced prompt");
        _mockHandler.SetResponse(HttpStatusCode.OK, responseJson);

        var asset = CreateTestAsset() with {
            Classification = new(
                                 AssetKind.Creature,
                                 "Fantasy",
                                 "Dragon",
                                 "Ancient"
                                )
        };
        await _enhancer.EnhancePromptAsync("Token", asset, 0, _ct);

        var requestContent = _mockHandler.LastRequestContent;
        requestContent.Should().Contain("Dragon (Ancient)");
    }

    [Fact]
    public async Task EnhancePromptAsync_WithNoAssetDescription_DoesNotIncludeDescription() {
        var responseJson = CreateSuccessResponse("Enhanced prompt");
        _mockHandler.SetResponse(HttpStatusCode.OK, responseJson);

        var asset = CreateTestAsset() with { Description = string.Empty };
        await _enhancer.EnhancePromptAsync("Token", asset, 0, _ct);

        var requestContent = _mockHandler.LastRequestContent;
        requestContent.Should().Contain("Red Dragon");
        requestContent.Should().NotContain("The subject is described as");
    }

    private static Asset CreateTestAsset() => new() {
        Id = Guid.CreateVersion7(),
        Name = "Red Dragon",
        Description = "A powerful ancient dragon",
        Classification = new(
                             AssetKind.Creature,
                             "Fantasy",
                             "Dragon",
                             null
                            ),
        Tokens = [new() { }],
    };

    private static string CreateSuccessResponse(string text) => $$"""
        {
            "output": [
                {},
                {
                    "content": [{
                        "text": "{{text}}"
                    }]
                }
            ],
            "usage": {
                "input_tokens": 100,
                "output_tokens": 50
            }
        }
        """;
}