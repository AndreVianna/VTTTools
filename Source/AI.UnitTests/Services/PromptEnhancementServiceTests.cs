using VttTools.AI.UnitTests.Mocks;

namespace VttTools.AI.Services;

public class PromptEnhancementServiceTests {
    private readonly IAiProviderFactory _providerFactory = Substitute.For<IAiProviderFactory>();
    private readonly MockPromptProvider _mockProvider;
    private readonly PromptEnhancementService _service;
    private readonly CancellationToken _ct;

    public PromptEnhancementServiceTests() {
        _mockProvider = new MockPromptProvider {
            ProviderType = AiProviderType.OpenAi,
            EnhancedPromptToReturn = "A highly detailed, photorealistic landscape scene",
        };

        _providerFactory.GetPromptProvider(Arg.Any<AiProviderType?>()).Returns(_mockProvider);

        _service = new PromptEnhancementService(_providerFactory);
        _ct = TestContext.Current.CancellationToken;
    }

    [Fact]
    public async Task EnhanceAsync_WithValidRequest_ReturnsEnhancedPrompt() {
        var request = new PromptEnhancementRequest {
            Prompt = "A landscape",
            Context = "Fantasy art",
            Style = "Photorealistic",
            Model = "gpt-4",
            Provider = AiProviderType.OpenAi,
        };

        var result = await _service.EnhanceAsync(request, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.EnhancedPrompt.Should().Be(_mockProvider.EnhancedPromptToReturn);
        result.Value.Provider.Should().Be(AiProviderType.OpenAi);
        result.Value.Model.Should().Be("gpt-4");
        result.Value.Duration.Should().BeGreaterThan(TimeSpan.Zero);
        _mockProvider.LastRequest.Should().BeSameAs(request);
    }

    [Fact]
    public async Task EnhanceAsync_WhenProviderFails_PropagatesError() {
        var request = new PromptEnhancementRequest {
            Prompt = "Test prompt",
        };
        _mockProvider.ErrorToReturn = "Enhancement failed";

        var result = await _service.EnhanceAsync(request, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Contain("Enhancement failed");
    }

    [Fact]
    public async Task EnhanceAsync_TracksRequestDuration() {
        var request = new PromptEnhancementRequest {
            Prompt = "Test prompt",
        };

        var result = await _service.EnhanceAsync(request, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Duration.Should().BeGreaterThanOrEqualTo(TimeSpan.Zero);
    }

    [Fact]
    public async Task EnhanceAsync_WithNullProvider_UsesDefaultProvider() {
        var request = new PromptEnhancementRequest {
            Prompt = "Test prompt",
            Provider = null,
        };

        var result = await _service.EnhanceAsync(request, _ct);

        result.IsSuccessful.Should().BeTrue();
        _providerFactory.Received(1).GetPromptProvider(null);
    }

    [Fact]
    public async Task EnhanceAsync_SetsTokensAndCostToZero() {
        var request = new PromptEnhancementRequest {
            Prompt = "Test prompt",
        };

        var result = await _service.EnhanceAsync(request, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.TokensUsed.Should().Be(0);
        result.Value.Cost.Should().Be(0m);
    }

    [Fact]
    public async Task EnhanceAsync_WithMinimalRequest_ReturnsEnhancedPrompt() {
        var request = new PromptEnhancementRequest {
            Prompt = "Simple prompt",
        };

        var result = await _service.EnhanceAsync(request, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.EnhancedPrompt.Should().NotBeEmpty();
    }
}
