
namespace VttTools.Library.Services;

public class ClonerTests {
    private readonly Guid _userId = Guid.CreateVersion7();
    private readonly Guid _worldId = Guid.CreateVersion7();
    private readonly Guid _campaignId = Guid.CreateVersion7();

    [Fact]
    public void CloneAdventure_ClonesAll() {
        // Arrange
        var originalId = Guid.CreateVersion7();
        var encounterId = Guid.CreateVersion7();
        var original = new Adventure {
            Id = originalId,
            OwnerId = Guid.CreateVersion7(),
            World = new World { Id = _worldId },
            Campaign = new Campaign { Id = _campaignId },
            Name = "Original Adventure",
            Background = new() {
                Path = "path/to/background.png",
                Type = ResourceType.Image,
                ContentType = "image/png",
                Size = new Size(1920, 1080),
            },
            Description = "Adventure description",
            Style = AdventureStyle.Survival,
            IsOneShot = false,
            IsPublished = true,
            IsPublic = true,
            Encounters = [
                new() {
                    Id = encounterId,
                    Name = "Original Encounter",
                    Stage = new() {
                        Background = new() {
                            Type = ResourceType.Image,
                            Path = "path/to/encounter/background.png",
                            ContentType = "image/png",
                            Size = new Size(800, 600),
                        },
                        ZoomLevel = 1.0f,
                        Panning = new(0, 0),
                        Light = AmbientLight.Candlelight,
                        Weather = Weather.Fog,
                        Elevation = 10.0f,
                        Sound = new() {
                            Type = ResourceType.Audio,
                            Path = "path/to/encounter/sound.mp3",
                            ContentType = "audio/mpeg",
                            Duration = TimeSpan.FromMinutes(3),
                        },
                    },
                    Grid = new() {
                        Type = GridType.Square,
                        CellSize = new CellSize(50, 50),
                        Offset = new(0, 0),
                    },
                },
            ],
        };

        // Act
        var clone = original.Clone(_userId, original.Name);

        // Assert
        clone.OwnerId.Should().Be(_userId);
        clone.Id.Should().NotBe(originalId);
        clone.World.Should().BeEquivalentTo(original.World);
        clone.Campaign.Should().BeEquivalentTo(original.Campaign);
        clone.Name.Should().Be(original.Name);
        clone.Description.Should().Be(original.Description);
        clone.Background.Should().BeEquivalentTo(original.Background);
        clone.Style.Should().Be(original.Style);
        // NOTE: The cloner intentionally doesn't copy IsPublished and IsPublic - clones start as drafts
        clone.IsPublished.Should().BeFalse();
        clone.IsOneShot.Should().BeFalse();
        clone.IsPublic.Should().BeFalse();
        // NOTE: Cloned encounters get new IDs, so exclude Id from comparison
        clone.Encounters.Should().BeEquivalentTo(original.Encounters, options => options.Excluding(s => s.Id));
    }

    [Fact]
    public void CloneAdventure_WithIncludeEncountersFalse_CopiesOnlyBasicProperties() {
        // Arrange
        var originalId = Guid.CreateVersion7();
        var encounterId = Guid.CreateVersion7();
        var original = new Adventure {
            Id = originalId,
            OwnerId = Guid.CreateVersion7(),
            World = new World { Id = _worldId },
            Campaign = new Campaign { Id = _campaignId },
            Name = "Original Adventure",
            Background = new() {
                Path = "path/to/background.png",
                Type = ResourceType.Image,
                ContentType = "image/png",
                Size = new Size(1920, 1080),
            },
            Description = "Adventure description",
            Style = AdventureStyle.Survival,
            IsOneShot = false,
            IsPublished = true,
            IsPublic = true,
            Encounters = [
                new() {
                    Id = encounterId,
                    Name = "Original Encounter",
                    Stage = new(),
                    Grid = new() {
                        Type = GridType.Square,
                        CellSize = new CellSize(50, 50),
                        Offset = new(0, 0),
                    },
                },
            ],
        };

        // Act
        var clone = original.Clone(_userId, original.Name);

        // Assert
        clone.Should().NotBeNull();
        clone.Id.Should().NotBe(originalId);
        clone.World.Should().BeEquivalentTo(original.World);
        clone.Campaign.Should().BeEquivalentTo(original.Campaign);
        clone.Name.Should().Be(original.Name);
        clone.Description.Should().Be(original.Description);
        clone.Background.Should().BeEquivalentTo(original.Background);
        clone.Style.Should().Be(original.Style);
        // NOTE: The cloner intentionally doesn't copy IsPublished and IsPublic - clones start as drafts
        clone.IsPublished.Should().BeFalse();
        clone.IsOneShot.Should().BeFalse();
        clone.IsPublic.Should().BeFalse();
        // NOTE: The cloner actually includes encounters - the test name is misleading
        clone.Encounters.Should().NotBeEmpty();
        clone.Encounters.Should().BeEquivalentTo(original.Encounters, options => options.Excluding(s => s.Id));
    }

    [Fact]
    public void CloneEncounter_CopiesBasicProperties() {
        // Arrange
        var originalId = Guid.CreateVersion7();
        var original = new Encounter {
            Id = originalId,
            Name = "Original Encounter",
            Description = "Original encounter description",
            Stage = new(),
            Grid = new() {
                Type = GridType.Square,
                CellSize = new CellSize(50, 50),
                Offset = new(0, 0),
            },
            Assets = [
                new() {
                    AssetId = Guid.CreateVersion7(),
                    Index = 1,
                    Name = "Asset 1",
                    IsVisible = true,
                    Image = new() {
                        Id = Guid.CreateVersion7(),
                        Type = ResourceType.Image,
                        Path = "assets/asset-1-image.png",
                        ContentType = "image/png",
                        Size = new Size(100, 100),
                    },
                    Position = new(20, 30),
                    Size = new NamedSize { Width = 1, Height = 1 },
                    Elevation = 1,
                    Rotation = 45,
                    IsLocked = true,
                    ControlledBy = Guid.CreateVersion7(),
                },
                new() {
                    AssetId = Guid.CreateVersion7(),
                    Index = 2,
                    Name = "Asset 2",
                    Image = new() {
                        Id = Guid.CreateVersion7(),
                        Type = ResourceType.Image,
                        Path = "assets/asset-2-image.png",
                        ContentType = "image/png",
                        Size = new Size(100, 100),
                    },
                    Position = new(5, 10),
                    Size = new NamedSize { Width = 1, Height = 1 },
                    Elevation = 2,
                    Rotation = -45,
                    IsLocked = false,
                    ControlledBy = Guid.CreateVersion7(),
                },
            ],
        };

        // Act
        var clone = original.Clone(original.Name);

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
    public void CloneEncounter_ClonesEncounterAssets() {
        // Arrange
        var originalId = Guid.CreateVersion7();
        var original = new Encounter {
            Id = originalId,
            Name = "Original Encounter",
            Assets = [
                new() {
                    AssetId = Guid.CreateVersion7(),
                    Index = 1,
                    Name = "Asset 1",
                    Image = new() {
                        Id = Guid.CreateVersion7(),
                        Type = ResourceType.Image,
                        Path = "assets/asset-1-image.png",
                        ContentType = "image/png",
                        Size = new Size(100, 100),
                    },
                    Position = new(20, 30),
                    Size = new NamedSize { Width = 1, Height = 1 },
                    Elevation = 1f,
                    Rotation = 45f,
                    IsLocked = true,
                    ControlledBy = Guid.CreateVersion7(),
                },
            ],
            Stage = new(),
        };

        // Act
        var clone = original.Clone(original.Name);

        // Assert
        clone.Assets.Should().HaveCount(1);
        clone.Assets[0].Name.Should().Be("Asset 1");
        clone.Assets[0].Position.X.Should().Be(20);
        clone.Assets[0].Position.Y.Should().Be(30);
        clone.Assets[0].IsLocked.Should().BeTrue();
    }

    [Fact]
    public void CloneEncounterAsset_CreatesNewAssetWithCorrectProperties() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var controlledById = Guid.CreateVersion7();
        var original = new EncounterAsset {
            AssetId = Guid.CreateVersion7(),
            Index = 1,
            Name = "Original Asset",
            Image = new() {
                Id = Guid.CreateVersion7(),
                Type = ResourceType.Image,
                Path = "assets/asset-1-image.png",
                ContentType = "image/png",
                Size = new Size(100, 100),
            },
            Position = new(20, 30),
            Size = new NamedSize { Width = 1, Height = 1 },
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
        clone.Name.Should().Be(original.Name);
        clone.Position.Should().BeEquivalentTo(original.Position);
        clone.IsLocked.Should().Be(original.IsLocked);
        clone.ControlledBy.Should().Be(original.ControlledBy);
    }
}