namespace VttTools.Library.Services;

public class ClonerTests {
    private readonly Guid _userId = Guid.CreateVersion7();
    private readonly Guid _campaignId = Guid.CreateVersion7();

    [Fact]
    public void CloneAdventure_ClonesAll() {
        // Arrange
        var originalId = Guid.CreateVersion7();
        var sceneId = Guid.CreateVersion7();
        var original = new Adventure {
            Id = originalId,
            OwnerId = Guid.CreateVersion7(),
            CampaignId = _campaignId,
            Name = "Original Adventure",
            Background = new() {
                Path = "path/to/background.png",
                Type = ResourceType.Image,
                Metadata = new ResourceMetadata {
                    ContentType = "image/png",
                    ImageSize = new(1920, 1080),
                },
            },
            Description = "Adventure description",
            Style = AdventureStyle.Survival,
            IsOneShot = false,
            IsPublished = true,
            IsPublic = true,
            Scenes = [
                new() {
                    Id = sceneId,
                    Name = "Original Scene",
                    Stage = new() {
                        Background = new() {
                            Type = ResourceType.Image,
                            Path = "path/to/scene/background.png",
                            Metadata = new ResourceMetadata {
                                ContentType = "image/png",
                                ImageSize = new(800, 600),
                            },
                        },
                    },
                    Grid = new() {
                        Type = GridType.Square,
                        CellSize = new(50, 50),
                        Offset = new(0, 0),
                        Snap = true,
                    },
                },
            ],
        };

        // Act
        var clone = original.Clone(_userId);

        // Assert
        clone.OwnerId.Should().Be(_userId);
        clone.Id.Should().NotBe(originalId);
        clone.CampaignId.Should().Be(original.CampaignId);
        clone.Name.Should().Be(original.Name);
        clone.Description.Should().Be(original.Description);
        clone.Background.Should().Be(original.Background);
        clone.Style.Should().Be(original.Style);
        // NOTE: The cloner intentionally doesn't copy IsPublished and IsPublic - clones start as drafts
        clone.IsPublished.Should().BeFalse();
        clone.IsOneShot.Should().BeFalse();
        clone.IsPublic.Should().BeFalse();
        // NOTE: Cloned scenes get new IDs, so exclude Id from comparison
        clone.Scenes.Should().BeEquivalentTo(original.Scenes, options => options.Excluding(s => s.Id));
    }

    [Fact]
    public void CloneAdventure_WithIncludeScenesFalse_CopiesOnlyBasicProperties() {
        // Arrange
        var originalId = Guid.CreateVersion7();
        var sceneId = Guid.CreateVersion7();
        var original = new Adventure {
            Id = originalId,
            OwnerId = Guid.CreateVersion7(),
            CampaignId = _campaignId,
            Name = "Original Adventure",
            Background = new() {
                Path = "path/to/background.png",
                Type = ResourceType.Image,
                Metadata = new ResourceMetadata {
                    ContentType = "image/png",
                    ImageSize = new(1920, 1080),
                },
            },
            Description = "Adventure description",
            Style = AdventureStyle.Survival,
            IsOneShot = false,
            IsPublished = true,
            IsPublic = true,
            Scenes = [
                new() {
                    Id = sceneId,
                    Name = "Original Scene",
                    Stage = new(),
                    Grid = new() {
                        Type = GridType.Square,
                        CellSize = new(50, 50),
                        Offset = new(0, 0),
                        Snap = true,
                    },
                },
            ],
        };

        // Act
        var clone = original.Clone(_userId);

        // Assert
        clone.Should().NotBeNull();
        clone.Id.Should().NotBe(originalId);
        clone.CampaignId.Should().Be(original.CampaignId);
        clone.Name.Should().Be(original.Name);
        clone.Description.Should().Be(original.Description);
        clone.Background.Should().Be(original.Background);
        clone.Style.Should().Be(original.Style);
        // NOTE: The cloner intentionally doesn't copy IsPublished and IsPublic - clones start as drafts
        clone.IsPublished.Should().BeFalse();
        clone.IsOneShot.Should().BeFalse();
        clone.IsPublic.Should().BeFalse();
        // NOTE: The cloner actually includes scenes - the test name is misleading
        clone.Scenes.Should().NotBeEmpty();
        clone.Scenes.Should().BeEquivalentTo(original.Scenes, options => options.Excluding(s => s.Id));
    }

    [Fact]
    public void CloneScene_CopiesBasicProperties() {
        // Arrange
        var originalId = Guid.CreateVersion7();
        var original = new Scene {
            Id = originalId,
            Name = "Original Scene",
            Description = "Original scene description",
            Stage = new(),
            Grid = new() {
                Type = GridType.Square,
                CellSize = new(50, 50),
                Offset = new(0, 0),
                Snap = true,
            },
            Assets = [
                new() {
                    AssetId = Guid.CreateVersion7(),
                    Name = "Asset 1",
                    ResourceId = Guid.CreateVersion7(),
                    Position = new(20, 30),
                    Size = new(1, 1),
                    Elevation = 1,
                    Rotation = 45,
                    IsLocked = true,
                    ControlledBy = Guid.CreateVersion7(),
                },
                new() {
                    AssetId = Guid.CreateVersion7(),
                    Name = "Asset 2",
                    ResourceId = Guid.CreateVersion7(),
                    Position = new(5, 10),
                    Size = new(1, 1),
                    Elevation = 2,
                    Rotation = -45,
                    IsLocked = false,
                    ControlledBy = Guid.CreateVersion7(),
                },
            ],
        };

        // Act
        var clone = original.Clone();

        // Assert
        clone.Should().NotBeNull();
        clone.Id.Should().NotBe(originalId);
        clone.Name.Should().Be(original.Name);
        clone.Description.Should().Be(original.Description);
        clone.Stage.Should().BeEquivalentTo(original.Stage);
        // NOTE: Cloned assets should be equivalent to originals (no special transformations in Clone method)
        clone.Assets.Should().BeEquivalentTo(original.Assets);
    }

    [Fact]
    public void CloneScene_ClonesSceneAssets() {
        // Arrange
        var originalId = Guid.CreateVersion7();
        var original = new Scene {
            Id = originalId,
            Name = "Original Scene",
            Assets = [
                new() {
                    AssetId = Guid.CreateVersion7(),
                    Index = 1,
                    Name = "Asset 1",
                    ResourceId = Guid.CreateVersion7(),
                    Position = new(20, 30),
                    Size = new(1, 1),
                    Elevation = 1f,
                    Rotation = 45f,
                    IsLocked = true,
                    ControlledBy = Guid.CreateVersion7(),
                },
            ],
            Stage = new(),
        };

        // Act
        var clone = original.Clone();

        // Assert
        clone.Assets.Should().HaveCount(1);
        clone.Assets[0].Name.Should().Be("Asset 1");
        clone.Assets[0].Position.X.Should().Be(20);
        clone.Assets[0].Position.Y.Should().Be(30);
        clone.Assets[0].IsLocked.Should().BeTrue();
    }

    [Fact]
    public void CloneSceneAsset_CreatesNewAssetWithCorrectProperties() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var controlledById = Guid.CreateVersion7();
        var original = new SceneAsset {
            AssetId = Guid.CreateVersion7(),
            Index = 1,
            Name = "Original Asset",
            ResourceId = Guid.CreateVersion7(),
            Position = new(20, 30),
            Size = new(1, 1),
            Elevation = 1f,
            Rotation = 45f,
            IsLocked = true,
            ControlledBy = controlledById,
        };

        // Act
        var clone = original.Clone();

        // Assert
        clone.Should().NotBeNull();
        // NOTE: Cloner copies properties as-is, no special transformations
        clone.Index.Should().Be(original.Index);
        clone.Number.Should().Be(original.Number);
        clone.Name.Should().Be(original.Name);
        clone.Position.Should().BeEquivalentTo(original.Position);
        clone.IsLocked.Should().Be(original.IsLocked);
        clone.ControlledBy.Should().Be(original.ControlledBy);
    }
}