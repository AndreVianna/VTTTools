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

    [Fact]
    public void Position_WhenModified_UpdatesCoordinates() {
        // Arrange
        var episodeAsset = new EpisodeAsset();

        // Act
        episodeAsset.Position.Left = 25;
        episodeAsset.Position.Top = 35;

        // Assert
        episodeAsset.Position.Left.Should().Be(25);
        episodeAsset.Position.Top.Should().Be(35);
    }

    [Fact]
    public void Scale_WhenSetToNegativeValue_StillRetainsValue() {
        // Arrange
        var episodeAsset = new EpisodeAsset {
            // Act
            Scale = -0.5
        };

        // Assert
        episodeAsset.Scale.Should().Be(-0.5);
    }

    [Fact]
    public void ControlledBy_WhenSetAndCleared_UpdatesCorrectly() {
        // Arrange
        var episodeAsset = new EpisodeAsset();
        var userId = Guid.NewGuid();

        // Act & Assert - Set
        episodeAsset.ControlledBy = userId;
        episodeAsset.ControlledBy.Should().Be(userId);

        // Act & Assert - Clear
        episodeAsset.ControlledBy = null;
        episodeAsset.ControlledBy.Should().BeNull();
    }

    [Fact]
    public void IsLocked_WhenToggled_UpdatesCorrectly() {
        // Arrange
        var episodeAsset = new EpisodeAsset { IsLocked = false };

        // Act & Assert
        episodeAsset.IsLocked = true;
        episodeAsset.IsLocked.Should().BeTrue();

        episodeAsset.IsLocked = false;
        episodeAsset.IsLocked.Should().BeFalse();
    }
}