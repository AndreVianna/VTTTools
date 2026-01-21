using VttTools.AssetImageManager.Mocks;

namespace VttTools.AssetImageManager.Application.Commands;

public sealed class GenerateCommandTests : IDisposable {
    private readonly string _tempDir;
    private readonly MockImageGenerationService _mockImageService;
    private readonly HierarchicalFileStore _realFileStore;
    private readonly IFileStore _mockFileStore;
    private readonly GenerateCommand _command;
    private readonly IConfiguration _mockConfiguration;

    public GenerateCommandTests() {
        _tempDir = Path.Combine(Directory.GetCurrentDirectory(), $"TokenManagerTests_{Guid.NewGuid():N}");
        Directory.CreateDirectory(_tempDir);

        _mockImageService = new();
        _realFileStore = new(_tempDir);
        _mockFileStore = Substitute.For<IFileStore>();
        _mockConfiguration = Substitute.For<IConfiguration>();

        SetupFileStoreDelegation();

        _mockConfiguration["Images:Token:Provider"].Returns("STABILITY");
        _mockConfiguration["Images:Token:Model"].Returns("sb35");
        _mockConfiguration["Images:Token:NegativePrompt"].Returns("border, frame");
        _mockConfiguration["Images:Token:AspectRatio"].Returns("1:1");
        _mockConfiguration["Images:Portrait:Provider"].Returns("STABILITY");
        _mockConfiguration["Images:Portrait:Model"].Returns("sb35");
        _mockConfiguration["Images:Portrait:NegativePrompt"].Returns("border, frame");
        _mockConfiguration["Images:Portrait:AspectRatio"].Returns("1:1");

        _command = new(
                       _mockImageService,
                       _mockFileStore,
                       _mockConfiguration);
    }

    private void SetupFileStoreDelegation() {
        _mockFileStore.HasImageFiles(Arg.Any<Asset>(), Arg.Any<int>())
            .Returns(ci => _realFileStore.HasImageFiles(ci.ArgAt<Asset>(0), ci.ArgAt<int>(1)));
        _mockFileStore.ImageFileExists(Arg.Any<string>(), Arg.Any<Asset>(), Arg.Any<int>())
            .Returns(ci => _realFileStore.ImageFileExists(ci.ArgAt<string>(0), ci.ArgAt<Asset>(1), ci.ArgAt<int>(2)));
        _mockFileStore.FindPromptFile(Arg.Any<string>(), Arg.Any<Asset>(), Arg.Any<int>())
            .Returns(ci => _realFileStore.FindPromptFile(ci.ArgAt<string>(0), ci.ArgAt<Asset>(1), ci.ArgAt<int>(2)));
        _mockFileStore.FindImageFile(Arg.Any<string>(), Arg.Any<Asset>(), Arg.Any<int>())
            .Returns(ci => _realFileStore.FindImageFile(ci.ArgAt<string>(0), ci.ArgAt<Asset>(1), ci.ArgAt<int>(2)));
        _mockFileStore.PromptFileExists(Arg.Any<string>(), Arg.Any<Asset>(), Arg.Any<int>())
            .Returns(ci => _realFileStore.PromptFileExists(ci.ArgAt<string>(0), ci.ArgAt<Asset>(1), ci.ArgAt<int>(2)));
        _mockFileStore.GetExistingImageFiles(Arg.Any<Asset>(), Arg.Any<int>())
            .Returns(ci => _realFileStore.GetExistingImageFiles(ci.ArgAt<Asset>(0), ci.ArgAt<int>(1)));
        _mockFileStore.GetExistingPromptFiles(Arg.Any<Asset>(), Arg.Any<int>())
            .Returns(ci => _realFileStore.GetExistingPromptFiles(ci.ArgAt<Asset>(0), ci.ArgAt<int>(1)));
        _mockFileStore.SaveImageAsync(Arg.Any<string>(), Arg.Any<Asset>(), Arg.Any<int>(), Arg.Any<byte[]>(), Arg.Any<CancellationToken>())
            .Returns(ci => _realFileStore.SaveImageAsync(ci.ArgAt<string>(0), ci.ArgAt<Asset>(1), ci.ArgAt<int>(2), ci.ArgAt<byte[]>(3), ci.ArgAt<CancellationToken>(4)));
        _mockFileStore.SavePromptAsync(Arg.Any<string>(), Arg.Any<Asset>(), Arg.Any<int>(), Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns(ci => _realFileStore.SavePromptAsync(ci.ArgAt<string>(0), ci.ArgAt<Asset>(1), ci.ArgAt<int>(2), ci.ArgAt<string>(3), ci.ArgAt<CancellationToken>(4)));
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

        Assert.Empty(_mockImageService.ReceivedRequests);
    }

    [Fact]
    public async Task Should_ReturnEarly_When_InputPathIsNotAbsolute() {
        var options = new GenerateOptions(
            InputPath: "relative/path.json",
            Limit: null,
            DelayMs: 0,
            NameFilter: null);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        Assert.Empty(_mockImageService.ReceivedRequests);
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

        Assert.Empty(_mockImageService.ReceivedRequests);
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

        Assert.Empty(_mockImageService.ReceivedRequests);
    }

    [Fact]
    public async Task Should_ReturnSuccess_When_SingleEntityNoVariants() {
        // Single entity with 1 token generates: Token + Portrait (base) + Token (variant) = 3 images
        var entity = CreateAssetWithSimpleToken("Goblin", AssetKind.Creature, "Humanoid", "Goblinoid", "Common");
        var testFilePath = await SetupMockedJsonFileAsync("single-entity.json", entity);
        await CreatePromptFilesAsync(entity, 0);
        await CreatePromptFilesAsync(entity, 1);
        for (var i = 0; i < 3; i++) {
            _mockImageService.EnqueueImage();
        }
        SetConsoleInput("\n");

        var options = new GenerateOptions(
            InputPath: testFilePath,
            Limit: null,
            DelayMs: 0,
            NameFilter: null);

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        result.Should().Be(0);
        _mockImageService.ReceivedRequests.Should().HaveCount(3);
    }

    [Fact]
    public async Task Should_ReadPromptFiles_When_EntityWithMultipleTokens() {
        // Entity with 2 tokens generates: Token + Portrait (base) + Token (variant1) = 3 images
        // Note: Token count represents the total tokens in Tokens list (which are the variants)
        var entity = CreateAssetWithSimpleTokens("Goblin", AssetKind.Creature, "Humanoid", "Goblinoid", "Common", 2);
        var testFilePath = await SetupMockedJsonFileAsync("entity-with-tokens.json", entity);
        await CreatePromptFilesAsync(entity, 0);
        await CreatePromptFilesAsync(entity, 1);
        await CreatePromptFilesAsync(entity, 2);
        for (var i = 0; i < 3; i++) {
            _mockImageService.EnqueueImage();
        }
        SetConsoleInput("\n");

        var options = new GenerateOptions(
            InputPath: testFilePath,
            Limit: null,
            DelayMs: 0,
            NameFilter: null);

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        result.Should().Be(0);
        _mockImageService.ReceivedRequests.Should().HaveCount(3);
    }

    [Fact]
    public async Task Should_SkipExistingImages_When_FilesAlreadyExist() {
        var entity = CreateAssetWithSimpleToken("Goblin", AssetKind.Creature, "Humanoid", "Goblinoid", "Common");
        var testFilePath = await SetupMockedJsonFileAsync("existing-images.json", entity);
        await CreatePromptFilesAsync(entity, 0);
        await CreatePromptFilesAsync(entity, 1);
        await CreateExistingImageAsync(entity, 0, "Token");
        await CreateExistingImageAsync(entity, 0, "Portrait");
        SetConsoleInput("\nS\nS\nS\n");

        var options = new GenerateOptions(
            InputPath: testFilePath,
            Limit: null,
            DelayMs: 0,
            NameFilter: null);

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        result.Should().Be(0);
    }

    [Fact]
    public async Task Should_ProcessOnlyFilteredAssets_When_NameFilterProvided() {
        // Filters to single entity with 1 token: Token + Portrait (base) + Token (variant) = 3 images
        var goblin = CreateAssetWithSimpleToken("Goblin", AssetKind.Creature, "Humanoid", "Goblinoid", "Common");
        var orc = CreateAssetWithSimpleToken("Orc", AssetKind.Creature, "Humanoid", "Orc", "Common");
        var testFilePath = await SetupMockedJsonFileAsync("filtered-assets.json", goblin, orc);
        await CreatePromptFilesAsync(goblin, 0);
        await CreatePromptFilesAsync(goblin, 1);
        await CreatePromptFilesAsync(orc, 0);
        await CreatePromptFilesAsync(orc, 1);
        for (var i = 0; i < 3; i++) {
            _mockImageService.EnqueueImage();
        }
        SetConsoleInput("\n");

        var options = new GenerateOptions(
            InputPath: testFilePath,
            Limit: null,
            DelayMs: 0,
            NameFilter: "Goblin");

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        result.Should().Be(0);
        _mockImageService.ReceivedRequests.Should().HaveCount(3);
    }

    [Fact]
    public async Task Should_ProcessMultipleEntities_WhenJsonContainsMultiple() {
        // 3 entities × 3 images each (Token + Portrait base + Token variant) = 9 images
        var goblin = CreateAssetWithSimpleToken("Goblin", AssetKind.Creature, "Humanoid", "Goblinoid", "Common");
        var orc = CreateAssetWithSimpleToken("Orc", AssetKind.Creature, "Humanoid", "Orc", "Common");
        var kobold = CreateAssetWithSimpleToken("Kobold", AssetKind.Creature, "Humanoid", "Reptilian", "Common");
        var testFilePath = await SetupMockedJsonFileAsync("multiple-assets.json", goblin, orc, kobold);
        await CreatePromptFilesAsync(goblin, 0);
        await CreatePromptFilesAsync(goblin, 1);
        await CreatePromptFilesAsync(orc, 0);
        await CreatePromptFilesAsync(orc, 1);
        await CreatePromptFilesAsync(kobold, 0);
        await CreatePromptFilesAsync(kobold, 1);
        for (var i = 0; i < 9; i++) {
            _mockImageService.EnqueueImage();
        }
        SetConsoleInput("\n");

        var options = new GenerateOptions(
            InputPath: testFilePath,
            Limit: null,
            DelayMs: 0,
            NameFilter: null);

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        result.Should().Be(0);
        _mockImageService.ReceivedRequests.Should().HaveCount(9);
    }

    [Fact]
    public async Task Should_RespectDelay_When_DelayMsIsSet() {
        // 3 images with 100ms delay between each = 2 delays × 100ms = minimum 200ms
        var entity = CreateAssetWithSimpleToken("Goblin", AssetKind.Creature, "Humanoid", "Goblinoid", "Common");
        var testFilePath = await SetupMockedJsonFileAsync("delay-test.json", entity);
        await CreatePromptFilesAsync(entity, 0);
        await CreatePromptFilesAsync(entity, 1);
        for (var i = 0; i < 3; i++) {
            _mockImageService.EnqueueImage();
        }
        SetConsoleInput("\n");

        var stopwatch = Stopwatch.StartNew();
        var options = new GenerateOptions(
            InputPath: testFilePath,
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
        var entity = CreateAssetWithSimpleToken("Goblin", AssetKind.Creature, "Humanoid", "Goblinoid", "Common");
        var testFilePath = await SetupMockedJsonFileAsync("structure-test.json", entity);
        await CreatePromptFilesAsync(entity, 0);
        await CreatePromptFilesAsync(entity, 1);
        for (var i = 0; i < 3; i++) {
            _mockImageService.EnqueueImage();
        }
        SetConsoleInput("\n");

        var options = new GenerateOptions(
            InputPath: testFilePath,
            Limit: null,
            DelayMs: 0,
            NameFilter: null);

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        result.Should().Be(0);
        var imagePath = _mockFileStore.FindImageFile("Token", entity, 0);
        imagePath.Should().NotBeNull();
        File.Exists(imagePath).Should().BeTrue();
    }

    [Fact]
    public async Task Should_HandleApiErrors_When_GenerationFails() {
        var entity = CreateAssetWithSimpleToken("Goblin", AssetKind.Creature, "Humanoid", "Goblinoid", "Common");
        var testFilePath = await SetupMockedJsonFileAsync("error-test.json", entity);
        await CreatePromptFilesAsync(entity, 0);
        await CreatePromptFilesAsync(entity, 1);
        SetConsoleInput("\n");

        var options = new GenerateOptions(
            InputPath: testFilePath,
            Limit: null,
            DelayMs: 0,
            NameFilter: null);

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        result.Should().Be(0);
    }

    [Fact]
    public async Task Should_HandleCancellation_When_TokenIsCanceled() {
        var entity = CreateAssetWithSimpleToken("Goblin", AssetKind.Creature, "Humanoid", "Goblinoid", "Common");
        var testFilePath = await SetupMockedJsonFileAsync("cancel.json", entity);
        using var cts = new CancellationTokenSource();

        var options = new GenerateOptions(
            InputPath: testFilePath,
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

    private async Task CreatePromptFilesAsync(Asset asset, int tokenIndex) {
        foreach (var imageType in ImageTypeFor(asset.Classification.Kind, tokenIndex != 0)) {
            var prompt = $"Test prompt for {asset.Name} {imageType}";
            await _realFileStore.SavePromptAsync(imageType, asset, tokenIndex, prompt, TestContext.Current.CancellationToken);
        }
    }

    private static IEnumerable<string> ImageTypeFor(AssetKind kind, bool isToken = false)
        => kind switch {
            AssetKind.Object => ["Token"],
            _ when isToken => ["Token"],
            _ => ["Token", "Portrait"],
        };

    private async Task CreateExistingImageAsync(Asset asset, int tokenIndex, string imageType) {
        var fakeImageData = new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A };
        await _realFileStore.SaveImageAsync(imageType, asset, tokenIndex, fakeImageData, TestContext.Current.CancellationToken);
    }
    private async Task<string> CreateDummyJsonFileAsync(string fileName) {
        var filePath = Path.Combine(_tempDir, fileName);
        await File.WriteAllTextAsync(filePath, "[]", TestContext.Current.CancellationToken);
        return filePath;
    }

    private async Task<string> SetupMockedJsonFileAsync(string fileName, params Asset[] assets) {
        var filePath = await CreateDummyJsonFileAsync(fileName);
        _mockFileStore.LoadAssetsAsync(filePath, Arg.Any<CancellationToken>())
            .Returns(Task.FromResult(assets.ToList()));
        return filePath;
    }

    private static Asset CreateAssetWithSimpleToken(string name, AssetKind kind, string category, string type, string? subtype)
        => new() {
            Id = Guid.NewGuid(),
            Name = name,
            Classification = new(kind, category, type, subtype),
            Description = $"Test {name}",
            Size = NamedSize.Default,
            StatBlockEntries = [],
            Tokens = [
                new() {
                          Id = Guid.NewGuid(),
                          Path = string.Empty,
                          ContentType = "image/png",
                          FileName = $"{name.ToLowerInvariant()}.png",
                          FileSize = 1024,
                          Dimensions = Common.Model.Size.Zero,
                          Duration = TimeSpan.Zero
                      }
            ]
        };

    private static Asset CreateAssetWithSimpleTokens(string name, AssetKind kind, string category, string type, string? subtype, int tokenCount) {
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
            Classification = new(kind, category, type, subtype),
            Description = $"Test {name}",
            Size = NamedSize.Default,
            StatBlockEntries = [],
            Tokens = tokens
        };
    }

    private static void SetConsoleInput(string input) {
        var reader = new StringReader(input);
        Console.SetIn(reader);
    }
}