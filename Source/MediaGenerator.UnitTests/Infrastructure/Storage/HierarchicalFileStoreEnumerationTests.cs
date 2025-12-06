namespace VttTools.MediaGenerator.Infrastructure.Storage;

public class HierarchicalFileStoreEnumerationTests {
    [Fact]
    public void GetAssets_WhenDirectoryIsEmpty_ReturnsEmptyList() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        Directory.CreateDirectory(tempDir);

        try {
            var store = new HierarchicalFileStore(tempDir);

            var assets = store.GetAssets();

            Assert.Empty(assets);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public void GetAssets_WhenRootDoesNotExist_ReturnsEmptyList() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        var store = new HierarchicalFileStore(tempDir);

        var assets = store.GetAssets();

        Assert.Empty(assets);
    }

    [Fact]
    public void GetAssets_WithSingleEntitySingleVariant_ReturnsCorrectAsset() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        var assetDir = Path.Combine(tempDir, "creature", "humanoid", "goblinoid", "common", "goblin");
        Directory.CreateDirectory(assetDir);
        File.WriteAllText(Path.Combine(assetDir, "topdown.png"), "fake");
        File.WriteAllText(Path.Combine(assetDir, "token.png"), "fake");

        try {
            var store = new HierarchicalFileStore(tempDir);

            var assets = store.GetAssets();

            Assert.Single(assets);
            var asset = assets[0];
            Assert.Equal(AssetKind.Creature, asset.Classification.Kind);
            Assert.Equal("humanoid", asset.Classification.Category);
            Assert.Equal("goblinoid", asset.Classification.Type);
            Assert.Equal("common", asset.Classification.Subtype);
            Assert.Equal("goblin", asset.Name);
            Assert.Empty(asset.Tokens);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public void GetAssets_WithMultipleVariants_ReturnsAssetWithMultipleTokens() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        var assetDir = Path.Combine(tempDir, "creature", "humanoid", "goblinoid", "common", "goblin");
        Directory.CreateDirectory(assetDir);

        File.WriteAllText(Path.Combine(assetDir, "topdown.png"), "fake");
        File.WriteAllText(Path.Combine(assetDir, "token.png"), "fake");
        File.WriteAllText(Path.Combine(assetDir, "portrait.png"), "fake");
        File.WriteAllText(Path.Combine(assetDir, "topdown_01.png"), "fake");
        File.WriteAllText(Path.Combine(assetDir, "token_01.png"), "fake");
        File.WriteAllText(Path.Combine(assetDir, "topdown_02.png"), "fake");

        try {
            var store = new HierarchicalFileStore(tempDir);

            var assets = store.GetAssets();

            Assert.Single(assets);
            var asset = assets[0];
            Assert.Equal("goblin", asset.Name);
            Assert.Equal(2, asset.Tokens.Count);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public void GetAssets_WithMultipleEntities_ReturnsAllEntities() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        var goblin = Path.Combine(tempDir, "creature", "humanoid", "goblinoid", "common", "goblin");
        var zombie = Path.Combine(tempDir, "creature", "undead", "corporeal", "common", "zombie");
        var orc = Path.Combine(tempDir, "creature", "humanoid", "orc", "common", "orc");

        Directory.CreateDirectory(goblin);
        Directory.CreateDirectory(zombie);
        Directory.CreateDirectory(orc);

        File.WriteAllText(Path.Combine(goblin, "topdown.png"), "fake");
        File.WriteAllText(Path.Combine(zombie, "topdown.png"), "fake");
        File.WriteAllText(Path.Combine(orc, "topdown.png"), "fake");

        try {
            var store = new HierarchicalFileStore(tempDir);

            var assets = store.GetAssets();

            Assert.Equal(3, assets.Count);
            Assert.Contains(assets, s => s.Name == "goblin");
            Assert.Contains(assets, s => s.Name == "zombie");
            Assert.Contains(assets, s => s.Name == "orc");
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public void GetAssets_WithKindFilter_ReturnsOnlyMatchingEntities() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        var goblin = Path.Combine(tempDir, "creature", "humanoid", "goblinoid", "common", "goblin");
        var sword = Path.Combine(tempDir, "object", "weapon", "sword", "longsword");

        Directory.CreateDirectory(goblin);
        Directory.CreateDirectory(sword);

        File.WriteAllText(Path.Combine(goblin, "topdown.png"), "fake");
        File.WriteAllText(Path.Combine(sword, "topdown.png"), "fake");

        try {
            var store = new HierarchicalFileStore(tempDir);

            var assets = store.GetAssets(kindFilter: AssetKind.Creature);

            Assert.Single(assets);
            Assert.Equal("goblin", assets[0].Name);
            Assert.Equal(AssetKind.Creature, assets[0].Classification.Kind);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public void GetAssets_WithCategoryFilter_ReturnsOnlyMatchingEntities() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        var goblin = Path.Combine(tempDir, "creature", "humanoid", "goblinoid", "common", "goblin");
        var zombie = Path.Combine(tempDir, "creature", "undead", "corporeal", "common", "zombie");

        Directory.CreateDirectory(goblin);
        Directory.CreateDirectory(zombie);

        File.WriteAllText(Path.Combine(goblin, "topdown.png"), "fake");
        File.WriteAllText(Path.Combine(zombie, "topdown.png"), "fake");

        try {
            var store = new HierarchicalFileStore(tempDir);

            var assets = store.GetAssets(categoryFilter: "humanoid");

            Assert.Single(assets);
            Assert.Equal("goblin", assets[0].Name);
            Assert.Equal("humanoid", assets[0].Classification.Category);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public void GetAssets_WithAllFilters_ReturnsOnlyMatchingEntities() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        var goblin = Path.Combine(tempDir, "creature", "humanoid", "goblinoid", "common", "goblin");
        var hobgoblin = Path.Combine(tempDir, "creature", "humanoid", "goblinoid", "leader", "hobgoblin");

        Directory.CreateDirectory(goblin);
        Directory.CreateDirectory(hobgoblin);

        File.WriteAllText(Path.Combine(goblin, "topdown.png"), "fake");
        File.WriteAllText(Path.Combine(hobgoblin, "topdown.png"), "fake");

        try {
            var store = new HierarchicalFileStore(tempDir);

            var assets = store.GetAssets(
                kindFilter: AssetKind.Creature,
                categoryFilter: "humanoid",
                typeFilter: "goblinoid",
                subtypeFilter: "common");

            Assert.Single(assets);
            Assert.Equal("goblin", assets[0].Name);
            Assert.Equal("common", assets[0].Classification.Subtype);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public void FindAsset_WhenEntityDoesNotExist_ReturnsNull() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        Directory.CreateDirectory(tempDir);

        try {
            var store = new HierarchicalFileStore(tempDir);

            var asset = store.FindAsset("goblin");

            Assert.Null(asset);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public void FindAsset_WithExistingEntity_ReturnsCorrectAsset() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        var assetDir = Path.Combine(tempDir, "creature", "humanoid", "goblinoid", "common", "goblin");
        Directory.CreateDirectory(assetDir);
        File.WriteAllText(Path.Combine(assetDir, "topdown.png"), "fake1");
        File.WriteAllText(Path.Combine(assetDir, "token.png"), "fake2");

        try {
            var store = new HierarchicalFileStore(tempDir);

            var asset = store.FindAsset("goblin");

            Assert.NotNull(asset);
            Assert.Equal(AssetKind.Creature, asset.Classification.Kind);
            Assert.Equal("humanoid", asset.Classification.Category);
            Assert.Equal("goblinoid", asset.Classification.Type);
            Assert.Equal("common", asset.Classification.Subtype);
            Assert.Equal("goblin", asset.Name);
            Assert.Empty(asset.Tokens);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public void FindAsset_WithMultipleVariants_ReturnsAssetWithAllTokens() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        var assetDir = Path.Combine(tempDir, "creature", "humanoid", "goblinoid", "common", "goblin");
        Directory.CreateDirectory(assetDir);

        File.WriteAllText(Path.Combine(assetDir, "topdown.png"), "fake");
        File.WriteAllText(Path.Combine(assetDir, "token.png"), "fake");
        File.WriteAllText(Path.Combine(assetDir, "portrait.png"), "fake");
        File.WriteAllText(Path.Combine(assetDir, "topdown_01.png"), "fake");
        File.WriteAllText(Path.Combine(assetDir, "token_01.png"), "fake");
        File.WriteAllText(Path.Combine(assetDir, "topdown_02.png"), "fake");

        try {
            var store = new HierarchicalFileStore(tempDir);

            var asset = store.FindAsset("goblin");

            Assert.NotNull(asset);
            Assert.Equal(2, asset.Tokens.Count);
            Assert.Equal("Token 1", asset.Tokens[0].Description);
            Assert.Equal("Token 2", asset.Tokens[1].Description);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public void FindAsset_WithNoSubtype_HandlesCorrectly() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        var assetDir = Path.Combine(tempDir, "creature", "undead", "corporeal", "zombie");
        Directory.CreateDirectory(assetDir);
        File.WriteAllText(Path.Combine(assetDir, "topdown.png"), "fake");

        try {
            var store = new HierarchicalFileStore(tempDir);

            var asset = store.FindAsset("zombie");

            Assert.NotNull(asset);
            Assert.Equal("zombie", asset.Name);
            Assert.Null(asset.Classification.Subtype);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }
}