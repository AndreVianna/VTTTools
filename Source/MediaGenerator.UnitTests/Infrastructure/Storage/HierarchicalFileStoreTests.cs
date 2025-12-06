namespace VttTools.MediaGenerator.Infrastructure.Storage;

public class HierarchicalFileStoreTests {
    [Fact]
    public void Constructor_WithNullRootPath_ThrowsArgumentNullException() {
        var exception = Assert.Throws<ArgumentNullException>(() =>
            new HierarchicalFileStore(null!));

        Assert.Equal("rootPath", exception.ParamName);
    }

    [Fact]
    public void Constructor_WithValidRootPath_CreatesInstance() {
        const string rootPath = "C:\\VTTAssets";

        var store = new HierarchicalFileStore(rootPath);

        Assert.NotNull(store);
    }

    [Fact]
    public async Task SaveImageAsync_WithValidInputs_CreatesCorrectDirectoryStructure() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        try {
            var store = new HierarchicalFileStore(tempDir);
            var entity = new Asset {
                Name = "Goblin",
                Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Common"),
                Description = "Small green humanoid"
            };
            var imageData = new byte[] { 0x89, 0x50, 0x4E, 0x47 };

            var filePath = await store.SaveImageAsync("TopDown", entity, 0, imageData, TestContext.Current.CancellationToken);

            Assert.True(File.Exists(filePath));
            Assert.Contains("creature", filePath.ToLowerInvariant());
            Assert.Contains("humanoid", filePath.ToLowerInvariant());
            Assert.Contains("goblinoid", filePath.ToLowerInvariant());
            Assert.Contains("goblin", filePath.ToLowerInvariant());
            Assert.Contains("topdown.png", filePath.ToLowerInvariant());
        }
        finally {
            if (Directory.Exists(tempDir)) {
                Directory.Delete(tempDir, recursive: true);
            }
        }
    }

    [Fact]
    public async Task SaveImageAsync_WithUppercaseEntityName_CreatesLowercasePath() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        try {
            var store = new HierarchicalFileStore(tempDir);
            var entity = new Asset {
                Name = "Zombie",
                Classification = new AssetClassification(AssetKind.Creature, "Undead", "Corporeal", null),
                Description = "Undead humanoid"
            };
            var imageData = new byte[] { 0x89, 0x50, 0x4E, 0x47 };

            var filePath = await store.SaveImageAsync("TopDown", entity, 0, imageData, TestContext.Current.CancellationToken);

            Assert.Contains("zombie", filePath.ToLowerInvariant());
            Assert.Contains("undead", filePath.ToLowerInvariant());
        }
        finally {
            if (Directory.Exists(tempDir)) {
                Directory.Delete(tempDir, recursive: true);
            }
        }
    }

    [Fact]
    public async Task SaveImageAsync_WithPathTraversalInCategory_SanitizesPath() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        try {
            var store = new HierarchicalFileStore(tempDir);
            var entity = new Asset {
                Name = "Goblin",
                Classification = new AssetClassification(AssetKind.Creature, "../../../etc", "Goblinoid", "Common"),
                Description = "Test"
            };
            var imageData = new byte[] { 0x89, 0x50, 0x4E, 0x47 };

            var filePath = await store.SaveImageAsync("TopDown", entity, 0, imageData, TestContext.Current.CancellationToken);

            filePath.Should().NotBeNull();
            filePath.Should().Contain(tempDir);
            var relativePath = Path.GetRelativePath(tempDir, filePath);
            relativePath.Should().NotContain("..");
            filePath.Should().Contain("etc");
        }
        finally {
            if (Directory.Exists(tempDir)) {
                Directory.Delete(tempDir, recursive: true);
            }
        }
    }

    [Fact]
    public async Task SaveImageAsync_WithPathTraversalInEntityName_SanitizesPath() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        try {
            var store = new HierarchicalFileStore(tempDir);
            var entity = new Asset {
                Name = "../../../passwd",
                Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Common"),
                Description = "Test"
            };
            var imageData = new byte[] { 0x89, 0x50, 0x4E, 0x47 };

            var filePath = await store.SaveImageAsync("TopDown", entity, 0, imageData, TestContext.Current.CancellationToken);

            filePath.Should().NotBeNull();
            filePath.Should().Contain(tempDir);
            var relativePath = Path.GetRelativePath(tempDir, filePath);
            relativePath.Should().NotContain("..");
            filePath.Should().Contain("passwd");
        }
        finally {
            if (Directory.Exists(tempDir)) {
                Directory.Delete(tempDir, recursive: true);
            }
        }
    }

    [Fact]
    public async Task SaveImageAsync_WithDifferentVariantIndices_CreatesVariantFolders() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        try {
            var store = new HierarchicalFileStore(tempDir);
            var entity = new Asset {
                Name = "Goblin",
                Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Common"),
                Description = "Test"
            };
            var imageData = new byte[] { 0x89, 0x50, 0x4E, 0x47 };

            var baseVariantPath = await store.SaveImageAsync("TopDown", entity, 0, imageData, TestContext.Current.CancellationToken);
            var variant1Path = await store.SaveImageAsync("TopDown", entity, 1, imageData, TestContext.Current.CancellationToken);
            var variant2Path = await store.SaveImageAsync("TopDown", entity, 2, imageData, TestContext.Current.CancellationToken);

            File.Exists(baseVariantPath).Should().BeTrue();
            File.Exists(variant1Path).Should().BeTrue();
            File.Exists(variant2Path).Should().BeTrue();

            baseVariantPath.Should().NotBe(variant1Path);
            baseVariantPath.Should().NotBe(variant2Path);
            variant1Path.Should().NotBe(variant2Path);

            baseVariantPath.Should().EndWith("topdown.png");
            variant1Path.Should().EndWith("topdown_01.png");
            variant2Path.Should().EndWith("topdown_02.png");
        }
        finally {
            if (Directory.Exists(tempDir)) {
                Directory.Delete(tempDir, recursive: true);
            }
        }
    }

    [Fact]
    public async Task SaveImageAsync_WithEmptyCategory_ThrowsArgumentException() {
        var store = new HierarchicalFileStore("C:\\VTTAssets");
        var entity = new Asset {
            Name = "Goblin",
            Classification = new AssetClassification(AssetKind.Creature, "", "ResourceType", null),
            Description = "Test"
        };
        var imageData = new byte[] { 0x89, 0x50, 0x4E, 0x47 };

        await store.SaveImageAsync("TopDown", entity, 0, imageData, TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task SaveImageAsync_WithInvalidImageType_SavesSuccessfully() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        try {
            var store = new HierarchicalFileStore(tempDir);
            var entity = new Asset {
                Name = "Goblin",
                Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Common"),
                Description = "Test"
            };
            var imageData = new byte[] { 0x89, 0x50, 0x4E, 0x47 };

            var filePath = await store.SaveImageAsync("CustomType", entity, 0, imageData, TestContext.Current.CancellationToken);

            Assert.True(File.Exists(filePath));
            Assert.Contains("customtype.png", filePath.ToLowerInvariant());
        }
        finally {
            if (Directory.Exists(tempDir)) {
                Directory.Delete(tempDir, recursive: true);
            }
        }
    }

    [Fact]
    public async Task SaveImageAsync_WithPortraitType_CreatesPortraitFile() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        try {
            var store = new HierarchicalFileStore(tempDir);
            var entity = new Asset {
                Name = "Goblin",
                Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Common"),
                Description = "Test"
            };
            var imageData = new byte[] { 0x89, 0x50, 0x4E, 0x47 };

            var filePath = await store.SaveImageAsync("Portrait", entity, 0, imageData, TestContext.Current.CancellationToken);

            Assert.True(File.Exists(filePath));
            Assert.Contains("portrait.png", filePath.ToLowerInvariant());
        }
        finally {
            if (Directory.Exists(tempDir)) {
                Directory.Delete(tempDir, recursive: true);
            }
        }
    }

    [Fact]
    public async Task SaveImageAsync_WithNullEntity_ThrowsArgumentNullException() {
        var store = new HierarchicalFileStore("C:\\VTTAssets");
        var imageData = new byte[] { 0x89, 0x50, 0x4E, 0x47 };

        var exception = await Assert.ThrowsAsync<ArgumentNullException>(() =>
            store.SaveImageAsync("TopDown", null!, 0, imageData, TestContext.Current.CancellationToken));

        Assert.Equal("asset", exception.ParamName);
    }

    [Fact]
    public async Task SaveImageAsync_WithNullImageData_ThrowsArgumentNullException() {
        var store = new HierarchicalFileStore("C:\\VTTAssets");
        var entity = new Asset {
            Name = "Goblin",
            Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Common"),
            Description = "Test"
        };

        var exception = await Assert.ThrowsAsync<ArgumentNullException>(() =>
            store.SaveImageAsync("TopDown", entity, 0, null!, TestContext.Current.CancellationToken));

        Assert.Equal("content", exception.ParamName);
    }

    [Fact]
    public async Task SaveImageAsync_WithEmptyImageType_ThrowsArgumentException() {
        var store = new HierarchicalFileStore("C:\\VTTAssets");
        var entity = new Asset {
            Name = "Goblin",
            Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Common"),
            Description = "Test"
        };
        var imageData = new byte[] { 0x89, 0x50, 0x4E, 0x47 };

        var exception = await Assert.ThrowsAsync<ArgumentException>(() =>
            store.SaveImageAsync(string.Empty, entity, 0, imageData, TestContext.Current.CancellationToken));

        Assert.Equal("imageType", exception.ParamName);
    }

    [Fact]
    public async Task SavePromptAsync_WithValidInputs_CreatesPromptFile() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        try {
            var store = new HierarchicalFileStore(tempDir);
            var entity = new Asset {
                Name = "Goblin",
                Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Common"),
                Description = "Test"
            };
            const string prompt = "A goblin warrior from top-down view";

            var filePath = await store.SavePromptAsync("TopDown", entity, 0, prompt, TestContext.Current.CancellationToken);

            Assert.True(File.Exists(filePath));
            Assert.Contains(".md", filePath);
            var content = await File.ReadAllTextAsync(filePath, TestContext.Current.CancellationToken);
            Assert.Equal(prompt, content);
        }
        finally {
            if (Directory.Exists(tempDir)) {
                Directory.Delete(tempDir, recursive: true);
            }
        }
    }

    [Fact]
    public async Task FindImageFile_WithExistingFile_ReturnsPath() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        try {
            var store = new HierarchicalFileStore(tempDir);
            var entity = new Asset {
                Name = "Goblin",
                Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Common"),
                Description = "Test"
            };
            var imageData = new byte[] { 0x89, 0x50, 0x4E, 0x47 };
            var savedPath = await store.SaveImageAsync("TopDown", entity, 0, imageData, TestContext.Current.CancellationToken);

            var foundPath = store.FindImageFile("TopDown", entity, 0);

            Assert.NotNull(foundPath);
            Assert.Equal(savedPath, foundPath);
        }
        finally {
            if (Directory.Exists(tempDir)) {
                Directory.Delete(tempDir, recursive: true);
            }
        }
    }

    [Fact]
    public void FindImageFile_WithNonExistingFile_ReturnsNull() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        try {
            var store = new HierarchicalFileStore(tempDir);
            var entity = new Asset {
                Name = "Goblin",
                Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Common"),
                Description = "Test"
            };

            var foundPath = store.FindImageFile("TopDown", entity, 0);

            Assert.Null(foundPath);
        }
        finally {
            if (Directory.Exists(tempDir)) {
                Directory.Delete(tempDir, recursive: true);
            }
        }
    }

    [Fact]
    public void GetAssets_WithEmptyStore_ReturnsEmpty() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        try {
            var store = new HierarchicalFileStore(tempDir);

            var assets = store.GetAssets();

            Assert.Empty(assets);
        }
        finally {
            if (Directory.Exists(tempDir)) {
                Directory.Delete(tempDir, recursive: true);
            }
        }
    }

    [Fact]
    public async Task GetAssets_WithSavedAssets_ReturnsAssets() {
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        try {
            var store = new HierarchicalFileStore(tempDir);
            var entity = new Asset {
                Name = "Goblin",
                Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Common"),
                Description = "Test"
            };
            var imageData = new byte[] { 0x89, 0x50, 0x4E, 0x47 };
            await store.SaveImageAsync("TopDown", entity, 0, imageData, TestContext.Current.CancellationToken);

            var assets = store.GetAssets();

            Assert.Single(assets);
            Assert.Equal("Goblin", assets[0].Name);
        }
        finally {
            if (Directory.Exists(tempDir)) {
                Directory.Delete(tempDir, recursive: true);
            }
        }
    }
}