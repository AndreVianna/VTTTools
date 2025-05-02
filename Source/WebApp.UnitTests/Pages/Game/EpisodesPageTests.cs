namespace VttTools.WebApp.Pages.Game;

public class EpisodesPageTests : WebAppTestContext {
    private readonly IGameService _service = Substitute.For<IGameService>();
    private static readonly Guid _adventureId = Guid.NewGuid();
    private readonly Episode[] _defaultEpisodes = [
        new() {
            Name = "Episode 1.1",
            ParentId = _adventureId,
            Visibility = Visibility.Public,
        },
        new() {
            Name = "Episode 1.2",
            ParentId = _adventureId,
            Visibility = Visibility.Private,
        }];

    public EpisodesPageTests() {
        Services.AddScoped<IGameService>(_ => _service);
        _service.GetEpisodesAsync(Arg.Any<Guid>()).Returns(_defaultEpisodes);
        UseDefaultUser();
    }

    [Fact]
    public void BeforeIsReady_RendersLoadingState() {
        // Arrange
        _service.GetEpisodesAsync(Arg.Any<Guid>()).Returns(Task.Delay(1000, CancellationToken).ContinueWith(_ => _defaultEpisodes));

        // Act
        var cut = RenderComponent<EpisodesPage>();

        // Assert
        cut.Markup.Should().Contain("<h1>Episodes</h1>");
        cut.Markup.Should().Contain("""<span class="visually-hidden">Loading...</span>""");
    }

    [Fact]
    public void WhenIsReady_WithNoEpisodes_RendersAsEmpty() {
        // Arrange
        _service.GetEpisodesAsync(Arg.Any<Guid>()).Returns([]);

        // Act
        var cut = RenderComponent<EpisodesPage>();
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));

        // Assert
        cut.Markup.Should().Contain("<h1>Episodes</h1>");
        cut.Markup.Should().NotContain("""<span class="visually-hidden">Loading...</span>""");
        cut.Markup.Should().Contain("You don't have any episodes yet. Create a new one to get started!");
    }

    [Fact]
    public void WhenIsReady_RendersEpisodeList() {
        // Act
        var cut = RenderComponent<EpisodesPage>();
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));

        // Assert
        cut.Markup.Should().Contain("<h1>Episodes</h1>");
        cut.Markup.Should().NotContain("""<span class="visually-hidden">Loading...</span>""");
        var rows = cut.FindAll("tbody tr");
        rows.Count.Should().Be(2);
    }

    [Fact]
    public void WhenClickCreateButton_CallsCreateEpisodeMethod() {
        // Arrange
        var cut = RenderComponent<EpisodesPage>();
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));
        var nameInput = cut.Find("input[placeholder='Name']");
        nameInput.Change("New Episode");
        var newEpisode = new Episode {
            Name = "New Episode",
            OwnerId = CurrentUser!.Id,
            Visibility = Visibility.Hidden,
        };
        _service.CreateEpisodeAsync(Arg.Any<CreateEpisodeRequest>()).Returns(newEpisode);

        // Act
        cut.Find("#create-episode").Click();

        // Assert
        _service.Received(1).CreateEpisodeAsync(Arg.Any<CreateEpisodeRequest>());
    }

    [Fact]
    public void WhenClickEditButton_ShowsEditModal() {
        // Arrange
        var episodeId = _defaultEpisodes[0].Id;
        var cut = RenderComponent<EpisodesPage>();
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));
        _service.UpdateEpisodeAsync(Arg.Any<Guid>(), Arg.Any<UpdateEpisodeRequest>()).Returns(Result.Success());

        // Act
        cut.Find($"#edit-episode-{episodeId}").Click();
        cut.WaitForState(() => cut.Instance.State.IsEditing, TimeSpan.FromMilliseconds(500));

        // Assert
        cut.Find("#edit-episode-dialog").Should().NotBeNull();
        var nameInput = cut.Find("#edit-episode-name-input");
        nameInput.GetAttribute("value").Should().Be("Episode 1.1");
        var visibilitySelect = cut.Find("#edit-episode-visibility-input");
        visibilitySelect.GetAttribute("value").Should().Be(nameof(Visibility.Public));
        cut.Instance.State.EditInput.Id.Should().Be(_defaultEpisodes[0].Id);
    }

    [Fact]
    public void WhenClickDeleteButton_CallsDeleteEpisode() {
        // Arrange
        var episodeId = _defaultEpisodes[0].Id;
        var cut = RenderComponent<EpisodesPage>();
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));
        _service.DeleteEpisodeAsync(Arg.Any<Guid>()).Returns(true);

        // Act
        cut.Find($"#delete-episode-{episodeId}").Click();

        // Assert
        _service.Received(1).DeleteEpisodeAsync(_defaultEpisodes[0].Id);
    }

    [Fact]
    public void WhenClickCloneButton_CallsCloneEpisode() {
        // Act
        var episodeId = _defaultEpisodes[0].Id;
        var cut = RenderComponent<EpisodesPage>();
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));
        var clonedEpisode = new Episode {
            Name = _defaultEpisodes[0].Name,
            OwnerId = CurrentUser!.Id,
            Visibility = Visibility.Hidden,
        };
        _service.CloneEpisodeAsync(Arg.Any<Guid>(), Arg.Any<CloneEpisodeRequest>()).Returns(clonedEpisode);

        // Act
        cut.Find($"#clone-episode-{episodeId}").Click();

        // Assert
        _service.Received(1).CloneEpisodeAsync(Arg.Any<Guid>(), Arg.Any<CloneEpisodeRequest>());
    }
}