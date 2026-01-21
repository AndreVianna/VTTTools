namespace VttTools.AI.Services;

public class TextGenerationServiceTests {
    private readonly IAiProviderFactory _providerFactory = Substitute.For<IAiProviderFactory>();
    private readonly IPromptTemplateStorage _templateStorage = Substitute.For<IPromptTemplateStorage>();
    private readonly IPromptTemplateService _templateService = Substitute.For<IPromptTemplateService>();
    private readonly MockTextProvider _mockTextProvider = new();
    private readonly TextGenerationService _service;
    private readonly CancellationToken _ct;

    public TextGenerationServiceTests() {
        _providerFactory.GetTextProvider(Arg.Any<string?>()).Returns(_mockTextProvider);
        _providerFactory.GetAvailableTextProviders().Returns(["OpenAI"]);
        _providerFactory.GetProviderAndModel(Arg.Any<GeneratedContentType>())
            .Returns(("OpenAI", "gpt-4o-mini"));
        _service = new TextGenerationService(_providerFactory, _templateStorage, _templateService);
        _ct = TestContext.Current.CancellationToken;
    }

    [Fact]
    public async Task GenerateAsync_WithValidData_ReturnsSuccessfulResponse() {
        var data = new TextGenerationData {
            ContentType = GeneratedContentType.TextDescription,
            Provider = "OpenAI",
            Model = "gpt-4",
            Prompt = "Generate a description for a dragon",
        };

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.GeneratedText.Should().NotBeNullOrEmpty();
        result.Value.ContentType.Should().Be(GeneratedContentType.TextDescription);
    }

    [Fact]
    public async Task GenerateAsync_WithEmptyPrompt_ReturnsValidationError() {
        var data = new TextGenerationData {
            ContentType = GeneratedContentType.TextDescription,
            Provider = "OpenAI",
            Model = "gpt-4",
            Prompt = "",
        };

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().Contain(e => e.Message.Contains("prompt", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task GenerateAsync_WithSpecificProvider_UsesRequestedProvider() {
        var data = new TextGenerationData {
            ContentType = GeneratedContentType.TextDescription,
            Provider = "OpenAI",
            Model = "gpt-4",
            Prompt = "Generate a description",
        };

        await _service.GenerateAsync(data, _ct);

        _providerFactory.Received(1).GetTextProvider("OpenAI");
    }

    [Fact]
    public async Task GenerateAsync_WithTemplateName_ResolvesTemplate() {
        var template = new PromptTemplate {
            Id = Guid.CreateVersion7(),
            Name = "test.template",
            Category = GeneratedContentType.TextDescription,
            UserPromptTemplate = "Describe a {creature} in detail",
            SystemPrompt = "You are a fantasy writer.",
        };
        _templateStorage.GetLatestByNameAsync("test.template", false, _ct).Returns(template);
        _templateService.ResolveTemplate(template.UserPromptTemplate, Arg.Any<Dictionary<string, string>>())
            .Returns("Describe a dragon in detail");
        _templateService.ResolveTemplate(template.SystemPrompt, Arg.Any<Dictionary<string, string>>())
            .Returns("You are a fantasy writer.");

        var data = new TextGenerationData {
            ContentType = GeneratedContentType.TextDescription,
            Provider = "OpenAI",
            Model = "gpt-4",
            Prompt = "dragon",
            TemplateName = "test.template",
            TemplateContext = new Dictionary<string, string> { ["creature"] = "dragon" },
        };

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeTrue();
        _mockTextProvider.LastData!.Prompt.Should().Be("Describe a dragon in detail");
        _mockTextProvider.LastData!.SystemPrompt.Should().Be("You are a fantasy writer.");
    }

    [Fact]
    public async Task GenerateAsync_WithNonExistentTemplate_ReturnsError() {
        _templateStorage.GetLatestByNameAsync("missing.template", false, _ct).Returns((PromptTemplate?)null);

        var data = new TextGenerationData {
            ContentType = GeneratedContentType.TextDescription,
            Provider = "OpenAI",
            Model = "gpt-4",
            Prompt = "test",
            TemplateName = "missing.template",
        };

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Contain("missing.template");
    }

    [Fact]
    public async Task GenerateAsync_WithProviderError_ReturnsError() {
        _mockTextProvider.ErrorToReturn = "Provider unavailable";
        var data = new TextGenerationData {
            ContentType = GeneratedContentType.TextDescription,
            Provider = "OpenAI",
            Model = "gpt-4",
            Prompt = "Test prompt",
        };

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("Provider unavailable");
    }

    [Fact]
    public async Task GenerateAsync_WithMaxTokensAndTemperature_PassesToProvider() {
        var data = new TextGenerationData {
            ContentType = GeneratedContentType.TextDescription,
            Provider = "OpenAI",
            Model = "gpt-4",
            Prompt = "Generate text",
            MaxTokens = 500,
            Temperature = 0.7,
        };

        await _service.GenerateAsync(data, _ct);

        _mockTextProvider.LastData!.MaxTokens.Should().Be(500);
        _mockTextProvider.LastData!.Temperature.Should().Be(0.7);
    }

    [Fact]
    public void GetAvailableProviders_ReturnsProvidersFromFactory() {
        var result = _service.GetAvailableProviders();

        result.Should().HaveCount(1);
        result.Should().Contain("OpenAI");
    }

    [Fact]
    public async Task GenerateAsync_WithInvalidMaxTokens_ReturnsValidationError() {
        var data = new TextGenerationData {
            ContentType = GeneratedContentType.TextDescription,
            Provider = "OpenAI",
            Model = "gpt-4",
            Prompt = "Test",
            MaxTokens = 0,
        };

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().Contain(e => e.Message.Contains("MaxTokens", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task GenerateAsync_WithInvalidTemperature_ReturnsValidationError() {
        var data = new TextGenerationData {
            ContentType = GeneratedContentType.TextDescription,
            Provider = "OpenAI",
            Model = "gpt-4",
            Prompt = "Test",
            Temperature = 3.0,
        };

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().Contain(e => e.Message.Contains("Temperature", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task GenerateAsync_WithSystemPrompt_PassesToProvider() {
        var data = new TextGenerationData {
            ContentType = GeneratedContentType.TextDialogue,
            Provider = "OpenAI",
            Model = "gpt-4",
            Prompt = "Generate a story",
            SystemPrompt = "You are a creative storyteller.",
        };

        await _service.GenerateAsync(data, _ct);

        _mockTextProvider.LastData!.SystemPrompt.Should().Be("You are a creative storyteller.");
    }

    [Fact]
    public async Task GenerateAsync_WithTemplateAndNoSystemPrompt_UsesTemplateSystemPrompt() {
        var template = new PromptTemplate {
            Id = Guid.CreateVersion7(),
            Name = "test.template",
            Category = GeneratedContentType.TextDescription,
            UserPromptTemplate = "{prompt}",
            SystemPrompt = "Template system prompt",
        };
        _templateStorage.GetLatestByNameAsync("test.template", false, _ct).Returns(template);
        _templateService.ResolveTemplate(template.UserPromptTemplate, Arg.Any<Dictionary<string, string>>())
            .Returns("User prompt");
        _templateService.ResolveTemplate(template.SystemPrompt, Arg.Any<Dictionary<string, string>>())
            .Returns("Template system prompt");

        var data = new TextGenerationData {
            ContentType = GeneratedContentType.TextDescription,
            Provider = "OpenAI",
            Model = "gpt-4",
            Prompt = "User prompt",
            TemplateName = "test.template",
        };

        await _service.GenerateAsync(data, _ct);

        _mockTextProvider.LastData!.SystemPrompt.Should().Be("Template system prompt");
    }

    [Fact]
    public async Task GenerateAsync_WithNullProvider_ResolvesFromConfig() {
        var data = new TextGenerationData {
            ContentType = GeneratedContentType.TextDescription,
            Provider = null,
            Model = null,
            Prompt = "Test prompt",
        };

        var result = await _service.GenerateAsync(data, _ct);

        result.IsSuccessful.Should().BeTrue();
        _providerFactory.Received(1).GetProviderAndModel(GeneratedContentType.TextDescription);
    }
}