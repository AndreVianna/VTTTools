using System.Net.Http.Headers;

using Microsoft.Extensions.Logging;

namespace VttTools.AI.Services;

public class MediaAnalysisServiceTests {
    private readonly IAiProviderFactory _providerFactory = Substitute.For<IAiProviderFactory>();
    private readonly ILogger<MediaAnalysisService> _logger = NullLogger<MediaAnalysisService>.Instance;
    private readonly MockHttpMessageHandler _httpHandler;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IOptionsSnapshot<AiOptions> _options;
    private readonly MediaAnalysisService _service;
    private readonly CancellationToken _ct;

    public MediaAnalysisServiceTests() {
        _httpHandler = new MockHttpMessageHandler();

        var httpClient = new HttpClient(_httpHandler) {
            BaseAddress = new Uri("https://api.openai.com")
        };
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "test-key");

        var httpClientFactory = Substitute.For<IHttpClientFactory>();
        httpClientFactory.CreateClient(Arg.Any<string>()).Returns(httpClient);
        _httpClientFactory = httpClientFactory;

        var aiOptions = new AiOptions {
            Providers = new Dictionary<string, ProviderConfig> {
                ["OpenAI"] = new ProviderConfig {
                    ApiKey = "test-api-key",
                    BaseUrl = "https://api.openai.com"
                }
            }
        };
        _options = Substitute.For<IOptionsSnapshot<AiOptions>>();
        _options.Value.Returns(aiOptions);

        _providerFactory.GetProviderAndModel(GeneratedContentType.MediaAnalysis)
            .Returns(("OpenAI", "gpt-4o"));

        _service = new MediaAnalysisService(_httpClientFactory, _options, _providerFactory, _logger);
        _ct = TestContext.Current.CancellationToken;
    }

    [Fact]
    public async Task AnalyzeAsync_WithImageRequest_ReturnsAnalysisResult() {
        var responseJson = """
            {
                "choices": [{
                    "message": {
                        "content": "{\"suggestedName\": \"Red Dragon Portrait\", \"description\": \"A majestic red dragon.\", \"tags\": [\"dragon\", \"fantasy\"]}"
                    }
                }],
                "usage": { "prompt_tokens": 100, "completion_tokens": 50 }
            }
            """;
        _httpHandler.ResponseToReturn = new HttpResponseMessage(HttpStatusCode.OK) {
            Content = new StringContent(responseJson, Encoding.UTF8, "application/json")
        };

        var request = new MediaAnalysisRequest {
            MediaType = "image",
            FileName = "dragon.png",
            Frames = [new byte[] { 1, 2, 3, 4 }]
        };

        var result = await _service.AnalyzeAsync(request, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.SuggestedName.Should().Be("Red Dragon Portrait");
        result.Value.Description.Should().Be("A majestic red dragon.");
        result.Value.Tags.Should().Contain("dragon");
    }

    [Fact]
    public async Task AnalyzeAsync_WithAudioRequest_ReturnsAnalysisResult() {
        var responseJson = """
            {
                "choices": [{
                    "message": {
                        "content": "{\"suggestedName\": \"Epic Battle Music\", \"description\": \"Orchestral battle theme.\", \"tags\": [\"music\", \"battle\"]}"
                    }
                }],
                "usage": { "prompt_tokens": 100, "completion_tokens": 50 }
            }
            """;
        _httpHandler.ResponseToReturn = new HttpResponseMessage(HttpStatusCode.OK) {
            Content = new StringContent(responseJson, Encoding.UTF8, "application/json")
        };

        var request = new MediaAnalysisRequest {
            MediaType = "audio",
            FileName = "battle_theme.mp3",
            AudioData = [1, 2, 3, 4]
        };

        var result = await _service.AnalyzeAsync(request, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.SuggestedName.Should().Be("Epic Battle Music");
    }

    [Fact]
    public async Task AnalyzeAsync_WithApiError_ReturnsFailure() {
        _httpHandler.ResponseToReturn = new HttpResponseMessage(HttpStatusCode.BadRequest) {
            Content = new StringContent("Bad request", Encoding.UTF8, "application/json")
        };

        var request = new MediaAnalysisRequest {
            MediaType = "image",
            FileName = "test.png",
            Frames = [new byte[] { 1, 2, 3, 4 }]
        };

        var result = await _service.AnalyzeAsync(request, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().NotBeEmpty();
    }

    [Fact]
    public async Task AnalyzeAsync_WithEmptyResponse_ReturnsFailure() {
        var responseJson = """
            {
                "choices": []
            }
            """;
        _httpHandler.ResponseToReturn = new HttpResponseMessage(HttpStatusCode.OK) {
            Content = new StringContent(responseJson, Encoding.UTF8, "application/json")
        };

        var request = new MediaAnalysisRequest {
            MediaType = "image",
            FileName = "test.png",
            Frames = [new byte[] { 1, 2, 3, 4 }]
        };

        var result = await _service.AnalyzeAsync(request, _ct);

        result.IsSuccessful.Should().BeFalse();
    }

    [Fact]
    public async Task AnalyzeAsync_WithNonOpenAiProvider_ReturnsFailure() {
        _providerFactory.GetProviderAndModel(GeneratedContentType.MediaAnalysis)
            .Returns(("OtherProvider", "some-model"));

        var request = new MediaAnalysisRequest {
            MediaType = "image",
            FileName = "test.png",
            Frames = [new byte[] { 1, 2, 3, 4 }]
        };

        var result = await _service.AnalyzeAsync(request, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Contain("OpenAI");
    }

    [Fact]
    public async Task AnalyzeAsync_WithCodeFencedResponse_ParsesCorrectly() {
        var responseJson = """
            {
                "choices": [{
                    "message": {
                        "content": "```json\n{\"suggestedName\": \"Test Name\", \"description\": \"Test desc.\", \"tags\": [\"test\"]}\n```"
                    }
                }],
                "usage": { "prompt_tokens": 100, "completion_tokens": 50 }
            }
            """;
        _httpHandler.ResponseToReturn = new HttpResponseMessage(HttpStatusCode.OK) {
            Content = new StringContent(responseJson, Encoding.UTF8, "application/json")
        };

        var request = new MediaAnalysisRequest {
            MediaType = "image",
            FileName = "test.png",
            Frames = [new byte[] { 1, 2, 3, 4 }]
        };

        var result = await _service.AnalyzeAsync(request, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.SuggestedName.Should().Be("Test Name");
    }

    [Fact]
    public async Task AnalyzeAsync_WithMultipleFrames_IncludesAllFramesInRequest() {
        var responseJson = """
            {
                "choices": [{
                    "message": {
                        "content": "{\"suggestedName\": \"Video Content\", \"description\": \"A video.\", \"tags\": [\"video\"]}"
                    }
                }],
                "usage": { "prompt_tokens": 100, "completion_tokens": 50 }
            }
            """;
        _httpHandler.ResponseToReturn = new HttpResponseMessage(HttpStatusCode.OK) {
            Content = new StringContent(responseJson, Encoding.UTF8, "application/json")
        };

        var request = new MediaAnalysisRequest {
            MediaType = "video",
            FileName = "video.mp4",
            Frames = [
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9],
                [10, 11, 12]
            ]
        };

        var result = await _service.AnalyzeAsync(request, _ct);

        result.IsSuccessful.Should().BeTrue();
        _httpHandler.LastRequestContent.Should().NotBeNull();
    }
}
