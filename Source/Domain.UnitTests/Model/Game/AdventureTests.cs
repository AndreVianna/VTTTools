namespace VttTools.Model.Game;

public class AdventureTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var adventure = new Adventure();

        // Assert
        adventure.Id.Should().BeEmpty();
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
    public void EpisodesCollection_WhenAdded_ContainsAddedEpisode() {
        // Arrange
        var campaign = new Campaign {
            Id = Guid.NewGuid(),
        };
        var adventure = new Adventure {
            Id = Guid.NewGuid(),
            Name = "Test Adventure",
            OwnerId = Guid.NewGuid(),
            Visibility = Visibility.Hidden,
            TemplateId = Guid.NewGuid(),
            ParentId = campaign.Id,
            Campaign = campaign,
            Episodes = [],
        };
        var episode = new Episode {
            Id = Guid.NewGuid(),
        };

        // Act
        adventure.Episodes.Add(episode);

        // Assert
        adventure.Episodes.Should().ContainSingle();
        adventure.Episodes.Should().Contain(episode);
    }
}