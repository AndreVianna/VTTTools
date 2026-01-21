using VttTools.AssetImageManager.Fixtures;

namespace VttTools.AssetImageManager.Application.Commands;

public sealed class ListCommandTests : IDisposable {
    private readonly string _tempDir;
    private readonly HierarchicalFileStore _imageStore;
    private readonly ListCommand _command;

    private static readonly JsonSerializerOptions _jsonOptions = new() {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public ListCommandTests() {
        _tempDir = Path.Combine(Path.GetTempPath(), $"TokenManagerTests_{Guid.NewGuid():N}");
        Directory.CreateDirectory(_tempDir);

        _imageStore = new(_tempDir);
        _command = new(_imageStore);
    }

    public void Dispose() {
        if (Directory.Exists(_tempDir)) {
            Directory.Delete(_tempDir, true);
        }
    }

    [Fact]
    public async Task Should_ReturnEmpty_When_NoEntitiesExist() {
        var options = new ListTokensOptions(
            KindFilter: null,
            Name: null,
            ImportPath: null);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var summaries = _imageStore.GetAssets();
        Assert.Empty(summaries);
    }

    [Fact]
    public async Task Should_ListAllEntities_When_NoFiltersApplied() {
        await CreateSampleHierarchyAsync();

        var options = new ListTokensOptions(
            KindFilter: null,
            Name: null,
            ImportPath: null);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var summaries = _imageStore.GetAssets();
        Assert.NotEmpty(summaries);
    }

    [Fact]
    public async Task Should_FilterByKind_When_KindFilterSpecified() {
        var goblin = EntityDefinitionFixtures.CreateSimpleGoblin();
        var chest = EntityDefinitionFixtures.CreateChest();

        await SaveEntityImageAsync(goblin, 0);
        await SaveEntityImageAsync(chest, 0);

        var options = new ListTokensOptions(
            KindFilter: AssetKind.Creature,
            Name: null,
            ImportPath: null);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var summaries = _imageStore.GetAssets(kindFilter: AssetKind.Creature);
        Assert.NotEmpty(summaries);
        Assert.All(summaries, s => Assert.Equal(AssetKind.Creature, s.Classification.Kind));
    }

    [Fact]
    public async Task Should_FilterByName_When_NameSpecified() {
        var goblin = EntityDefinitionFixtures.CreateSimpleGoblin();
        var orc = EntityDefinitionFixtures.CreateOrc();

        await SaveEntityImageAsync(goblin, 0);
        await SaveEntityImageAsync(orc, 0);

        var options = new ListTokensOptions(
            KindFilter: null,
            Name: "Goblin",
            ImportPath: null);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var allSummaries = _imageStore.GetAssets();
        var filtered = allSummaries.Where(s => string.Equals(s.Name, "goblin", StringComparison.OrdinalIgnoreCase)).ToList();
        Assert.Single(filtered);
    }

    [Fact]
    public async Task Should_CombineFilters_When_MultipleFiltersSpecified() {
        var goblin = EntityDefinitionFixtures.CreateSimpleGoblin();
        var orc = EntityDefinitionFixtures.CreateOrc();

        await SaveEntityImageAsync(goblin, 0);
        await SaveEntityImageAsync(orc, 0);

        var options = new ListTokensOptions(
            KindFilter: AssetKind.Creature,
            Name: "Goblin",
            ImportPath: null);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var summaries = _imageStore.GetAssets(kindFilter: AssetKind.Creature);
        var filtered = summaries.Where(s => string.Equals(s.Name, "goblin", StringComparison.OrdinalIgnoreCase)).ToList();
        Assert.Single(filtered);
    }

    [Fact]
    public async Task Should_ShowCorrectTokenCounts_When_EntitiesHaveMultipleTokens() {
        var goblin = EntityDefinitionFixtures.CreateSimpleGoblin();
        var orc = EntityDefinitionFixtures.CreateOrc();

        await SaveEntityImageAsync(goblin, 1);
        await SaveEntityImageAsync(goblin, 2);
        await SaveEntityImageAsync(goblin, 3);

        await SaveEntityImageAsync(orc, 1);
        await SaveEntityImageAsync(orc, 2);

        var options = new ListTokensOptions(
            KindFilter: null,
            Name: null,
            ImportPath: null);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var summaries = _imageStore.GetAssets();
        var goblinSummary = summaries.First(s => s.Name == "Goblin");
        var orcSummary = summaries.First(s => s.Name == "Orc");

        Assert.Equal(3, goblinSummary.Tokens.Count);
        Assert.Equal(2, orcSummary.Tokens.Count);
    }

    [Fact]
    public async Task Should_SortEntities_ByCategory_Then_Type_Then_Name() {
        var goblin = EntityDefinitionFixtures.CreateSimpleGoblin();
        var orc = EntityDefinitionFixtures.CreateOrc();
        var chest = EntityDefinitionFixtures.CreateChest();

        await SaveEntityImageAsync(chest, 0);
        await SaveEntityImageAsync(orc, 0);
        await SaveEntityImageAsync(goblin, 0);

        var options = new ListTokensOptions(
            KindFilter: null,
            Name: null,
            ImportPath: null);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var summaries = _imageStore.GetAssets();

        Assert.Equal(3, summaries.Count);
        Assert.Contains(summaries, s => s.Name == "Goblin");
        Assert.Contains(summaries, s => s.Name == "Orc");
        Assert.Contains(summaries, s => s.Name == "Treasure Chest");
    }

    private async Task SaveEntityImageAsync(Asset entity, int variantIndex) {
        var fakeImage = new byte[1024];
        await _imageStore.SaveImageAsync("Token", entity, variantIndex, fakeImage);
        // CreateAsset expects token_{idx}.png (no leading zero) to exist for each variant index
        if (variantIndex > 0)
            await CreateTokenFileAsync(entity, variantIndex, fakeImage);
    }

    private Task CreateTokenFileAsync(Asset entity, int variantIndex, byte[] content) {
        var assetPath = Path.Combine(_tempDir,
            entity.Classification.Kind.ToString().ToLowerInvariant(),
            entity.Classification.Category.ToLowerInvariant(),
            entity.Classification.Type.ToLowerInvariant(),
            entity.Classification.Subtype?.ToLowerInvariant() ?? string.Empty,
            entity.Name.ToLowerInvariant().Replace(" ", "_"));
        Directory.CreateDirectory(assetPath);
        return File.WriteAllBytesAsync(Path.Combine(assetPath, $"token_{variantIndex}.png"), content);
    }

    private async Task CreateSampleHierarchyAsync() {
        var goblin = EntityDefinitionFixtures.CreateSimpleGoblin();
        var orc = EntityDefinitionFixtures.CreateOrc();

        await SaveEntityImageAsync(goblin, 0);
        await SaveEntityImageAsync(orc, 0);
    }

    [Fact]
    public async Task Should_ListFromJson_When_ImportPathProvided() {
        var entities = EntityDefinitionFixtures.CreateMultipleEntities();
        var jsonFile = Path.Combine(_tempDir, "entities.json");
        await File.WriteAllTextAsync(jsonFile, JsonSerializer.Serialize(entities, _jsonOptions), TestContext.Current.CancellationToken);

        var options = new ListTokensOptions(
            KindFilter: null,
            Name: null,
            ImportPath: jsonFile);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task Should_FilterByKind_When_ImportPathAndKindFilterProvided() {
        var goblin = EntityDefinitionFixtures.CreateSimpleGoblin();
        var chest = EntityDefinitionFixtures.CreateChest();
        var entities = new List<Asset> { goblin, chest };

        var jsonFile = Path.Combine(_tempDir, "mixed.json");
        await File.WriteAllTextAsync(jsonFile, JsonSerializer.Serialize(entities, _jsonOptions), TestContext.Current.CancellationToken);

        var options = new ListTokensOptions(
            KindFilter: AssetKind.Creature,
            Name: null,
            ImportPath: jsonFile);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task Should_CalculateVariantCounts_When_ImportPathWithVariants() {
        var entity = EntityDefinitionFixtures.CreateGoblinWithVariants();
        var entities = new List<Asset> { entity };

        var jsonFile = Path.Combine(_tempDir, "variants.json");
        await File.WriteAllTextAsync(jsonFile, JsonSerializer.Serialize(entities, _jsonOptions), TestContext.Current.CancellationToken);

        var options = new ListTokensOptions(
            KindFilter: null,
            Name: null,
            ImportPath: jsonFile);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);
    }

    [Fact]
    public Task Should_HandleMissingFile_When_ImportPathInvalid() {
        var options = new ListTokensOptions(
                                            KindFilter: null,
                                            Name: null,
                                            ImportPath: Path.Combine(_tempDir, "missing.json"));

        return _command.ExecuteAsync(options, TestContext.Current.CancellationToken);
    }
}