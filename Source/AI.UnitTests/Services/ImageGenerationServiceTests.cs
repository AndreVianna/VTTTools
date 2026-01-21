namespace VttTools.AI.Services;

public class ImageGenerationServiceTests {
    private readonly IAiProviderFactory _providerFactory = Substitute.For<IAiProviderFactory>();
    private readonly MockImageProvider _mockProvider;
    private readonly ImageGenerationService _service;
    private readonly CancellationToken _ct;

    public ImageGenerationServiceTests() {
        _mockProvider = new MockImageProvider {
            Name = "OpenAI",
            ImageDataToReturn = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
        };

        _providerFactory.GetImageProvider(Arg.Any<string?>()).Returns(_mockProvider);
        _providerFactory.GetAvailableImageProviders().Returns(["OpenAI", "Google"]);
        _providerFactory.GetProviderAndModel(Arg.Any<GeneratedContentType>())
            .Returns(("OpenAI", "gpt-image-1"));

        var options = Substitute.For<IOptions<JobProcessingOptions>>();
        var client = Substitute.For<IJobsServiceClient>();
        var channel = Substitute.For<System.Threading.Channels.Channel<JobQueueItem>>();
        var logger = NullLogger<ImageGenerationService>.Instance;

        _service = new ImageGenerationService(_providerFactory, options, client, channel, logger);
        _ct = TestContext.Current.CancellationToken;
    }

    [Fact]
    public async Task GenerateAsync_WithValidRequest_ReturnsImageResponse() {
        var data = new ImageGenerationData {
            ContentType = GeneratedContentType.ImagePortrait,
            Prompt = "A beautiful landscape",
            Model = "dall-e-3",
            Provider = "OpenAI",
        };

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.ImageData.Should().BeEquivalentTo(_mockProvider.ImageDataToReturn);
        result.Value.ContentType.Should().Be("image/png");
    }

    [Fact]
    public async Task GenerateAsync_WhenProviderFails_PropagatesError() {
        var data = new ImageGenerationData {
            ContentType = GeneratedContentType.ImagePortrait,
            Provider = "OpenAI",
            Model = "dall-e-3",
            Prompt = "Test prompt",
        };
        _mockProvider.ErrorToReturn = "Provider error occurred";

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Contain("Provider error occurred");
    }

    [Fact]
    public async Task GenerateAsync_TracksRequestDuration() {
        var data = new ImageGenerationData {
            ContentType = GeneratedContentType.ImagePortrait,
            Provider = "OpenAI",
            Model = "dall-e-3",
            Prompt = "Test prompt",
        };

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Elapsed.Should().BeGreaterThanOrEqualTo(TimeSpan.Zero);
    }

    [Fact]
    public void GetAvailableProviders_ReturnsProvidersFromFactory() {
        var providers = _service.GetAvailableProviders();

        providers.Should().HaveCount(2);
        providers.Should().Contain("OpenAI");
        providers.Should().Contain("Google");
        _providerFactory.Received(1).GetAvailableImageProviders();
    }

    [Fact]
    public async Task GenerateAsync_WithNullProvider_ResolvesFromConfig() {
        var data = new ImageGenerationData {
            ContentType = GeneratedContentType.ImagePortrait,
            Provider = null,
            Model = null,
            Prompt = "Test prompt",
        };

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeTrue();
        _providerFactory.Received(1).GetProviderAndModel(GeneratedContentType.ImagePortrait);
    }

    [Fact]
    public async Task GenerateAsync_SetsTokensAndCostToZero() {
        var data = new ImageGenerationData {
            ContentType = GeneratedContentType.ImagePortrait,
            Provider = "OpenAI",
            Model = "dall-e-3",
            Prompt = "Test prompt",
        };

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.InputTokens.Should().Be(0);
        result.Value.OutputTokens.Should().Be(0);
        result.Value.Cost.Should().Be(0m);
    }
}