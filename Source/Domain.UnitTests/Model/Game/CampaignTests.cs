namespace VttTools.Model.Game;

public class CampaignTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var campaign = new Campaign();

        // Assert
        campaign.Id.Should().BeEmpty();
        campaign.OwnerId.Should().BeEmpty();
        campaign.ParentId.Should().BeNull();
        campaign.Epic.Should().BeNull();
        campaign.TemplateId.Should().BeNull();
        campaign.Adventures.Should().NotBeNull();
        campaign.Adventures.Should().BeEmpty();
        campaign.Name.Should().BeEmpty();
        campaign.Visibility.Should().Be(Visibility.Hidden);
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        var id = Guid.NewGuid();
        var ownerId = Guid.NewGuid();
        var parentId = Guid.NewGuid();
        var epic = new Epic();
        var templateId = Guid.NewGuid();
        var adventures = new HashSet<Adventure> { new() };
        const string name = "Test Campaign";
        const Visibility visibility = Visibility.Public;

        // Act
        var campaign = new Campaign {
            Id = id,
            OwnerId = ownerId,
            ParentId = parentId,
            Epic = epic,
            TemplateId = templateId,
            Adventures = adventures,
            Name = name,
            Visibility = visibility,
        };

        // Assert
        campaign.Id.Should().Be(id);
        campaign.OwnerId.Should().Be(ownerId);
        campaign.ParentId.Should().Be(parentId);
        campaign.Epic.Should().Be(epic);
        campaign.TemplateId.Should().Be(templateId);
        campaign.Adventures.Should().BeSameAs(adventures);
        campaign.Name.Should().Be(name);
        campaign.Visibility.Should().Be(visibility);
    }

    [Fact]
    public void AdventuresCollection_WhenAdded_ContainsAddedAdventure() {
        // Arrange
        var campaign = new Campaign();
        var adventure = new Adventure {
            Id = Guid.NewGuid(),
            Name = "Test Adventure",
            OwnerId = Guid.NewGuid(),
        };

        // Act
        campaign.Adventures.Add(adventure);

        // Assert
        campaign.Adventures.Should().ContainSingle();
        campaign.Adventures.Should().Contain(adventure);
    }
}