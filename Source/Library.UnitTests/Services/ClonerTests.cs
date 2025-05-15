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
            IsListed = true,
            IsPublic = true,
            Scenes = [
                new() {
                    Id = sceneId,
                    Name = "Original Scene",
                    Stage = new() {
                        Source = "map.png",
                        Size = new() { Width = 10, Height = 20 },
                        Grid = new() {
                            Type = GridType.Square,
                            Offset = new() { Left = 5, Top = 5 },
                            CellSize = new() { Width = 1, Height = 1 },
                        },
                    },
                },
            ],
        };
        var data = new CloneAdventureData { TemplateId = originalId };

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
        clone.IsListed.Should().Be(original.IsListed);
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
            IsListed = true,
            IsPublic = true,
            Scenes = [
                new() {
                    Id = originalId,
                    Name = "Original Scene",
                    Stage = new() {
                        Source = "map.png",
                        Size = new() { Width = 10, Height = 20 },
                        Grid = new() {
                            Type = GridType.Square,
                            Offset = new() { Left = 5, Top = 5 },
                            CellSize = new() { Width = 1, Height = 1 },
                        },
                    },
                },
            ],
        };
        var data = new CloneAdventureData { TemplateId = originalId, IncludeScenes = false };

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
        clone.IsListed.Should().Be(original.IsListed);
        clone.IsPublic.Should().Be(original.IsPublic);
        clone.Scenes.Should().BeEmpty();
    }

    [Fact]
    public void CloneScene_CopiesBasicProperties() {
        // Arrange
        var originalId = Guid.NewGuid();
        var adventureId = Guid.NewGuid();
        var original = new Scene {
            Id = originalId,
            OwnerId = Guid.NewGuid(), // Different owner
            Name = "Original Scene",
            Description = "Original scene description",
            Stage = new() {
                Source = "map.png",
                Size = new() { Width = 10, Height = 20 },
                Grid = new() {
                    Type = GridType.Square,
                    Offset = new() { Left = 5, Top = 5 },
                    CellSize = new() { Width = 1, Height = 1 },
                },
            },
            SceneAssets = [
                new() {
                    SceneId = originalId,
                    AssetId = Guid.NewGuid(),
                    Name = "Asset 1",
                    Position = new() { Left = 10, Top = 15 },
                    Scale = 1.5f,
                    IsLocked = true,
                    ControlledBy = Guid.NewGuid(),
                },
                new() {
                    SceneId = originalId,
                    AssetId = Guid.NewGuid(),
                    Name = "Asset 2",
                    Position = new() { Left = 5, Top = 20 },
                    Scale = 0.5f,
                    IsLocked = false,
                    ControlledBy = Guid.NewGuid(),
                },
            ],
        };

        // Act
        var clone = Cloner.CloneScene(original, _userId, adventureId);

        // Assert
        clone.Should().NotBeNull();
        clone.Id.Should().NotBe(originalId);
        clone.OwnerId.Should().Be(_userId);
        clone.AdventureId.Should().Be(adventureId);
        clone.Name.Should().Be(original.Name);
        clone.Description.Should().Be(original.Description);
        clone.IsListed.Should().Be(original.IsListed);
        clone.IsPublic.Should().Be(original.IsPublic);
        clone.Stage.Should().BeEquivalentTo(original.Stage);
        clone.SceneAssets.Should().BeEquivalentTo(original.SceneAssets, options =>
            options.WithMapping<SceneAsset>(originalAsset => originalAsset.SceneId, _ => clone.Id)
                   .WithMapping<SceneAsset>(originalAsset => originalAsset.IsLocked, _ => false)
                   .WithMapping<SceneAsset>(originalAsset => originalAsset.ControlledBy, _ => _userId));
    }

    [Fact]
    public void CloneScene_ClonesSceneAssets() {
        // Arrange
        var originalId = Guid.NewGuid();
        var adventureId = Guid.NewGuid();
        var assetId = Guid.NewGuid();
        var original = new Scene {
            Id = originalId,
            AdventureId = adventureId,
            OwnerId = Guid.NewGuid(),
            Name = "Original Scene",
            SceneAssets = [
                new() {
                    SceneId = originalId,
                    AssetId = assetId,
                    Number = 1,
                    Name = "Asset 1",
                    Position = new() { Left = 10, Top = 15 },
                    Scale = 1.5f,
                    IsLocked = true,
                    ControlledBy = Guid.NewGuid(),
                },
            ],
            Stage = new(),
        };

        // Act
        var clone = Cloner.CloneScene(original, _userId, adventureId);

        // Assert
        clone.SceneAssets.Should().HaveCount(1);
        var clonedAsset = clone.SceneAssets.Single();
        clonedAsset.SceneId.Should().NotBeEmpty();
        clonedAsset.AssetId.Should().Be(assetId);
        clonedAsset.Name.Should().Be("Asset 1");
        clonedAsset.Position.Left.Should().Be(10);
        clonedAsset.Position.Top.Should().Be(15);
        clonedAsset.Scale.Should().Be(1.5f);
        clonedAsset.IsLocked.Should().BeTrue();
    }

    [Fact]
    public void CloneSceneAsset_CreatesNewAssetWithCorrectProperties() {
        // Arrange
        var sceneId = Guid.NewGuid();
        var assetId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var controlledById = Guid.NewGuid();
        var original = new SceneAsset {
            SceneId = sceneId, // Different scene ID
            AssetId = assetId,
            Number = 1,
            Name = "Original Asset",
            Position = new() { Left = 8, Top = 9 },
            Scale = 2.0f,
            IsLocked = true,
            ControlledBy = controlledById,
        };

        // Act
        var clone = Cloner.CloneSceneAsset(original, sceneId, userId);

        // Assert
        clone.Should().NotBeNull();
        clone.SceneId.Should().Be(sceneId);
        clone.AssetId.Should().Be(original.AssetId);
        clone.Number.Should().Be(original.Number);
        clone.Name.Should().Be(original.Name);
        clone.Position.Should().BeEquivalentTo(original.Position);
        clone.Scale.Should().Be(original.Scale);
        clone.IsLocked.Should().BeFalse();
        clone.ControlledBy.Should().Be(userId);
    }
}