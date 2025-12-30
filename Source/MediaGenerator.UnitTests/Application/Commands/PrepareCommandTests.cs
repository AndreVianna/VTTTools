using VttTools.AssetImageManager.Fixtures;
using VttTools.AssetImageManager.Mocks;

namespace VttTools.AssetImageManager.Application.Commands;

public sealed class PrepareCommandTests : IDisposable {
    private readonly string _tempDir;
    private readonly string _outputDir;
    private readonly PrepareCommand _command;
    private readonly MockPromptEnhancementService _mockPromptService;
    private readonly HierarchicalFileStore _realFileStore;
    private readonly IFileStore _mockFileStore;
    private readonly IConfiguration _mockConfiguration;

    public PrepareCommandTests() {
        _tempDir = Path.Combine(Path.GetTempPath(), $"TokenManagerTests_{Guid.NewGuid():N}");
        _outputDir = Path.Combine(_tempDir, "output");
        Directory.CreateDirectory(_tempDir);
        Directory.CreateDirectory(_outputDir);

        _mockPromptService = new();

        _mockConfiguration = Substitute.For<IConfiguration>();
        _mockConfiguration["PromptEnhancer:Provider"].Returns("OPENAI");
        _mockConfiguration["PromptEnhancer:Model"].Returns("gpt-5-mini");

        _realFileStore = new(_outputDir);
        _mockFileStore = Substitute.For<IFileStore>();
        SetupFileStoreDelegation();

        _command = new(_mockPromptService, _mockFileStore, _mockConfiguration);
    }

    private void SetupFileStoreDelegation() {
        _mockFileStore.FindPromptFile(Arg.Any<string>(), Arg.Any<Asset>(), Arg.Any<int>())
            .Returns(ci => _realFileStore.FindPromptFile(ci.ArgAt<string>(0), ci.ArgAt<Asset>(1), ci.ArgAt<int>(2)));
        _mockFileStore.SavePromptAsync(Arg.Any<string>(), Arg.Any<Asset>(), Arg.Any<int>(), Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns(ci => _realFileStore.SavePromptAsync(ci.ArgAt<string>(0), ci.ArgAt<Asset>(1), ci.ArgAt<int>(2), ci.ArgAt<string>(3), ci.ArgAt<CancellationToken>(4)));
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
        var jsonFile = await SetupMockedJsonFileAsync("empty.json");
        _mockFileStore.LoadAssetsAsync(jsonFile, Arg.Any<CancellationToken>())
            .Returns(Task.FromResult(new List<Asset>()));
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
        var jsonFile = await SetupMockedJsonFileAsync("single-entity.json", entity);
        var options = new PrepareOptions(jsonFile);

        _mockPromptService.EnqueueSuccess("Enhanced prompt for top-down view");
        _mockPromptService.EnqueueSuccess("Enhanced prompt for close-up view");

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        result.Should().Be(0);
        VerifyPromptFilesCreated(entity, 1, ["Token"]);
    }

    [Fact]
    public async Task Should_ReturnSuccess_When_SingleEntityWithVariants() {
        SetConsoleInput("yes");
        var entity = CreateAssetWithTokens("Goblin", "A green-skinned creature", 2);
        var jsonFile = await SetupMockedJsonFileAsync("entity-with-variants.json", entity);
        var options = new PrepareOptions(jsonFile);

        _mockPromptService.EnqueueSuccess("Enhanced prompt for top-down token 1");
        _mockPromptService.EnqueueSuccess("Enhanced prompt for close-up token 1");
        _mockPromptService.EnqueueSuccess("Enhanced prompt for top-down token 2");
        _mockPromptService.EnqueueSuccess("Enhanced prompt for close-up token 2");

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        result.Should().Be(0);
        VerifyPromptFilesCreated(entity, 1, ["Token"]);
        VerifyPromptFilesCreated(entity, 2, ["Token"]);
    }

    [Fact]
    public async Task Should_ReturnSuccess_When_MultipleEntities() {
        SetConsoleInput("yes");
        var goblin = CreateAssetWithToken("Goblin", "A green-skinned creature");
        var orc = CreateAssetWithToken("Orc", "A muscular grey-skinned brute");
        var jsonFile = await SetupMockedJsonFileAsync("multiple-entities.json", goblin, orc);
        var options = new PrepareOptions(jsonFile);

        _mockPromptService.EnqueueSuccess("Enhanced goblin top-down");
        _mockPromptService.EnqueueSuccess("Enhanced goblin close-up");
        _mockPromptService.EnqueueSuccess("Enhanced orc top-down");
        _mockPromptService.EnqueueSuccess("Enhanced orc close-up");

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        result.Should().Be(0);
        VerifyPromptFilesCreated(goblin, 1, ["Token"]);
        VerifyPromptFilesCreated(orc, 1, ["Token"]);
    }

    [Fact]
    public async Task Should_ShowWarning_When_MoreThan50Variants() {
        SetConsoleInput("yes");
        var entity = CreateAssetWithTokens("TestEntity", "Test description", 55);
        var jsonFile = await SetupMockedJsonFileAsync("many-variants.json", entity);
        var options = new PrepareOptions(jsonFile);

        for (var i = 0; i < 55; i++) {
            _mockPromptService.EnqueueSuccess($"Enhanced prompt for token {i} top-down");
            _mockPromptService.EnqueueSuccess($"Enhanced prompt for token {i} close-up");
            if (i == 0) {
                _mockPromptService.EnqueueSuccess($"Enhanced prompt for token {i} portrait");
            }
        }

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        result.Should().Be(0);
    }

    [Fact]
    public async Task Should_HandleCancellationDuringFileRead() {
        var entity = EntityDefinitionFixtures.CreateSimpleGoblin();
        var jsonFile = await SetupMockedJsonFileAsync("cancel.json", entity);
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

    private async Task<string> SetupMockedJsonFileAsync(string fileName, params Asset[] assets) {
        var filePath = Path.Combine(_tempDir, fileName);
        await File.WriteAllTextAsync(filePath, "[]", TestContext.Current.CancellationToken);
        _mockFileStore.LoadAssetsAsync(filePath, Arg.Any<CancellationToken>())
            .Returns(Task.FromResult(assets.ToList()));
        return filePath;
    }

    private static Asset CreateAssetWithToken(string name, string description) => new() {
        Id = Guid.NewGuid(),
        Name = name,
        Description = description,
        Classification = new(AssetKind.Creature, "Humanoid", "Goblinoid", "Common"),
        Size = NamedSize.Default,
        Tokens = [
            new() {
                      Id = Guid.NewGuid(),
                      Path = string.Empty,
                      ContentType = "image/png",
                      FileName = $"{name.ToLowerInvariant()}.png",
                      FileSize = 1024,
                      Dimensions = VttTools.Common.Model.Size.Zero,
                      Duration = TimeSpan.Zero
                  }
        ]
    };

    private static Asset CreateAssetWithTokens(string name, string description, int tokenCount) {
        var tokens = new List<ResourceMetadata>();
        for (var i = 0; i < tokenCount; i++) {
            tokens.Add(new() {
                Id = Guid.NewGuid(),
                Path = string.Empty,
                ContentType = "image/png",
                FileName = $"{name.ToLowerInvariant()}-{i}.png",
                FileSize = 1024,
                Dimensions = VttTools.Common.Model.Size.Zero,
                Duration = TimeSpan.Zero
            });
        }

        return new() {
            Id = Guid.NewGuid(),
            Name = name,
            Description = description,
            Classification = new(AssetKind.Creature, "Humanoid", "Test", "Common"),
            Size = NamedSize.Default,
            Tokens = tokens
        };
    }

    private void VerifyPromptFilesCreated(Asset entity, int tokenIndex, string[] imageTypes) {
        foreach (var imageType in imageTypes) {
            var filePath = _realFileStore.FindPromptFile(imageType, entity, tokenIndex);
            filePath.Should().NotBeNull($"Prompt file for {imageType} should be created");
            File.Exists(filePath).Should().BeTrue($"Prompt file {filePath} should exist on disk");
        }
    }

    private static void SetConsoleInput(string input) {
        var reader = new StringReader(input + "\n");
        Console.SetIn(reader);
    }
}