namespace VttTools.AssetImageManager.Infrastructure.Storage;

public class HierarchicalImageStoreEnumerationTests {
    [Fact]
    public async Task GetEntitySummariesAsync_WhenDirectoryIsEmpty_ReturnsEmptyList() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        Directory.CreateDirectory(tempDir);

        try {
            var store = new HierarchicalImageStore(tempDir);

            var summaries = await store.GetEntitySummariesAsync(ct: TestContext.Current.CancellationToken);

            Assert.Empty(summaries);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public async Task GetEntitySummariesAsync_WhenRootDoesNotExist_ReturnsEmptyList() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        var store = new HierarchicalImageStore(tempDir);

        var summaries = await store.GetEntitySummariesAsync(ct: TestContext.Current.CancellationToken);

        Assert.Empty(summaries);
    }

    [Fact]
    public async Task GetEntitySummariesAsync_WithSingleEntitySingleVariantSingleTheme_ReturnsCorrectSummary() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        var variantDir = Path.Combine(tempDir, "fantasy", "creatures", "monsters", "humanoids", "g", "goblin", "male-warrior");
        Directory.CreateDirectory(variantDir);
        File.WriteAllText(Path.Combine(variantDir, "top-down.png"), "fake");
        File.WriteAllText(Path.Combine(variantDir, "miniature.png"), "fake");

        try {
            var store = new HierarchicalImageStore(tempDir);

            var summaries = await store.GetEntitySummariesAsync(ct: TestContext.Current.CancellationToken);

            Assert.Single(summaries);
            var summary = summaries[0];
            Assert.Equal("creatures", summary.Category);
            Assert.Equal("monsters", summary.Type);
            Assert.Equal("humanoids", summary.Subtype);
            Assert.Equal("goblin", summary.Name);
            Assert.Equal(1, summary.VariantCount);
            Assert.Equal(2, summary.TotalPoseCount);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public async Task GetEntitySummariesAsync_WithMultipleVariantsAndThemes_AggregatesCorrectly() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        var variant1 = Path.Combine(tempDir, "fantasy", "creatures", "monsters", "humanoids", "g", "goblin", "male-warrior");
        var variant2 = Path.Combine(tempDir, "fantasy", "creatures", "monsters", "humanoids", "g", "goblin", "female-mage");

        Directory.CreateDirectory(variant1);
        Directory.CreateDirectory(variant2);

        File.WriteAllText(Path.Combine(variant1, "top-down.png"), "fake");
        File.WriteAllText(Path.Combine(variant1, "miniature.png"), "fake");
        File.WriteAllText(Path.Combine(variant1, "photo.png"), "fake");
        File.WriteAllText(Path.Combine(variant2, "top-down.png"), "fake");

        try {
            var store = new HierarchicalImageStore(tempDir);

            var summaries = await store.GetEntitySummariesAsync(ct: TestContext.Current.CancellationToken);

            Assert.Single(summaries);
            var summary = summaries[0];
            Assert.Equal("goblin", summary.Name);
            Assert.Equal(2, summary.VariantCount);
            Assert.Equal(4, summary.TotalPoseCount);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public async Task GetEntitySummariesAsync_WithMultipleEntities_ReturnsAllEntities() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        var goblin = Path.Combine(tempDir, "fantasy", "creatures", "monsters", "humanoids", "g", "goblin", "base");
        var zombie = Path.Combine(tempDir, "fantasy", "creatures", "monsters", "humanoids", "z", "zombie", "base");
        var orc = Path.Combine(tempDir, "fantasy", "creatures", "monsters", "humanoids", "o", "orc", "base");

        Directory.CreateDirectory(goblin);
        Directory.CreateDirectory(zombie);
        Directory.CreateDirectory(orc);

        File.WriteAllText(Path.Combine(goblin, "top-down.png"), "fake");
        File.WriteAllText(Path.Combine(zombie, "top-down.png"), "fake");
        File.WriteAllText(Path.Combine(orc, "top-down.png"), "fake");

        try {
            var store = new HierarchicalImageStore(tempDir);

            var summaries = await store.GetEntitySummariesAsync(ct: TestContext.Current.CancellationToken);

            Assert.Equal(3, summaries.Count);
            Assert.Contains(summaries, s => s.Name == "goblin");
            Assert.Contains(summaries, s => s.Name == "zombie");
            Assert.Contains(summaries, s => s.Name == "orc");
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public async Task GetEntitySummariesAsync_WithCategoryFilter_ReturnsOnlyMatchingEntities() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        var goblin = Path.Combine(tempDir, "fantasy", "creatures", "monsters", "humanoids", "g", "goblin", "base");
        var sword = Path.Combine(tempDir, "fantasy", "objects", "weapons", "melee", "s", "sword", "base");

        Directory.CreateDirectory(goblin);
        Directory.CreateDirectory(sword);

        File.WriteAllText(Path.Combine(goblin, "top-down.png"), "fake");
        File.WriteAllText(Path.Combine(sword, "top-down.png"), "fake");

        try {
            var store = new HierarchicalImageStore(tempDir);

            var summaries = await store.GetEntitySummariesAsync(categoryFilter: "creatures", ct: TestContext.Current.CancellationToken);

            Assert.Single(summaries);
            Assert.Equal("goblin", summaries[0].Name);
            Assert.Equal("creatures", summaries[0].Category);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public async Task GetEntitySummariesAsync_WithCategoryAndTypeFilter_ReturnsOnlyMatchingEntities() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        var goblin = Path.Combine(tempDir, "fantasy", "creatures", "monsters", "humanoids", "g", "goblin", "base");
        var npc = Path.Combine(tempDir, "fantasy", "creatures", "npcs", "humans", "n", "nobleman", "base");

        Directory.CreateDirectory(goblin);
        Directory.CreateDirectory(npc);

        File.WriteAllText(Path.Combine(goblin, "top-down.png"), "fake");
        File.WriteAllText(Path.Combine(npc, "top-down.png"), "fake");

        try {
            var store = new HierarchicalImageStore(tempDir);

            var summaries = await store.GetEntitySummariesAsync(categoryFilter: "creatures", typeFilter: "monsters", ct: TestContext.Current.CancellationToken);

            Assert.Single(summaries);
            Assert.Equal("goblin", summaries[0].Name);
            Assert.Equal("monsters", summaries[0].Type);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public async Task GetEntitySummariesAsync_WithAllFilters_ReturnsOnlyMatchingEntities() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        var goblin = Path.Combine(tempDir, "fantasy", "creatures", "monsters", "humanoids", "g", "goblin", "base");
        var dragon = Path.Combine(tempDir, "fantasy", "creatures", "monsters", "dragons", "d", "dragon", "base");

        Directory.CreateDirectory(goblin);
        Directory.CreateDirectory(dragon);

        File.WriteAllText(Path.Combine(goblin, "top-down.png"), "fake");
        File.WriteAllText(Path.Combine(dragon, "top-down.png"), "fake");

        try {
            var store = new HierarchicalImageStore(tempDir);

            var summaries = await store.GetEntitySummariesAsync(
                categoryFilter: "creatures",
                typeFilter: "monsters",
                subtypeFilter: "humanoids",
                ct: TestContext.Current.CancellationToken);

            Assert.Single(summaries);
            Assert.Equal("goblin", summaries[0].Name);
            Assert.Equal("humanoids", summaries[0].Subtype);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public async Task GetEntitySummariesAsync_HandlesMultipleLetterDirectoriesGracefully() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        var goblin = Path.Combine(tempDir, "fantasy", "creatures", "monsters", "humanoids", "g", "goblin", "base");
        var ghost = Path.Combine(tempDir, "fantasy", "creatures", "monsters", "humanoids", "g", "ghost", "base");
        var zombie = Path.Combine(tempDir, "fantasy", "creatures", "monsters", "humanoids", "z", "zombie", "base");

        Directory.CreateDirectory(goblin);
        Directory.CreateDirectory(ghost);
        Directory.CreateDirectory(zombie);

        File.WriteAllText(Path.Combine(goblin, "top-down.png"), "fake");
        File.WriteAllText(Path.Combine(ghost, "top-down.png"), "fake");
        File.WriteAllText(Path.Combine(zombie, "top-down.png"), "fake");

        try {
            var store = new HierarchicalImageStore(tempDir);

            var summaries = await store.GetEntitySummariesAsync(ct: TestContext.Current.CancellationToken);

            Assert.Equal(3, summaries.Count);
            Assert.Contains(summaries, s => s.Name == "goblin");
            Assert.Contains(summaries, s => s.Name == "ghost");
            Assert.Contains(summaries, s => s.Name == "zombie");
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public async Task GetEntityInfoAsync_WhenEntityDoesNotExist_ReturnsNull() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        Directory.CreateDirectory(tempDir);

        try {
            var store = new HierarchicalImageStore(tempDir);

            var entityInfo = await store.GetEntityInfoAsync("fantasy", "creatures", "monsters", "humanoids", "goblin", TestContext.Current.CancellationToken);

            Assert.Null(entityInfo);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public async Task GetEntityInfoAsync_WithSingleVariantSingleTheme_ReturnsCorrectInfo() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        var variantDir = Path.Combine(tempDir, "fantasy", "creatures", "monsters", "humanoids", "g", "goblin", "male-warrior");
        Directory.CreateDirectory(variantDir);
        File.WriteAllText(Path.Combine(variantDir, "top-down.png"), "fake1");
        File.WriteAllText(Path.Combine(variantDir, "miniature.png"), "fake2");

        try {
            var store = new HierarchicalImageStore(tempDir);

            var entityInfo = await store.GetEntityInfoAsync("fantasy", "creatures", "monsters", "humanoids", "goblin", TestContext.Current.CancellationToken);

            Assert.NotNull(entityInfo);
            Assert.Equal("creatures", entityInfo.Category);
            Assert.Equal("monsters", entityInfo.Type);
            Assert.Equal("humanoids", entityInfo.Subtype);
            Assert.Equal("goblin", entityInfo.Name);
            Assert.Single(entityInfo.Variants);

            var variant = entityInfo.Variants[0];
            Assert.Equal("male-warrior", variant.VariantId);
            Assert.Equal(2, variant.Poses.Count);

            Assert.Equal(1, variant.Poses[0].PoseNumber);
            Assert.Equal(2, variant.Poses[1].PoseNumber);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public async Task GetEntityInfoAsync_WithMultipleVariantsAndThemes_ReturnsCompleteInfo() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        var v1 = Path.Combine(tempDir, "fantasy", "creatures", "monsters", "humanoids", "g", "goblin", "male-warrior");
        var v2 = Path.Combine(tempDir, "fantasy", "creatures", "monsters", "humanoids", "g", "goblin", "female-mage");

        Directory.CreateDirectory(v1);
        Directory.CreateDirectory(v2);

        File.WriteAllText(Path.Combine(v1, "top-down.png"), "fake");
        File.WriteAllText(Path.Combine(v1, "miniature.png"), "fake");
        File.WriteAllText(Path.Combine(v1, "photo.png"), "fake");
        File.WriteAllText(Path.Combine(v2, "top-down.png"), "fake");

        try {
            var store = new HierarchicalImageStore(tempDir);

            var entityInfo = await store.GetEntityInfoAsync("fantasy", "creatures", "monsters", "humanoids", "goblin", TestContext.Current.CancellationToken);

            Assert.NotNull(entityInfo);
            Assert.Equal(2, entityInfo.Variants.Count);

            var maleWarrior = entityInfo.Variants.FirstOrDefault(v => v.VariantId == "male-warrior");
            Assert.NotNull(maleWarrior);
            Assert.Equal(3, maleWarrior.Poses.Count);

            var femaleMage = entityInfo.Variants.FirstOrDefault(v => v.VariantId == "female-mage");
            Assert.NotNull(femaleMage);
            Assert.Single(femaleMage.Poses);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public async Task GetEntityInfoAsync_ParsesPoseNumbersCorrectly() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        var variantDir = Path.Combine(tempDir, "fantasy", "creatures", "monsters", "humanoids", "g", "goblin", "base");
        Directory.CreateDirectory(variantDir);

        File.WriteAllText(Path.Combine(variantDir, "top-down.png"), "fake");
        File.WriteAllText(Path.Combine(variantDir, "miniature.png"), "fake");
        File.WriteAllText(Path.Combine(variantDir, "photo.png"), "fake");

        try {
            var store = new HierarchicalImageStore(tempDir);

            var entityInfo = await store.GetEntityInfoAsync("fantasy", "creatures", "monsters", "humanoids", "goblin", TestContext.Current.CancellationToken);

            Assert.NotNull(entityInfo);
            var poses = entityInfo.Variants[0].Poses;
            Assert.Equal(3, poses.Count);
            Assert.Equal(1, poses[0].PoseNumber);
            Assert.Equal(2, poses[1].PoseNumber);
            Assert.Equal(3, poses[2].PoseNumber);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public async Task GetEntityInfoAsync_IncludesFileMetadata() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        var variantDir = Path.Combine(tempDir, "fantasy", "creatures", "monsters", "humanoids", "g", "goblin", "base");
        Directory.CreateDirectory(variantDir);

        var tokenPath = Path.Combine(variantDir, "top-down.png");
        File.WriteAllText(tokenPath, "fake data with some length");

        try {
            var store = new HierarchicalImageStore(tempDir);

            var entityInfo = await store.GetEntityInfoAsync("fantasy", "creatures", "monsters", "humanoids", "goblin", TestContext.Current.CancellationToken);

            Assert.NotNull(entityInfo);
            var pose = entityInfo.Variants[0].Poses[0];
            Assert.Equal(tokenPath, pose.FilePath);
            Assert.True(pose.FileSizeBytes > 0);
            Assert.True(pose.CreatedUtc <= DateTime.UtcNow);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public async Task GetEntityInfoAsync_HandlesMalformedFilenamesGracefully() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        var variantDir = Path.Combine(tempDir, "fantasy", "creatures", "monsters", "humanoids", "g", "goblin", "base");
        Directory.CreateDirectory(variantDir);

        File.WriteAllText(Path.Combine(variantDir, "top-down.png"), "fake");
        File.WriteAllText(Path.Combine(variantDir, "not_a_token.png"), "fake");
        File.WriteAllText(Path.Combine(variantDir, "token_abc.png"), "fake");
        File.WriteAllText(Path.Combine(variantDir, "portrait.png"), "fake");

        try {
            var store = new HierarchicalImageStore(tempDir);

            var entityInfo = await store.GetEntityInfoAsync("fantasy", "creatures", "monsters", "humanoids", "goblin", TestContext.Current.CancellationToken);

            Assert.NotNull(entityInfo);
            var poses = entityInfo.Variants[0].Poses;
            Assert.Equal(2, poses.Count);
            Assert.Equal(1, poses[0].PoseNumber);
            Assert.Equal(4, poses[1].PoseNumber);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }
}
