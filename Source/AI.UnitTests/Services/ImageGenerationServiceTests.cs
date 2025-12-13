
namespace VttTools.AI.Services;

public class ImageGenerationServiceTests {
    private readonly IAiProviderFactory _providerFactory = Substitute.For<IAiProviderFactory>();
    private readonly MockImageProvider _mockProvider;
    private readonly ImageGenerationService _service;
    private readonly CancellationToken _ct;

    public ImageGenerationServiceTests() {
        _mockProvider = new MockImageProvider {
            Name = "OpenAi",
            ImageDataToReturn = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
        };

        _providerFactory.GetImageProvider(Arg.Any<string>()).Returns(_mockProvider);
        _providerFactory.GetAvailableImageProviders().Returns(["OpenAi", "Google"]);

        _service = new ImageGenerationService(_providerFactory);
        _ct = TestContext.Current.CancellationToken;
    }

    [Fact]
    public async Task GenerateAsync_WithValidRequest_ReturnsImageResponse() {
        var data = new ImageGenerationData {
            Prompt = "A beautiful landscape",
            Model = "dall-e-3",
            Provider = "OpenAi",
        };

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.ImageData.Should().BeEquivalentTo(_mockProvider.ImageDataToReturn);
        result.Value.ContentType.Should().Be("image/png");
        _mockProvider.LastRequest.Should().BeSameAs(data);
    }

    [Fact]
    public async Task GenerateAsync_WhenProviderFails_PropagatesError() {
        var data = new ImageGenerationData {
            Provider = "OpenAi",
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
            Provider = "OpenAi",
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
        providers.Should().Contain("OpenAi");
        providers.Should().Contain("Google");
        _providerFactory.Received(1).GetAvailableImageProviders();
    }

    [Fact]
    public async Task GenerateAsync_WithNullProvider_UsesDefaultProvider() {
        var data = new ImageGenerationData {
            Provider = null!,
            Model = "dall-e-3",
            Prompt = "Test prompt",
        };

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeFalse();
    }

    [Fact]
    public async Task GenerateAsync_SetsTokensAndCostToZero() {
        var data = new ImageGenerationData {
            Provider = "OpenAi",
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
