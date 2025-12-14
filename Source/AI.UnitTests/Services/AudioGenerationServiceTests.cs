
using VttTools.AI.Mocks;

namespace VttTools.AI.Services;

public class AudioGenerationServiceTests {
    private readonly IAiProviderFactory _providerFactory = Substitute.For<IAiProviderFactory>();
    private readonly MockAudioProvider _mockProvider;
    private readonly AudioGenerationService _service;
    private readonly CancellationToken _ct;

    public AudioGenerationServiceTests() {
        _mockProvider = new MockAudioProvider {
            Name = "ElevenLabs",
            AudioDataToReturn = [0x52, 0x49, 0x46, 0x46],
        };

        _providerFactory.GetAudioProvider(Arg.Any<string?>()).Returns(_mockProvider);
        _providerFactory.GetAvailableAudioProviders().Returns(["ElevenLabs", "OpenAI"]);
        _providerFactory.GetProviderAndModel(Arg.Any<GeneratedContentType>())
            .Returns(("ElevenLabs", "eleven_multilingual_v2"));

        _service = new AudioGenerationService(_providerFactory);
        _ct = TestContext.Current.CancellationToken;
    }

    [Fact]
    public async Task GenerateAsync_WithValidRequest_ReturnsAudioResponse() {
        var data = new AudioGenerationData {
            ContentType = GeneratedContentType.AudioVoice,
            Prompt = "Epic battle music",
            Model = "tts-1",
            Provider = "ElevenLabs",
            Duration = TimeSpan.FromSeconds(30),
        };

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.AudioData.Should().BeEquivalentTo(_mockProvider.AudioDataToReturn);
        result.Value.ContentType.Should().Be("audio/ogg");
        _mockProvider.LastRequest.Should().BeSameAs(data);
    }

    [Fact]
    public async Task GenerateAsync_WhenProviderFails_PropagatesError() {
        var data = new AudioGenerationData {
            ContentType = GeneratedContentType.AudioVoice,
            Provider = "ElevenLabs",
            Model = "tts-1",
            Prompt = "Test audio",
        };
        _mockProvider.ErrorToReturn = "Audio generation failed";

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Contain("Audio generation failed");
    }

    [Fact]
    public async Task GenerateAsync_WithNullDuration_UsesZero() {
        var data = new AudioGenerationData {
            ContentType = GeneratedContentType.AudioVoice,
            Provider = "ElevenLabs",
            Model = "tts-1",
            Prompt = "Test audio",
            Duration = null,
        };

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Elapsed.Should().Be(TimeSpan.Zero);
    }

    [Fact]
    public void GetAvailableProviders_ReturnsProvidersFromFactory() {
        var providers = _service.GetAvailableProviders();

        providers.Should().HaveCount(2);
        providers.Should().Contain("ElevenLabs");
        providers.Should().Contain("OpenAI");
        _providerFactory.Received(1).GetAvailableAudioProviders();
    }

    [Fact]
    public async Task GenerateAsync_SetsCostToZero() {
        var data = new AudioGenerationData {
            ContentType = GeneratedContentType.AudioMusic,
            Provider = "ElevenLabs",
            Model = "tts-1",
            Prompt = "Test audio",
        };

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Cost.Should().Be(0m);
    }

    [Fact]
    public async Task GenerateAsync_WithNullProvider_ResolvesFromConfig() {
        var data = new AudioGenerationData {
            ContentType = GeneratedContentType.AudioVoice,
            Provider = null,
            Model = null,
            Prompt = "Test audio",
        };

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeTrue();
        _providerFactory.Received(1).GetProviderAndModel(GeneratedContentType.AudioVoice);
    }
}
