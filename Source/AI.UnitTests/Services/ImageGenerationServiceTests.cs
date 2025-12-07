using VttTools.AI.UnitTests.Mocks;

namespace VttTools.AI.Services;

public class ImageGenerationServiceTests {
    private readonly IAiProviderFactory _providerFactory = Substitute.For<IAiProviderFactory>();
    private readonly MockImageProvider _mockProvider;
    private readonly ImageGenerationService _service;
    private readonly CancellationToken _ct;

    public ImageGenerationServiceTests() {
        _mockProvider = new MockImageProvider {
            ProviderType = AiProviderType.OpenAi,
            ImageDataToReturn = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
        };

        _providerFactory.GetImageProvider(Arg.Any<AiProviderType?>()).Returns(_mockProvider);
        _providerFactory.GetAvailableImageProviders().Returns([AiProviderType.OpenAi, AiProviderType.Google]);

        _service = new ImageGenerationService(_providerFactory);
        _ct = TestContext.Current.CancellationToken;
    }

    [Fact]
    public async Task GenerateAsync_WithValidRequest_ReturnsImageResponse() {
        var request = new ImageGenerationRequest {
            Prompt = "A beautiful landscape",
            Model = "dall-e-3",
            Provider = AiProviderType.OpenAi,
        };

        var result = await _service.GenerateAsync(request, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.ImageData.Should().BeEquivalentTo(_mockProvider.ImageDataToReturn);
        result.Value.ContentType.Should().Be("image/png");
        result.Value.Provider.Should().Be(AiProviderType.OpenAi);
        result.Value.Model.Should().Be("dall-e-3");
        result.Value.Duration.Should().BeGreaterThan(TimeSpan.Zero);
        _mockProvider.LastRequest.Should().BeSameAs(request);
    }

    [Fact]
    public async Task GenerateAsync_WhenProviderFails_PropagatesError() {
        var request = new ImageGenerationRequest {
            Prompt = "Test prompt",
        };
        _mockProvider.ErrorToReturn = "Provider error occurred";

        var result = await _service.GenerateAsync(request, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Contain("Provider error occurred");
    }

    [Fact]
    public async Task GenerateAsync_TracksRequestDuration() {
        var request = new ImageGenerationRequest {
            Prompt = "Test prompt",
        };

        var result = await _service.GenerateAsync(request, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Duration.Should().BeGreaterThanOrEqualTo(TimeSpan.Zero);
    }

    [Fact]
    public async Task GetAvailableProvidersAsync_ReturnsProvidersFromFactory() {
        var providers = await _service.GetAvailableProvidersAsync(_ct);

        providers.Should().HaveCount(2);
        providers.Should().Contain(AiProviderType.OpenAi);
        providers.Should().Contain(AiProviderType.Google);
        _providerFactory.Received(1).GetAvailableImageProviders();
    }

    [Fact]
    public async Task GenerateAsync_WithNullProvider_UsesDefaultProvider() {
        var request = new ImageGenerationRequest {
            Prompt = "Test prompt",
            Provider = null,
        };

        var result = await _service.GenerateAsync(request, _ct);

        result.IsSuccessful.Should().BeTrue();
        _providerFactory.Received(1).GetImageProvider(null);
    }

    [Fact]
    public async Task GenerateAsync_SetsTokensAndCostToZero() {
        var request = new ImageGenerationRequest {
            Prompt = "Test prompt",
        };

        var result = await _service.GenerateAsync(request, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.TokensUsed.Should().Be(0);
        result.Value.Cost.Should().Be(0m);
    }
}
