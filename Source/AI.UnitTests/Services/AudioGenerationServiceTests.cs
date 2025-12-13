
namespace VttTools.AI.Services;

public class AudioGenerationServiceTests {
    private readonly IAiProviderFactory _providerFactory = Substitute.For<IAiProviderFactory>();
    private readonly MockAudioProvider _mockProvider;
    private readonly AudioGenerationService _service;
    private readonly CancellationToken _ct;

    public AudioGenerationServiceTests() {
        _mockProvider = new MockAudioProvider {
            Name = "OpenAi",
            AudioDataToReturn = [0x52, 0x49, 0x46, 0x46],
        };

        _providerFactory.GetAudioProvider(Arg.Any<string>()).Returns(_mockProvider);
        _providerFactory.GetAvailableAudioProviders().Returns(["OpenAi", "ElevenLabs"]);

        _service = new AudioGenerationService(_providerFactory);
        _ct = TestContext.Current.CancellationToken;
    }

    [Fact]
    public async Task GenerateAsync_WithValidRequest_ReturnsAudioResponse() {
        var data = new AudioGenerationData {
            Prompt = "Epic battle music",
            Model = "tts-1",
            Provider = "OpenAi",
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
            Provider = "OpenAi",
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
            Provider = "OpenAi",
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
        providers.Should().Contain("OpenAi");
        providers.Should().Contain("ElevenLabs");
        _providerFactory.Received(1).GetAvailableAudioProviders();
    }

    [Fact]
    public async Task GenerateAsync_SetsCostToZero() {
        var data = new AudioGenerationData {
            Provider = "OpenAi",
            Model = "tts-1",
            Prompt = "Test audio",
        };

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Cost.Should().Be(0m);
    }
}
