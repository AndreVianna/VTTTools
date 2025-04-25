//namespace VttTools.WebApp.Components.Game.Pages;

//public class EpisodesComponentTests : Bunit.TestContext {
//    private readonly GameService _gameServiceClient = Substitute.For<GameService>();
//    private readonly HttpClient _httpClient = Substitute.For<HttpClient>();
//    private readonly NavigationManager _navigationManager;
//    private readonly Guid _adventureId = Guid.NewGuid();

//    public EpisodesComponentTests() {
//        _gameServiceClient.Api.Returns(_httpClient);

//        // Set up navigation
//        _navigationManager = Services.GetRequiredService<NavigationManager>();
//        Services.AddSingleton<GameService>(_gameServiceClient);
//    }

//    [Fact]
//    public void Episodes_RendersLoadingState_WhenStateIsNull() {
//        // Act
//        var cut = RenderComponent<Episodes>(parameters =>
//            parameters.Add(p => p.AdventureId, _adventureId));

//        // Assert
//        cut.Find("p").TextContent.Should().Contain("Loading");
//    }

//    [Fact]
//    public void Episodes_RendersEpisodesList_WhenStateHasEpisodes() {
//        // Arrange
//        var episodes = new[] {
//            new Episode { Id = Guid.NewGuid(), Name = "Episode 1", Visibility = Visibility.Public },
//            new Episode { Id = Guid.NewGuid(), Name = "Episode 2", Visibility = Visibility.Private },
//                             };

//        _gameServiceClient.GetEpisodesAsync(_adventureId).Returns(episodes);

//        // Act
//        var cut = RenderComponent<Episodes>(parameters =>
//            parameters.Add(p => p.AdventureId, _adventureId));

//        // Allow the component to initialize asynchronously
//        WaitForState(() => cut.Instance.State?.Episodes != null);

//        // Assert
//        var rows = cut.FindAll("tbody tr");
//        rows.Count.Should().Be(2);

//        var firstRowCells = rows[0].FindAll("td");
//        firstRowCells[0].TextContent.Should().Be("Episode 1");
//        firstRowCells[1].TextContent.Should().Be(Visibility.Public.ToString());

//        var secondRowCells = rows[1].FindAll("td");
//        secondRowCells[0].TextContent.Should().Be("Episode 2");
//        secondRowCells[1].TextContent.Should().Be(Visibility.Private.ToString());
//    }

//    [Fact]
//    public void Creating_Episode_CallsCreateEpisodeMethod() {
//        // Arrange
//        _gameServiceClient.GetEpisodesAsync(_adventureId).Returns([]);

//        // Act
//        var cut = RenderComponent<Episodes>(parameters =>
//            parameters.Add(p => p.AdventureId, _adventureId));

//        // Fill in the form
//        var nameInput = cut.Find("input[placeholder='Subject']");
//        nameInput.Change("New Test Episode");

//        var visibilitySelect = cut.Find("select");
//        visibilitySelect.Change(Visibility.Public.ToString());

//        // Click create button
//        var createButton = cut.Find("button.btn-primary");
//        createButton.Click();

//        // Assert
//        _gameServiceClient.Received(1).CreateEpisodeAsync(
//            _adventureId,
//            Arg.Is<CreateEpisodeRequest>(r =>
//                r.Name == "New Test Episode" && r.Visibility == Visibility.Public)
//        );
//    }

//    [Fact]
//    public void Clicking_EditButton_ShowsEditModal() {
//        // Arrange
//        var episodeId = Guid.NewGuid();
//        var episodes = new[] {
//            new Episode { Id = episodeId, Name = "Episode to Edit", Visibility = Visibility.Public },
//                             };

//        _gameServiceClient.GetEpisodesAsync(_adventureId).Returns(episodes);

//        // Act
//        var cut = RenderComponent<Episodes>(parameters =>
//            parameters.Add(p => p.AdventureId, _adventureId));

//        // Wait for component to initialize
//        WaitForState(() => cut.Instance.State?.Episodes != null);

//        // Click edit button
//        var editButton = cut.Find("button.btn-secondary");
//        editButton.Click();

//        // Assert
//        // Modal should be visible
//        cut.Find(".modal.show").Should().NotBeNull();

//        // The form should be pre-filled with episode data
//        var nameInput = cut.Find(".modal-body input");
//        nameInput.GetAttribute("value").Should().Be("Episode to Edit");

//        var visibilitySelect = cut.Find(".modal-body select");
//        visibilitySelect.GetAttribute("value").Should().Be(Visibility.Public.ToString());

//        // Verify that edit state is set
//        cut.Instance.State.IsEditing.Should().BeTrue();
//        cut.Instance.State.EditingEpisodeId.Should().Be(episodeId);
//    }

//    [Fact]
//    public void Clicking_DeleteButton_CallsDeleteEpisode() {
//        // Arrange
//        var episodeId = Guid.NewGuid();
//        var episodes = new[] {
//            new Episode { Id = episodeId, Name = "Episode to Delete", Visibility = Visibility.Public },
//                             };

//        _gameServiceClient.GetEpisodesAsync(_adventureId).Returns(episodes);

//        // Act
//        var cut = RenderComponent<Episodes>(parameters =>
//            parameters.Add(p => p.AdventureId, _adventureId));

//        // Wait for component to initialize
//        WaitForState(() => cut.Instance.State?.Episodes != null);

//        // Click delete button
//        var deleteButton = cut.Find("button.btn-danger");
//        deleteButton.Click();

//        // Assert
//        _gameServiceClient.Received(1).DeleteEpisodeAsync(episodeId);
//    }

//    [Fact]
//    public void Clicking_CloneButton_CallsCloneEpisode() {
//        // Arrange
//        var episodeId = Guid.NewGuid();
//        var episodes = new[] {
//            new Episode { Id = episodeId, Name = "Episode to Clone", Visibility = Visibility.Public },
//                             };

//        _gameServiceClient.GetEpisodesAsync(_adventureId).Returns(episodes);

//        // Act
//        var cut = RenderComponent<Episodes>(parameters =>
//            parameters.Add(p => p.AdventureId, _adventureId));

//        // Wait for component to initialize
//        WaitForState(() => cut.Instance.State?.Episodes != null);

//        // Click clone button
//        var cloneButton = cut.Find("button.btn-info");
//        cloneButton.Click();

//        // Assert
//        _gameServiceClient.Received(1).CloneEpisodeAsync(episodeId);
//    }

//    private void WaitForState(Func<bool> predicate, int timeoutMs = 1000) {
//        var startTime = DateTime.Now;
//        while (!predicate() && (DateTime.Now - startTime).TotalMilliseconds < timeoutMs) {
//            Thread.Sleep(10);
//        }

//        // Final check
//        predicate().Should().BeTrue($"Timed out waiting for state to update within {timeoutMs}ms");
//    }
//}