using VttTools.AI.UnitTests.Mocks;

namespace VttTools.AI.Services;

public class VideoGenerationServiceTests {
    private readonly IAiProviderFactory _providerFactory = Substitute.For<IAiProviderFactory>();
    private readonly MockVideoProvider _mockProvider;
    private readonly VideoGenerationService _service;
    private readonly CancellationToken _ct;

    public VideoGenerationServiceTests() {
        _mockProvider = new MockVideoProvider {
            ProviderType = AiProviderType.RunwayML,
            VideoDataToReturn = [0x00, 0x00, 0x00, 0x18],
        };

        _providerFactory.GetVideoProvider(Arg.Any<AiProviderType?>()).Returns(_mockProvider);
        _providerFactory.GetAvailableVideoProviders().Returns([AiProviderType.RunwayML]);

        _service = new VideoGenerationService(_providerFactory);
        _ct = TestContext.Current.CancellationToken;
    }

    [Fact]
    public async Task GenerateAsync_WithValidRequest_ReturnsVideoResponse() {
        var request = new VideoGenerationRequest {
            Prompt = "Dragon flying over mountains",
            Model = "gen-2",
            Provider = AiProviderType.RunwayML,
            Duration = TimeSpan.FromSeconds(5),
        };

        var result = await _service.GenerateAsync(request, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.VideoData.Should().BeEquivalentTo(_mockProvider.VideoDataToReturn);
        result.Value.ContentType.Should().Be("video/mp4");
        result.Value.Provider.Should().Be(AiProviderType.RunwayML);
        result.Value.Model.Should().Be("gen-2");
        result.Value.Duration.Should().Be(TimeSpan.FromSeconds(5));
        _mockProvider.LastRequest.Should().BeSameAs(request);
    }

    [Fact]
    public async Task GenerateAsync_WhenProviderFails_PropagatesError() {
        var request = new VideoGenerationRequest {
            Prompt = "Test video",
        };
        _mockProvider.ErrorToReturn = "Video generation failed";

        var result = await _service.GenerateAsync(request, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Contain("Video generation failed");
    }

    [Fact]
    public async Task GenerateAsync_WithNullDuration_UsesZero() {
        var request = new VideoGenerationRequest {
            Prompt = "Test video",
            Duration = null,
        };

        var result = await _service.GenerateAsync(request, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Duration.Should().Be(TimeSpan.Zero);
    }

    [Fact]
    public async Task GetAvailableProvidersAsync_ReturnsProvidersFromFactory() {
        var providers = await _service.GetAvailableProvidersAsync(_ct);

        providers.Should().HaveCount(1);
        providers.Should().Contain(AiProviderType.RunwayML);
        _providerFactory.Received(1).GetAvailableVideoProviders();
    }

    [Fact]
    public async Task GenerateAsync_SetsCostToZero() {
        var request = new VideoGenerationRequest {
            Prompt = "Test video",
        };

        var result = await _service.GenerateAsync(request, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Cost.Should().Be(0m);
    }
}
