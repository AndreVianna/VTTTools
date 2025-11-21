namespace VttTools.AssetImageManager.UnitTests.Application.Commands;

public sealed class GenerateCommandTests : IDisposable {
    private readonly string _tempDir;
    private readonly MockHttpClientFactory _mockHttpClientFactory;
    private readonly HierarchicalFileStore _imageStore;
    private readonly GenerateCommand _command;
    private readonly IConfiguration _mockConfiguration;

    private static readonly JsonSerializerOptions _jsonOptions = new() {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
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
        _mockConfiguration["Images:Miniature:Provider"].Returns("STABILITY");
        _mockConfiguration["Images:Miniature:Model"].Returns("sb35");
        _mockConfiguration["Images:Miniature:NegativePrompt"].Returns("border, frame");
        _mockConfiguration["Images:Miniature:AspectRatio"].Returns("1:1");
        _mockConfiguration["Images:Photo:Provider"].Returns("STABILITY");
        _mockConfiguration["Images:Photo:Model"].Returns("sb35");
        _mockConfiguration["Images:Photo:NegativePrompt"].Returns("border, frame");
        _mockConfiguration["Images:Photo:AspectRatio"].Returns("1:1");
        _mockConfiguration["Images:Portrait:Provider"].Returns("STABILITY");
        _mockConfiguration["Images:Portrait:Model"].Returns("sb35");
        _mockConfiguration["Images:Portrait:NegativePrompt"].Returns("border, frame");
        _mockConfiguration["Images:Portrait:AspectRatio"].Returns("1:1");

        var entityLoader = new EntityLoaderService();
        _command = new GenerateCommand(
            _mockHttpClientFactory,
            _imageStore,
            _mockConfiguration,
            entityLoader);
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
            ImageType: "All",
            Limit: null,
            DelayMs: 0,
            IdFilter: null);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        Assert.Empty(_mockHttpClientFactory.ReceivedRequests);
    }

    [Fact]
    public async Task Should_ReturnEarly_When_InputPathIsNotAbsolute() {
        var options = new GenerateOptions(
            InputPath: "relative/path.json",
            ImageType: "All",
            Limit: null,
            DelayMs: 0,
            IdFilter: null);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        Assert.Empty(_mockHttpClientFactory.ReceivedRequests);
    }

    [Fact]
    public async Task Should_ReturnEarly_When_FileNotJson() {
        var txtFile = Path.Combine(_tempDir, "test.txt");
        await File.WriteAllTextAsync(txtFile, "test", TestContext.Current.CancellationToken);
        var options = new GenerateOptions(
            InputPath: txtFile,
            ImageType: "All",
            Limit: null,
            DelayMs: 0,
            IdFilter: null);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        Assert.Empty(_mockHttpClientFactory.ReceivedRequests);
    }

    [Fact]
    public async Task Should_ReturnEarly_When_FileDoesNotExist() {
        var missingFile = Path.Combine(_tempDir, "missing.json");
        var options = new GenerateOptions(
            InputPath: missingFile,
            ImageType: "All",
            Limit: null,
            DelayMs: 0,
            IdFilter: null);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        Assert.Empty(_mockHttpClientFactory.ReceivedRequests);
    }

    [Fact]
    public async Task Should_ReturnSuccess_When_SingleEntityNoVariants() {
        var entity = EntityDefinitionFixtures.CreateSimpleGoblin();
        var jsonFile = await CreateJsonFileAsync("entity.json", [entity]);

        var variant = new StructuralVariant("base", null, null, null, null, null, null, null);
        await CreatePromptFileAsync(entity, variant, ImageType.TopDown, "Enhanced prompt for goblin");

        _mockHttpClientFactory.EnqueueFakeImage();

        var options = new GenerateOptions(
            InputPath: jsonFile,
            ImageType: "All",
            Limit: null,
            DelayMs: 0,
            IdFilter: null);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        Assert.Single(_mockHttpClientFactory.ReceivedRequests);

        var existingTypes = _imageStore.GetExistingImageFiles(entity, variant);
        Assert.Contains(ImageType.TopDown, existingTypes);
    }

    [Fact]
    public async Task Should_ReadPromptFiles_When_EntityWithVariants() {
        var entity = EntityDefinitionFixtures.CreateGoblinWithVariants();
        var jsonFile = await CreateJsonFileAsync("entity.json", [entity]);

        var variants = VariantExpander.ExpandAlternatives(entity.Alternatives![0]);
        for (var i = 0; i < variants.Count; i++) {
            await CreatePromptFileAsync(entity, variants[i], ImageType.TopDown, $"Enhanced prompt {i}");
            _mockHttpClientFactory.EnqueueFakeImage();
        }

        var options = new GenerateOptions(
            InputPath: jsonFile,
            ImageType: "All",
            Limit: null,
            DelayMs: 0,
            IdFilter: null);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        Assert.Equal(8, _mockHttpClientFactory.ReceivedRequests.Count);
    }

    [Fact]
    public async Task Should_ReadPromptFilesForEachImageType() {
        var entity = EntityDefinitionFixtures.CreateSimpleGoblin();
        var jsonFile = await CreateJsonFileAsync("entity.json", [entity]);

        var variant = new StructuralVariant("base", null, null, null, null, null, null, null);
        var imageTypes = new[] { ImageType.TopDown, ImageType.TopDown, ImageType.Photo };

        for (var i = 0; i < imageTypes.Length; i++) {
            await CreatePromptFileAsync(entity, variant, imageTypes[i], $"Enhanced prompt {i}");
            _mockHttpClientFactory.EnqueueFakeImage();
        }

        var options = new GenerateOptions(
            InputPath: jsonFile,
            ImageType: "All",
            Limit: null,
            DelayMs: 0,
            IdFilter: null);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        Assert.Equal(3, _mockHttpClientFactory.ReceivedRequests.Count);
        Assert.Equal("Enhanced prompt 0", _mockHttpClientFactory.ReceivedRequests[0].Prompt);
        Assert.Equal("Enhanced prompt 1", _mockHttpClientFactory.ReceivedRequests[1].Prompt);
        Assert.Equal("Enhanced prompt 2", _mockHttpClientFactory.ReceivedRequests[2].Prompt);
    }

    [Fact]
    public async Task Should_CallImageGeneratorForEachImageType() {
        var entity = EntityDefinitionFixtures.CreateSimpleGoblin();
        var jsonFile = await CreateJsonFileAsync("entity.json", [entity]);

        var variant = new StructuralVariant("base", null, null, null, null, null, null, null);
        var imageTypes = new[] { ImageType.TopDown, ImageType.TopDown, ImageType.Photo };

        for (var i = 0; i < imageTypes.Length; i++) {
            await CreatePromptFileAsync(entity, variant, imageTypes[i], $"Enhanced prompt {i}");
            _mockHttpClientFactory.EnqueueFakeImage();
        }

        var options = new GenerateOptions(
            InputPath: jsonFile,
            ImageType: "All",
            Limit: null,
            DelayMs: 0,
            IdFilter: null);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        Assert.Equal(3, _mockHttpClientFactory.ReceivedRequests.Count);

        foreach (var request in _mockHttpClientFactory.ReceivedRequests) {
            Assert.NotNull(request.NegativePrompt);
            Assert.Contains("border", request.NegativePrompt);
        }
    }

    [Fact]
    public async Task Should_SaveImagesWithCorrectImageTypes() {
        var entity = EntityDefinitionFixtures.CreateSimpleGoblin();
        var jsonFile = await CreateJsonFileAsync("entity.json", [entity]);

        var variant = new StructuralVariant("base", null, null, null, null, null, null, null);
        var imageTypes = new[] { ImageType.TopDown, ImageType.TopDown, ImageType.Photo };

        for (var i = 0; i < imageTypes.Length; i++) {
            await CreatePromptFileAsync(entity, variant, imageTypes[i], $"Enhanced prompt {i}");
            _mockHttpClientFactory.EnqueueFakeImage();
        }

        var options = new GenerateOptions(
            InputPath: jsonFile,
            ImageType: "All",
            Limit: null,
            DelayMs: 0,
            IdFilter: null);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var existingTypes = _imageStore.GetExistingImageFiles(entity, variant);
        Assert.Equal(3, existingTypes.Count);
        Assert.Contains(ImageType.TopDown, existingTypes);
        Assert.Contains(ImageType.TopDown, existingTypes);
        Assert.Contains(ImageType.Photo, existingTypes);
    }

    [Fact]
    public async Task Should_FilterByName_When_IdFilterSpecified() {
        var goblin = EntityDefinitionFixtures.CreateSimpleGoblin();
        var orc = EntityDefinitionFixtures.CreateOrc();
        var jsonFile = await CreateJsonFileAsync("entities.json", [goblin, orc]);

        var goblinVariant = new StructuralVariant("base", null, null, null, null, null, null, null);
        await CreatePromptFileAsync(goblin, goblinVariant, ImageType.TopDown, "Enhanced goblin prompt");
        _mockHttpClientFactory.EnqueueFakeImage();

        var options = new GenerateOptions(
            InputPath: jsonFile,
            ImageType: "All",
            Limit: null,
            DelayMs: 0,
            IdFilter: "Goblin");

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        Assert.Single(_mockHttpClientFactory.ReceivedRequests);
        Assert.Equal("Enhanced goblin prompt", _mockHttpClientFactory.ReceivedRequests[0].Prompt);
    }

    [Fact]
    public async Task Should_SkipWhenPromptFileMissing() {
        var entity = EntityDefinitionFixtures.CreateSimpleGoblin();
        var jsonFile = await CreateJsonFileAsync("entity.json", [entity]);

        var options = new GenerateOptions(
            InputPath: jsonFile,
            ImageType: "All",
            Limit: null,
            DelayMs: 0,
            IdFilter: null);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        Assert.Empty(_mockHttpClientFactory.ReceivedRequests);
    }

    private async Task<string> CreateJsonFileAsync(string fileName, List<EntryDefinition> entities) {
        var filePath = Path.Combine(_tempDir, fileName);
        var json = JsonSerializer.Serialize(entities, _jsonOptions);
        await File.WriteAllTextAsync(filePath, json);
        return filePath;
    }

    private async Task CreatePromptFileAsync(EntryDefinition entity, StructuralVariant variant, string imageType, string promptContent)
        => await _imageStore.SavePromptAsync(entity, variant, promptContent, imageType, CancellationToken.None);
}
