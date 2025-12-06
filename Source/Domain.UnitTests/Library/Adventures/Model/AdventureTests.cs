namespace VttTools.Library.Adventures.Model;

public class AdventureTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var adventure = new Adventure();

        // Assert
        adventure.Id.Should().NotBeEmpty();
        adventure.OwnerId.Should().BeEmpty();
        adventure.World.Should().BeNull();
        adventure.Campaign.Should().BeNull();
        adventure.Encounters.Should().NotBeNull();
        adventure.Encounters.Should().BeEmpty();
        adventure.Name.Should().BeEmpty();
        adventure.Description.Should().BeEmpty();
        adventure.Style.Should().Be(AdventureStyle.Generic);
        adventure.Background.Should().BeNull();
        adventure.IsPublished.Should().BeFalse();
        adventure.IsOneShot.Should().BeFalse();
        adventure.IsPublic.Should().BeFalse();
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        var id = Guid.CreateVersion7();
        const string name = "Some Adventure";
        const string description = "Adventure description";
        const AdventureStyle style = AdventureStyle.DungeonCrawl;
        var display = new ResourceInfo {
            Id = Guid.CreateVersion7(),
            ResourceType = ResourceType.Background,
            Path = "assets/adventure-background.png",
            ContentType = "image/png",
            Size = new Size(1920, 1080),
        };
        const bool isVisible = true;
        const bool isPublic = true;
        const bool isOneShot = true;
        var ownerId = Guid.CreateVersion7();
        var world = new World { Id = Guid.CreateVersion7() };
        var campaign = new Campaign { Id = Guid.CreateVersion7() };
        var encounter = new Encounter {
            Id = Guid.CreateVersion7(),
        };

        // Act
        var adventure = new Adventure {
            Id = id,
            Name = name,
            Description = description,
            Style = style,
            Background = display,
            IsPublished = isVisible,
            IsOneShot = isOneShot,
            IsPublic = isPublic,
            OwnerId = ownerId,
            World = world,
            Campaign = campaign,
            Encounters = [encounter],
        };

        // Assert
        adventure.Id.Should().Be(id);
        adventure.Name.Should().Be(name);
        adventure.Description.Should().Be(description);
        adventure.Style.Should().Be(style);
        adventure.Background.Should().BeEquivalentTo(display);
        adventure.IsPublished.Should().Be(isVisible);
        adventure.IsOneShot.Should().Be(isOneShot);
        adventure.IsPublic.Should().Be(isPublic);
        adventure.OwnerId.Should().Be(ownerId);
        adventure.World.Should().BeEquivalentTo(world);
        adventure.Campaign.Should().BeEquivalentTo(campaign);
        adventure.Encounters.Should().ContainSingle(e => e.Equals(encounter));
    }
}