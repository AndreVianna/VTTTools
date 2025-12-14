namespace VttTools.MediaGenerator.Infrastructure.Clients.Google;

public sealed class GoogleClientTests : IDisposable {
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;
    private readonly GoogleClient _client;
    private readonly MockHttpMessageHandler _mockHandler;
    private readonly CancellationToken _ct;

    public GoogleClientTests() {
        _httpClientFactory = Substitute.For<IHttpClientFactory>();
        _config = Substitute.For<IConfiguration>();
        _mockHandler = new MockHttpMessageHandler();
        _ct = TestContext.Current.CancellationToken;

        _config["Providers:Google:BaseUrl"].Returns("https://generativelanguage.googleapis.com");
        _config["Providers:Google:ApiKey"].Returns("test-key");
        _config["Providers:Google:gemini-2.0"].Returns("/v1beta/models/gemini-2.0:generate");
        _config["Images:TopDown:AspectRatio"].Returns("1:1");

        var httpClient = new HttpClient(_mockHandler, disposeHandler: false) {
            BaseAddress = new Uri("https://generativelanguage.googleapis.com")
        };
        _httpClientFactory.CreateClient(Arg.Any<string>()).Returns(httpClient);

        _client = new GoogleClient(_httpClientFactory, _config);
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
    public async Task GenerateImageFileAsync_WithValidRequest_ReturnsImageData() {
        var imageBytes = CreateTestImageBytes();
        var base64Image = Convert.ToBase64String(imageBytes);
        var responseJson = $$"""
        {
            "candidates": [{
                "content": {
                    "parts": [{
                        "inlineData": {
                            "mimeType": "image/png",
                            "data": "{{base64Image}}"
                        }
                    }]
                }
            }],
            "usageMetadata": {
                "promptTokenCount": 100,
                "candidatesTokenCount": 200,
                "totalTokenCount": 300
            }
        }
        """;
        _mockHandler.SetResponse(HttpStatusCode.OK, responseJson);

        var result = await _client.GenerateImageFileAsync("gemini-2.0", "TopDown", "A fantasy dragon", _ct);

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeEmpty();
        result.TotalTokens.Should().Be(300);
        result.TotalCost.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task GenerateImageFileAsync_WithErrorResponse_ThrowsException() {
        _mockHandler.SetResponse(HttpStatusCode.BadRequest, "{\"error\":\"Invalid request\"}");

        var act = async () => await _client.GenerateImageFileAsync("gemini-2.0", "TopDown", "A dragon", _ct);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Google API error*");
    }

    [Fact]
    public async Task GenerateImageFileAsync_WithEmptyImageData_ThrowsException() {
        const string responseJson = """
        {
            "candidates": [{
                "content": {
                    "parts": [{
                        "inlineData": {
                            "mimeType": "image/png",
                            "data": ""
                        }
                    }]
                }
            }],
            "usageMetadata": {
                "promptTokenCount": 100,
                "candidatesTokenCount": 200,
                "totalTokenCount": 300
            }
        }
        """;
        _mockHandler.SetResponse(HttpStatusCode.OK, responseJson);

        var act = async () => await _client.GenerateImageFileAsync("gemini-2.0", "TopDown", "A dragon", _ct);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*empty image data*");
    }

    [Fact]
    public async Task GenerateImageFileAsync_CalculatesCostCorrectly() {
        var imageBytes = CreateTestImageBytes();
        var base64Image = Convert.ToBase64String(imageBytes);
        var responseJson = $$"""
        {
            "candidates": [{
                "content": {
                    "parts": [{
                        "inlineData": {
                            "mimeType": "image/png",
                            "data": "{{base64Image}}"
                        }
                    }]
                }
            }],
            "usageMetadata": {
                "promptTokenCount": 1000000,
                "candidatesTokenCount": 1000000,
                "totalTokenCount": 2000000
            }
        }
        """;
        _mockHandler.SetResponse(HttpStatusCode.OK, responseJson);

        var result = await _client.GenerateImageFileAsync("gemini-2.0", "TopDown", "A dragon", _ct);

        result.TotalCost.Should().BeApproximately(30.3, 0.01);
    }

    [Fact]
    public async Task GenerateImageFileAsync_IncludesPromptInRequest() {
        var imageBytes = CreateTestImageBytes();
        var base64Image = Convert.ToBase64String(imageBytes);
        var responseJson = $$"""
        {
            "candidates": [{
                "content": {
                    "parts": [{
                        "inlineData": {
                            "mimeType": "image/png",
                            "data": "{{base64Image}}"
                        }
                    }]
                }
            }],
            "usageMetadata": {
                "promptTokenCount": 100,
                "candidatesTokenCount": 200,
                "totalTokenCount": 300
            }
        }
        """;
        _mockHandler.SetResponse(HttpStatusCode.OK, responseJson);

        await _client.GenerateImageFileAsync("gemini-2.0", "TopDown", "A magical forest", _ct);

        var requestContent = _mockHandler.LastRequestContent;
        requestContent.Should().Contain("A magical forest");
    }

    [Fact]
    public async Task GenerateImageFileAsync_IncludesAspectRatioInRequest() {
        _config["Images:Portrait:AspectRatio"].Returns("2:3");
        var imageBytes = CreateTestImageBytes();
        var base64Image = Convert.ToBase64String(imageBytes);
        var responseJson = $$"""
        {
            "candidates": [{
                "content": {
                    "parts": [{
                        "inlineData": {
                            "mimeType": "image/png",
                            "data": "{{base64Image}}"
                        }
                    }]
                }
            }],
            "usageMetadata": {
                "promptTokenCount": 100,
                "candidatesTokenCount": 200,
                "totalTokenCount": 300
            }
        }
        """;
        _mockHandler.SetResponse(HttpStatusCode.OK, responseJson);

        await _client.GenerateImageFileAsync("gemini-2.0", "Portrait", "A wizard", _ct);

        var requestContent = _mockHandler.LastRequestContent;
        requestContent.Should().Contain("2:3");
    }

    [Fact]
    public async Task GenerateImageFileAsync_WithDefaultAspectRatio_Uses1x1() {
        _config["Images:Custom:AspectRatio"].Returns((string?)null);
        var imageBytes = CreateTestImageBytes();
        var base64Image = Convert.ToBase64String(imageBytes);
        var responseJson = $$"""
        {
            "candidates": [{
                "content": {
                    "parts": [{
                        "inlineData": {
                            "mimeType": "image/png",
                            "data": "{{base64Image}}"
                        }
                    }]
                }
            }],
            "usageMetadata": {
                "promptTokenCount": 100,
                "candidatesTokenCount": 200,
                "totalTokenCount": 300
            }
        }
        """;
        _mockHandler.SetResponse(HttpStatusCode.OK, responseJson);

        await _client.GenerateImageFileAsync("gemini-2.0", "Custom", "A castle", _ct);

        var requestContent = _mockHandler.LastRequestContent;
        requestContent.Should().Contain("1:1");
    }

    [Fact]
    public async Task GenerateImageFileAsync_IncludesResponseModalityInRequest() {
        var imageBytes = CreateTestImageBytes();
        var base64Image = Convert.ToBase64String(imageBytes);
        var responseJson = $$"""
        {
            "candidates": [{
                "content": {
                    "parts": [{
                        "inlineData": {
                            "mimeType": "image/png",
                            "data": "{{base64Image}}"
                        }
                    }]
                }
            }],
            "usageMetadata": {
                "promptTokenCount": 100,
                "candidatesTokenCount": 200,
                "totalTokenCount": 300
            }
        }
        """;
        _mockHandler.SetResponse(HttpStatusCode.OK, responseJson);

        await _client.GenerateImageFileAsync("gemini-2.0", "TopDown", "A dragon", _ct);

        var requestContent = _mockHandler.LastRequestContent;
        requestContent.Should().Contain("Image");
        requestContent.Should().Contain("responseModalities");
    }

    [Fact]
    public async Task Constructor_WithMissingBaseUrl_ThrowsWhenCreatingClient() {
        _config["Providers:Google:BaseUrl"].Returns((string?)null);

        var act = async () => await _client.GenerateImageFileAsync("gemini-2.0", "TopDown", "A dragon", _ct);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*base url not configured*");
    }

    [Fact]
    public async Task Constructor_WithMissingApiKey_ThrowsWhenCreatingClient() {
        _config["Providers:Google:ApiKey"].Returns((string?)null);

        var act = async () => await _client.GenerateImageFileAsync("gemini-2.0", "TopDown", "A dragon", _ct);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*API key is not configured*");
    }

    [Fact]
    public async Task GenerateImageFileAsync_WithMissingEndpoint_ThrowsException() {
        _config["Providers:Google:unknown-model"].Returns((string?)null);

        var act = async () => await _client.GenerateImageFileAsync("unknown-model", "TopDown", "A dragon", _ct);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*endpoint is not configured*");
    }

    private static byte[] CreateTestImageBytes() {
        using var image = new Image<Rgba32>(64, 64);
        image.Mutate(x => x.BackgroundColor(Color.Green));
        using var ms = new MemoryStream();
        image.SaveAsPng(ms);
        return ms.ToArray();
    }
}
