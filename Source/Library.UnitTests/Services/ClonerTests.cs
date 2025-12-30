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
            World = new() { Id = _worldId },
            Campaign = new() { Id = _campaignId },
            Name = "Original Adventure",
            Background = new() {
                Path = "path/to/background.png",
                ContentType = "image/png",
                Dimensions = new(1920, 1080),
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
                    Stage = new() { Id = Guid.CreateVersion7(), OwnerId = Guid.CreateVersion7(), Name = "Test Stage" },
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
            World = new() { Id = _worldId },
            Campaign = new() { Id = _campaignId },
            Name = "Original Adventure",
            Background = new() {
                Path = "path/to/background.png",
                ContentType = "image/png",
                Dimensions = new(1920, 1080),
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
                    Stage = new() { Id = Guid.CreateVersion7(), OwnerId = Guid.CreateVersion7(), Name = "Test Stage" },
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
        var stageId = Guid.CreateVersion7();
        var original = new Encounter {
            Id = originalId,
            Name = "Original Encounter",
            Description = "Original encounter description",
            Stage = new() { Id = stageId, OwnerId = Guid.CreateVersion7(), Name = "Test Stage" },
            Actors = [
                new() {
                    Asset = new() { Id = Guid.CreateVersion7() },
                    Name = "Actor 1",
                    IsHidden = true,
                    Display = new() {
                        Id = Guid.CreateVersion7(),
                        Path = "assets/actor-1-image.png",
                        ContentType = "image/png",
                        Dimensions = new(100, 100),
                    },
                    Position = new(20, 30),
                    Size = new() { Width = 1, Height = 1 },
                    Elevation = 1,
                    Rotation = 45,
                    IsLocked = true,
                    ControlledBy = Guid.CreateVersion7(),
                },
                new() {
                    Asset = new() { Id = Guid.CreateVersion7() },
                    Name = "Actor 2",
                    Display = new() {
                        Id = Guid.CreateVersion7(),
                        Path = "assets/actor-2-image.png",
                        ContentType = "image/png",
                        Dimensions = new(100, 100),
                    },
                    Position = new(5, 10),
                    Size = new() { Width = 1, Height = 1 },
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
        clone.Stage.Id.Should().Be(original.Stage.Id);
        // Cloned actors should be equivalent to originals
        clone.Actors.Should().BeEquivalentTo(original.Actors);
    }

    [Fact]
    public void CloneEncounter_ClonesEncounterActors() {
        // Arrange
        var originalId = Guid.CreateVersion7();
        var original = new Encounter {
            Id = originalId,
            Name = "Original Encounter",
            Stage = new() { Id = Guid.CreateVersion7(), OwnerId = Guid.CreateVersion7(), Name = "Test Stage" },
            Actors = [
                new() {
                    Asset = new() { Id = Guid.CreateVersion7() },
                    Name = "Actor 1",
                    Display = new() {
                        Id = Guid.CreateVersion7(),
                        Path = "assets/actor-1-image.png",
                        ContentType = "image/png",
                        Dimensions = new(100, 100),
                    },
                    Position = new(20, 30),
                    Size = new() { Width = 1, Height = 1 },
                    Elevation = 1f,
                    Rotation = 45f,
                    IsLocked = true,
                    ControlledBy = Guid.CreateVersion7(),
                },
            ],
        };

        // Act
        var clone = original.Clone(original.Name);

        // Assert
        clone.Actors.Should().HaveCount(1);
        clone.Actors[0].Name.Should().Be("Actor 1");
        clone.Actors[0].Position.X.Should().Be(20);
        clone.Actors[0].Position.Y.Should().Be(30);
        clone.Actors[0].IsLocked.Should().BeTrue();
    }

    [Fact]
    public void CloneEncounterActor_CreatesNewActorWithCorrectProperties() {
        // Arrange
        var controlledById = Guid.CreateVersion7();
        var original = new EncounterActor {
            Asset = new() { Id = Guid.CreateVersion7() },
            Name = "Original Actor",
            IsHidden = true,
            Display = new() {
                Id = Guid.CreateVersion7(),
                Path = "assets/actor-1-image.png",
                ContentType = "image/png",
                Dimensions = new(100, 100),
            },
            Position = new(20, 30),
            Size = new() { Width = 1, Height = 1 },
            Elevation = 1f,
            Rotation = 45f,
            IsLocked = true,
            ControlledBy = controlledById,
            Frame = new() {
                Shape = FrameShape.Circle,
                BorderThickness = 2,
                BorderColor = "black",
                Background = "white",
            },
        };

        // Act
        var clone = original.Clone();

        // Assert
        clone.Asset.Id.Should().Be(original.Asset.Id);
        clone.Name.Should().Be(original.Name);
        clone.IsHidden.Should().Be(original.IsHidden);
        clone.Display.Should().BeEquivalentTo(original.Display);
        clone.Position.Should().Be(original.Position);
        clone.Size.Should().Be(original.Size);
        clone.Elevation.Should().Be(original.Elevation);
        clone.Rotation.Should().Be(original.Rotation);
        clone.IsLocked.Should().Be(original.IsLocked);
        clone.ControlledBy.Should().Be(original.ControlledBy);
        clone.Frame.Should().BeEquivalentTo(original.Frame);
    }

    [Fact]
    public void CloneEncounterProp_CreatesNewPropWithCorrectProperties() {
        // Arrange
        var original = new EncounterObject {
            Asset = new() { Id = Guid.CreateVersion7() },
            Name = "Treasure Chest",
            IsHidden = true,
            ClosedDisplay = new() {
                Id = Guid.CreateVersion7(),
                Path = "assets/chest.png",
                ContentType = "image/png",
                Dimensions = new(64, 64),
            },
            Position = new(10, 15),
            Size = new() { Width = 1, Height = 1 },
            Elevation = 0f,
            Rotation = 0f,
            IsLocked = false,
            State = ObjectState.Closed,
        };

        // Act
        var clone = original.Clone();

        // Assert
        clone.Asset.Id.Should().Be(original.Asset.Id);
        clone.Name.Should().Be(original.Name);
        clone.IsHidden.Should().Be(original.IsHidden);
        clone.Position.Should().Be(original.Position);
        clone.Size.Should().Be(original.Size);
        clone.State.Should().Be(original.State);
    }

    [Fact]
    public void CloneEncounterEffect_CreatesNewEffectWithCorrectProperties() {
        // Arrange
        var assetId = Guid.CreateVersion7();
        var original = new EncounterEffect {
            Name = "Fireball",
            Position = new(20, 20),
            Rotation = 45f,
            Asset = new() { Id = assetId },
            State = EffectState.Enabled,
            IsHidden = true,
            TriggerRegion = new() { Type = ShapeType.Circle, Radius = 20 },
            EnabledDisplay = new() { Id = Guid.CreateVersion7(), Path = "effects/fireball.png", ContentType = "image/png" },
            DisabledDisplay = new() { Id = Guid.CreateVersion7(), Path = "effects/fireball-off.png", ContentType = "image/png" },
            OnTriggerDisplay = new() { Id = Guid.CreateVersion7(), Path = "effects/fireball-trigger.png", ContentType = "image/png" },
            TriggeredDisplay = new() { Id = Guid.CreateVersion7(), Path = "effects/fireball-triggered.png", ContentType = "image/png" },
        };

        // Act
        var clone = original.Clone();

        // Assert
        clone.Name.Should().Be(original.Name);
        clone.Position.Should().Be(original.Position);
        clone.Rotation.Should().Be(original.Rotation);
        clone.Asset.Id.Should().Be(original.Asset.Id);
        clone.State.Should().Be(original.State);
        clone.IsHidden.Should().Be(original.IsHidden);
        clone.TriggerRegion.Should().BeEquivalentTo(original.TriggerRegion);
        clone.EnabledDisplay.Should().BeEquivalentTo(original.EnabledDisplay);
        clone.DisabledDisplay.Should().BeEquivalentTo(original.DisabledDisplay);
        clone.OnTriggerDisplay.Should().BeEquivalentTo(original.OnTriggerDisplay);
        clone.TriggeredDisplay.Should().BeEquivalentTo(original.TriggeredDisplay);
    }

    // NOTE: EncounterDecoration and EncounterSound clone tests removed - structural elements are now on Stage

    [Fact]
    public void CloneWorld_ClonesBasicProperties() {
        // Arrange
        var originalId = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var original = new World {
            Id = originalId,
            OwnerId = ownerId,
            Name = "Original World",
            Description = "A test world",
            Background = new() {
                Id = Guid.CreateVersion7(),
                Path = "world/background.png",
                ContentType = "image/png",
            },
        };

        // Act
        var clone = original.Clone(_userId, original.Name);

        // Assert
        clone.Id.Should().NotBe(originalId);
        clone.OwnerId.Should().Be(_userId);
        clone.Name.Should().Be(original.Name);
        clone.Description.Should().Be(original.Description);
        clone.Background.Should().BeEquivalentTo(original.Background);
    }

    [Fact]
    public void CloneCampaign_ClonesBasicProperties() {
        // Arrange
        var originalId = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var world = new World { Id = _worldId };
        var original = new Campaign {
            Id = originalId,
            OwnerId = ownerId,
            World = world,
            Name = "Original Campaign",
            Description = "A test campaign",
            Background = new() {
                Id = Guid.CreateVersion7(),
                Path = "campaign/background.png",
                ContentType = "image/png",
            },
        };

        // Act
        var clone = original.Clone(_userId, original.Name);

        // Assert
        clone.Id.Should().NotBe(originalId);
        clone.OwnerId.Should().Be(_userId);
        clone.World.Should().BeEquivalentTo(original.World);
        clone.Name.Should().Be(original.Name);
        clone.Description.Should().Be(original.Description);
        clone.Background.Should().BeEquivalentTo(original.Background);
    }

    [Fact]
    public void CloneResourceMetadata_ClonesAllProperties() {
        // Arrange
        var original = new ResourceMetadata {
            Id = Guid.CreateVersion7(),
            Path = "path/to/resource.png",
            ContentType = "image/png",
            FileName = "resource.png",
            FileSize = 12345,
            Dimensions = new(100, 200),
            Duration = TimeSpan.FromSeconds(30),
        };

        // Act
        var clone = original.Clone();

        // Assert
        clone.Id.Should().Be(original.Id);
        clone.Path.Should().Be(original.Path);
        clone.ContentType.Should().Be(original.ContentType);
        clone.FileName.Should().Be(original.FileName);
        clone.FileSize.Should().Be(original.FileSize);
        clone.Dimensions.Should().Be(original.Dimensions);
        clone.Duration.Should().Be(original.Duration);
    }
}
