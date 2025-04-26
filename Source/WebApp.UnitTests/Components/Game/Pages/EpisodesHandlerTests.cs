namespace VttTools.WebApp.Components.Game.Pages;

public class EpisodesHandlerTests {
    private readonly Guid _adventureId = Guid.NewGuid();
    private readonly IGameService _service = Substitute.For<IGameService>();
    private readonly Episodes.Handler _handler;
    private readonly Episode[] _episodes = [
        new() { Name = "Episode 1", Visibility = Visibility.Public },
        new() { Name = "Episode 2", Visibility = Visibility.Private },
    ];

    public EpisodesHandlerTests() {
        _handler = new(_adventureId, _service);
    }

    [Fact]
    public async Task InitializeAsync_LoadsEpisodes_And_ReturnsPageState() {
        // Arrange
        _service.GetEpisodesAsync(_adventureId).Returns(_episodes);

        // Act
        var handler = await Episodes.Handler.InitializeAsync(_adventureId, _service);

        // Assert
        handler.Should().NotBeNull();
        handler.State.AdventureId.Should().Be(_adventureId);
        handler.State.Episodes.Should().BeEquivalentTo(_episodes);
    }

    [Fact]
    public async Task CreateEpisodeAsync_WithValidInput_CreatesEpisodeAndResetsInput() {
        // Arrange
        _handler.State.CreateInput = new() {
            Name = "New Episode",
            Visibility = Visibility.Private,
        };
        var newEpisode = new Episode {
            Name = "New Episode",
            Visibility = Visibility.Private,
        };
        var episodesAfterCreate = new[] { newEpisode };

        _service.CreateEpisodeAsync(Arg.Any<CreateEpisodeRequest>()).Returns(newEpisode);

        // Act
        await _handler.CreateEpisodeAsync();

        // Assert
        _handler.State.Episodes.Should().BeEquivalentTo(episodesAfterCreate);
        _handler.State.ShowEditDialog = false;
    }

    [Fact]
    public void StartEdit_SetsEditingStateAndPopulatesInput() {
        // Arrange
        var episode = new Episode {
            Name = "Episode to Edit",
            Visibility = Visibility.Public,
        };

        // Act
        _handler.StartEdit(episode);

        // Assert
        _handler.State.ShowEditDialog.Should().BeTrue();
        _handler.State.EditInput.Id.Should().Be(episode.Id);
        _handler.State.EditInput.Name.Should().Be(episode.Name);
        _handler.State.EditInput.Visibility.Should().Be(episode.Visibility);
    }

    [Fact]
    public void CancelEdit_ResetIsEditingFlag() {
        // Arrange
        _handler.State.ShowEditDialog = true;
        _handler.State.EditInput = new() {
            Id = Guid.NewGuid(),
            Name = "Updated Episode",
            Visibility = Visibility.Public,
        };

        // Act
        _handler.CancelEdit();

        // Assert
        _handler.State.ShowEditDialog.Should().BeFalse();
    }

    [Fact]
    public async Task SaveEditAsync_WithValidInput_UpdatesEpisodeAndReloadsEpisodes() {
        // Arrange
        _handler.State.ShowEditDialog = true;
        var episodeId = Guid.NewGuid();
        _handler.State.EditInput = new() {
            Id = episodeId,
            Name = "Updated Episode",
            Visibility = Visibility.Public,
        };
        _handler.State.Episodes = [new Episode { Id = episodeId, Name = "Episode 1", Visibility = Visibility.Hidden }];
        var episodesAfterEdit = new[] {
            new Episode { Id = episodeId, Name = "Updated Episode", Visibility = Visibility.Public },
        };

        _service.UpdateEpisodeAsync(Arg.Any<Guid>(), Arg.Any<UpdateEpisodeRequest>())
            .Returns(Result.Success());

        // Act
        await _handler.SaveEditAsync();

        // Assert
        await _service.Received(1).UpdateEpisodeAsync(episodeId, Arg.Any<UpdateEpisodeRequest>());

        _handler.State.ShowEditDialog.Should().BeFalse();
        _handler.State.Episodes.Should().BeEquivalentTo(episodesAfterEdit);
    }

    [Fact]
    public async Task DeleteEpisodeAsync_RemovesEpisodeAndReloadsEpisodes() {
        // Arrange
        var episodeId = Guid.NewGuid();

        var episodesAfterDelete = Array.Empty<Episode>();
        _service.GetEpisodesAsync(_adventureId).Returns(episodesAfterDelete);

        // Act
        await _handler.DeleteEpisodeAsync(episodeId);

        // Assert
        _handler.State.Episodes.Should().BeEquivalentTo(episodesAfterDelete);
    }

    [Fact]
    public async Task CloneEpisodeAsync_ClonesEpisodeAndReloadsEpisodes() {
        // Arrange
        var episodeId = Guid.NewGuid();
        _handler.State.Episodes = [new Episode { Id = episodeId, Name = "Episode 1" }];
        var clonedEpisode = new Episode { Id = Guid.NewGuid(), Name = "Episode 1 (Copy)" };
        var episodesAfterClone = new[] {
            new Episode { Id = episodeId, Name = "Episode 1" },
            clonedEpisode,
        };

        _service.CloneEpisodeAsync(episodeId, Arg.Any<CloneEpisodeRequest>()).Returns(clonedEpisode);

        // Act
        await _handler.CloneEpisodeAsync(episodeId);

        // Assert
        _handler.State.Episodes.Should().BeEquivalentTo(episodesAfterClone);
    }
}