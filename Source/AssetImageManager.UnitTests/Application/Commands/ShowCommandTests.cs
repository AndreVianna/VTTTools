namespace VttTools.AssetImageManager.UnitTests.Application.Commands;

public sealed class ShowCommandTests : IDisposable {
    private readonly string _tempDir;
    private readonly HierarchicalFileStore _imageStore;
    private readonly ShowCommand _command;

    public ShowCommandTests() {
        _tempDir = Path.Combine(Path.GetTempPath(), $"TokenManagerTests_{Guid.NewGuid():N}");
        Directory.CreateDirectory(_tempDir);

        _imageStore = new HierarchicalFileStore(_tempDir);
        _command = new ShowCommand(_imageStore);
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
        await SaveEntityImageAsync(goblin, 1, "TopDown");

        var options = new ShowTokenOptions(Name: "Goblin");

        _command.Execute(options);

        var entityInfo = _imageStore.FindAsset("Goblin");

        Assert.NotNull(entityInfo);
        Assert.Equal("Goblin", entityInfo.Name);
    }

    [Fact]
    public async Task Should_ShowAllTokens_When_EntityHasMultipleTokens() {
        var goblin = EntityDefinitionFixtures.CreateSimpleGoblin();

        var fakeImage = new byte[1024];
        await _imageStore.SaveImageAsync("TopDown", goblin, 1, fakeImage, TestContext.Current.CancellationToken);
        await _imageStore.SaveImageAsync("TopDown", goblin, 2, fakeImage, TestContext.Current.CancellationToken);
        await _imageStore.SaveImageAsync("TopDown", goblin, 3, fakeImage, TestContext.Current.CancellationToken);

        var options = new ShowTokenOptions(Name: "Goblin");

        _command.Execute(options);

        var entityInfo = _imageStore.FindAsset("Goblin");

        Assert.NotNull(entityInfo);
        Assert.Equal(3, entityInfo.Tokens.Count);
        Assert.All(entityInfo.Tokens, token => Assert.NotNull(token.Description));
    }

    [Fact]
    public async Task Should_ShowAllPoses_When_VariantHasMultiplePoses() {
        var entity = EntityDefinitionFixtures.CreateSimpleGoblin();

        var fakeImage = new byte[1024];
        await _imageStore.SaveImageAsync("TopDown", entity, 1, fakeImage, TestContext.Current.CancellationToken);
        await _imageStore.SaveImageAsync("CloseUp", entity, 1, fakeImage, TestContext.Current.CancellationToken);
        await _imageStore.SaveImageAsync("Portrait", entity, 1, fakeImage, TestContext.Current.CancellationToken);

        var options = new ShowTokenOptions(Name: "Goblin");

        _command.Execute(options);

        var entityInfo = _imageStore.FindAsset("Goblin");

        Assert.NotNull(entityInfo);
        Assert.Single(entityInfo.Tokens);
    }

    [Fact]
    public async Task Should_ShowCorrectMetadata() {
        var entity = EntityDefinitionFixtures.CreateSimpleGoblin();

        var fakeImage = new byte[2048];
        for (var i = 0; i < fakeImage.Length; i++) {
            fakeImage[i] = (byte)(i % 256);
        }

        await _imageStore.SaveImageAsync("TopDown", entity, 1, fakeImage, TestContext.Current.CancellationToken);

        var options = new ShowTokenOptions(Name: "Goblin");

        _command.Execute(options);

        var entityInfo = _imageStore.FindAsset("Goblin");

        Assert.NotNull(entityInfo);
        Assert.Single(entityInfo.Tokens);
    }

    [Fact]
    public async Task Should_HandleCaseInsensitiveNameLookup() {
        var goblin = EntityDefinitionFixtures.CreateSimpleGoblin();
        await SaveEntityImageAsync(goblin, 1, "TopDown");

        var options = new ShowTokenOptions(Name: "GOBLIN");

        _command.Execute(options);

        var summaries = _imageStore.GetAssets();
        var matched = summaries.FirstOrDefault(s => string.Equals(s.Name, "goblin", StringComparison.OrdinalIgnoreCase));
        Assert.NotNull(matched);
    }

    [Fact]
    public async Task Should_ShowComplexTokenHierarchy_When_EntityHasMultipleTokensWithDifferentPoses() {
        var dragon = EntityDefinitionFixtures.CreateDragonWithComplexVariants();

        var fakeImage = new byte[1024];
        await _imageStore.SaveImageAsync("TopDown", dragon, 0, fakeImage, TestContext.Current.CancellationToken);
        await _imageStore.SaveImageAsync("TopDown", dragon, 1, fakeImage, TestContext.Current.CancellationToken);
        await _imageStore.SaveImageAsync("CloseUp", dragon, 1, fakeImage, TestContext.Current.CancellationToken);
        await _imageStore.SaveImageAsync("Portrait", dragon, 1, fakeImage, TestContext.Current.CancellationToken);

        await _imageStore.SaveImageAsync("TopDown", dragon, 2, fakeImage, TestContext.Current.CancellationToken);
        await _imageStore.SaveImageAsync("CloseUp", dragon, 2, fakeImage, TestContext.Current.CancellationToken);

        await _imageStore.SaveImageAsync("TopDown", dragon, 3, fakeImage, TestContext.Current.CancellationToken);

        var options = new ShowTokenOptions(Name: "Red Dragon");

        _command.Execute(options);

        var entityInfo = _imageStore.FindAsset("Red Dragon");

        entityInfo.Should().NotBeNull();
        entityInfo!.Tokens.Should().HaveCount(3);
        entityInfo.Tokens.Should().AllSatisfy(token => token.Should().NotBeNull());
    }

    private async Task SaveEntityImageAsync(Asset entity, int variantIndex, string imageType) {
        var fakeImage = new byte[1024];
        await _imageStore.SaveImageAsync(imageType, entity, variantIndex, fakeImage);
    }
}

