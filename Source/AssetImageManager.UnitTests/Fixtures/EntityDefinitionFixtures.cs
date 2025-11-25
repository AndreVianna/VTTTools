namespace VttTools.AssetImageManager.UnitTests.Fixtures;

public static class EntityDefinitionFixtures {
    public static Asset CreateSimpleGoblin() => new() {
        Name = "Goblin",
        Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Common"),
        Description = "Green-skinned, cunning creature with pointed ears and sharp teeth",
        Tokens = []
    };

    public static Asset CreateGoblinWithVariants() => new() {
        Name = "Goblin",
        Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Common"),
        Description = "Green-skinned, cunning creature with pointed ears and sharp teeth",
        Tokens = []
    };

    public static Asset CreateOrc() => new() {
        Name = "Orc",
        Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Orc", "Common"),
        Description = "Muscular, grey-skinned brute with tusks and scarred face",
        Tokens = []
    };

    public static Asset CreateDragonWithComplexVariants() => new() {
        Name = "Dragon",
        Classification = new AssetClassification(AssetKind.Creature, "Dragon", "Chromatic", "Red"),
        Description = "Massive winged reptile with scales and horns",
        Tokens = []
    };

    public static Asset CreateChest() => new() {
        Name = "Treasure Chest",
        Classification = new AssetClassification(AssetKind.Object, "Container", "Chest", "Wooden"),
        Description = "Wooden chest with iron fittings, lock and hinges",
        Tokens = []
    };

    public static List<Asset> CreateMultipleEntities() => [
        CreateSimpleGoblin(),
        CreateOrc(),
        CreateGoblinWithVariants()
    ];

    public static Asset CreateLargeVariantSet() => new() {
        Name = "TestEntity",
        Classification = new AssetClassification(AssetKind.Creature, "Test", "Test", "Test"),
        Description = "Test entity with test features",
        Tokens = []
    };
}
