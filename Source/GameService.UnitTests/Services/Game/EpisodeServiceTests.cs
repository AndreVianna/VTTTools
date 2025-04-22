namespace VttTools.GameService.Services.Game;

public class EpisodeServiceTests {
    private readonly IEpisodeStorage _episodeStorage;
    private readonly EpisodeService _service;
    private readonly Guid _userId = Guid.NewGuid();

    public EpisodeServiceTests() {
        _episodeStorage = Substitute.For<IEpisodeStorage>();
        _service = new(_episodeStorage);
    }

    [Fact]
    public async Task GetEpisodesAsync_CallsStorage() {
        // Arrange
        var episodes = new Episode[] {
            new() { Id = Guid.NewGuid(), Name = "Test Episode 1" },
            new() { Id = Guid.NewGuid(), Name = "Test Episode 2" },
                                         };
        _episodeStorage.GetAllAsync(Arg.Any<CancellationToken>()).Returns(episodes);

        // Act
        var result = await _service.GetEpisodesAsync(TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeEquivalentTo(episodes);
        await _episodeStorage.Received(1).GetAllAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetEpisodeByIdAsync_CallsStorage() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var episode = new Episode { Id = episodeId, Name = "Test Episode" };
        _episodeStorage.GetByIdAsync(episodeId, Arg.Any<CancellationToken>()).Returns(episode);

        // Act
        var result = await _service.GetEpisodeByIdAsync(episodeId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeEquivalentTo(episode);
        await _episodeStorage.Received(1).GetByIdAsync(episodeId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateEpisodeAsync_CreatesNewEpisode() {
        // Arrange
        var request = new CreateEpisodeRequest {
            Name = "New Episode",
            Visibility = Visibility.Public,
        };
        _episodeStorage.AddAsync(Arg.Any<Episode>(), Arg.Any<CancellationToken>())
            .Returns(x => x.Arg<Episode>());

        // Act
        var result = await _service.CreateEpisodeAsync(_userId, request, TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be(request.Name);
        result.Visibility.Should().Be(request.Visibility);
        result.OwnerId.Should().Be(_userId);
        await _episodeStorage.Received(1).AddAsync(Arg.Any<Episode>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateEpisodeAsync_WithOwner_UpdatesEpisode() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var episode = new Episode {
            Id = episodeId,
            Name = "Old Name",
            OwnerId = _userId,
            Visibility = Visibility.Private,
        };
        var request = new UpdateEpisodeRequest {
            Name = "Updated Name",
            Visibility = Visibility.Public,
        };

        _episodeStorage.GetByIdAsync(episodeId, Arg.Any<CancellationToken>()).Returns(episode);
        _episodeStorage.UpdateAsync(Arg.Any<Episode>(), Arg.Any<CancellationToken>())
            .Returns(x => x.Arg<Episode>());

        // Act
        var result = await _service.UpdateEpisodeAsync(_userId, episodeId, request, TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be(request.Name.Value);
        result.Visibility.Should().Be(request.Visibility.Value);
        await _episodeStorage.Received(1).UpdateAsync(Arg.Any<Episode>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateEpisodeAsync_WithNonOwner_ReturnsNull() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var nonOwnerId = Guid.NewGuid();
        var episode = new Episode {
            Id = episodeId,
            Name = "Episode",
            OwnerId = _userId,
        };
        var request = new UpdateEpisodeRequest {
            Name = "Updated Name",
        };

        _episodeStorage.GetByIdAsync(episodeId, Arg.Any<CancellationToken>()).Returns(episode);

        // Act
        var result = await _service.UpdateEpisodeAsync(nonOwnerId, episodeId, request, TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeNull();
        await _episodeStorage.DidNotReceive().UpdateAsync(Arg.Any<Episode>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteEpisodeAsync_WithOwner_DeletesEpisode() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var episode = new Episode {
            Id = episodeId,
            Name = "Episode",
            OwnerId = _userId,
        };

        _episodeStorage.GetByIdAsync(episodeId, Arg.Any<CancellationToken>()).Returns(episode);

        // Act
        var result = await _service.DeleteEpisodeAsync(_userId, episodeId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeTrue();
        await _episodeStorage.Received(1).DeleteAsync(episode, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteEpisodeAsync_WithNonOwner_ReturnsFalse() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var nonOwnerId = Guid.NewGuid();
        var episode = new Episode {
            Id = episodeId,
            Name = "Episode",
            OwnerId = _userId,
        };

        _episodeStorage.GetByIdAsync(episodeId, Arg.Any<CancellationToken>()).Returns(episode);

        // Act
        var result = await _service.DeleteEpisodeAsync(nonOwnerId, episodeId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeFalse();
        await _episodeStorage.DidNotReceive().DeleteAsync(Arg.Any<Episode>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneEpisodeAsync_WithOwner_ClonesEpisodeAndEpisodes() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var episode = new Episode {
            Id = episodeId,
            Name = "Episode",
            OwnerId = _userId,
            Visibility = Visibility.Public,
        };

        var episodes = new[] {
            new Episode {
                Id = Guid.NewGuid(),
                Name = "Episode 1",
                ParentId = episodeId,
                Stage = new() {
                    MapType = StageMapType.Square,
                    Source = "source1",
                    Size = new() { Width = 10, Height = 10 },
                    Grid = new() {
                        Offset = new() { Left = 0, Top = 0 },
                        CellSize = new() { Width = 1, Height = 1 },
                    },
                },
                EpisodeAssets = [
                    new EpisodeAsset {
                        AssetId = Guid.NewGuid(),
                        Name = "Asset 1",
                        Position = new() { Left = 1, Top = 1 },
                        Scale = 1.0f,
                        IsLocked = false,
                    },
                ],
            },
        };

        _episodeStorage.GetByIdAsync(episodeId, Arg.Any<CancellationToken>()).Returns(episode);
        _episodeStorage.GetByParentIdAsync(episodeId, Arg.Any<CancellationToken>()).Returns(episodes);

        _episodeStorage.AddAsync(Arg.Any<Episode>(), Arg.Any<CancellationToken>())
            .Returns(x => x.Arg<Episode>());

        _episodeStorage.AddAsync(Arg.Any<Episode>(), Arg.Any<CancellationToken>())
            .Returns(x => x.Arg<Episode>());

        // Act
        var result = await _service.CloneEpisodeAsync(_userId, episodeId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be(episode.Name);
        result.Visibility.Should().Be(episode.Visibility);
        result.OwnerId.Should().Be(_userId);
        result.TemplateId.Should().Be(episodeId);

        await _episodeStorage.Received(1).AddAsync(Arg.Any<Episode>(), Arg.Any<CancellationToken>());
        await _episodeStorage.Received(episodes.Length).AddAsync(Arg.Any<Episode>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAssetsAsync_CallsStorage() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var episode = new Episode {
            Id = episodeId,
            Name = "Episode",
            EpisodeAssets = [
                new() { AssetId = Guid.NewGuid(), Name = "Test Asset 1", EpisodeId = episodeId },
                new() { AssetId = Guid.NewGuid(), Name = "Test Asset 2", EpisodeId = episodeId },
            ],
        };

        _episodeStorage.GetByIdAsync(episodeId, Arg.Any<CancellationToken>())
                       .Returns(episode);

        // Act
        var result = await _service.GetAssetsAsync(episodeId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeEquivalentTo(episode.EpisodeAssets);
        await _episodeStorage.Received(1).GetByIdAsync(episodeId, Arg.Any<CancellationToken>());
    }
}