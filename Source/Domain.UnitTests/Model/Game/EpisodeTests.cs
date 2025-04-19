namespace VttTools.Model.Game;

public class EpisodeTests {
    [Fact]
    public void Constructor_Default_InitializesWithDefaultValues() {
        // Act
        var episode = new Episode();

        // Assert
        episode.Id.Should().Be(Guid.Empty);
        episode.OwnerId.Should().Be(Guid.Empty);
        episode.ParentId.Should().Be(Guid.Empty);
        episode.Adventure.Should().BeNull();
        episode.IsTemplate.Should().BeTrue();
        episode.TemplateId.Should().BeNull();
        episode.Name.Should().BeEmpty();
        episode.Visibility.Should().Be(Visibility.Hidden);
        episode.Stage.Should().NotBeNull();
        episode.EpisodeAssets.Should().NotBeNull();
        episode.EpisodeAssets.Should().BeEmpty();
    }

    [Fact]
    public void Properties_WhenSet_RetainValues() {
        // Arrange
        var id = Guid.NewGuid();
        var ownerId = Guid.NewGuid();
        var parentId = Guid.NewGuid();
        var templateId = Guid.NewGuid();
        var adventure = new Adventure();
        var stage = new Stage();
        var episodeAssets = new HashSet<EpisodeAsset> { new() };

        // Act
        var episode = new Episode {
            Id = id,
            OwnerId = ownerId,
            ParentId = parentId,
            Adventure = adventure,
            IsTemplate = false,
            TemplateId = templateId,
            Name = "Test Episode",
            Visibility = Visibility.Public,
            Stage = stage,
            EpisodeAssets = episodeAssets
        };

        // Assert
        episode.Id.Should().Be(id);
        episode.OwnerId.Should().Be(ownerId);
        episode.ParentId.Should().Be(parentId);
        episode.Adventure.Should().BeSameAs(adventure);
        episode.IsTemplate.Should().BeFalse();
        episode.TemplateId.Should().Be(templateId);
        episode.Name.Should().Be("Test Episode");
        episode.Visibility.Should().Be(Visibility.Public);
        episode.Stage.Should().BeSameAs(stage);
        episode.EpisodeAssets.Should().BeSameAs(episodeAssets);
        episode.EpisodeAssets.Should().HaveCount(1);
    }

    [Fact]
    public void EpisodeAssets_WhenModified_UpdatesCollection() {
        // Arrange
        var episode = new Episode();
        var asset1 = new EpisodeAsset { AssetId = Guid.NewGuid() };
        var asset2 = new EpisodeAsset { AssetId = Guid.NewGuid() };

        // Act
        episode.EpisodeAssets.Add(asset1);
        episode.EpisodeAssets.Add(asset2);

        // Assert
        episode.EpisodeAssets.Should().HaveCount(2);
        episode.EpisodeAssets.Should().Contain(asset1);
        episode.EpisodeAssets.Should().Contain(asset2);
    }

    [Fact]
    public void Stage_Default_InitializesWithNewStageInstance() {
        // Act
        var episode = new Episode();

        // Assert
        episode.Stage.Should().NotBeNull();
        episode.Stage.Should().BeOfType<Stage>();
    }
}