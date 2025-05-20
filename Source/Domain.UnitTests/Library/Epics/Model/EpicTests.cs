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
        var id = Guid.NewGuid();
        const string name = "Some Epic";
        const string description = "Some Description";
        var ownerId = Guid.NewGuid();
        var imageId = Guid.NewGuid();
        var campaign = new Campaign {
            Id = Guid.NewGuid(),
        };

        // Act
        var epic = new Epic {
            Id = id,
            Name = name,
            Description = description,
            OwnerId = ownerId,
            ImageId = imageId,
            IsPublished = true,
            IsPublic = true,
            Campaigns = [campaign],
        };

        // Assert
        epic.Id.Should().Be(id);
        epic.Name.Should().Be(name);
        epic.Description.Should().Be(description);
        epic.OwnerId.Should().Be(ownerId);
        epic.ImageId.Should().Be(imageId);
        epic.IsPublished.Should().BeTrue();
        epic.IsPublic.Should().BeTrue();
        epic.Campaigns.Should().ContainSingle(c => c.Equals(campaign));
    }
}