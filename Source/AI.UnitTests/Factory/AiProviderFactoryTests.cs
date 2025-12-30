namespace VttTools.AI.Factory;

public class AiProviderFactoryTests {
    private readonly IOptionsSnapshot<AiOptions> _mockOptions;
    private readonly MockImageProvider _mockImageProvider;
    private readonly MockAudioProvider _mockAudioProvider;
    private readonly MockVideoProvider _mockVideoProvider;
    private readonly MockPromptProvider _mockPromptProvider;
    private readonly MockTextProvider _mockTextProvider;
    private readonly AiProviderFactory _factory;

    public AiProviderFactoryTests() {
        var aiOptions = new AiOptions {
            Defaults = new Dictionary<string, Dictionary<string, ProviderModelConfig>> {
                ["DefaultDisplay"] = new() {
                    ["_default"] = new ProviderModelConfig { Provider = "OpenAI", Model = "gpt-image-1" },
                    ["Portrait"] = new ProviderModelConfig { Provider = "OpenAI", Model = "gpt-image-1" },
                    ["Token"] = new ProviderModelConfig { Provider = "OpenAI", Model = "gpt-image-1" },
                },
                ["Audio"] = new() {
                    ["_default"] = new ProviderModelConfig { Provider = "ElevenLabs", Model = "eleven_multilingual_v2" },
                },
                ["Video"] = new() {
                    ["_default"] = new ProviderModelConfig { Provider = "RunwayML", Model = "gen-3" },
                },
                ["Text"] = new() {
                    ["_default"] = new ProviderModelConfig { Provider = "OpenAI", Model = "gpt-4o-mini" },
                    ["Description"] = new ProviderModelConfig { Provider = "OpenAI", Model = "gpt-4o-mini" },
                },
                ["Prompt"] = new() {
                    ["_default"] = new ProviderModelConfig { Provider = "OpenAI", Model = "gpt-4o-mini" },
                    ["Enhancement"] = new ProviderModelConfig { Provider = "OpenAI", Model = "gpt-4o-mini" },
                },
            },
            Providers = [],
        };

        _mockOptions = Substitute.For<IOptionsSnapshot<AiOptions>>();
        _mockOptions.Value.Returns(aiOptions);

        _mockImageProvider = new MockImageProvider { Name = "OpenAI" };
        _mockAudioProvider = new MockAudioProvider { Name = "ElevenLabs" };
        _mockVideoProvider = new MockVideoProvider { Name = "RunwayML" };
        _mockPromptProvider = new MockPromptProvider { Name = "OpenAI" };
        _mockTextProvider = new MockTextProvider { Name = "OpenAI" };

        _factory = new AiProviderFactory(
            _mockOptions,
            [_mockImageProvider],
            [_mockAudioProvider],
            [_mockVideoProvider],
            [_mockPromptProvider],
            [_mockTextProvider]);
    }

    [Fact]
    public void GetProviderAndModel_WithValidContentType_ReturnsConfiguredProviderAndModel() {
        (var provider, var model) = _factory.GetProviderAndModel(GeneratedContentType.ImagePortrait);

        provider.Should().Be("OpenAI");
        model.Should().Be("gpt-image-1");
    }

    [Fact]
    public void GetProviderAndModel_FallsBackToDefault_WhenSubtypeNotConfigured() {
        (var provider, var model) = _factory.GetProviderAndModel(GeneratedContentType.AudioVoice);

        provider.Should().Be("ElevenLabs");
        model.Should().Be("eleven_multilingual_v2");
    }

    [Fact]
    public void GetImageProvider_WithSpecificType_ReturnsCorrectProvider() {
        var provider = _factory.GetImageProvider("OpenAI");

        provider.Should().BeSameAs(_mockImageProvider);
        provider.Name.Should().Be("OpenAI");
    }

    [Fact]
    public void GetImageProvider_WithNull_ReturnsDefaultFromConfig() {
        var provider = _factory.GetImageProvider(null);

        provider.Should().BeSameAs(_mockImageProvider);
        provider.Name.Should().Be("OpenAI");
    }

    [Fact]
    public void GetImageProvider_WhenNotRegistered_ThrowsInvalidOperationException() {
        var action = () => _factory.GetImageProvider("Google");

        action.Should().Throw<InvalidOperationException>()
            .Which.Message.Should().Contain("DefaultDisplay provider 'Google' is not registered");
    }

    [Fact]
    public void GetAvailableImageProviders_ReturnsAllRegisteredProviders() {
        var providers = _factory.GetAvailableImageProviders();

        providers.Should().HaveCount(1);
        providers.Should().Contain("OpenAI");
    }

    [Fact]
    public void GetAudioProvider_WithSpecificType_ReturnsCorrectProvider() {
        var provider = _factory.GetAudioProvider("ElevenLabs");

        provider.Should().BeSameAs(_mockAudioProvider);
        provider.Name.Should().Be("ElevenLabs");
    }

    [Fact]
    public void GetAudioProvider_WithNull_ReturnsDefaultFromConfig() {
        var provider = _factory.GetAudioProvider(null);

        provider.Should().BeSameAs(_mockAudioProvider);
        provider.Name.Should().Be("ElevenLabs");
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
        providers.Should().Contain("ElevenLabs");
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
        var provider = _factory.GetPromptProvider("OpenAI");

        provider.Should().BeSameAs(_mockPromptProvider);
        provider.Name.Should().Be("OpenAI");
    }

    [Fact]
    public void GetPromptProvider_WithNull_ReturnsDefaultFromConfig() {
        var provider = _factory.GetPromptProvider(null);

        provider.Should().BeSameAs(_mockPromptProvider);
        provider.Name.Should().Be("OpenAI");
    }

    [Fact]
    public void GetPromptProvider_WhenNotRegistered_ThrowsInvalidOperationException() {
        var action = () => _factory.GetPromptProvider("Google");

        action.Should().Throw<InvalidOperationException>()
            .Which.Message.Should().Contain("Prompt provider 'Google' is not registered");
    }

    [Fact]
    public void GetTextProvider_WithSpecificType_ReturnsCorrectProvider() {
        var provider = _factory.GetTextProvider("OpenAI");

        provider.Should().BeSameAs(_mockTextProvider);
        provider.Name.Should().Be("OpenAI");
    }

    [Fact]
    public void GetTextProvider_WithNull_ReturnsDefaultFromConfig() {
        var provider = _factory.GetTextProvider(null);

        provider.Should().BeSameAs(_mockTextProvider);
        provider.Name.Should().Be("OpenAI");
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
        providers.Should().Contain("OpenAI");
    }
}
