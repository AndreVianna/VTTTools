namespace VttTools.Library.Campaigns.Model;

public class CampaignTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var campaign = new Campaign();

        // Assert
        campaign.Id.Should().NotBeEmpty();
        campaign.OwnerId.Should().BeEmpty();
        campaign.EpicId.Should().BeNull();
        campaign.Adventures.Should().BeEmpty();
        campaign.Name.Should().BeEmpty();
        campaign.Description.Should().BeEmpty();
        campaign.IsPublished.Should().BeFalse();
        campaign.IsPublic.Should().BeFalse();
        campaign.ImageId.Should().BeNull();
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        var id = Guid.NewGuid();
        const string name = "Some Epic";
        const string description = "Some Description";
        var ownerId = Guid.NewGuid();
        var epicId = Guid.NewGuid();
        var imageId = Guid.NewGuid();
        var adventure = new Adventure {
            Id = Guid.NewGuid(),
        };

        // Act
        var campaign = new Campaign {
            Id = id,
            Name = name,
            Description = description,
            OwnerId = ownerId,
            EpicId = epicId,
            ImageId = imageId,
            IsPublished = true,
            IsPublic = true,
            Adventures = [adventure],
        };

        // Assert
        campaign.Id.Should().Be(id);
        campaign.Name.Should().Be(name);
        campaign.Description.Should().Be(description);
        campaign.OwnerId.Should().Be(ownerId);
        campaign.EpicId.Should().Be(epicId);
        campaign.ImageId.Should().Be(imageId);
        campaign.IsPublished.Should().BeTrue();
        campaign.IsPublic.Should().BeTrue();
        campaign.Adventures.Should().ContainSingle(c => c.Equals(adventure));
    }
}