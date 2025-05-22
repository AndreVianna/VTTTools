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
            Name = "Original Adventure",
            ImageId = Guid.NewGuid(),
            Description = "Adventure description",
            Type = AdventureType.Survival,
            IsPublished = true,
            IsPublic = true,
            Scenes = [
                new() {
                    Id = sceneId,
                    Name = "Original Scene",
                    Stage = new() {
                        ZoomLevel = 1f,
                        Grid = new() {
                            Type = GridType.Square,
                            Cell = new(),
                        },
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
        clone.ImageId.Should().Be(original.ImageId);
        clone.Type.Should().Be(original.Type);
        clone.IsPublished.Should().Be(original.IsPublished);
        clone.IsPublic.Should().Be(original.IsPublic);
        clone.Scenes.Should().BeEquivalentTo(original.Scenes);
    }

    [Fact]
    public void CloneAdventure_WithIncludeScenesFalse_CopiesOnlyBasicProperties() {
        // Arrange
        var originalId = Guid.NewGuid();
        var original = new Adventure {
            Id = originalId,
            OwnerId = Guid.NewGuid(), // Different owner
            CampaignId = _campaignId,
            Name = "Original Adventure",
            ImageId = Guid.NewGuid(),
            Description = "Adventure description",
            Type = AdventureType.Survival,
            IsPublished = true,
            IsPublic = true,
            Scenes = [
                new() {
                    Id = originalId,
                    Name = "Original Scene",
                    Stage = new() {
                        ZoomLevel = 1,
                        Grid = new() {
                            Type = GridType.Square,
                            Cell = new(),
                        },
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
        clone.ImageId.Should().Be(original.ImageId);
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
            Stage = new() {
                ZoomLevel = 1f,
                Grid = new() {
                    Type = GridType.Square,
                    Cell = new(),
                },
            },
            SceneAssets = [
                new() {
                    Name = "Asset 1",
                    Position = new() { X = 20, Y = 30 },
                    Scale = new() { X = 0.5f, Y = 0.5f },
                    Elevation = 1f,
                    Rotation = 45f,
                    IsLocked = true,
                    ControlledBy = Guid.NewGuid(),
                },
                new() {
                    Name = "Asset 2",
                    Position = new() { X = 5, Y = 10 },
                    Scale = new() { X = 1.5f, Y = 1.5f },
                    Elevation = 2f,
                    Rotation = -45f,
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
        clone.SceneAssets.Should().BeEquivalentTo(original.SceneAssets, options =>
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
            SceneAssets = [
                new() {
                    Number = 1,
                    Name = "Asset 1",
                    Position = new() { X = 20, Y = 30 },
                    Scale = new() { X = 0.5f, Y = 0.5f },
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
        clone.SceneAssets.Should().HaveCount(1);
        var clonedAsset = clone.SceneAssets.Single();
        clonedAsset.Name.Should().Be("Asset 1");
        clonedAsset.Position.X.Should().Be(10);
        clonedAsset.Position.Y.Should().Be(15);
        clonedAsset.Scale.Should().Be(1.5f);
        clonedAsset.IsLocked.Should().BeTrue();
    }

    [Fact]
    public void CloneSceneAsset_CreatesNewAssetWithCorrectProperties() {
        // Arrange
        var userId = Guid.NewGuid();
        var controlledById = Guid.NewGuid();
        var original = new SceneAsset {
            Number = 1,
            Name = "Original Asset",
            Position = new() { X = 20, Y = 30 },
            Scale = new() { X = 0.5f, Y = 0.5f },
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