using VttTools.AI.UnitTests.Mocks;

namespace VttTools.AI.Factory;

public class AiProviderFactoryTests {
    private readonly IConfiguration _configuration;
    private readonly MockImageProvider _mockImageProvider;
    private readonly MockAudioProvider _mockAudioProvider;
    private readonly MockVideoProvider _mockVideoProvider;
    private readonly MockPromptProvider _mockPromptProvider;
    private readonly AiProviderFactory _factory;

    public AiProviderFactoryTests() {
        var configData = new Dictionary<string, string?> {
            ["AI:DefaultProviders:Image"] = "OpenAi",
            ["AI:DefaultProviders:Audio"] = "OpenAi",
            ["AI:DefaultProviders:Video"] = "RunwayML",
            ["AI:DefaultProviders:Prompt"] = "OpenAi",
        };

        _configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(configData)
            .Build();

        _mockImageProvider = new MockImageProvider { ProviderType = AiProviderType.OpenAi };
        _mockAudioProvider = new MockAudioProvider { ProviderType = AiProviderType.OpenAi };
        _mockVideoProvider = new MockVideoProvider { ProviderType = AiProviderType.RunwayML };
        _mockPromptProvider = new MockPromptProvider { ProviderType = AiProviderType.OpenAi };

        _factory = new AiProviderFactory(
            _configuration,
            [_mockImageProvider],
            [_mockAudioProvider],
            [_mockVideoProvider],
            [_mockPromptProvider]);
    }

    [Fact]
    public void GetImageProvider_WithSpecificType_ReturnsCorrectProvider() {
        var provider = _factory.GetImageProvider(AiProviderType.OpenAi);

        provider.Should().BeSameAs(_mockImageProvider);
        provider.ProviderType.Should().Be(AiProviderType.OpenAi);
    }

    [Fact]
    public void GetImageProvider_WithNull_ReturnsDefaultFromConfig() {
        var provider = _factory.GetImageProvider(null);

        provider.Should().BeSameAs(_mockImageProvider);
        provider.ProviderType.Should().Be(AiProviderType.OpenAi);
    }

    [Fact]
    public void GetImageProvider_WhenNotRegistered_ThrowsInvalidOperationException() {
        var action = () => _factory.GetImageProvider(AiProviderType.Google);

        action.Should().Throw<InvalidOperationException>()
            .Which.Message.Should().Contain("Image provider 'Google' is not registered");
    }

    [Fact]
    public void GetAvailableImageProviders_ReturnsAllRegisteredProviders() {
        var providers = _factory.GetAvailableImageProviders();

        providers.Should().HaveCount(1);
        providers.Should().Contain(AiProviderType.OpenAi);
    }

    [Fact]
    public void GetAudioProvider_WithSpecificType_ReturnsCorrectProvider() {
        var provider = _factory.GetAudioProvider(AiProviderType.OpenAi);

        provider.Should().BeSameAs(_mockAudioProvider);
        provider.ProviderType.Should().Be(AiProviderType.OpenAi);
    }

    [Fact]
    public void GetAudioProvider_WithNull_ReturnsDefaultFromConfig() {
        var provider = _factory.GetAudioProvider(null);

        provider.Should().BeSameAs(_mockAudioProvider);
        provider.ProviderType.Should().Be(AiProviderType.OpenAi);
    }

    [Fact]
    public void GetAudioProvider_WhenNotRegistered_ThrowsInvalidOperationException() {
        var action = () => _factory.GetAudioProvider(AiProviderType.Google);

        action.Should().Throw<InvalidOperationException>()
            .Which.Message.Should().Contain("Audio provider 'Google' is not registered");
    }

    [Fact]
    public void GetAvailableAudioProviders_ReturnsAllRegisteredProviders() {
        var providers = _factory.GetAvailableAudioProviders();

        providers.Should().HaveCount(1);
        providers.Should().Contain(AiProviderType.OpenAi);
    }

    [Fact]
    public void GetVideoProvider_WithSpecificType_ReturnsCorrectProvider() {
        var provider = _factory.GetVideoProvider(AiProviderType.RunwayML);

        provider.Should().BeSameAs(_mockVideoProvider);
        provider.ProviderType.Should().Be(AiProviderType.RunwayML);
    }

    [Fact]
    public void GetVideoProvider_WithNull_ReturnsDefaultFromConfig() {
        var provider = _factory.GetVideoProvider(null);

        provider.Should().BeSameAs(_mockVideoProvider);
        provider.ProviderType.Should().Be(AiProviderType.RunwayML);
    }

    [Fact]
    public void GetVideoProvider_WhenNotRegistered_ThrowsInvalidOperationException() {
        var action = () => _factory.GetVideoProvider(AiProviderType.Google);

        action.Should().Throw<InvalidOperationException>()
            .Which.Message.Should().Contain("Video provider 'Google' is not registered");
    }

    [Fact]
    public void GetAvailableVideoProviders_ReturnsAllRegisteredProviders() {
        var providers = _factory.GetAvailableVideoProviders();

        providers.Should().HaveCount(1);
        providers.Should().Contain(AiProviderType.RunwayML);
    }

    [Fact]
    public void GetPromptProvider_WithSpecificType_ReturnsCorrectProvider() {
        var provider = _factory.GetPromptProvider(AiProviderType.OpenAi);

        provider.Should().BeSameAs(_mockPromptProvider);
        provider.ProviderType.Should().Be(AiProviderType.OpenAi);
    }

    [Fact]
    public void GetPromptProvider_WithNull_ReturnsDefaultFromConfig() {
        var provider = _factory.GetPromptProvider(null);

        provider.Should().BeSameAs(_mockPromptProvider);
        provider.ProviderType.Should().Be(AiProviderType.OpenAi);
    }

    [Fact]
    public void GetPromptProvider_WhenNotRegistered_ThrowsInvalidOperationException() {
        var action = () => _factory.GetPromptProvider(AiProviderType.Google);

        action.Should().Throw<InvalidOperationException>()
            .Which.Message.Should().Contain("Prompt provider 'Google' is not registered");
    }
}
