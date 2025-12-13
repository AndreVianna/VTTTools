
namespace VttTools.AI.Factory;

public class AiProviderFactoryTests {
    private readonly IConfiguration _configuration;
    private readonly IAiProviderConfigStorage _mockProviderStorage;
    private readonly IMemoryCache _mockCache;
    private readonly ILogger<AiProviderFactory> _mockLogger;
    private readonly MockImageProvider _mockImageProvider;
    private readonly MockAudioProvider _mockAudioProvider;
    private readonly MockVideoProvider _mockVideoProvider;
    private readonly MockPromptProvider _mockPromptProvider;
    private readonly MockTextProvider _mockTextProvider;
    private readonly AiProviderFactory _factory;

    public AiProviderFactoryTests() {
        var configData = new Dictionary<string, string?> {
            ["AI:DefaultProviders:Image"] = "OpenAi",
            ["AI:DefaultProviders:Audio"] = "OpenAi",
            ["AI:DefaultProviders:Video"] = "RunwayML",
            ["AI:DefaultProviders:Prompt"] = "OpenAi",
            ["AI:DefaultProviders:Text"] = "OpenAi",
        };

        _configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(configData)
            .Build();

        _mockProviderStorage = Substitute.For<IAiProviderConfigStorage>();
        _mockCache = Substitute.For<IMemoryCache>();
        _mockLogger = Substitute.For<ILogger<AiProviderFactory>>();

        _mockImageProvider = new MockImageProvider { Name = "OpenAi" };
        _mockAudioProvider = new MockAudioProvider { Name = "OpenAi" };
        _mockVideoProvider = new MockVideoProvider { Name = "RunwayML" };
        _mockPromptProvider = new MockPromptProvider { Name = "OpenAi" };
        _mockTextProvider = new MockTextProvider { Name = "OpenAi" };

        _factory = new AiProviderFactory(
            _configuration,
            _mockProviderStorage,
            _mockCache,
            _mockLogger,
            [_mockImageProvider],
            [_mockAudioProvider],
            [_mockVideoProvider],
            [_mockPromptProvider],
            [_mockTextProvider]);
    }

    [Fact]
    public void GetImageProvider_WithSpecificType_ReturnsCorrectProvider() {
        var provider = _factory.GetImageProvider("OpenAi");

        provider.Should().BeSameAs(_mockImageProvider);
        provider.Name.Should().Be("OpenAi");
    }

    [Fact]
    public void GetImageProvider_WithNull_ReturnsDefaultFromConfig() {
        var provider = _factory.GetImageProvider(null);

        provider.Should().BeSameAs(_mockImageProvider);
        provider.Name.Should().Be("OpenAi");
    }

    [Fact]
    public void GetImageProvider_WhenNotRegistered_ThrowsInvalidOperationException() {
        var action = () => _factory.GetImageProvider("Google");

        action.Should().Throw<InvalidOperationException>()
            .Which.Message.Should().Contain("Image provider 'Google' is not registered");
    }

    [Fact]
    public void GetAvailableImageProviders_ReturnsAllRegisteredProviders() {
        var providers = _factory.GetAvailableImageProviders();

        providers.Should().HaveCount(1);
        providers.Should().Contain("OpenAi");
    }

    [Fact]
    public void GetAudioProvider_WithSpecificType_ReturnsCorrectProvider() {
        var provider = _factory.GetAudioProvider("OpenAi");

        provider.Should().BeSameAs(_mockAudioProvider);
        provider.Name.Should().Be("OpenAi");
    }

    [Fact]
    public void GetAudioProvider_WithNull_ReturnsDefaultFromConfig() {
        var provider = _factory.GetAudioProvider(null);

        provider.Should().BeSameAs(_mockAudioProvider);
        provider.Name.Should().Be("OpenAi");
    }

    [Fact]
    public void GetAudioProvider_WhenNotRegistered_ThrowsInvalidOperationException() {
        var action = () => _factory.GetAudioProvider("Google");

        action.Should().Throw<InvalidOperationException>()
            .Which.Message.Should().Contain("Audio provider 'Google' is not registered");
    }

    [Fact]
    public void GetAvailableAudioProviders_ReturnsAllRegisteredProviders() {
        var providers = _factory.GetAvailableAudioProviders();

        providers.Should().HaveCount(1);
        providers.Should().Contain("OpenAi");
    }

    [Fact]
    public void GetVideoProvider_WithSpecificType_ReturnsCorrectProvider() {
        var provider = _factory.GetVideoProvider("RunwayML");

        provider.Should().BeSameAs(_mockVideoProvider);
        provider.Name.Should().Be("RunwayML");
    }

    [Fact]
    public void GetVideoProvider_WithNull_ReturnsDefaultFromConfig() {
        var provider = _factory.GetVideoProvider(null);

        provider.Should().BeSameAs(_mockVideoProvider);
        provider.Name.Should().Be("RunwayML");
    }

    [Fact]
    public void GetVideoProvider_WhenNotRegistered_ThrowsInvalidOperationException() {
        var action = () => _factory.GetVideoProvider("Google");

        action.Should().Throw<InvalidOperationException>()
            .Which.Message.Should().Contain("Video provider 'Google' is not registered");
    }

    [Fact]
    public void GetAvailableVideoProviders_ReturnsAllRegisteredProviders() {
        var providers = _factory.GetAvailableVideoProviders();

        providers.Should().HaveCount(1);
        providers.Should().Contain("RunwayML");
    }

    [Fact]
    public void GetPromptProvider_WithSpecificType_ReturnsCorrectProvider() {
        var provider = _factory.GetPromptProvider("OpenAi");

        provider.Should().BeSameAs(_mockPromptProvider);
        provider.Name.Should().Be("OpenAi");
    }

    [Fact]
    public void GetPromptProvider_WithNull_ReturnsDefaultFromConfig() {
        var provider = _factory.GetPromptProvider(null);

        provider.Should().BeSameAs(_mockPromptProvider);
        provider.Name.Should().Be("OpenAi");
    }

    [Fact]
    public void GetPromptProvider_WhenNotRegistered_ThrowsInvalidOperationException() {
        var action = () => _factory.GetPromptProvider("Google");

        action.Should().Throw<InvalidOperationException>()
            .Which.Message.Should().Contain("Prompt provider 'Google' is not registered");
    }

    [Fact]
    public void GetTextProvider_WithSpecificType_ReturnsCorrectProvider() {
        var provider = _factory.GetTextProvider("OpenAi");

        provider.Should().BeSameAs(_mockTextProvider);
        provider.Name.Should().Be("OpenAi");
    }

    [Fact]
    public void GetTextProvider_WithNull_ReturnsDefaultFromConfig() {
        var provider = _factory.GetTextProvider(null);

        provider.Should().BeSameAs(_mockTextProvider);
        provider.Name.Should().Be("OpenAi");
    }

    [Fact]
    public void GetTextProvider_WhenNotRegistered_ThrowsInvalidOperationException() {
        var action = () => _factory.GetTextProvider("Google");

        action.Should().Throw<InvalidOperationException>()
            .Which.Message.Should().Contain("Text provider 'Google' is not registered");
    }

    [Fact]
    public void GetAvailableTextProviders_ReturnsAllRegisteredProviders() {
        var providers = _factory.GetAvailableTextProviders();

        providers.Should().HaveCount(1);
        providers.Should().Contain("OpenAi");
    }
}
