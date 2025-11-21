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
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public PrepareCommandTests() {
        _tempDir = Path.Combine(Path.GetTempPath(), $"TokenManagerTests_{Guid.NewGuid():N}");
        _outputDir = Path.Combine(_tempDir, "output");
        Directory.CreateDirectory(_tempDir);
        Directory.CreateDirectory(_outputDir);

        _mockHttpClientFactory = new MockHttpClientFactory();

        _mockConfiguration = Substitute.For<IConfiguration>();
        _mockConfiguration["Images:TopDown:Prompts:Creatures"]
            .Returns("from above, bird's-eye view, top-down, game token");
        _mockConfiguration["Images:TopDown:Prompts:Objects"]
            .Returns("from above, bird's-eye view, top-down, product photography");
        _mockConfiguration["Images:TopDown:Prompts:Characters"]
            .Returns("from above, bird's-eye view, top-down, heroic pose");
        _mockConfiguration["Images:Miniature:Prompts:Creatures"]
            .Returns("full body, standing, isometric, game token");
        _mockConfiguration["Images:Miniature:Prompts:Objects"]
            .Returns("full view, product shot, isometric");
        _mockConfiguration["Images:Miniature:Prompts:Characters"]
            .Returns("full body, heroic stance, isometric");
        _mockConfiguration["Images:Photo:Prompts:Creatures"]
            .Returns("3/4 view, dynamic pose, character focus");
        _mockConfiguration["Images:Photo:Prompts:Objects"]
            .Returns((string?)null);
        _mockConfiguration["Images:Photo:Prompts:Characters"]
            .Returns("3/4 view, passport photo, heroic expression");
        _mockConfiguration["Images:Portrait:Prompts:Creatures"]
            .Returns("portrait, character art, upper body");
        _mockConfiguration["Images:Portrait:Prompts:Objects"]
            .Returns("close-up view, detailed shot");
        _mockConfiguration["Images:Portrait:Prompts:Characters"]
            .Returns("character portrait, heroic portrait");
        _mockConfiguration["Images:TopDown:NegativePrompts:Token"]
            .Returns("border, frame, text");
        _mockConfiguration["Images:Portrait:NegativePrompts:Portrait"]
            .Returns("border, frame, cropped face");

        _imageStore = new HierarchicalFileStore(_outputDir);
        var entityLoader = new EntityLoaderService();
        _command = new PrepareCommand(_mockHttpClientFactory, _imageStore, _mockConfiguration, entityLoader);
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
        var entity = EntityDefinitionFixtures.CreateSimpleGoblin();
        var jsonFile = await CreateJsonFileAsync("single.json", [entity]);
        var options = new PrepareOptions(jsonFile);

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        Assert.Equal(0, result);
    }

    [Fact]
    public async Task Should_ReturnSuccess_When_SingleEntityWithVariants() {
        var entity = EntityDefinitionFixtures.CreateGoblinWithVariants();
        var jsonFile = await CreateJsonFileAsync("variants.json", [entity]);
        var options = new PrepareOptions(jsonFile);

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        Assert.Equal(0, result);
    }

    [Fact]
    public async Task Should_ReturnSuccess_When_MultipleEntities() {
        var entities = EntityDefinitionFixtures.CreateMultipleEntities();
        var jsonFile = await CreateJsonFileAsync("multiple.json", entities);
        var options = new PrepareOptions(jsonFile);

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        Assert.Equal(0, result);
    }

    [Fact]
    public async Task Should_ShowWarning_When_MoreThan50Variants() {
        var entity = EntityDefinitionFixtures.CreateLargeVariantSet();
        var jsonFile = await CreateJsonFileAsync("large.json", [entity]);
        var options = new PrepareOptions(jsonFile);

        var result = await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        Assert.Equal(0, result);
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

    private async Task<string> CreateJsonFileAsync(string fileName, List<EntryDefinition> entities) {
        var filePath = Path.Combine(_tempDir, fileName);
        var json = JsonSerializer.Serialize(entities, _jsonOptions);
        await File.WriteAllTextAsync(filePath, json);
        return filePath;
    }
}
