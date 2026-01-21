namespace VttTools.AI.Services;

public class PromptEnhancementServiceTests {
    private readonly IAiProviderFactory _providerFactory = Substitute.For<IAiProviderFactory>();
    private readonly MockPromptProvider _mockProvider;
    private readonly PromptEnhancementService _service;
    private readonly CancellationToken _ct;

    public PromptEnhancementServiceTests() {
        _mockProvider = new MockPromptProvider {
            Name = "OpenAI",
            EnhancedPromptToReturn = "A highly detailed, photorealistic landscape scene",
        };

        _providerFactory.GetPromptProvider(Arg.Any<string?>()).Returns(_mockProvider);
        _providerFactory.GetProviderAndModel(Arg.Any<GeneratedContentType>())
            .Returns(("OpenAI", "gpt-4o-mini"));

        _service = new PromptEnhancementService(_providerFactory);
        _ct = TestContext.Current.CancellationToken;
    }

    [Fact]
    public async Task EnhanceAsync_WithValidRequest_ReturnsEnhancedPrompt() {
        var data = new PromptEnhancementData {
            Prompt = "A landscape",
            Context = "Fantasy art",
            Style = "Photorealistic",
            Model = "gpt-4",
            Provider = "OpenAi",
        };

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.EnhancedPrompt.Should().Be(_mockProvider.EnhancedPromptToReturn);
        _mockProvider.LastRequest.Should().BeSameAs(data);
    }

    [Fact]
    public async Task EnhanceAsync_WhenProviderFails_PropagatesError() {
        var data = new PromptEnhancementData {
            Provider = "OpenAi",
            Model = "gpt-4",
            Prompt = "Test prompt",
        };
        _mockProvider.ErrorToReturn = "Enhancement failed";

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Contain("Enhancement failed");
    }

    [Fact]
    public async Task EnhanceAsync_TracksRequestDuration() {
        var data = new PromptEnhancementData {
            Provider = "OpenAi",
            Model = "gpt-4",
            Prompt = "Test prompt",
        };

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Elapsed.Should().BeGreaterThanOrEqualTo(TimeSpan.Zero);
    }

    [Fact]
    public async Task EnhanceAsync_WithNullProvider_ResolvesFromConfig() {
        var data = new PromptEnhancementData {
            Provider = null,
            Model = null,
            Prompt = "Test prompt",
        };

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeTrue();
        _providerFactory.Received(1).GetProviderAndModel(GeneratedContentType.PromptEnhancement);
    }

    [Fact]
    public async Task EnhanceAsync_SetsTokensAndCostToZero() {
        var data = new PromptEnhancementData {
            Provider = "OpenAi",
            Model = "gpt-4",
            Prompt = "Test prompt",
        };

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.OutputTokens.Should().Be(0);
        result.Value.Cost.Should().Be(0m);
    }

    [Fact]
    public async Task EnhanceAsync_WithMinimalRequest_ReturnsEnhancedPrompt() {
        var data = new PromptEnhancementData {
            Provider = "OpenAi",
            Model = "gpt-4",
            Prompt = "Simple prompt",
        };

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.EnhancedPrompt.Should().NotBeEmpty();
    }
}