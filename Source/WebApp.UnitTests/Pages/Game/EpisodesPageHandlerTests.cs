namespace VttTools.WebApp.Pages.Game;

public class EpisodesPageHandlerTests {
    private readonly Guid _adventureId = Guid.NewGuid();
    private readonly IGameService _service = Substitute.For<IGameService>();

    [Fact]
    public async Task InitializeAsync_LoadsEpisodes_And_ReturnsHandler() {
        // Arrange & Act
        var handler = await CreateInitializedHandler();

        // Assert
        handler.Should().NotBeNull();
        handler.State.AdventureId.Should().Be(_adventureId);
        handler.State.Episodes.Should().NotBeEmpty();
    }

    [Fact]
    public async Task CreateEpisodeAsync_WithValidInput_CreatesEpisodeAndResetsInput() {
        // Arrange
        var handler = await CreateInitializedHandler();
        handler.State.CreateInput = new() {
            Name = "New Episode",
            Visibility = Visibility.Private,
        };
        var newEpisode = new Episode {
            Name = "New Episode",
            Visibility = Visibility.Private,
        };

        _service.CreateEpisodeAsync(Arg.Any<CreateEpisodeRequest>()).Returns(newEpisode);

        // Act
        await handler.CreateEpisodeAsync();

        // Assert
        handler.State.Episodes.Should().HaveCount(3);
    }

    [Fact]
    public async Task CreateEpisodeAsync_WithInvalidInput_ReturnsErrors() {
        // Arrange
        var handler = await CreateInitializedHandler();
        handler.State.CreateInput = new() {
            Name = "New Episode",
            Visibility = Visibility.Private,
        };

        _service.CreateEpisodeAsync(Arg.Any<CreateEpisodeRequest>()).Returns(Result.Failure("Some error"));

        // Act
        await handler.CreateEpisodeAsync();

        // Assert
        handler.State.Episodes.Should().HaveCount(2);
        handler.State.CreateInput.Errors.Should().NotBeEmpty();
        handler.State.CreateInput.Errors[0].Message.Should().Be("Some error");
    }

    [Fact]
    public async Task DeleteEpisodeAsync_RemovesEpisodeAndReloadsEpisodes() {
        // Arrange
        var handler = await CreateInitializedHandler();
        var episodeId = handler.State.Episodes[1].Id;
        _service.DeleteEpisodeAsync(Arg.Any<Guid>()).Returns(true);

        // Act
        await handler.DeleteEpisodeAsync(episodeId);

        // Assert
        handler.State.Episodes.Should().HaveCount(1);
    }

    [Fact]
    public async Task CloneEpisodeAsync_ClonesEpisodeAndReloadsEpisodes() {
        // Arrange
        var handler = await CreateInitializedHandler();
        var episodeId = Guid.NewGuid();
        handler.State.Episodes = [new Episode { Id = episodeId, Name = "Episode 1" }];
        var clonedEpisode = new Episode { Id = Guid.NewGuid(), Name = "Episode 1 (Copy)" };
        var episodesAfterClone = new[] {
            new Episode { Id = episodeId, Name = "Episode 1" },
            clonedEpisode,
        };

        _service.CloneEpisodeAsync(episodeId, Arg.Any<CloneEpisodeRequest>()).Returns(clonedEpisode);

        // Act
        await handler.CloneEpisodeAsync(episodeId);

        // Assert
        handler.State.Episodes.Should().BeEquivalentTo(episodesAfterClone);
    }

    [Fact]
    public async Task StartEdit_SetsEditingStateAndPopulatesInput() {
        // Arrange
        var handler = await CreateInitializedHandler();
        var episode = new Episode {
            Name = "Episode to Edit",
            Visibility = Visibility.Public,
        };

        // Act
        handler.StartEdit(episode);

        // Assert
        handler.State.ShowEditDialog.Should().BeTrue();
        handler.State.EditInput.Id.Should().Be(episode.Id);
        handler.State.EditInput.Name.Should().Be(episode.Name);
        handler.State.EditInput.Visibility.Should().Be(episode.Visibility);
    }

    [Fact]
    public async Task CancelEdit_ResetIsEditingFlag() {
        // Arrange
        var handler = await CreateInitializedHandler();
        handler.State.ShowEditDialog = true;
        handler.State.EditInput = new() {
            Id = Guid.NewGuid(),
            Name = "Updated Episode",
            Visibility = Visibility.Public,
        };

        // Act
        handler.CancelEdit();

        // Assert
        handler.State.ShowEditDialog.Should().BeFalse();
    }

    [Fact]
    public async Task SaveEditAsync_WithValidInput_UpdatesEpisodeAndReloadsEpisodes() {
        // Arrange
        var handler = await CreateInitializedHandler();
        handler.State.ShowEditDialog = true;
        var episodeId = Guid.NewGuid();
        var episodeBeforeEdit = new Episode {
            Id = episodeId,
            Name = "Episode 1",
            Visibility = Visibility.Hidden,
        };
        var episodesBeforeEdit = new List<Episode> { episodeBeforeEdit };
        handler.State.EditInput = new() {
            Id = episodeId,
            Name = "Updated Episode",
            Visibility = Visibility.Public,
        };
        handler.State.EditInput = new() {
            Id = episodeId,
            Name = "Updated Episode",
            Visibility = Visibility.Public,
        };
        handler.State.Episodes = episodesBeforeEdit;
        var episodesAfterEdit = new[] {
            new Episode { Id = episodeId, Name = "Updated Episode", Visibility = Visibility.Public },
        };

        _service.UpdateEpisodeAsync(Arg.Any<Guid>(), Arg.Any<UpdateEpisodeRequest>())
            .Returns(Result.Success());

        // Act
        await handler.SaveEditAsync();

        // Assert
        handler.State.ShowEditDialog.Should().BeFalse();
        handler.State.Episodes.Should().BeEquivalentTo(episodesAfterEdit);
    }

    [Fact]
    public async Task SaveEditAsync_WithInvalidInput_ReturnsErrors() {
        // Arrange
        var handler = await CreateInitializedHandler();
        handler.State.ShowEditDialog = true;
        var episodeId = Guid.NewGuid();
        var episodeBeforeEdit = new Episode {
            Id = episodeId,
            Name = "Episode 1",
            Visibility = Visibility.Hidden,
        };
        var episodesBeforeEdit = new List<Episode> { episodeBeforeEdit };
        handler.State.EditInput = new() {
            Id = episodeId,
            Name = "Updated Episode",
            Visibility = Visibility.Public,
        };
        handler.State.Episodes = episodesBeforeEdit;

        _service.UpdateEpisodeAsync(Arg.Any<Guid>(), Arg.Any<UpdateEpisodeRequest>())
            .Returns(Result.Failure("Some errors."));

        // Act
        await handler.SaveEditAsync();

        // Assert
        handler.State.ShowEditDialog.Should().BeTrue();
        handler.State.EditInput.Errors.Should().NotBeEmpty();
        handler.State.EditInput.Errors[0].Message.Should().Be("Some errors.");
        handler.State.Episodes.Should().BeEquivalentTo(episodesBeforeEdit);
    }

    private async Task<EpisodesPageHandler> CreateInitializedHandler() {
        var episodes = new[] {
            new Episode { Name = "Episode 1", Visibility = Visibility.Public },
            new Episode { Name = "Episode 2", Visibility = Visibility.Private },
        };
        var handler = new EpisodesPageHandler();
        _service.GetEpisodesAsync(_adventureId).Returns(episodes);
        await handler.InitializeAsync(_adventureId, _service);
        return handler;
    }
}