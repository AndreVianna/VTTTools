namespace VttTools.Library.Campaigns.Model;

public class CampaignTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var campaign = new Campaign();

        // Assert
        campaign.Id.Should().NotBeEmpty();
        campaign.OwnerId.Should().BeEmpty();
        campaign.World.Should().BeNull();
        campaign.Adventures.Should().BeEmpty();
        campaign.Name.Should().BeEmpty();
        campaign.Description.Should().BeEmpty();
        campaign.IsPublished.Should().BeFalse();
        campaign.IsPublic.Should().BeFalse();
        campaign.Background.Should().BeNull();
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        var id = Guid.CreateVersion7();
        const string name = "Some World";
        const string description = "Some Description";
        var ownerId = Guid.CreateVersion7();
        var world = new World { Id = Guid.CreateVersion7() };
        var display = new Resource {
            Id = Guid.CreateVersion7(),
            Type = ResourceType.Image,
            Path = "assets/campaign-background.png",
            Metadata = new ResourceMetadata {
                ContentType = "image/png",
                ImageSize = new Size(1920, 1080),
            },
            Tags = ["fantasy", "adventure"],
        };
        var adventure = new Adventure {
            Id = Guid.CreateVersion7(),
        };

        // Act
        var campaign = new Campaign {
            Id = id,
            Name = name,
            Description = description,
            OwnerId = ownerId,
            World = world,
            Background = display,
            IsPublished = true,
            IsPublic = true,
            Adventures = [adventure],
        };

        // Assert
        campaign.Id.Should().Be(id);
        campaign.Name.Should().Be(name);
        campaign.Description.Should().Be(description);
        campaign.OwnerId.Should().Be(ownerId);
        campaign.World.Should().BeEquivalentTo(world);
        campaign.Background.Should().BeEquivalentTo(display);
        campaign.IsPublished.Should().BeTrue();
        campaign.IsPublic.Should().BeTrue();
        campaign.Adventures.Should().ContainSingle(c => c.Equals(adventure));
    }
}