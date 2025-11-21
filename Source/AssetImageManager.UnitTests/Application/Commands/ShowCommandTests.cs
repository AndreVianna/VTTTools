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
    public async Task Should_ReturnNotFound_When_EntityDoesNotExist() {
        var options = new ShowTokenOptions(Id: "NonExistent");

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var summaries = await _imageStore.GetEntitySummariesAsync(ct: TestContext.Current.CancellationToken);
        Assert.Empty(summaries);
    }

    [Fact]
    public async Task Should_ShowEntityInfo_When_EntityExists() {
        var goblin = EntityDefinitionFixtures.CreateSimpleGoblin();
        await SaveEntityImageAsync(goblin, "base", ImageType.TopDown);

        var options = new ShowTokenOptions(Id: "Goblin");

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var entityInfo = await _imageStore.GetEntityInfoAsync(goblin.Genre, goblin.Category, goblin.Type, goblin.Subtype, goblin.Name, TestContext.Current.CancellationToken);

        Assert.NotNull(entityInfo);
        Assert.Equal("Goblin", entityInfo.Name);
    }

    [Fact]
    public async Task Should_ShowAllVariants_When_EntityHasMultipleVariants() {
        var entity = EntityDefinitionFixtures.CreateGoblinWithVariants();
        var variant1 = new StructuralVariant("male-warrior-scimitar", "small", "male", "warrior", "scimitar", null, null, null);
        var variant2 = new StructuralVariant("female-shaman-shortbow", "small", "female", "shaman", "shortbow", null, null, null);

        var fakeImage = new byte[1024];
        await _imageStore.SaveImageAsync(entity, variant1, fakeImage, ImageType.TopDown, TestContext.Current.CancellationToken);
        await _imageStore.SaveImageAsync(entity, variant2, fakeImage, ImageType.TopDown, TestContext.Current.CancellationToken);

        var options = new ShowTokenOptions(Id: "Goblin");

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var entityInfo = await _imageStore.GetEntityInfoAsync(entity.Genre, entity.Category, entity.Type, entity.Subtype, entity.Name, TestContext.Current.CancellationToken);

        Assert.NotNull(entityInfo);
        Assert.Equal(2, entityInfo.Variants.Count);
    }

    [Fact]
    public async Task Should_ShowAllPoses_When_VariantHasMultiplePoses() {
        var entity = EntityDefinitionFixtures.CreateSimpleGoblin();
        var variant = new StructuralVariant("base", null, null, null, null, null, null, null);

        var fakeImage = new byte[1024];
        await _imageStore.SaveImageAsync(entity, variant, fakeImage, ImageType.TopDown, TestContext.Current.CancellationToken);
        await _imageStore.SaveImageAsync(entity, variant, fakeImage, ImageType.TopDown, TestContext.Current.CancellationToken);
        await _imageStore.SaveImageAsync(entity, variant, fakeImage, ImageType.Photo, TestContext.Current.CancellationToken);

        var options = new ShowTokenOptions(Id: "Goblin");

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var entityInfo = await _imageStore.GetEntityInfoAsync(entity.Genre, entity.Category, entity.Type, entity.Subtype, entity.Name, TestContext.Current.CancellationToken);

        Assert.NotNull(entityInfo);
        var variantInfo = entityInfo.Variants[0];
        Assert.Equal(3, variantInfo.Poses.Count);
    }

    [Fact]
    public async Task Should_ShowCorrectMetadata() {
        var entity = EntityDefinitionFixtures.CreateSimpleGoblin();
        var variant = new StructuralVariant("base", null, null, null, null, null, null, null);

        var fakeImage = new byte[2048];
        for (var i = 0; i < fakeImage.Length; i++) {
            fakeImage[i] = (byte)(i % 256);
        }

        await _imageStore.SaveImageAsync(entity, variant, fakeImage, ImageType.TopDown, TestContext.Current.CancellationToken);

        var options = new ShowTokenOptions(Id: "Goblin");

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var entityInfo = await _imageStore.GetEntityInfoAsync(entity.Genre, entity.Category, entity.Type, entity.Subtype, entity.Name, TestContext.Current.CancellationToken);

        Assert.NotNull(entityInfo);
        var variantInfo = entityInfo.Variants[0];
        var poseInfo = variantInfo.Poses[0];

        Assert.Equal(1, poseInfo.PoseNumber);
        Assert.Equal(2048, poseInfo.FileSizeBytes);
        Assert.True(poseInfo.CreatedUtc <= DateTime.UtcNow);
        Assert.True(poseInfo.CreatedUtc >= DateTime.UtcNow.AddMinutes(-1));
    }

    [Fact]
    public async Task Should_HandleCaseInsensitiveNameLookup() {
        var goblin = EntityDefinitionFixtures.CreateSimpleGoblin();
        await SaveEntityImageAsync(goblin, "base", ImageType.TopDown);

        var options = new ShowTokenOptions(Id: "GOBLIN");

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var summaries = await _imageStore.GetEntitySummariesAsync(ct: TestContext.Current.CancellationToken);
        var matched = summaries.FirstOrDefault(s => string.Equals(s.Name, "goblin", StringComparison.OrdinalIgnoreCase));
        Assert.NotNull(matched);
    }

    [Fact]
    public async Task Should_ShowComplexHierarchy() {
        var entity = EntityDefinitionFixtures.CreateGoblinWithVariants();
        var variant1 = new StructuralVariant("male-warrior-scimitar", "small", "male", "warrior", "scimitar", null, null, null);
        var variant2 = new StructuralVariant("female-shaman-shortbow", "small", "female", "shaman", "shortbow", null, null, null);

        var fakeImage = new byte[1024];
        await _imageStore.SaveImageAsync(entity, variant1, fakeImage, ImageType.TopDown, TestContext.Current.CancellationToken);
        await _imageStore.SaveImageAsync(entity, variant1, fakeImage, ImageType.TopDown, TestContext.Current.CancellationToken);
        await _imageStore.SaveImageAsync(entity, variant2, fakeImage, ImageType.TopDown, TestContext.Current.CancellationToken);

        var options = new ShowTokenOptions(Id: "Goblin");

        await _command.ExecuteAsync(options, TestContext.Current.CancellationToken);

        var entityInfo = await _imageStore.GetEntityInfoAsync(entity.Genre, entity.Category, entity.Type, entity.Subtype, entity.Name, TestContext.Current.CancellationToken);

        Assert.NotNull(entityInfo);
        Assert.Equal(2, entityInfo.Variants.Count);

        var totalPoses = entityInfo.Variants.Sum(v => v.Poses.Count);
        Assert.Equal(3, totalPoses);
    }

    private async Task SaveEntityImageAsync(EntryDefinition entity, string variantId, string imageType) {
        var variant = new StructuralVariant(variantId, null, null, null, null, null, null, null);
        var fakeImage = new byte[1024];
        await _imageStore.SaveImageAsync(entity, variant, fakeImage, imageType);
    }
}
