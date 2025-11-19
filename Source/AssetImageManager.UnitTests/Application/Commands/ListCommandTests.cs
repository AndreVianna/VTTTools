namespace VttTools.AssetImageManager.UnitTests.Application.Commands;

public sealed class ListCommandTests : IDisposable {
    private readonly string _tempDir;
    private readonly HierarchicalImageStore _imageStore;
    private readonly ListCommand _command;

    public ListCommandTests() {
        _tempDir = Path.Combine(Path.GetTempPath(), $"TokenManagerTests_{Guid.NewGuid():N}");
        Directory.CreateDirectory(_tempDir);

        _imageStore = new HierarchicalImageStore(_tempDir);
        _command = new ListCommand(_imageStore);
    }

    public void Dispose() {
        if (Directory.Exists(_tempDir)) {
            Directory.Delete(_tempDir, true);
        }
    }

    [Fact]
    public async Task Should_ReturnEmpty_When_NoEntitiesExist() {
        var options = new ListTokensOptions(
            TypeFilter: null,
            IdOrName: null);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var summaries = await _imageStore.GetEntitySummariesAsync(ct: TestContext.Current.CancellationToken);
        Assert.Empty(summaries);
    }

    [Fact]
    public async Task Should_ListAllEntities_When_NoFiltersApplied() {
        await CreateSampleHierarchyAsync();

        var options = new ListTokensOptions(
            TypeFilter: null,
            IdOrName: null);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var summaries = await _imageStore.GetEntitySummariesAsync(ct: TestContext.Current.CancellationToken);
        Assert.NotEmpty(summaries);
    }

    [Fact]
    public async Task Should_FilterByKind_When_TypeFilterSpecified() {
        var goblin = EntityDefinitionFixtures.CreateSimpleGoblin();
        var chest = EntityDefinitionFixtures.CreateChest();

        await SaveEntityImageAsync(goblin, "base");
        await SaveEntityImageAsync(chest, "base");

        var options = new ListTokensOptions(
            TypeFilter: EntityType.Monster,
            IdOrName: null);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var summaries = await _imageStore.GetEntitySummariesAsync("creatures", null, null, TestContext.Current.CancellationToken);
        Assert.NotEmpty(summaries);
        Assert.All(summaries, s => Assert.Equal("creatures", s.Category));
    }

    [Fact]
    public async Task Should_FilterByName_When_IdOrNameSpecified() {
        var goblin = EntityDefinitionFixtures.CreateSimpleGoblin();
        var orc = EntityDefinitionFixtures.CreateOrc();

        await SaveEntityImageAsync(goblin, "base");
        await SaveEntityImageAsync(orc, "base");

        var options = new ListTokensOptions(
            TypeFilter: null,
            IdOrName: "Goblin");

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var allSummaries = await _imageStore.GetEntitySummariesAsync(ct: TestContext.Current.CancellationToken);
        var filtered = allSummaries.Where(s => string.Equals(s.Name, "goblin", StringComparison.OrdinalIgnoreCase)).ToList();
        Assert.Single(filtered);
    }

    [Fact]
    public async Task Should_CombineFilters_When_MultipleFiltersSpecified() {
        var goblin = EntityDefinitionFixtures.CreateSimpleGoblin();
        var orc = EntityDefinitionFixtures.CreateOrc();

        await SaveEntityImageAsync(goblin, "base");
        await SaveEntityImageAsync(orc, "base");

        var options = new ListTokensOptions(
            TypeFilter: EntityType.Monster,
            IdOrName: "Goblin");

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var summaries = await _imageStore.GetEntitySummariesAsync("creatures", null, null, TestContext.Current.CancellationToken);
        var filtered = summaries.Where(s => string.Equals(s.Name, "goblin", StringComparison.OrdinalIgnoreCase)).ToList();
        Assert.Single(filtered);
    }

    [Fact]
    public async Task Should_ShowCorrectCounts() {
        var entity = EntityDefinitionFixtures.CreateGoblinWithVariants();
        var variant1 = new StructuralVariant("male-warrior-scimitar", "small", "male", "warrior", "scimitar", null, null, null);
        var variant2 = new StructuralVariant("female-shaman-shortbow", "small", "female", "shaman", "shortbow", null, null, null);

        var fakeImage = new byte[1024];
        await _imageStore.SaveImageAsync(entity, variant1, fakeImage, ImageType.TopDown, TestContext.Current.CancellationToken);
        await _imageStore.SaveImageAsync(entity, variant1, fakeImage, ImageType.Miniature, TestContext.Current.CancellationToken);
        await _imageStore.SaveImageAsync(entity, variant2, fakeImage, ImageType.TopDown, TestContext.Current.CancellationToken);

        var options = new ListTokensOptions(
            TypeFilter: null,
            IdOrName: null);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var summaries = await _imageStore.GetEntitySummariesAsync(ct: TestContext.Current.CancellationToken);
        var goblinSummary = summaries.FirstOrDefault(s => s.Name.Equals("goblin", StringComparison.OrdinalIgnoreCase));

        Assert.NotNull(goblinSummary);
        Assert.Equal(2, goblinSummary.VariantCount);
        Assert.Equal(3, goblinSummary.TotalPoseCount);
    }

    [Fact]
    public async Task Should_SortEntities_ByCategory_Then_Type_Then_Name() {
        var goblin = EntityDefinitionFixtures.CreateSimpleGoblin();
        var orc = EntityDefinitionFixtures.CreateOrc();
        var chest = EntityDefinitionFixtures.CreateChest();

        await SaveEntityImageAsync(chest, "base");
        await SaveEntityImageAsync(orc, "base");
        await SaveEntityImageAsync(goblin, "base");

        var options = new ListTokensOptions(
            TypeFilter: null,
            IdOrName: null);

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var summaries = await _imageStore.GetEntitySummariesAsync(ct: TestContext.Current.CancellationToken);
        var sorted = summaries.OrderBy(s => s.Category).ThenBy(s => s.Type).ThenBy(s => s.Subtype).ThenBy(s => s.Name).ToList();

        Assert.Equal(summaries.Count, sorted.Count);
        for (var i = 0; i < summaries.Count; i++) {
            Assert.Equal(sorted[i].Name, summaries[i].Name);
        }
    }

    private async Task SaveEntityImageAsync(EntityDefinition entity, string variantId) {
        var variant = new StructuralVariant(variantId, null, null, null, null, null, null, null);
        var fakeImage = new byte[1024];
        await _imageStore.SaveImageAsync(entity, variant, fakeImage, ImageType.TopDown);
    }

    private async Task CreateSampleHierarchyAsync() {
        var goblin = EntityDefinitionFixtures.CreateSimpleGoblin();
        var orc = EntityDefinitionFixtures.CreateOrc();

        await SaveEntityImageAsync(goblin, "base");
        await SaveEntityImageAsync(orc, "base");
    }
}
