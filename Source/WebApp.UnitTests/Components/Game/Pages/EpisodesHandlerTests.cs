namespace VttTools.WebApp.Components.Game.Pages;

public class EpisodesHandlerTests {
    private readonly IGameServiceClient _client = Substitute.For<IGameServiceClient>();
    private readonly Episodes.Handler _handler = new();
    private readonly Guid _adventureId = Guid.NewGuid();

    [Fact]
    public async Task InitializeAsync_LoadsEpisodes_And_ReturnsPageState() {
        // Arrange
        var episodes = new[] {
            new Episode { Id = Guid.NewGuid(), Name = "Episode 1", Visibility = Visibility.Public },
            new Episode { Id = Guid.NewGuid(), Name = "Episode 2", Visibility = Visibility.Private },
                             };

        _client.GetEpisodesAsync(_adventureId).Returns(episodes);

        // Act
        var state = await _handler.InitializeAsync(_client, _adventureId);

        // Assert
        state.Should().NotBeNull();
        state.AdventureId.Should().Be(_adventureId);
        state.Episodes.Should().BeEquivalentTo(episodes);
        await _client.Received(1).GetEpisodesAsync(_adventureId);
    }

    [Fact]
    public async Task LoadEpisodesAsync_UpdatesStateWithEpisodes() {
        // Arrange
        var state = new Episodes.PageState { AdventureId = _adventureId };
        var episodes = new[] {
            new Episode { Id = Guid.NewGuid(), Name = "Episode 1", Visibility = Visibility.Public },
            new Episode { Id = Guid.NewGuid(), Name = "Episode 2", Visibility = Visibility.Private },
                             };

        _client.GetEpisodesAsync(_adventureId).Returns(episodes);

        // Act
        await _handler.LoadEpisodesAsync(state);

        // Assert
        state.Episodes.Should().BeEquivalentTo(episodes);
        await _client.Received(1).GetEpisodesAsync(_adventureId);
    }

    [Fact]
    public async Task CreateEpisodeAsync_WithValidInput_CreatesEpisodeAndResetsInput() {
        // Arrange
        var state = new Episodes.PageState {
            AdventureId = _adventureId,
            Input = new() {
                Name = "New Episode",
                Visibility = Visibility.Private,
            },
        };

        _client.CreateEpisodeAsync(Arg.Any<CreateEpisodeRequest>())
            .Returns(Result.Success());

        var episodes = new[] { new Episode { Id = Guid.NewGuid(), Name = "New Episode" } };
        _client.GetEpisodesAsync(_adventureId).Returns(episodes);

        // Act
        await _handler.CreateEpisodeAsync(state);

        // Assert
        await _client.Received(1).CreateEpisodeAsync(Arg.Any<CreateEpisodeRequest>());

        state.Input.Name.Should().BeEmpty();
        state.Input.Visibility.Should().Be(Visibility.Hidden);
        state.Episodes.Should().BeEquivalentTo(episodes);
    }

    [Fact]
    public void StartEdit_SetsEditingStateAndPopulatesInput() {
        // Arrange
        var state = new Episodes.PageState();
        var episode = new Episode {
            Id = Guid.NewGuid(),
            Name = "Episode to Edit",
            Visibility = Visibility.Public,
        };

        // Act
        Episodes.Handler.StartEdit(state, episode);

        // Assert
        state.IsEditing.Should().BeTrue();
        state.EditingEpisodeId.Should().Be(episode.Id);
        state.Input.Name.Should().Be(episode.Name);
        state.Input.Visibility.Should().Be(episode.Visibility);
    }

    [Fact]
    public void CancelEdit_ResetIsEditingFlag() {
        // Arrange
        var state = new Episodes.PageState {
            IsEditing = true,
            EditingEpisodeId = Guid.NewGuid(),
        };

        // Act
        Episodes.Handler.CancelEdit(state);

        // Assert
        state.IsEditing.Should().BeFalse();
    }

    [Fact]
    public async Task SaveEditAsync_WithValidInput_UpdatesEpisodeAndReloadsEpisodes() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var state = new Episodes.PageState {
            AdventureId = _adventureId,
            IsEditing = true,
            EditingEpisodeId = episodeId,
            Input = new() {
                Name = "Updated Episode",
                Visibility = Visibility.Public,
            },
        };

        _client.UpdateEpisodeAsync(Arg.Any<Guid>(), Arg.Any<UpdateEpisodeRequest>())
            .Returns(Result.Success());

        var episodes = new[] {
            new Episode { Id = episodeId, Name = "Updated Episode", Visibility = Visibility.Public },
                             };
        _client.GetEpisodesAsync(_adventureId).Returns(episodes);

        // Act
        await _handler.SaveEditAsync(state);

        // Assert
        await _client.Received(1).UpdateEpisodeAsync(episodeId, Arg.Any<UpdateEpisodeRequest>());

        state.IsEditing.Should().BeFalse();
        state.Episodes.Should().BeEquivalentTo(episodes);
    }

    [Fact]
    public async Task DeleteEpisodeAsync_RemovesEpisodeAndReloadsEpisodes() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var state = new Episodes.PageState {
            AdventureId = _adventureId,
        };

        var episodesAfterDelete = new Episode[] { };
        _client.GetEpisodesAsync(_adventureId).Returns(episodesAfterDelete);

        // Act
        await _handler.DeleteEpisodeAsync(state, episodeId);

        // Assert
        await _client.Received(1).DeleteEpisodeAsync(episodeId);
        await _client.Received(1).GetEpisodesAsync(_adventureId);
        state.Episodes.Should().BeEquivalentTo(episodesAfterDelete);
    }

    [Fact]
    public async Task CloneEpisodeAsync_ClonesEpisodeAndReloadsEpisodes() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var state = new Episodes.PageState {
            AdventureId = _adventureId,
        };

        _client.CloneEpisodeAsync(episodeId, Arg.Any<CloneEpisodeRequest>()).Returns(Result.Success());

        var episodesAfterClone = new[] {
            new Episode { Id = Guid.NewGuid(), Name = "Episode 1" },
            new Episode { Id = Guid.NewGuid(), Name = "Episode 1 (Copy)" },
        };
        _client.GetEpisodesAsync(_adventureId).Returns(episodesAfterClone);

        // Act
        await _handler.CloneEpisodeAsync(state, episodeId);

        // Assert
        await _client.Received(1).CloneEpisodeAsync(episodeId, Arg.Any<CloneEpisodeRequest>());
        await _client.Received(1).GetEpisodesAsync(_adventureId);
        state.Episodes.Should().BeEquivalentTo(episodesAfterClone);
    }
}