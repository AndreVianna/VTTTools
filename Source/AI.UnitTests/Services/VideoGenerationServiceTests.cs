
using VttTools.AI.Mocks;

namespace VttTools.AI.Services;

public class VideoGenerationServiceTests {
    private readonly IAiProviderFactory _providerFactory = Substitute.For<IAiProviderFactory>();
    private readonly MockVideoProvider _mockProvider;
    private readonly VideoGenerationService _service;
    private readonly CancellationToken _ct;

    public VideoGenerationServiceTests() {
        _mockProvider = new MockVideoProvider {
            Name = "RunwayML",
            VideoDataToReturn = [0x00, 0x00, 0x00, 0x18],
        };

        _providerFactory.GetVideoProvider(Arg.Any<string?>()).Returns(_mockProvider);
        _providerFactory.GetAvailableVideoProviders().Returns(["RunwayML"]);
        _providerFactory.GetProviderAndModel(Arg.Any<GeneratedContentType>())
            .Returns(("RunwayML", "gen-3"));

        _service = new VideoGenerationService(_providerFactory);
        _ct = TestContext.Current.CancellationToken;
    }

    [Fact]
    public async Task GenerateAsync_WithValidRequest_ReturnsVideoResponse() {
        var data = new VideoGenerationData {
            ContentType = GeneratedContentType.VideoBackground,
            Prompt = "Dragon flying over mountains",
            Model = "gen-2",
            Provider = "RunwayML",
            Duration = TimeSpan.FromSeconds(5),
        };

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.VideoData.Should().BeEquivalentTo(_mockProvider.VideoDataToReturn);
        result.Value.ContentType.Should().Be("video/mp4");
        result.Value.Elapsed.Should().BeGreaterThanOrEqualTo(TimeSpan.Zero);
        _mockProvider.LastRequest.Should().BeSameAs(data);
    }

    [Fact]
    public async Task GenerateAsync_WhenProviderFails_PropagatesError() {
        var data = new VideoGenerationData {
            ContentType = GeneratedContentType.VideoOverlay,
            Provider = "RunwayML",
            Model = "gen-2",
            Prompt = "Test video",
        };
        _mockProvider.ErrorToReturn = "Video generation failed";

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Contain("Video generation failed");
    }

    [Fact]
    public async Task GenerateAsync_WithNullDuration_ReturnsSuccessfulResponse() {
        var data = new VideoGenerationData {
            ContentType = GeneratedContentType.VideoBackground,
            Provider = "RunwayML",
            Model = "gen-2",
            Prompt = "Test video",
            Duration = null,
        };

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Elapsed.Should().BeGreaterThanOrEqualTo(TimeSpan.Zero);
    }

    [Fact]
    public void GetAvailableProviders_ReturnsProvidersFromFactory() {
        var providers = _service.GetAvailableProviders();

        providers.Should().HaveCount(1);
        providers.Should().Contain("RunwayML");
        _providerFactory.Received(1).GetAvailableVideoProviders();
    }

    [Fact]
    public async Task GenerateAsync_SetsCostToZero() {
        var data = new VideoGenerationData {
            ContentType = GeneratedContentType.VideoBackground,
            Provider = "RunwayML",
            Model = "gen-2",
            Prompt = "Test video",
        };

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Cost.Should().Be(0m);
    }

    [Fact]
    public async Task GenerateAsync_WithNullProvider_ResolvesFromConfig() {
        var data = new VideoGenerationData {
            ContentType = GeneratedContentType.VideoBackground,
            Provider = null,
            Model = null,
            Prompt = "Test video",
        };

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeTrue();
        _providerFactory.Received(1).GetProviderAndModel(GeneratedContentType.VideoBackground);
    }
}
