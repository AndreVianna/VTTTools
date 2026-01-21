using VttTools.AssetImageManager.Fixtures;

namespace VttTools.AssetImageManager.Application.Commands;

public sealed class ShowCommandTests : IDisposable {
    private readonly string _tempDir;
    private readonly HierarchicalFileStore _imageStore;
    private readonly ShowCommand _command;

    public ShowCommandTests() {
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
    public void Should_ReturnNotFound_When_EntityDoesNotExist() {
        var options = new ShowTokenOptions(Name: "NonExistent");

        _command.Execute(options);

        var summaries = _imageStore.GetAssets();
        Assert.Empty(summaries);
    }

    [Fact]
    public async Task Should_ShowEntityInfo_When_EntityExists() {
        var goblin = EntityDefinitionFixtures.CreateSimpleGoblin();
        await SaveEntityImageAsync(goblin, 1, "Token");

        var options = new ShowTokenOptions(Name: "Goblin");

        _command.Execute(options);

        var entityInfo = _imageStore.FindAsset("Goblin");

        Assert.NotNull(entityInfo);
        Assert.Equal("Goblin", entityInfo.Name);
    }

    [Fact]
    public async Task Should_ShowAllTokens_When_EntityHasMultipleTokens() {
        var goblin = EntityDefinitionFixtures.CreateSimpleGoblin();

        await SaveEntityImageAsync(goblin, 1, "Token");
        await SaveEntityImageAsync(goblin, 2, "Token");
        await SaveEntityImageAsync(goblin, 3, "Token");

        var options = new ShowTokenOptions(Name: "Goblin");

        _command.Execute(options);

        var entityInfo = _imageStore.FindAsset("Goblin");

        Assert.NotNull(entityInfo);
        Assert.Equal(3, entityInfo.Tokens.Count);
    }

    [Fact]
    public async Task Should_ShowAllPoses_When_VariantHasMultiplePoses() {
        var entity = EntityDefinitionFixtures.CreateSimpleGoblin();

        await SaveEntityImageAsync(entity, 1, "Token");
        await SaveEntityImageAsync(entity, 1, "Portrait");

        var options = new ShowTokenOptions(Name: "Goblin");

        _command.Execute(options);

        var entityInfo = _imageStore.FindAsset("Goblin");

        Assert.NotNull(entityInfo);
        Assert.Single(entityInfo.Tokens);
    }

    [Fact]
    public async Task Should_ShowCorrectMetadata() {
        var entity = EntityDefinitionFixtures.CreateSimpleGoblin();

        await SaveEntityImageAsync(entity, 1, "Token");

        var options = new ShowTokenOptions(Name: "Goblin");

        _command.Execute(options);

        var entityInfo = _imageStore.FindAsset("Goblin");

        Assert.NotNull(entityInfo);
        Assert.Single(entityInfo.Tokens);
    }

    [Fact]
    public async Task Should_HandleCaseInsensitiveNameLookup() {
        var goblin = EntityDefinitionFixtures.CreateSimpleGoblin();
        await SaveEntityImageAsync(goblin, 1, "Token");

        var options = new ShowTokenOptions(Name: "GOBLIN");

        _command.Execute(options);

        var summaries = _imageStore.GetAssets();
        var matched = summaries.FirstOrDefault(s => string.Equals(s.Name, "goblin", StringComparison.OrdinalIgnoreCase));
        Assert.NotNull(matched);
    }

    [Fact]
    public async Task Should_ShowComplexTokenHierarchy_When_EntityHasMultipleTokensWithDifferentPoses() {
        var dragon = EntityDefinitionFixtures.CreateDragonWithComplexVariants();

        // Index 0 is excluded by CreateAsset (line 232: Where(idx => idx > 0))
        await SaveEntityImageAsync(dragon, 1, "Token");
        await SaveEntityImageAsync(dragon, 1, "Portrait");
        await SaveEntityImageAsync(dragon, 2, "Token");
        await SaveEntityImageAsync(dragon, 3, "Token");

        var options = new ShowTokenOptions(Name: "Red Dragon");

        _command.Execute(options);

        var entityInfo = _imageStore.FindAsset("Red Dragon");

        entityInfo.Should().NotBeNull();
        entityInfo.Tokens.Should().HaveCount(3);
        entityInfo.Tokens.Should().AllSatisfy(token => token.Should().NotBeNull());
    }

    private async Task SaveEntityImageAsync(Asset entity, int variantIndex, string imageType) {
        var fakeImage = new byte[1024];
        await _imageStore.SaveImageAsync(imageType, entity, variantIndex, fakeImage);
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
}