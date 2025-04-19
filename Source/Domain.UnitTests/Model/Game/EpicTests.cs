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
        var ownerId = Guid.NewGuid();
        var templateId = Guid.NewGuid();
        var campaigns = new HashSet<Campaign> { new() };
        const string name = "Test Epic";
        const Visibility visibility = Visibility.Public;

        // Act
        var epic = new Epic {
            Id = id,
            OwnerId = ownerId,
            TemplateId = templateId,
            Campaigns = campaigns,
            Name = name,
            Visibility = visibility,
        };

        // Assert
        epic.Id.Should().Be(id);
        epic.OwnerId.Should().Be(ownerId);
        epic.TemplateId.Should().Be(templateId);
        epic.Campaigns.Should().BeSameAs(campaigns);
        epic.Name.Should().Be(name);
        epic.Visibility.Should().Be(visibility);
    }

    [Fact]
    public void CampaignsCollection_WhenAdded_ContainsAddedCampaign() {
        // Arrange
        var epic = new Epic();
        var campaign = new Campaign {
            Id = Guid.NewGuid(),
            Name = "Test Campaign",
            OwnerId = Guid.NewGuid(),
        };

        // Act
        epic.Campaigns.Add(campaign);

        // Assert
        epic.Campaigns.Should().ContainSingle();
        epic.Campaigns.Should().Contain(campaign);
    }
}