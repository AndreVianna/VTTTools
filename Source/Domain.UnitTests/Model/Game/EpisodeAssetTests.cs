namespace VttTools.Model.Game;

public class EpisodeAssetTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var episodeAsset = new EpisodeAsset();

        // Assert
        episodeAsset.EpisodeId.Should().BeEmpty();
        episodeAsset.AssetId.Should().BeEmpty();
        episodeAsset.Episode.Should().BeNull();
        episodeAsset.Asset.Should().BeNull();
        episodeAsset.Name.Should().BeEmpty();
        episodeAsset.Position.Should().NotBeNull();
        episodeAsset.Position.Left.Should().Be(0);
        episodeAsset.Position.Top.Should().Be(0);
        episodeAsset.Scale.Should().Be(1.0);
        episodeAsset.IsLocked.Should().BeFalse();
        episodeAsset.ControlledBy.Should().BeNull();
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var assetId = Guid.NewGuid();
        var episode = new Episode();
        var asset = new Asset();
        const string name = "Test Asset";
        var position = new Position { Left = 10, Top = 20 };
        const double scale = 1.5;
        const bool isLocked = true;
        var controlledBy = Guid.NewGuid();

        // Act
        var episodeAsset = new EpisodeAsset {
            EpisodeId = episodeId,
            AssetId = assetId,
            Episode = episode,
            Asset = asset,
            Name = name,
            Position = position,
            Scale = scale,
            IsLocked = isLocked,
            ControlledBy = controlledBy,
        };

        // Assert
        episodeAsset.EpisodeId.Should().Be(episodeId);
        episodeAsset.AssetId.Should().Be(assetId);
        episodeAsset.Episode.Should().BeSameAs(episode);
        episodeAsset.Asset.Should().BeSameAs(asset);
        episodeAsset.Name.Should().Be(name);
        episodeAsset.Position.Should().Be(position);
        episodeAsset.Scale.Should().Be(scale);
        episodeAsset.IsLocked.Should().Be(isLocked);
        episodeAsset.ControlledBy.Should().Be(controlledBy);
    }
}