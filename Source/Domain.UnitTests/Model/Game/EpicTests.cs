namespace VttTools.Model.Game;

public class EpicTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var epic = new Epic();

        // Assert
        epic.Id.Should().BeEmpty();
        epic.OwnerId.Should().BeEmpty();
        epic.TemplateId.Should().BeNull();
        epic.Campaigns.Should().NotBeNull();
        epic.Campaigns.Should().BeEmpty();
        epic.Name.Should().BeEmpty();
        epic.Visibility.Should().Be(Visibility.Hidden);
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        var id = Guid.NewGuid();
        const string name = "Some Epic";
        var ownerId = Guid.NewGuid();
        var templateId = Guid.NewGuid();
        const Visibility visibility = Visibility.Public;
        var campaign = new Campaign {
            Id = Guid.NewGuid(),
        };

        // Act
        var epic = new Epic {
            Id = id,
            Name = name,
            OwnerId = ownerId,
            Visibility = visibility,
            TemplateId = templateId,
            Campaigns = [campaign],
        };

        // Assert
        epic.Id.Should().Be(id);
        epic.Name.Should().Be(name);
        epic.OwnerId.Should().Be(ownerId);
        epic.Visibility.Should().Be(visibility);
        epic.TemplateId.Should().Be(templateId);
        epic.Campaigns.Should().ContainSingle(c => c.Equals(campaign));
    }
}