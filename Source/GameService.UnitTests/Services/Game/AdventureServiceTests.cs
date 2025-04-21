namespace VttTools.GameService.Services.Game;

public class AdventureServiceTests {
    private readonly IAdventureStorage _adventureStorage;
    private readonly IEpisodeStorage _episodeStorage;
    private readonly AdventureService _service;
    private readonly Guid _userId = Guid.NewGuid();

    public AdventureServiceTests() {
        _adventureStorage = Substitute.For<IAdventureStorage>();
        _episodeStorage = Substitute.For<IEpisodeStorage>();
        _service = new(_adventureStorage, _episodeStorage);
    }

    [Fact]
    public async Task GetAdventuresAsync_CallsStorage() {
        // Arrange
        var adventures = new Adventure[] {
            new() { Id = Guid.NewGuid(), Name = "Test Adventure 1" },
            new() { Id = Guid.NewGuid(), Name = "Test Adventure 2" },
                                         };
        _adventureStorage.GetAllAsync(Arg.Any<CancellationToken>()).Returns(adventures);

        // Act
        var result = await _service.GetAdventuresAsync(TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeEquivalentTo(adventures);
        await _adventureStorage.Received(1).GetAllAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAdventureAsync_CallsStorage() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var adventure = new Adventure { Id = adventureId, Name = "Test Adventure" };
        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);

        // Act
        var result = await _service.GetAdventureAsync(adventureId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeEquivalentTo(adventure);
        await _adventureStorage.Received(1).GetByIdAsync(adventureId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetEpisodesAsync_CallsStorage() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var episodes = new Episode[] {
            new() { Id = Guid.NewGuid(), Name = "Test Episode 1", ParentId = adventureId },
            new() { Id = Guid.NewGuid(), Name = "Test Episode 2", ParentId = adventureId },
                                     };
        _episodeStorage.GetByParentIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(episodes);

        // Act
        var result = await _service.GetEpisodesAsync(adventureId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeEquivalentTo(episodes);
        await _episodeStorage.Received(1).GetByParentIdAsync(adventureId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAdventureAsync_CreatesNewAdventure() {
        // Arrange
        var request = new CreateAdventureRequest {
            Name = "New Adventure",
            Visibility = Visibility.Public,
        };
        _adventureStorage.AddAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>())
            .Returns(x => x.Arg<Adventure>());

        // Act
        var result = await _service.CreateAdventureAsync(_userId, request, TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be(request.Name);
        result.Visibility.Should().Be(request.Visibility);
        result.OwnerId.Should().Be(_userId);
        await _adventureStorage.Received(1).AddAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAdventureAsync_WithOwner_UpdatesAdventure() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Old Name",
            OwnerId = _userId,
            Visibility = Visibility.Private,
        };
        var request = new UpdateAdventureRequest {
            Name = "Updated Name",
            Visibility = Visibility.Public,
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);
        _adventureStorage.UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>())
            .Returns(x => x.Arg<Adventure>());

        // Act
        var result = await _service.UpdateAdventureAsync(_userId, adventureId, request, TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be(request.Name.Value);
        result.Visibility.Should().Be(request.Visibility.Value);
        await _adventureStorage.Received(1).UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAdventureAsync_WithNonOwner_ReturnsNull() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var nonOwnerId = Guid.NewGuid();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
        };
        var request = new UpdateAdventureRequest {
            Name = "Updated Name",
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);

        // Act
        var result = await _service.UpdateAdventureAsync(nonOwnerId, adventureId, request, TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeNull();
        await _adventureStorage.DidNotReceive().UpdateAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteAdventureAsync_WithOwner_DeletesAdventure() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);

        // Act
        var result = await _service.DeleteAdventureAsync(_userId, adventureId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeTrue();
        await _adventureStorage.Received(1).DeleteAsync(adventure, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteAdventureAsync_WithNonOwner_ReturnsFalse() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var nonOwnerId = Guid.NewGuid();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);

        // Act
        var result = await _service.DeleteAdventureAsync(nonOwnerId, adventureId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeFalse();
        await _adventureStorage.DidNotReceive().DeleteAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneAdventureAsync_WithOwner_ClonesAdventureAndEpisodes() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
            Visibility = Visibility.Public,
        };

        var episodes = new[] {
            new Episode {
                Id = Guid.NewGuid(),
                Name = "Episode 1",
                ParentId = adventureId,
                Stage = new Stage {
                    MapType = StageMapType.Square,
                    Source = "source1",
                    Size = new Size { Width = 10, Height = 10 },
                    Grid = new Grid {
                        Offset = new Position { Left = 0, Top = 0 },
                        CellSize = new Size { Width = 1, Height = 1 },
                                    },
                                  },
                EpisodeAssets = [
                    new EpisodeAsset {
                        AssetId = Guid.NewGuid(),
                        Name = "Asset 1",
                        Position = new Position { Left = 1, Top = 1 },
                        Scale = 1.0f,
                        IsLocked = false,
                                     },
                                ],
                        },
                             };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);
        _episodeStorage.GetByParentIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(episodes);

        _adventureStorage.AddAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>())
            .Returns(x => x.Arg<Adventure>());

        _episodeStorage.AddAsync(Arg.Any<Episode>(), Arg.Any<CancellationToken>())
            .Returns(x => x.Arg<Episode>());

        // Act
        var result = await _service.CloneAdventureAsync(_userId, adventureId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be(adventure.Name);
        result.Visibility.Should().Be(adventure.Visibility);
        result.OwnerId.Should().Be(_userId);
        result.TemplateId.Should().Be(adventureId);

        await _adventureStorage.Received(1).AddAsync(Arg.Any<Adventure>(), Arg.Any<CancellationToken>());
        await _episodeStorage.Received(episodes.Length).AddAsync(Arg.Any<Episode>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateEpisodeAsync_WithOwner_CreatesEpisode() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
        };

        var request = new CreateEpisodeRequest {
            Name = "New Episode",
            Visibility = Visibility.Public,
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);
        _episodeStorage.AddAsync(Arg.Any<Episode>(), Arg.Any<CancellationToken>())
            .Returns(x => x.Arg<Episode>());

        // Act
        var result = await _service.CreateEpisodeAsync(_userId, adventureId, request, TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be(request.Name);
        result.Visibility.Should().Be(request.Visibility);
        result.OwnerId.Should().Be(_userId);
        result.ParentId.Should().Be(adventureId);
        await _episodeStorage.Received(1).AddAsync(Arg.Any<Episode>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateEpisodeAsync_WithNonOwner_ReturnsNull() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var nonOwnerId = Guid.NewGuid();
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
        };

        var request = new CreateEpisodeRequest {
            Name = "New Episode",
            Visibility = Visibility.Public,
        };

        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);

        // Act
        var result = await _service.CreateEpisodeAsync(nonOwnerId, adventureId, request, TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeNull();
        await _episodeStorage.DidNotReceive().AddAsync(Arg.Any<Episode>(), Arg.Any<CancellationToken>());
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
    public async Task CloneEpisodeAsync_WithOwner_ClonesEpisode() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var episode = new Episode {
            Id = episodeId,
            Name = "Episode",
            OwnerId = _userId,
            Visibility = Visibility.Public,
            ParentId = Guid.NewGuid(),
        };

        _episodeStorage.GetByIdAsync(episodeId, Arg.Any<CancellationToken>()).Returns(episode);
        _episodeStorage.AddAsync(Arg.Any<Episode>(), Arg.Any<CancellationToken>())
            .Returns(x => x.Arg<Episode>());

        // Act
        var result = await _service.CloneEpisodeAsync(_userId, episodeId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be(episode.Name);
        result.Visibility.Should().Be(episode.Visibility);
        result.OwnerId.Should().Be(_userId);
        result.ParentId.Should().Be(episode.ParentId);
        result.TemplateId.Should().Be(episodeId);
        await _episodeStorage.Received(1).AddAsync(Arg.Any<Episode>(), Arg.Any<CancellationToken>());
    }
}