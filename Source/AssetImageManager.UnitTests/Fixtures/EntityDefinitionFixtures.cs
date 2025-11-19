namespace VttTools.AssetImageManager.UnitTests.Fixtures;

public static class EntityDefinitionFixtures {
    public static EntityDefinition CreateSimpleGoblin() => new() {
        Name = "Goblin",
        Genre = "Fantasy",
        Category = "creatures",
        Type = "monsters",
        Subtype = "humanoids",
        PhysicalDescription = "Green-skinned, cunning creature",
        DistinctiveFeatures = "Pointed ears and sharp teeth",
        Environment = "caves and forests"
    };

    public static EntityDefinition CreateGoblinWithVariants() => new() {
        Name = "Goblin",
        Genre = "Fantasy",
        Category = "creatures",
        Type = "monsters",
        Subtype = "humanoids",
        PhysicalDescription = "Green-skinned, cunning creature",
        DistinctiveFeatures = "Pointed ears and sharp teeth",
        Environment = "caves and forests",
        Alternatives = [
            new AlternativeDefinition {
                Size = ["small"],
                Gender = ["male", "female"],
                Class = ["warrior", "shaman"],
                Equipment = ["scimitar", "shortbow"],
                Armor = null,
                Material = null,
                Quality = null
            }
        ]
    };

    public static EntityDefinition CreateOrc() => new() {
        Name = "Orc",
        Genre = "Fantasy",
        Category = "creatures",
        Type = "monsters",
        Subtype = "humanoids",
        PhysicalDescription = "Muscular, grey-skinned brute",
        DistinctiveFeatures = "Tusks and scarred face",
        Environment = "mountains and wastelands"
    };

    public static EntityDefinition CreateDragonWithComplexVariants() => new() {
        Name = "Dragon",
        Genre = "Fantasy",
        Category = "creatures",
        Type = "monsters",
        Subtype = "dragons",
        PhysicalDescription = "Massive winged reptile",
        DistinctiveFeatures = "Scales and horns",
        Environment = "mountains and lairs",
        Alternatives = [
            new AlternativeDefinition {
                Size = null,
                Gender = null,
                Class = ["ancient", "adult", "young"],
                Equipment = null,
                Armor = null,
                Material = null,
                Quality = null
            }
        ]
    };

    public static EntityDefinition CreateChest() => new() {
        Name = "Treasure Chest",
        Genre = "Fantasy",
        Category = "objects",
        Type = "containers",
        Subtype = "chests",
        PhysicalDescription = "Wooden chest with iron fittings",
        DistinctiveFeatures = "Lock and hinges",
        Environment = "dungeons",
        Alternatives = [
            new AlternativeDefinition {
                Size = null,
                Gender = null,
                Class = null,
                Equipment = null,
                Armor = null,
                Material = ["wood", "metal", "stone"],
                Quality = ["common", "ornate"]
            }
        ]
    };

    public static List<EntityDefinition> CreateMultipleEntities() => [
        CreateSimpleGoblin(),
        CreateOrc(),
        CreateGoblinWithVariants()
    ];

    public static EntityDefinition CreateLargeVariantSet() {
        var genders = new List<string> { "male", "female", "nonbinary" };
        var classes = new List<string> { "warrior", "mage", "rogue", "cleric" };
        var equipment = Enumerable.Range(1, 5).Select(i => $"Equipment{i}").ToList();

        return new EntityDefinition {
            Name = "TestEntity",
            Genre = "Fantasy",
            Category = "creatures",
            Type = "monsters",
            Subtype = "test",
            PhysicalDescription = "Test entity",
            DistinctiveFeatures = "Test features",
            Environment = "test environment",
            Alternatives = [
                new AlternativeDefinition {
                    Size = ["small"],
                    Gender = genders,
                    Class = classes,
                    Equipment = equipment,
                    Armor = null,
                    Material = null,
                    Quality = null
                }
            ]
        };
    }
}
