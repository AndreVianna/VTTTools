namespace VttTools.AssetImageManager.Infrastructure.Storage;

public class HierarchicalImageStoreTests {
    [Fact]
    public void Constructor_WithNullRootPath_ThrowsArgumentNullException() {
        var exception = Assert.Throws<ArgumentNullException>(() =>
            new HierarchicalImageStore(null!));

        Assert.Equal("rootPath", exception.ParamName);
    }

    [Fact]
    public void Constructor_WithValidRootPath_CreatesInstance() {
        const string rootPath = "C:\\VTTAssets";

        var store = new HierarchicalImageStore(rootPath);

        Assert.NotNull(store);
    }

    [Fact]
    public async Task SaveImageAsync_WithValidInputs_CreatesCorrectDirectoryStructure() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        try {
            var store = new HierarchicalImageStore(tempDir);
            var entity = new EntityDefinition { Name = "goblin", Genre = "Fantasy", Category = "creatures", Type = "monsters", Subtype = "humanoids", PhysicalDescription = "small green humanoid", DistinctiveFeatures = null, Environment = null, Alternatives = [new AlternativeDefinition { Gender = null, Class = null, Equipment = null, Armor = null, Material = null, Quality = null }] };
            var variant = new StructuralVariant("male-warrior", "small", "male", "warrior", null, null, null, null);
            var imageData = new byte[] { 0x89, 0x50, 0x4E, 0x47 };

            var filePath = await store.SaveImageAsync(entity, variant, imageData, ImageType.TopDown, TestContext.Current.CancellationToken);

            Assert.True(File.Exists(filePath));
            Assert.Contains("fantasy", filePath);
            Assert.Contains("creatures", filePath);
            Assert.Contains("monsters", filePath);
            Assert.Contains("humanoids", filePath);
            Assert.Contains("male-warrior", filePath);
            Assert.Contains("top-down.png", filePath);
        }
        finally {
            if (Directory.Exists(tempDir)) {
                Directory.Delete(tempDir, recursive: true);
            }
        }
    }

    [Fact]
    public async Task SaveImageAsync_WithUppercaseEntityName_ExtractsLowercaseFirstLetter() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        try {
            var store = new HierarchicalImageStore(tempDir);
            var entity = new EntityDefinition { Name = "Zombie", Genre = "Fantasy", Category = "creatures", Type = "monsters", Subtype = "humanoids", PhysicalDescription = "undead humanoid", DistinctiveFeatures = null, Environment = null, Alternatives = [new AlternativeDefinition { Gender = null, Class = null, Equipment = null, Armor = null, Material = null, Quality = null }] };
            var variant = new StructuralVariant("base", null, null, null, null, null, null, null);
            var imageData = new byte[] { 0x89, 0x50, 0x4E, 0x47 };

            var filePath = await store.SaveImageAsync(entity, variant, imageData, ImageType.TopDown, TestContext.Current.CancellationToken);

            Assert.Contains(Path.Combine("fantasy", "creatures", "monsters", "humanoids", "z", "zombie"), filePath.ToLowerInvariant());
        }
        finally {
            if (Directory.Exists(tempDir)) {
                Directory.Delete(tempDir, recursive: true);
            }
        }
    }

    [Fact]
    public async Task SaveImageAsync_WithPathTraversalInCategory_ThrowsArgumentException() {
        var store = new HierarchicalImageStore("C:\\VTTAssets");
        var entity = new EntityDefinition { Name = "goblin", Genre = "Fantasy", Category = "../../../etc/passwd", Type = "monsters", Subtype = "humanoids", PhysicalDescription = "small green humanoid", DistinctiveFeatures = null, Environment = null, Alternatives = [new AlternativeDefinition { Gender = null, Class = null, Equipment = null, Armor = null, Material = null, Quality = null }] };
        var variant = new StructuralVariant("base", null, null, null, null, null, null, null);
        var imageData = new byte[] { 0x89, 0x50, 0x4E, 0x47 };

        var exception = await Assert.ThrowsAsync<ArgumentException>(() =>
            store.SaveImageAsync(entity, variant, imageData, ImageType.TopDown, TestContext.Current.CancellationToken));

        Assert.Contains("invalid path characters", exception.Message);
    }

    [Fact]
    public async Task SaveImageAsync_WithPathTraversalInEntityName_ThrowsArgumentException() {
        var store = new HierarchicalImageStore("C:\\VTTAssets");
        var entity = new EntityDefinition { Name = "../../evil", Genre = "Fantasy", Category = "creatures", Type = "monsters", Subtype = "humanoids", PhysicalDescription = "malicious entity", DistinctiveFeatures = null, Environment = null, Alternatives = [new AlternativeDefinition { Gender = null, Class = null, Equipment = null, Armor = null, Material = null, Quality = null }] };
        var variant = new StructuralVariant("base", null, null, null, null, null, null, null);
        var imageData = new byte[] { 0x89, 0x50, 0x4E, 0x47 };

        var exception = await Assert.ThrowsAsync<ArgumentException>(() =>
            store.SaveImageAsync(entity, variant, imageData, ImageType.TopDown, TestContext.Current.CancellationToken));

        Assert.Contains("invalid path characters", exception.Message);
    }

    [Fact]
    public async Task SaveImageAsync_WithPathTraversalInVariantId_ThrowsArgumentException() {
        var store = new HierarchicalImageStore("C:\\VTTAssets");
        var entity = new EntityDefinition { Name = "goblin", Genre = "Fantasy", Category = "creatures", Type = "monsters", Subtype = "humanoids", PhysicalDescription = "small green humanoid", DistinctiveFeatures = null, Environment = null, Alternatives = [new AlternativeDefinition { Gender = null, Class = null, Equipment = null, Armor = null, Material = null, Quality = null }] };
        var variant = new StructuralVariant("../../../hacker", null, null, null, null, null, null, null);
        var imageData = new byte[] { 0x89, 0x50, 0x4E, 0x47 };

        var exception = await Assert.ThrowsAsync<ArgumentException>(() =>
            store.SaveImageAsync(entity, variant, imageData, ImageType.TopDown, TestContext.Current.CancellationToken));

        Assert.Contains("invalid path characters", exception.Message);
    }

    [Fact]
    public async Task SaveImageAsync_WithEmptyCategory_ThrowsArgumentException() {
        var store = new HierarchicalImageStore("C:\\VTTAssets");
        var entity = new EntityDefinition { Name = "goblin", Genre = "Fantasy", Category = "", Type = "monsters", Subtype = "humanoids", PhysicalDescription = "small green humanoid", DistinctiveFeatures = null, Environment = null, Alternatives = [new AlternativeDefinition { Gender = null, Class = null, Equipment = null, Armor = null, Material = null, Quality = null }] };
        var variant = new StructuralVariant("base", null, null, null, null, null, null, null);
        var imageData = new byte[] { 0x89, 0x50, 0x4E, 0x47 };

        var exception = await Assert.ThrowsAsync<ArgumentException>(() =>
            store.SaveImageAsync(entity, variant, imageData, ImageType.TopDown, TestContext.Current.CancellationToken));

        Assert.Contains("cannot be null or whitespace", exception.Message);
    }

    [Fact]
    public async Task SaveImageAsync_WithInvalidImageType_ThrowsArgumentException() {
        var store = new HierarchicalImageStore("C:\\VTTAssets");
        var entity = new EntityDefinition { Name = "goblin", Genre = "Fantasy", Category = "creatures", Type = "monsters", Subtype = "humanoids", PhysicalDescription = "small green humanoid", DistinctiveFeatures = null, Environment = null, Alternatives = [new AlternativeDefinition { Gender = null, Class = null, Equipment = null, Armor = null, Material = null, Quality = null }] };
        var variant = new StructuralVariant("base", null, null, null, null, null, null, null);
        var imageData = new byte[] { 0x89, 0x50, 0x4E, 0x47 };

        var exception = await Assert.ThrowsAsync<ArgumentException>(() =>
            store.SaveImageAsync(entity, variant, imageData, "InvalidType", TestContext.Current.CancellationToken));

        Assert.Contains("Invalid image type", exception.Message);
    }

    [Fact]
    public async Task SaveImageAsync_WithPortraitType_CreatesPortraitFile() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        try {
            var store = new HierarchicalImageStore(tempDir);
            var entity = new EntityDefinition { Name = "goblin", Genre = "Fantasy", Category = "creatures", Type = "monsters", Subtype = "humanoids", PhysicalDescription = "small green humanoid", DistinctiveFeatures = null, Environment = null, Alternatives = [new AlternativeDefinition { Gender = null, Class = null, Equipment = null, Armor = null, Material = null, Quality = null }] };
            var variant = new StructuralVariant("base", null, null, null, null, null, null, null);
            var imageData = new byte[] { 0x89, 0x50, 0x4E, 0x47 };

            var filePath = await store.SaveImageAsync(entity, variant, imageData, ImageType.Portrait, TestContext.Current.CancellationToken);

            Assert.True(File.Exists(filePath));
            Assert.Contains("portrait.png", filePath);
        }
        finally {
            if (Directory.Exists(tempDir)) {
                Directory.Delete(tempDir, recursive: true);
            }
        }
    }

    [Fact]
    public async Task GetExistingImageTypesAsync_WhenNoFilesExist_ReturnsEmptyList() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        Directory.CreateDirectory(tempDir);

        try {
            var store = new HierarchicalImageStore(tempDir);
            var entity = new EntityDefinition { Name = "goblin", Genre = "Fantasy", Category = "creatures", Type = "monsters", Subtype = "humanoids", PhysicalDescription = "small green humanoid", DistinctiveFeatures = null, Environment = null, Alternatives = [new AlternativeDefinition { Gender = null, Class = null, Equipment = null, Armor = null, Material = null, Quality = null }] };
            var variant = new StructuralVariant("base", null, null, null, null, null, null, null);

            var existingTypes = await store.GetExistingImageTypesAsync(entity, variant, CancellationToken.None);

            Assert.Empty(existingTypes);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public async Task GetExistingImageTypesAsync_WithExistingImages_ReturnsCorrectTypes() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        var variantDir = Path.Combine(tempDir, "fantasy", "creatures", "monsters", "humanoids", "g", "goblin", "base");
        Directory.CreateDirectory(variantDir);

        try {
            File.WriteAllText(Path.Combine(variantDir, "top-down.png"), "fake");
            File.WriteAllText(Path.Combine(variantDir, "miniature.png"), "fake");
            File.WriteAllText(Path.Combine(variantDir, "portrait.png"), "fake");

            var store = new HierarchicalImageStore(tempDir);
            var entity = new EntityDefinition { Name = "goblin", Genre = "Fantasy", Category = "creatures", Type = "monsters", Subtype = "humanoids", PhysicalDescription = "small green humanoid", DistinctiveFeatures = null, Environment = null, Alternatives = [new AlternativeDefinition { Gender = null, Class = null, Equipment = null, Armor = null, Material = null, Quality = null }] };
            var variant = new StructuralVariant("base", null, null, null, null, null, null, null);

            var existingTypes = await store.GetExistingImageTypesAsync(entity, variant, CancellationToken.None);

            Assert.Equal(3, existingTypes.Count);
            Assert.Contains(ImageType.TopDown, existingTypes);
            Assert.Contains(ImageType.Miniature, existingTypes);
            Assert.Contains(ImageType.Portrait, existingTypes);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public async Task SaveMetadataAsync_WithValidInputs_CreatesMetadataFile() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        try {
            var store = new HierarchicalImageStore(tempDir);
            var entity = new EntityDefinition { Name = "goblin", Genre = "Fantasy", Category = "creatures", Type = "monsters", Subtype = "humanoids", PhysicalDescription = "small green humanoid", DistinctiveFeatures = null, Environment = null, Alternatives = [new AlternativeDefinition { Gender = null, Class = null, Equipment = null, Armor = null, Material = null, Quality = null }] };
            var variant = new StructuralVariant("base", null, null, null, null, null, null, null);
            const string metadataJson = "{\"test\": \"data\"}";

            var filePath = await store.SaveMetadataAsync(entity, variant, metadataJson, TestContext.Current.CancellationToken);

            Assert.True(File.Exists(filePath));
            Assert.Contains("metadata.json", filePath);
            var content = await File.ReadAllTextAsync(filePath, TestContext.Current.CancellationToken);
            Assert.Equal(metadataJson, content);
        }
        finally {
            if (Directory.Exists(tempDir)) {
                Directory.Delete(tempDir, recursive: true);
            }
        }
    }

    [Fact]
    public async Task LoadMetadataAsync_WhenFileExists_ReturnsContent() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        var variantDir = Path.Combine(tempDir, "fantasy", "creatures", "monsters", "humanoids", "g", "goblin", "base");
        Directory.CreateDirectory(variantDir);
        const string metadataJson = "{\"test\": \"data\"}";
        await File.WriteAllTextAsync(Path.Combine(variantDir, "metadata.json"), metadataJson, TestContext.Current.CancellationToken);

        try {
            var store = new HierarchicalImageStore(tempDir);
            var entity = new EntityDefinition { Name = "goblin", Genre = "Fantasy", Category = "creatures", Type = "monsters", Subtype = "humanoids", PhysicalDescription = "small green humanoid", DistinctiveFeatures = null, Environment = null, Alternatives = [new AlternativeDefinition { Gender = null, Class = null, Equipment = null, Armor = null, Material = null, Quality = null }] };
            var variant = new StructuralVariant("base", null, null, null, null, null, null, null);

            var content = await store.LoadMetadataAsync(entity, variant, CancellationToken.None);

            Assert.Equal(metadataJson, content);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public async Task LoadMetadataAsync_WhenFileDoesNotExist_ReturnsNull() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        Directory.CreateDirectory(tempDir);

        try {
            var store = new HierarchicalImageStore(tempDir);
            var entity = new EntityDefinition { Name = "goblin", Genre = "Fantasy", Category = "creatures", Type = "monsters", Subtype = "humanoids", PhysicalDescription = "small green humanoid", DistinctiveFeatures = null, Environment = null, Alternatives = [new AlternativeDefinition { Gender = null, Class = null, Equipment = null, Armor = null, Material = null, Quality = null }] };
            var variant = new StructuralVariant("base", null, null, null, null, null, null, null);

            var content = await store.LoadMetadataAsync(entity, variant, CancellationToken.None);

            Assert.Null(content);
        }
        finally {
            Directory.Delete(tempDir, recursive: true);
        }
    }
}
