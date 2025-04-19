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
        episode.IsTemplate.Should().BeFalse();
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
        const string name = "Some Episode";
        var ownerId = Guid.NewGuid();
        var parentId = Guid.NewGuid();
        var adventure = new Adventure();
        var templateId = Guid.NewGuid();
        const bool isTemplate = true;
        var stage = new Stage();
        var episodeAsset = new EpisodeAsset();

        // Act
        var episode = new Episode {
            Id = id,
            OwnerId = ownerId,
            Name = name,
            ParentId = parentId,
            Adventure = adventure,
            IsTemplate = isTemplate,
            TemplateId = templateId,
            Visibility = Visibility.Public,
            Stage = stage,
            EpisodeAssets = [episodeAsset],
        };

        // Assert
        episode.Id.Should().Be(id);
        episode.OwnerId.Should().Be(ownerId);
        episode.ParentId.Should().Be(parentId);
        episode.Adventure.Should().BeSameAs(adventure);
        episode.IsTemplate.Should().Be(isTemplate);
        episode.TemplateId.Should().Be(templateId);
        episode.Name.Should().Be(name);
        episode.Visibility.Should().Be(Visibility.Public);
        episode.Stage.Should().BeSameAs(stage);
        episode.EpisodeAssets.Should().ContainSingle(ea => ea.Equals(episodeAsset));
    }
}