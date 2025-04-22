namespace VttTools.Model.Game;

public class AdventureTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var adventure = new Adventure();

        // Assert
        adventure.Id.Should().NotBeEmpty();
        adventure.OwnerId.Should().BeEmpty();
        adventure.ParentId.Should().BeNull();
        adventure.Campaign.Should().BeNull();
        adventure.TemplateId.Should().BeNull();
        adventure.Episodes.Should().NotBeNull();
        adventure.Episodes.Should().BeEmpty();
        adventure.Name.Should().BeEmpty();
        adventure.Visibility.Should().Be(Visibility.Hidden);
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        var id = Guid.NewGuid();
        const string name = "Some Adventure";
        var ownerId = Guid.NewGuid();
        var parentId = Guid.NewGuid();
        var templateId = Guid.NewGuid();
        const Visibility visibility = Visibility.Public;
        var campaign = new Campaign {
            Id = parentId,
        };
        var episode = new Episode {
            Id = Guid.NewGuid(),
        };

        // Act
        var adventure = new Adventure {
            Id = id,
            Name = name,
            OwnerId = ownerId,
            Visibility = visibility,
            TemplateId = templateId,
            ParentId = parentId,
            Campaign = campaign,
            Episodes = [episode],
        };

        // Assert
        adventure.Id.Should().Be(id);
        adventure.Name.Should().Be(name);
        adventure.OwnerId.Should().Be(ownerId);
        adventure.Visibility.Should().Be(visibility);
        adventure.TemplateId.Should().Be(templateId);
        adventure.ParentId.Should().Be(parentId);
        adventure.Campaign.Should().Be(campaign);
        adventure.Episodes.Should().ContainSingle(e => e.Equals(episode));
    }
}