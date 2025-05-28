namespace VttTools.Library.Services;

public class ClonerTests {
    private readonly Guid _userId = Guid.NewGuid();
    private readonly Guid _campaignId = Guid.NewGuid();

    [Fact]
    public void CloneAdventure_ClonesAll() {
        // Arrange
        var originalId = Guid.NewGuid();
        var sceneId = Guid.NewGuid();
        var original = new Adventure {
            Id = originalId,
            OwnerId = Guid.NewGuid(),
            CampaignId = _campaignId,
            Name = "Original Adventure",
            Display = new() {
                FileName = "some_file.png",
                Type = ResourceType.Image,
                Size = new(50, 50),
            },
            Description = "Adventure description",
            Type = AdventureType.Survival,
            IsPublished = true,
            IsPublic = true,
            Scenes = [
                new() {
                    Id = sceneId,
                    Name = "Original Scene",
                    ZoomLevel = 1,
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
        var data = new ClonedAdventureData { TemplateId = originalId };

        // Act
        var clone = Cloner.CloneAdventure(original, _userId, data);

        // Assert
        clone.OwnerId.Should().Be(_userId);
        clone.Id.Should().NotBe(originalId);
        clone.CampaignId.Should().Be(original.CampaignId);
        clone.Name.Should().Be($"{original.Name} (Copy)");
        clone.Description.Should().Be(original.Description);
        clone.Display.Should().Be(original.Display);
        clone.Type.Should().Be(original.Type);
        clone.IsPublished.Should().Be(original.IsPublished);
        clone.IsPublic.Should().Be(original.IsPublic);
        clone.Scenes.Should().BeEquivalentTo(original.Scenes);
    }

    [Fact]
    public void CloneAdventure_WithIncludeScenesFalse_CopiesOnlyBasicProperties() {
        // Arrange
        var originalId = Guid.NewGuid();
        var sceneId = Guid.NewGuid();
        var original = new Adventure {
            Id = originalId,
            OwnerId = Guid.NewGuid(),
            CampaignId = _campaignId,
            Name = "Original Adventure",
            Display = new() {
                FileName = "some_file.png",
                Type = ResourceType.Image,
                Size = new(50, 50),
            },
            Description = "Adventure description",
            Type = AdventureType.Survival,
            IsPublished = true,
            IsPublic = true,
            Scenes = [
                new() {
                    Id = sceneId,
                    Name = "Original Scene",
                    ZoomLevel = 1,
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
        var data = new ClonedAdventureData { TemplateId = originalId, IncludeScenes = false };

        // Act
        var clone = Cloner.CloneAdventure(original, _userId, data);

        // Assert
        clone.Should().NotBeNull();
        clone.Id.Should().NotBe(originalId);
        clone.CampaignId.Should().Be(original.CampaignId);
        clone.Name.Should().Be($"{original.Name} (Copy)");
        clone.Description.Should().Be(original.Description);
        clone.Display.Should().Be(original.Display);
        clone.Type.Should().Be(original.Type);
        clone.IsPublished.Should().Be(original.IsPublished);
        clone.IsPublic.Should().Be(original.IsPublic);
        clone.Scenes.Should().BeEmpty();
    }

    [Fact]
    public void CloneScene_CopiesBasicProperties() {
        // Arrange
        var originalId = Guid.NewGuid();
        var original = new Scene {
            Id = originalId,
            Name = "Original Scene",
            Description = "Original scene description",
            ZoomLevel = 1,
            Stage = new(),
            Grid = new() {
                Type = GridType.Square,
                CellSize = new(50, 50),
                Offset = new(0, 0),
                Snap = true,
            },
            Assets = [
                new() {
                    Name = "Asset 1",
                    Position = new(20, 30),
                    Scale = 0.5f,
                    Elevation = 1,
                    Rotation = 45,
                    IsLocked = true,
                    ControlledBy = Guid.NewGuid(),
                },
                new() {
                    Name = "Asset 2",
                    Position = new(5, 10),
                    Scale = 1.5f,
                    Elevation = 2,
                    Rotation = -45,
                    IsLocked = false,
                    ControlledBy = Guid.NewGuid(),
                },
            ],
        };

        // Act
        var clone = Cloner.CloneScene(original, _userId);

        // Assert
        clone.Should().NotBeNull();
        clone.Id.Should().NotBe(originalId);
        clone.Name.Should().Be(original.Name);
        clone.Description.Should().Be(original.Description);
        clone.Stage.Should().BeEquivalentTo(original.Stage);
        clone.Assets.Should().BeEquivalentTo(original.Assets, options =>
            options.WithMapping<SceneAsset>(originalAsset => originalAsset.IsLocked, _ => false)
                   .WithMapping<SceneAsset>(originalAsset => originalAsset.ControlledBy, _ => _userId));
    }

    [Fact]
    public void CloneScene_ClonesSceneAssets() {
        // Arrange
        var originalId = Guid.NewGuid();
        var original = new Scene {
            Id = originalId,
            Name = "Original Scene",
            Assets = [
                new() {
                    Number = 1,
                    Name = "Asset 1",
                    Position = new(20, 30),
                    Scale = 0.5f,
                    Elevation = 1f,
                    Rotation = 45f,
                    IsLocked = true,
                    ControlledBy = Guid.NewGuid(),
                },
            ],
            Stage = new(),
        };

        // Act
        var clone = Cloner.CloneScene(original, _userId);

        // Assert
        clone.Assets.Should().HaveCount(1);
        clone.Assets[0].Name.Should().Be("Asset 1");
        clone.Assets[0].Position.X.Should().Be(10);
        clone.Assets[0].Position.Y.Should().Be(15);
        clone.Assets[0].Scale.Should().Be(1.5f);
        clone.Assets[0].IsLocked.Should().BeTrue();
    }

    [Fact]
    public void CloneSceneAsset_CreatesNewAssetWithCorrectProperties() {
        // Arrange
        var userId = Guid.NewGuid();
        var controlledById = Guid.NewGuid();
        var original = new SceneAsset {
            Number = 1,
            Name = "Original Asset",
            Position = new(20, 30),
            Scale = 0.5f,
            Elevation = 1f,
            Rotation = 45f,
            IsLocked = true,
            ControlledBy = controlledById,
        };

        // Act
        var clone = Cloner.CloneSceneAsset(original, userId);

        // Assert
        clone.Should().NotBeNull();
        clone.Number.Should().Be(original.Number);
        clone.Name.Should().Be(original.Name);
        clone.Position.Should().BeEquivalentTo(original.Position);
        clone.Scale.Should().Be(original.Scale);
        clone.IsLocked.Should().BeFalse();
        clone.ControlledBy.Should().Be(userId);
    }
}