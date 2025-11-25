namespace VttTools.AssetImageManager.Infrastructure.Storage;

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
        var variantDir = Path.Combine(assetDir, "0");
        Directory.CreateDirectory(variantDir);
        File.WriteAllText(Path.Combine(variantDir, "top-down.png"), "fake");
        File.WriteAllText(Path.Combine(variantDir, "close-up.png"), "fake");

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
            Assert.Single(asset.Tokens);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public void GetAssets_WithMultipleVariants_ReturnsAssetWithMultipleTokens() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        var variant1 = Path.Combine(tempDir, "creature", "humanoid", "goblinoid", "common", "goblin", "0");
        var variant2 = Path.Combine(tempDir, "creature", "humanoid", "goblinoid", "common", "goblin", "1");

        Directory.CreateDirectory(variant1);
        Directory.CreateDirectory(variant2);

        File.WriteAllText(Path.Combine(variant1, "top-down.png"), "fake");
        File.WriteAllText(Path.Combine(variant1, "close-up.png"), "fake");
        File.WriteAllText(Path.Combine(variant1, "portrait.png"), "fake");
        File.WriteAllText(Path.Combine(variant2, "top-down.png"), "fake");

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

        var goblin = Path.Combine(tempDir, "creature", "humanoid", "goblinoid", "common", "goblin", "0");
        var zombie = Path.Combine(tempDir, "creature", "undead", "corporeal", "common", "zombie", "0");
        var orc = Path.Combine(tempDir, "creature", "humanoid", "orc", "common", "orc", "0");

        Directory.CreateDirectory(goblin);
        Directory.CreateDirectory(zombie);
        Directory.CreateDirectory(orc);

        File.WriteAllText(Path.Combine(goblin, "top-down.png"), "fake");
        File.WriteAllText(Path.Combine(zombie, "top-down.png"), "fake");
        File.WriteAllText(Path.Combine(orc, "top-down.png"), "fake");

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

        var goblin = Path.Combine(tempDir, "creature", "humanoid", "goblinoid", "common", "goblin", "0");
        var sword = Path.Combine(tempDir, "object", "weapon", "sword", "longsword", "0");

        Directory.CreateDirectory(goblin);
        Directory.CreateDirectory(sword);

        File.WriteAllText(Path.Combine(goblin, "top-down.png"), "fake");
        File.WriteAllText(Path.Combine(sword, "top-down.png"), "fake");

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

        var goblin = Path.Combine(tempDir, "creature", "humanoid", "goblinoid", "common", "goblin", "0");
        var zombie = Path.Combine(tempDir, "creature", "undead", "corporeal", "common", "zombie", "0");

        Directory.CreateDirectory(goblin);
        Directory.CreateDirectory(zombie);

        File.WriteAllText(Path.Combine(goblin, "top-down.png"), "fake");
        File.WriteAllText(Path.Combine(zombie, "top-down.png"), "fake");

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

        var goblin = Path.Combine(tempDir, "creature", "humanoid", "goblinoid", "common", "goblin", "0");
        var hobgoblin = Path.Combine(tempDir, "creature", "humanoid", "goblinoid", "leader", "hobgoblin", "0");

        Directory.CreateDirectory(goblin);
        Directory.CreateDirectory(hobgoblin);

        File.WriteAllText(Path.Combine(goblin, "top-down.png"), "fake");
        File.WriteAllText(Path.Combine(hobgoblin, "top-down.png"), "fake");

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
        var variantDir = Path.Combine(tempDir, "creature", "humanoid", "goblinoid", "common", "goblin", "0");
        Directory.CreateDirectory(variantDir);
        File.WriteAllText(Path.Combine(variantDir, "top-down.png"), "fake1");
        File.WriteAllText(Path.Combine(variantDir, "close-up.png"), "fake2");

        try {
            var store = new HierarchicalFileStore(tempDir);

            var asset = store.FindAsset("goblin");

            Assert.NotNull(asset);
            Assert.Equal(AssetKind.Creature, asset.Classification.Kind);
            Assert.Equal("humanoid", asset.Classification.Category);
            Assert.Equal("goblinoid", asset.Classification.Type);
            Assert.Equal("common", asset.Classification.Subtype);
            Assert.Equal("goblin", asset.Name);
            Assert.Single(asset.Tokens);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public void FindAsset_WithMultipleVariants_ReturnsAssetWithAllTokens() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        var v1 = Path.Combine(tempDir, "creature", "humanoid", "goblinoid", "common", "goblin", "0");
        var v2 = Path.Combine(tempDir, "creature", "humanoid", "goblinoid", "common", "goblin", "1");

        Directory.CreateDirectory(v1);
        Directory.CreateDirectory(v2);

        File.WriteAllText(Path.Combine(v1, "top-down.png"), "fake");
        File.WriteAllText(Path.Combine(v1, "close-up.png"), "fake");
        File.WriteAllText(Path.Combine(v1, "portrait.png"), "fake");
        File.WriteAllText(Path.Combine(v2, "top-down.png"), "fake");

        try {
            var store = new HierarchicalFileStore(tempDir);

            var asset = store.FindAsset("goblin");

            Assert.NotNull(asset);
            Assert.Equal(2, asset.Tokens.Count);
            Assert.Equal("0", asset.Tokens[0].Description);
            Assert.Equal("1", asset.Tokens[1].Description);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public void FindAsset_WithNoSubtype_HandlesCorrectly() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        var variantDir = Path.Combine(tempDir, "creature", "undead", "corporeal", "zombie", "0");
        Directory.CreateDirectory(variantDir);
        File.WriteAllText(Path.Combine(variantDir, "top-down.png"), "fake");

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
