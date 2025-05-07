namespace VttTools.Library.Campaigns.Model;

public class CampaignTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var campaign = new Campaign();

        // Assert
        campaign.Id.Should().NotBeEmpty();
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
        const string name = "Some Epic";
        var ownerId = Guid.NewGuid();
        var parentId = Guid.NewGuid();
        var templateId = Guid.NewGuid();
        const Visibility visibility = Visibility.Public;
        var epic = new Epic {
            Id = parentId,
        };
        var adventure = new Adventure {
            Id = Guid.NewGuid(),
        };

        // Act
        var campaign = new Campaign {
            Id = id,
            Name = name,
            OwnerId = ownerId,
            Visibility = visibility,
            TemplateId = templateId,
            ParentId = parentId,
            Epic = epic,
            Adventures = [adventure],
        };

        // Assert
        campaign.Id.Should().Be(id);
        campaign.Name.Should().Be(name);
        campaign.OwnerId.Should().Be(ownerId);
        campaign.Visibility.Should().Be(visibility);
        campaign.TemplateId.Should().Be(templateId);
        campaign.ParentId.Should().Be(parentId);
        campaign.Epic.Should().Be(epic);
        campaign.Adventures.Should().ContainSingle(c => c.Equals(adventure));
    }
}