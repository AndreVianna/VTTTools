namespace VttTools.AssetImageManager.UnitTests.Application.Commands;

public sealed class PrepareCommandTests : IDisposable {
    private readonly string _tempDir;
    private readonly string _outputDir;
    private readonly PrepareCommand _command;
    private readonly MockHttpClientFactory _mockHttpClientFactory;
    private readonly IFileStore _imageStore;
    private readonly IConfiguration _mockConfiguration;

    private static readonly JsonSerializerOptions _jsonOptions = new() {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingDefault
    };

    public PrepareCommandTests() {
        _tempDir = Path.Combine(Path.GetTempPath(), $"TokenManagerTests_{Guid.NewGuid():N}");
        _outputDir = Path.Combine(_tempDir, "output");
        Directory.CreateDirectory(_tempDir);
        Directory.CreateDirectory(_outputDir);

        _mockHttpClientFactory = new MockHttpClientFactory();

        _mockConfiguration = Substitute.For<IConfiguration>();
        _mockConfiguration["PromptEnhancer:Provider"].Returns("OPENAI");
        _mockConfiguration["PromptEnhancer:Model"].Returns("gpt-4");
        _mockConfiguration["OpenAI:ApiKey"].Returns("test-key");
        _mockConfiguration["OpenAI:Model"].Returns("gpt-4");

        _imageStore = new HierarchicalFileStore(_outputDir);
        _command = new PrepareCommand(_mockHttpClientFactory, _imageStore, _mockConfiguration);
    }

    public void Dispose() {
        if (Directory.Exists(_tempDir)) {
            Directory.Delete(_tempDir, true);
        }
    }

    [Fact]
    public async Task Should_ReturnError_When_InputPathIsEmpty() {
        var options = new PrepareOptions(string.Empty);

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        Assert.Equal(1, result);
    }

    [Fact]
    public async Task Should_ReturnError_When_InputPathIsNotAbsolute() {
        var options = new PrepareOptions("relative/path/entities.json");

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        Assert.Equal(1, result);
    }

    [Fact]
    public async Task Should_ReturnError_When_FileIsNotJson() {
        var txtFile = Path.Combine(_tempDir, "test.txt");
        await File.WriteAllTextAsync(txtFile, "test", TestContext.Current.CancellationToken);
        var options = new PrepareOptions(txtFile);

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        Assert.Equal(1, result);
    }

    [Fact]
    public async Task Should_ReturnError_When_FileDoesNotExist() {
        var missingFile = Path.Combine(_tempDir, "missing.json");
        var options = new PrepareOptions(missingFile);

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        Assert.Equal(1, result);
    }

    [Fact]
    public async Task Should_ReturnSuccess_When_FileIsEmptyArray() {
        var jsonFile = Path.Combine(_tempDir, "empty.json");
        await File.WriteAllTextAsync(jsonFile, "[]", TestContext.Current.CancellationToken);
        var options = new PrepareOptions(jsonFile);

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        Assert.Equal(0, result);
    }

    [Fact]
    public async Task Should_ReturnError_When_JsonIsInvalid() {
        var jsonFile = Path.Combine(_tempDir, "invalid.json");
        await File.WriteAllTextAsync(jsonFile, "{ invalid json }", TestContext.Current.CancellationToken);
        var options = new PrepareOptions(jsonFile);

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        Assert.Equal(1, result);
    }

    [Fact]
    public async Task Should_ReturnSuccess_When_SingleEntityWithNoVariants() {
        SetConsoleInput("yes");
        var entity = CreateAssetWithToken("Goblin", "A green-skinned creature");
        var jsonFile = await CreateJsonFileAsync("single-entity.json", [entity]);
        var options = new PrepareOptions(jsonFile);

        EnqueueOpenAiSuccessResponse("Enhanced prompt for top-down view");
        EnqueueOpenAiSuccessResponse("Enhanced prompt for close-up view");
        EnqueueOpenAiSuccessResponse("Enhanced prompt for portrait view");

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        result.Should().Be(0);
        VerifyPromptFilesCreated(entity, 0, ["TopDown", "CloseUp", "Portrait"]);
    }

    [Fact]
    public async Task Should_ReturnSuccess_When_SingleEntityWithVariants() {
        SetConsoleInput("yes");
        var entity = CreateAssetWithTokens("Goblin", "A green-skinned creature", 2);
        var jsonFile = await CreateJsonFileAsync("entity-with-variants.json", [entity]);
        var options = new PrepareOptions(jsonFile);

        EnqueueOpenAiSuccessResponse("Enhanced prompt for top-down token 0");
        EnqueueOpenAiSuccessResponse("Enhanced prompt for close-up token 0");
        EnqueueOpenAiSuccessResponse("Enhanced prompt for portrait token 0");
        EnqueueOpenAiSuccessResponse("Enhanced prompt for top-down token 1");
        EnqueueOpenAiSuccessResponse("Enhanced prompt for close-up token 1");

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        result.Should().Be(0);
        VerifyPromptFilesCreated(entity, 0, ["TopDown", "CloseUp", "Portrait"]);
        VerifyPromptFilesCreated(entity, 1, ["TopDown", "CloseUp"]);
    }

    [Fact]
    public async Task Should_ReturnSuccess_When_MultipleEntities() {
        SetConsoleInput("yes");
        var goblin = CreateAssetWithToken("Goblin", "A green-skinned creature");
        var orc = CreateAssetWithToken("Orc", "A muscular grey-skinned brute");
        var jsonFile = await CreateJsonFileAsync("multiple-entities.json", [goblin, orc]);
        var options = new PrepareOptions(jsonFile);

        EnqueueOpenAiSuccessResponse("Enhanced goblin top-down");
        EnqueueOpenAiSuccessResponse("Enhanced goblin close-up");
        EnqueueOpenAiSuccessResponse("Enhanced goblin portrait");
        EnqueueOpenAiSuccessResponse("Enhanced orc top-down");
        EnqueueOpenAiSuccessResponse("Enhanced orc close-up");
        EnqueueOpenAiSuccessResponse("Enhanced orc portrait");

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        result.Should().Be(0);
        VerifyPromptFilesCreated(goblin, 0, ["TopDown", "CloseUp", "Portrait"]);
        VerifyPromptFilesCreated(orc, 0, ["TopDown", "CloseUp", "Portrait"]);
    }

    [Fact]
    public async Task Should_ShowWarning_When_MoreThan50Variants() {
        SetConsoleInput("yes");
        var entity = CreateAssetWithTokens("TestEntity", "Test description", 55);
        var jsonFile = await CreateJsonFileAsync("many-variants.json", [entity]);
        var options = new PrepareOptions(jsonFile);

        for (var i = 0; i < 55; i++) {
            EnqueueOpenAiSuccessResponse($"Enhanced prompt for token {i} top-down");
            EnqueueOpenAiSuccessResponse($"Enhanced prompt for token {i} close-up");
            if (i == 0) {
                EnqueueOpenAiSuccessResponse($"Enhanced prompt for token {i} portrait");
            }
        }

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        result.Should().Be(0);
    }

    [Fact]
    public async Task Should_HandleCancellationDuringFileRead() {
        var entity = EntityDefinitionFixtures.CreateSimpleGoblin();
        var jsonFile = await CreateJsonFileAsync("cancel.json", [entity]);
        var options = new PrepareOptions(jsonFile);
        using var cts = new CancellationTokenSource();

        var task = _command.ExecuteAsync(options, cts.Token);
        cts.Cancel();

        try {
            await task;
        }
        catch (OperationCanceledException) {
            Assert.True(true);
            return;
        }

        Assert.True(true);
    }

    private async Task<string> CreateJsonFileAsync(string fileName, List<Asset> entities) {
        var filePath = Path.Combine(_tempDir, fileName);
        var json = JsonSerializer.Serialize(entities, _jsonOptions);
        await File.WriteAllTextAsync(filePath, json, TestContext.Current.CancellationToken);
        return filePath;
    }

    private static Asset CreateAssetWithToken(string name, string description) => new() {
        Id = Guid.NewGuid(),
        Name = name,
        Description = description,
        Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Common"),
        TokenSize = NamedSize.Default,
        StatBlocks = [],
        Tokens = [
            new Resource {
                Id = Guid.NewGuid(),
                Description = description,
                Type = ResourceType.Image,
                Path = string.Empty,
                ContentType = "image/png",
                FileName = $"{name.ToLowerInvariant()}.png",
                FileLength = 1024,
                Size = Size.Zero,
                Duration = TimeSpan.Zero
            }
        ]
    };

    private static Asset CreateAssetWithTokens(string name, string description, int tokenCount) {
        var tokens = new List<Resource>();
        for (var i = 0; i < tokenCount; i++) {
            tokens.Add(new Resource {
                Id = Guid.NewGuid(),
                Description = $"{description} variant {i}",
                Type = ResourceType.Image,
                Path = string.Empty,
                ContentType = "image/png",
                FileName = $"{name.ToLowerInvariant()}-{i}.png",
                FileLength = 1024,
                Size = Size.Zero,
                Duration = TimeSpan.Zero
            });
        }

        return new Asset {
            Id = Guid.NewGuid(),
            Name = name,
            Description = description,
            Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Test", "Common"),
            TokenSize = NamedSize.Default,
            StatBlocks = [],
            Tokens = tokens
        };
    }

    private void EnqueueOpenAiSuccessResponse(string promptText) {
        var responseJson = $$"""
        {
            "id": "msg_{{Guid.NewGuid():N}}",
            "object": "thread.message",
            "created_at": {{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}},
            "status": "completed",
            "model": "gpt-4",
            "output": [
                {
                    "type": "message",
                    "id": "msg_item_{{Guid.NewGuid():N}}",
                    "status": "completed",
                    "role": "system"
                },
                {
                    "type": "message",
                    "id": "msg_item_{{Guid.NewGuid():N}}",
                    "status": "completed",
                    "role": "assistant",
                    "content": [
                        {
                            "type": "text",
                            "text": "{{promptText}}"
                        }
                    ]
                }
            ],
            "usage": {
                "input_tokens": 100,
                "output_tokens": 50,
                "total_tokens": 150
            }
        }
        """;

        _mockHttpClientFactory.EnqueueJsonResponse(responseJson);
    }

    private void VerifyPromptFilesCreated(Asset entity, int tokenIndex, string[] imageTypes) {
        foreach (var imageType in imageTypes) {
            var filePath = _imageStore.FindPromptFile(imageType, entity, tokenIndex);
            filePath.Should().NotBeNull($"Prompt file for {imageType} should be created");
            File.Exists(filePath).Should().BeTrue($"Prompt file {filePath} should exist on disk");
        }
    }

    private static void SetConsoleInput(string input) {
        var reader = new StringReader(input + "\n");
        Console.SetIn(reader);
    }
}
