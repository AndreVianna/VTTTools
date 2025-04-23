namespace VttTools.GameService.Services.Game;

public class ClonerTests {
    private readonly Guid _userId = Guid.NewGuid();
    private readonly Guid _campaignId = Guid.NewGuid();

    [Fact]
    public void CloneAdventure_CopiesBasicProperties() {
        // Arrange
        var originalId = Guid.NewGuid();
        var original = new Adventure {
            Id = originalId,
            OwnerId = Guid.NewGuid(), // Different owner
            Name = "Original Adventure",
            Visibility = Visibility.Public,
            Episodes = [],
        };

        // Act
        var clone = Cloner.CloneAdventure(original, _campaignId, _userId);

        // Assert
        clone.Should().NotBeNull();
        clone.Id.Should().NotBe(originalId);
        clone.OwnerId.Should().Be(_userId);
        clone.ParentId.Should().Be(_campaignId);
        clone.Name.Should().Be(original.Name);
        clone.Visibility.Should().Be(original.Visibility);
        clone.TemplateId.Should().Be(originalId);
    }

    [Fact]
    public void CloneAdventure_ClonesEpisodes() {
        // Arrange
        var originalId = Guid.NewGuid();
        var episodeId = Guid.NewGuid();
        var original = new Adventure {
            Id = originalId,
            OwnerId = Guid.NewGuid(),
            Name = "Original Adventure",
            Visibility = Visibility.Public,
            Episodes = [
                           new() {
                                     Id = episodeId,
                                     Name = "Original Episode",
                                     Visibility = Visibility.Private,
                                     Stage = new() {
                                                       MapType = StageMapType.Square,
                                                       Source = "map.png",
                                                       Size = new() { Width = 10, Height = 20 },
                                                       Grid = new() {
                                                                        Offset = new() { Left = 5, Top = 5 },
                                                                        CellSize = new() { Width = 1, Height = 1 },
                                                                    },
                                                   },
                                 },
                       ],
        };

        // Act
        var clone = Cloner.CloneAdventure(original, _campaignId, _userId);

        // Assert
        clone.Episodes.Should().HaveCount(1);
        var clonedEpisode = clone.Episodes.Single();
        clonedEpisode.Id.Should().NotBe(episodeId);
        clonedEpisode.Name.Should().Be("Original Episode");
        clonedEpisode.OwnerId.Should().Be(_userId);
        clonedEpisode.ParentId.Should().Be(clone.Id);
        clonedEpisode.TemplateId.Should().Be(episodeId);
    }

    [Fact]
    public void CloneEpisode_CopiesBasicProperties() {
        // Arrange
        var originalId = Guid.NewGuid();
        var adventureId = Guid.NewGuid();
        var original = new Episode {
            Id = originalId,
            OwnerId = Guid.NewGuid(), // Different owner
            Name = "Original Episode",
            Visibility = Visibility.Private,
            Stage = new() {
                MapType = StageMapType.Square,
                Source = "map.png",
                Size = new() { Width = 10, Height = 20 },
                Grid = new() {
                    Offset = new() { Left = 5, Top = 5 },
                    CellSize = new() { Width = 1, Height = 1 },
                },
            },
            EpisodeAssets = [],
        };

        // Act
        var clone = Cloner.CloneEpisode(original, adventureId, _userId);

        // Assert
        clone.Should().NotBeNull();
        clone.Id.Should().NotBe(originalId);
        clone.OwnerId.Should().Be(_userId);
        clone.ParentId.Should().Be(adventureId);
        clone.Name.Should().Be(original.Name);
        clone.Visibility.Should().Be(original.Visibility);
        clone.TemplateId.Should().Be(originalId);

        // Stage assertions
        clone.Stage.Should().NotBeNull();
        clone.Stage.MapType.Should().Be(StageMapType.Square);
        clone.Stage.Source.Should().Be("map.png");
        clone.Stage.Size.Width.Should().Be(10);
        clone.Stage.Size.Height.Should().Be(20);
        clone.Stage.Grid.Offset.Left.Should().Be(5);
        clone.Stage.Grid.Offset.Top.Should().Be(5);
        clone.Stage.Grid.CellSize.Width.Should().Be(1);
        clone.Stage.Grid.CellSize.Height.Should().Be(1);
    }

    [Fact]
    public void CloneEpisode_ClonesEpisodeAssets() {
        // Arrange
        var originalId = Guid.NewGuid();
        var adventureId = Guid.NewGuid();
        var assetId = Guid.NewGuid();
        var original = new Episode {
            Id = originalId,
            OwnerId = Guid.NewGuid(),
            Name = "Original Episode",
            EpisodeAssets = [
                                new() {
                                          EpisodeId = originalId,
                                          AssetId = assetId,
                                          Name = "Asset 1",
                                          Position = new() { Left = 10, Top = 15 },
                                          Scale = 1.5f,
                                          IsLocked = true,
                                          ControlledBy = Guid.NewGuid(),
                                      },
                            ],
            Stage = new(),
        };

        // Act
        var clone = Cloner.CloneEpisode(original, adventureId, _userId);

        // Assert
        clone.EpisodeAssets.Should().HaveCount(1);
        var clonedAsset = clone.EpisodeAssets.Single();
        // Don't check the exact ID, just that it has one
        clonedAsset.EpisodeId.Should().NotBeEmpty();
        clonedAsset.AssetId.Should().Be(assetId);
        clonedAsset.Name.Should().Be("Asset 1");
        clonedAsset.Position.Left.Should().Be(10);
        clonedAsset.Position.Top.Should().Be(15);
        clonedAsset.Scale.Should().Be(1.5f);
        clonedAsset.IsLocked.Should().BeTrue();
    }

    [Fact]
    public void CloneStage_CreatesNewStageWithCorrectProperties() {
        // Arrange
        var original = new Stage {
            MapType = StageMapType.HexV,
            Source = "hexmap.png",
            Size = new() { Width = 30, Height = 40 },
            Grid = new() {
                Offset = new() { Left = 2, Top = 3 },
                CellSize = new() { Width = 2, Height = 2 },
            },
        };

        // Act
        var clone = Cloner.CloneStage(original);

        // Assert
        clone.Should().NotBeNull();
        clone.MapType.Should().Be(StageMapType.HexV);
        clone.Source.Should().Be("hexmap.png");
        clone.Size.Width.Should().Be(30);
        clone.Size.Height.Should().Be(40);
        clone.Grid.Offset.Left.Should().Be(2);
        clone.Grid.Offset.Top.Should().Be(3);
        clone.Grid.CellSize.Width.Should().Be(2);
        clone.Grid.CellSize.Height.Should().Be(2);
    }

    [Fact]
    public void CloneGrid_CreatesNewGridWithCorrectProperties() {
        // Arrange
        var original = new Grid {
            Offset = new() { Left = 5, Top = 10 },
            CellSize = new() { Width = 3, Height = 3 },
        };

        // Act
        var clone = Cloner.CloneGrid(original);

        // Assert
        clone.Should().NotBeNull();
        clone.Offset.Left.Should().Be(5);
        clone.Offset.Top.Should().Be(10);
        clone.CellSize.Width.Should().Be(3);
        clone.CellSize.Height.Should().Be(3);
    }

    [Fact]
    public void CloneSize_CreatesNewSizeWithCorrectDimensions() {
        // Arrange
        var original = new Size { Width = 15, Height = 25 };

        // Act
        var clone = Cloner.CloneSize(original);

        // Assert
        clone.Should().NotBeNull();
        clone.Width.Should().Be(15);
        clone.Height.Should().Be(25);
    }

    [Fact]
    public void ClonePosition_CreatesNewPositionWithCorrectCoordinates() {
        // Arrange
        var original = new Position { Left = 7, Top = 12 };

        // Act
        var clone = Cloner.ClonePosition(original);

        // Assert
        clone.Should().NotBeNull();
        clone.Left.Should().Be(7);
        clone.Top.Should().Be(12);
    }

    [Fact]
    public void CloneEpisodeAsset_CreatesNewAssetWithCorrectProperties() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var assetId = Guid.NewGuid();
        var controlledById = Guid.NewGuid();
        var episode = new Episode {
            Id = episodeId,
        };
        var original = new EpisodeAsset {
            EpisodeId = Guid.NewGuid(), // Different episode ID
            AssetId = assetId,
            Name = "Original Asset",
            Position = new() { Left = 8, Top = 9 },
            Scale = 2.0f,
            IsLocked = true,
            ControlledBy = controlledById,
        };

        // Act
        var clone = Cloner.CloneEpisodeAsset(episode, original);

        // Assert
        clone.Should().NotBeNull();
        clone.EpisodeId.Should().Be(episodeId);
        clone.AssetId.Should().Be(assetId);
        clone.Name.Should().Be("Original Asset");
        clone.Position.Left.Should().Be(8);
        clone.Position.Top.Should().Be(9);
        clone.Scale.Should().Be(2.0f);
        clone.IsLocked.Should().BeTrue();
        clone.ControlledBy.Should().Be(controlledById);
    }
}