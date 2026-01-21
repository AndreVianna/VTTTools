namespace VttTools.Library.Worlds.Model;

public class WorldTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var world = new World();

        // Assert
        world.Id.Should().NotBeEmpty();
        world.OwnerId.Should().BeEmpty();
        world.Campaigns.Should().BeEmpty();
        world.Adventures.Should().BeEmpty();
        world.Name.Should().BeEmpty();
        world.Description.Should().BeEmpty();
        world.IsPublished.Should().BeFalse();
        world.IsPublic.Should().BeFalse();
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        var id = Guid.CreateVersion7();
        const string name = "Some World";
        const string description = "Some Description";
        var ownerId = Guid.CreateVersion7();
        var display = new ResourceMetadata {
            Id = Guid.CreateVersion7(),
            Path = "assets/world-background.png",
            ContentType = "image/png",
            Dimensions = new Size(1920, 1080),
        };
        var campaign = new Campaign { Id = Guid.CreateVersion7() };
        var adventure = new Adventure { Id = Guid.CreateVersion7() };

        // Act
        var world = new World {
            Id = id,
            Name = name,
            Description = description,
            OwnerId = ownerId,
            Background = display,
            IsPublished = true,
            IsPublic = true,
            Campaigns = [campaign],
            Adventures = [adventure],
        };

        // Assert
        world.Id.Should().Be(id);
        world.Name.Should().Be(name);
        world.Description.Should().Be(description);
        world.OwnerId.Should().Be(ownerId);
        world.Background.Should().BeEquivalentTo(display);
        world.IsPublished.Should().BeTrue();
        world.IsPublic.Should().BeTrue();
        world.Campaigns.Should().ContainSingle(c => c.Equals(campaign));
        world.Adventures.Should().ContainSingle(a => a.Equals(adventure));
    }
}