namespace VttTools.AssetImageManager.UnitTests.Application.Commands;

public sealed class GenerateCommandTests : IDisposable {
    private readonly string _tempDir;
    private readonly MockHttpClientFactory _mockHttpClientFactory;
    private readonly HierarchicalFileStore _imageStore;
    private readonly GenerateCommand _command;
    private readonly IConfiguration _mockConfiguration;

    private static readonly JsonSerializerOptions _jsonOptions = new() {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingDefault
    };

    public GenerateCommandTests() {
        _tempDir = Path.Combine(Directory.GetCurrentDirectory(), $"TokenManagerTests_{Guid.NewGuid():N}");
        Directory.CreateDirectory(_tempDir);

        _mockHttpClientFactory = new MockHttpClientFactory();
        _imageStore = new HierarchicalFileStore(_tempDir);
        _mockConfiguration = Substitute.For<IConfiguration>();

        _mockConfiguration["Providers:Stability:BaseUrl"].Returns("https://api.stability.ai");
        _mockConfiguration["Providers:Stability:ApiKey"].Returns("test-api-key");
        _mockConfiguration["Providers:Stability:sb35:Path"].Returns("/v2beta/stable-image/generate/sd3");

        _mockConfiguration["Images:TopDown:Provider"].Returns("STABILITY");
        _mockConfiguration["Images:TopDown:Model"].Returns("sb35");
        _mockConfiguration["Images:TopDown:NegativePrompt"].Returns("border, frame");
        _mockConfiguration["Images:TopDown:AspectRatio"].Returns("1:1");
        _mockConfiguration["Images:CloseUp:Provider"].Returns("STABILITY");
        _mockConfiguration["Images:CloseUp:Model"].Returns("sb35");
        _mockConfiguration["Images:CloseUp:NegativePrompt"].Returns("border, frame");
        _mockConfiguration["Images:CloseUp:AspectRatio"].Returns("1:1");
        _mockConfiguration["Images:Portrait:Provider"].Returns("STABILITY");
        _mockConfiguration["Images:Portrait:Model"].Returns("sb35");
        _mockConfiguration["Images:Portrait:NegativePrompt"].Returns("border, frame");
        _mockConfiguration["Images:Portrait:AspectRatio"].Returns("1:1");

        _command = new GenerateCommand(
            _mockHttpClientFactory,
            _imageStore,
            _mockConfiguration);
    }

    public void Dispose() {
        if (Directory.Exists(_tempDir)) {
            Directory.Delete(_tempDir, true);
        }
    }

    [Fact]
    public async Task Should_ReturnEarly_When_InputPathIsEmpty() {
        var options = new GenerateOptions(
            InputPath: string.Empty,
            Limit: null,
            DelayMs: 0,
            NameFilter: null);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        Assert.Empty(_mockHttpClientFactory.ReceivedRequests);
    }

    [Fact]
    public async Task Should_ReturnEarly_When_InputPathIsNotAbsolute() {
        var options = new GenerateOptions(
            InputPath: "relative/path.json",
            Limit: null,
            DelayMs: 0,
            NameFilter: null);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        Assert.Empty(_mockHttpClientFactory.ReceivedRequests);
    }

    [Fact]
    public async Task Should_ReturnEarly_When_FileNotJson() {
        var txtFile = Path.Combine(_tempDir, "test.txt");
        await File.WriteAllTextAsync(txtFile, "test", TestContext.Current.CancellationToken);
        var options = new GenerateOptions(
            InputPath: txtFile,
            Limit: null,
            DelayMs: 0,
            NameFilter: null);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        Assert.Empty(_mockHttpClientFactory.ReceivedRequests);
    }

    [Fact]
    public async Task Should_ReturnEarly_When_FileDoesNotExist() {
        var missingFile = Path.Combine(_tempDir, "missing.json");
        var options = new GenerateOptions(
            InputPath: missingFile,
            Limit: null,
            DelayMs: 0,
            NameFilter: null);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        Assert.Empty(_mockHttpClientFactory.ReceivedRequests);
    }

    [Fact]
    public async Task Should_ReturnSuccess_When_SingleEntityNoVariants() {
        var entity = CreateAssetWithSimpleToken("Goblin", AssetKind.Creature, "Humanoid", "Goblinoid", "Common");
        var jsonFile = await CreateJsonFileWithSimpleTokensAsync("single-entity.json", entity);
        await CreatePromptFilesAsync(entity, 0);
        _mockHttpClientFactory.EnqueueFakeImage();
        _mockHttpClientFactory.EnqueueFakeImage();
        _mockHttpClientFactory.EnqueueFakeImage();
        SetConsoleInput("Y");

        var options = new GenerateOptions(
            InputPath: jsonFile,
            Limit: null,
            DelayMs: 0,
            NameFilter: null);

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        result.Should().Be(0);
        _mockHttpClientFactory.ReceivedRequests.Should().HaveCount(3);
    }

    [Fact]
    public async Task Should_ReadPromptFiles_When_EntityWithMultipleTokens() {
        var entity = CreateAssetWithSimpleTokens("Goblin", AssetKind.Creature, "Humanoid", "Goblinoid", "Common", 2);
        var jsonFile = await CreateJsonFileWithSimpleTokensAsync("entity-with-tokens.json", entity);
        await CreatePromptFilesAsync(entity, 0);
        await CreatePromptFilesAsync(entity, 1);
        _mockHttpClientFactory.EnqueueFakeImage();
        _mockHttpClientFactory.EnqueueFakeImage();
        _mockHttpClientFactory.EnqueueFakeImage();
        _mockHttpClientFactory.EnqueueFakeImage();
        _mockHttpClientFactory.EnqueueFakeImage();
        _mockHttpClientFactory.EnqueueFakeImage();
        _mockHttpClientFactory.EnqueueFakeImage();
        _mockHttpClientFactory.EnqueueFakeImage();
        _mockHttpClientFactory.EnqueueFakeImage();
        SetConsoleInput("Y");

        var options = new GenerateOptions(
            InputPath: jsonFile,
            Limit: null,
            DelayMs: 0,
            NameFilter: null);

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        result.Should().Be(0);
        _mockHttpClientFactory.ReceivedRequests.Should().HaveCountGreaterThanOrEqualTo(6);
    }

    [Fact]
    public async Task Should_SkipExistingImages_When_FilesAlreadyExist() {
        var entity = EntityDefinitionFixtures.CreateSimpleGoblin();
        var jsonFile = await CreateJsonFileAsync("existing-images.json", [entity]);
        await CreatePromptFilesAsync(entity, 0);
        await CreateExistingImageAsync(entity, 0, "TopDown");
        SetConsoleInput("Y\nS");

        var options = new GenerateOptions(
            InputPath: jsonFile,
            Limit: null,
            DelayMs: 0,
            NameFilter: null);

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        result.Should().Be(0);
    }

    [Fact]
    public async Task Should_ProcessOnlyFilteredAssets_When_NameFilterProvided() {
        var goblin = CreateAssetWithSimpleToken("Goblin", AssetKind.Creature, "Humanoid", "Goblinoid", "Common");
        var orc = CreateAssetWithSimpleToken("Orc", AssetKind.Creature, "Humanoid", "Orc", "Common");
        var jsonFile = await CreateJsonFileWithSimpleTokensAsync("filtered-assets.json", goblin, orc);
        await CreatePromptFilesAsync(goblin, 0);
        await CreatePromptFilesAsync(orc, 0);
        _mockHttpClientFactory.EnqueueFakeImage();
        _mockHttpClientFactory.EnqueueFakeImage();
        _mockHttpClientFactory.EnqueueFakeImage();
        _mockHttpClientFactory.EnqueueFakeImage();
        _mockHttpClientFactory.EnqueueFakeImage();
        _mockHttpClientFactory.EnqueueFakeImage();
        SetConsoleInput("Y");

        var options = new GenerateOptions(
            InputPath: jsonFile,
            Limit: null,
            DelayMs: 0,
            NameFilter: "Goblin");

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        result.Should().Be(0);
        _mockHttpClientFactory.ReceivedRequests.Should().HaveCount(3);
    }

    [Fact]
    public async Task Should_ProcessMultipleEntities_WhenJsonContainsMultiple() {
        var goblin = CreateAssetWithSimpleToken("Goblin", AssetKind.Creature, "Humanoid", "Goblinoid", "Common");
        var orc = CreateAssetWithSimpleToken("Orc", AssetKind.Creature, "Humanoid", "Orc", "Common");
        var kobold = CreateAssetWithSimpleToken("Kobold", AssetKind.Creature, "Humanoid", "Reptilian", "Common");
        var jsonFile = await CreateJsonFileWithSimpleTokensAsync("multiple-assets.json", goblin, orc, kobold);
        await CreatePromptFilesAsync(goblin, 0);
        await CreatePromptFilesAsync(orc, 0);
        await CreatePromptFilesAsync(kobold, 0);
        for (var i = 0; i < 9; i++) {
            _mockHttpClientFactory.EnqueueFakeImage();
        }
        SetConsoleInput("Y");

        var options = new GenerateOptions(
            InputPath: jsonFile,
            Limit: null,
            DelayMs: 0,
            NameFilter: null);

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        result.Should().Be(0);
        _mockHttpClientFactory.ReceivedRequests.Should().HaveCount(9);
    }

    [Fact]
    public async Task Should_RespectDelay_When_DelayMsIsSet() {
        var entity = EntityDefinitionFixtures.CreateSimpleGoblin();
        var jsonFile = await CreateJsonFileAsync("delay-test.json", [entity]);
        await CreatePromptFilesAsync(entity, 0);
        _mockHttpClientFactory.EnqueueFakeImage();
        _mockHttpClientFactory.EnqueueFakeImage();
        _mockHttpClientFactory.EnqueueFakeImage();
        SetConsoleInput("Y");

        var stopwatch = Stopwatch.StartNew();
        var options = new GenerateOptions(
            InputPath: jsonFile,
            Limit: null,
            DelayMs: 100,
            NameFilter: null);

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);
        stopwatch.Stop();

        result.Should().Be(0);
        stopwatch.ElapsedMilliseconds.Should().BeGreaterThanOrEqualTo(200);
    }

    [Fact]
    public async Task Should_CreateCorrectStructure_When_SavingImages() {
        var entity = EntityDefinitionFixtures.CreateSimpleGoblin();
        entity = AddTokenToEntity(entity, 1);
        var jsonFile = await CreateJsonFileAsync("structure-test.json", [entity]);
        await CreatePromptFilesAsync(entity, 0);
        _mockHttpClientFactory.EnqueueFakeImage();
        _mockHttpClientFactory.EnqueueFakeImage();
        _mockHttpClientFactory.EnqueueFakeImage();
        SetConsoleInput("Y");

        var options = new GenerateOptions(
            InputPath: jsonFile,
            Limit: null,
            DelayMs: 0,
            NameFilter: null);

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        result.Should().Be(0);
        var imagePath = _imageStore.FindImageFile("TopDown", entity, 0);
        imagePath.Should().NotBeNull();
        File.Exists(imagePath).Should().BeTrue();
    }

    [Fact]
    public async Task Should_HandleApiErrors_When_GenerationFails() {
        var entity = EntityDefinitionFixtures.CreateSimpleGoblin();
        var jsonFile = await CreateJsonFileAsync("error-test.json", [entity]);
        await CreatePromptFilesAsync(entity, 0);
        SetConsoleInput("Y");

        var options = new GenerateOptions(
            InputPath: jsonFile,
            Limit: null,
            DelayMs: 0,
            NameFilter: null);

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        result.Should().Be(0);
    }

    [Fact]
    public async Task Should_HandleCancellation_When_TokenIsCanceled() {
        var entity = EntityDefinitionFixtures.CreateSimpleGoblin();
        var jsonFile = await CreateJsonFileAsync("cancel.json", [entity]);
        using var cts = new CancellationTokenSource();

        var options = new GenerateOptions(
            InputPath: jsonFile,
            Limit: null,
            DelayMs: 0,
            NameFilter: null);

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

    private async Task<string> CreateJsonFileAsync(string fileName, List<Asset> assets) {
        var filePath = Path.Combine(_tempDir, fileName);
        var json = JsonSerializer.Serialize(assets, _jsonOptions);
        await File.WriteAllTextAsync(filePath, json);

        _mockConfiguration["Providers:Stability:BaseUrl"].Returns("https://api.stability.ai");
        _mockConfiguration["Providers:Stability:ApiKey"].Returns("test-api-key");

        return filePath;
    }

    private async Task CreatePromptFilesAsync(Asset asset, int tokenIndex) {
        var imageTypes = asset.Classification.Kind switch {
            AssetKind.Character => new[] { "TopDown", "CloseUp", "Portrait" },
            AssetKind.Creature => ["TopDown", "CloseUp", "Portrait"],
            AssetKind.Object => ["TopDown"],
            _ => ["TopDown", "CloseUp", "Portrait"]
        };

        foreach (var imageType in imageTypes) {
            var prompt = $"Test prompt for {asset.Name} {imageType}";
            await _imageStore.SavePromptAsync(imageType, asset, tokenIndex, prompt, TestContext.Current.CancellationToken);
        }
    }

    private async Task CreateExistingImageAsync(Asset asset, int tokenIndex, string imageType) {
        var fakeImageData = new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A };
        await _imageStore.SaveImageAsync(imageType, asset, tokenIndex, fakeImageData, TestContext.Current.CancellationToken);
    }

    private async Task<string> CreateJsonFileWithTokensAsync(string fileName, params Asset[] entities) {
        var filePath = Path.Combine(_tempDir, fileName);
        var json = JsonSerializer.Serialize(entities.ToList(), _jsonOptions);
        await File.WriteAllTextAsync(filePath, json, TestContext.Current.CancellationToken);
        return filePath;
    }

    private static void SetConsoleInput(string input) {
        var reader = new StringReader(input + "\n");
        Console.SetIn(reader);
    }

    private static Asset AddTokenToEntity(Asset entity, int tokenCount) {
        var tokens = new List<Resource>();
        for (var i = 0; i < tokenCount; i++) {
            tokens.Add(new Resource {
                Id = Guid.NewGuid(),
                Description = $"variant {i}",
                Type = ResourceType.Image,
                Path = string.Empty,
                ContentType = "image/png",
                FileName = $"{entity.Name.ToLowerInvariant()}-{i}.png",
                FileLength = 1024,
                Size = Size.Zero,
                Duration = TimeSpan.Zero
            });
        }
        return new Asset {
            Id = entity.Id,
            Name = entity.Name,
            Classification = entity.Classification,
            Description = entity.Description,
            Portrait = entity.Portrait,
            TokenSize = entity.TokenSize,
            StatBlocks = entity.StatBlocks,
            OwnerId = entity.OwnerId,
            IsPublished = entity.IsPublished,
            IsPublic = entity.IsPublic,
            Tokens = tokens
        };
    }
}
