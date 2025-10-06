using VttTools.Media.Model;

namespace VttTools.Library.Adventures.Model;

public class AdventureTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var adventure = new Adventure();

        // Assert
        adventure.Id.Should().NotBeEmpty();
        adventure.OwnerId.Should().BeEmpty();
        adventure.CampaignId.Should().BeNull();
        adventure.Scenes.Should().NotBeNull();
        adventure.Scenes.Should().BeEmpty();
        adventure.Name.Should().BeEmpty();
        adventure.Description.Should().BeEmpty();
        adventure.Type.Should().Be(AdventureType.Generic);
        adventure.Background.Should().BeNull();
        adventure.IsPublished.Should().BeFalse();
        adventure.IsPublic.Should().BeFalse();
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        var id = Guid.NewGuid();
        const string name = "Some Adventure";
        const string description = "Adventure description";
        const AdventureType type = AdventureType.DungeonCrawl;
        var display = new Resource {
            Id = Guid.NewGuid(),
            Type = ResourceType.Image,
            Path = "assets/adventure-background.png",
            Metadata = new ResourceMetadata {
                ContentType = "image/png",
                ImageSize = new Size(1920, 1080),
            },
            Tags = ["adventure", "background"],
        };
        const bool isVisible = true;
        const bool isPublic = true;
        var ownerId = Guid.NewGuid();
        var campaignId = Guid.NewGuid();
        var scene = new Scene {
            Id = Guid.NewGuid(),
        };

        // Act
        var adventure = new Adventure {
            Id = id,
            Name = name,
            Description = description,
            Type = type,
            Background = display,
            IsPublished = isVisible,
            IsPublic = isPublic,
            OwnerId = ownerId,
            CampaignId = campaignId,
            Scenes = [scene],
        };

        // Assert
        adventure.Id.Should().Be(id);
        adventure.Name.Should().Be(name);
        adventure.Description.Should().Be(description);
        adventure.Type.Should().Be(type);
        adventure.Background.Should().BeEquivalentTo(display);
        adventure.IsPublished.Should().Be(isVisible);
        adventure.IsPublic.Should().Be(isPublic);
        adventure.OwnerId.Should().Be(ownerId);
        adventure.CampaignId.Should().Be(campaignId);
        adventure.Scenes.Should().ContainSingle(e => e.Equals(scene));
    }
}