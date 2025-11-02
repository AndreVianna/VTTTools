
namespace VttTools.Library.Epics.Model;

public class EpicTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var epic = new Epic();

        // Assert
        epic.Id.Should().NotBeEmpty();
        epic.OwnerId.Should().BeEmpty();
        epic.Campaigns.Should().BeEmpty();
        epic.Name.Should().BeEmpty();
        epic.Description.Should().BeEmpty();
        epic.IsPublished.Should().BeFalse();
        epic.IsPublic.Should().BeFalse();
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        var id = Guid.CreateVersion7();
        const string name = "Some Epic";
        const string description = "Some Description";
        var ownerId = Guid.CreateVersion7();
        var display = new Resource {
            Id = Guid.CreateVersion7(),
            Type = ResourceType.Image,
            Path = "assets/epic-background.png",
            Metadata = new ResourceMetadata {
                ContentType = "image/png",
                ImageSize = new Size(1920, 1080),
            },
            Tags = ["epic", "background"],
        };
        var campaign = new Campaign {
            Id = Guid.CreateVersion7(),
        };

        // Act
        var epic = new Epic {
            Id = id,
            Name = name,
            Description = description,
            OwnerId = ownerId,
            Background = display,
            IsPublished = true,
            IsPublic = true,
            Campaigns = [campaign],
        };

        // Assert
        epic.Id.Should().Be(id);
        epic.Name.Should().Be(name);
        epic.Description.Should().Be(description);
        epic.OwnerId.Should().Be(ownerId);
        epic.Background.Should().BeEquivalentTo(display);
        epic.IsPublished.Should().BeTrue();
        epic.IsPublic.Should().BeTrue();
        epic.Campaigns.Should().ContainSingle(c => c.Equals(campaign));
    }
}