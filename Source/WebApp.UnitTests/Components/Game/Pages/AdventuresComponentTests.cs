//namespace VttTools.WebApp.Components.Game.Pages;

//public class AdventuresComponentTests : Bunit.TestContext {
//    private readonly GameService _gameServiceClient = Substitute.For<GameService>();
//    private readonly HttpClient _httpClient = Substitute.For<HttpClient>();
//    private readonly NavigationManager _navigationManager;
//    private readonly TestNavigationInterceptor _navigationInterceptor;

//    public AdventuresComponentTests() {
//        _gameServiceClient.Api.Returns(_httpClient);

//        // Set up navigation
//        _navigationManager = Services.GetRequiredService<NavigationManager>();
//        _navigationInterceptor = new(_navigationManager);
//        Services.AddSingleton<GameService>(_gameServiceClient);
//    }

//    [Fact]
//    public void Adventures_RendersLoadingState_WhenStateIsNull() {
//        // Act
//        var cut = RenderComponent<Adventures>();

//        // Assert
//        cut.Find("p").TextContent.Should().Contain("Loading");
//    }

//    [Fact]
//    public void Adventures_RendersAdventuresList_WhenStateHasAdventures() {
//        // Arrange
//        var adventures = new[] {
//            new Adventure { Id = Guid.NewGuid(), Name = "Adventure 1", Visibility = Visibility.Public },
//            new Adventure { Id = Guid.NewGuid(), Name = "Adventure 2", Visibility = Visibility.Private },
//                               };

//        _gameServiceClient.GetAdventuresAsync().Returns(adventures);

//        // Act
//        var cut = RenderComponent<Adventures>();

//        // Allow the component to initialize asynchronously
//        WaitForState(() => cut.Instance.State?.Adventures != null);

//        // Assert
//        var rows = cut.FindAll("tbody tr");
//        rows.Count.Should().Be(2);

//        var firstRowCells = rows[0].FindAll("td");
//        firstRowCells[0].TextContent.Should().Be("Adventure 1");
//        firstRowCells[1].TextContent.Should().Be(Visibility.Public.ToString());

//        var secondRowCells = rows[1].FindAll("td");
//        secondRowCells[0].TextContent.Should().Be("Adventure 2");
//        secondRowCells[1].TextContent.Should().Be(Visibility.Private.ToString());
//    }

//    [Fact]
//    public void Creating_Adventure_CallsCreateAdventureMethod() {
//        // Arrange
//        _gameServiceClient.GetAdventuresAsync().Returns([]);

//        // Act
//        var cut = RenderComponent<Adventures>();

//        // Fill in the form
//        var nameInput = cut.Find("input[placeholder='Subject']");
//        nameInput.Change("New Test Adventure");

//        var visibilitySelect = cut.Find("select");
//        visibilitySelect.Change(Visibility.Public.ToString());

//        // Click create button
//        var createButton = cut.Find("button.btn-primary");
//        createButton.Click();

//        // Assert
//        _gameServiceClient.Received(1).CreateAdventureAsync(Arg.Is<CreateAdventureRequest>(r =>
//            r.Name == "New Test Adventure" && r.Visibility == Visibility.Public));
//    }

//    [Fact]
//    public void Clicking_EditButton_ShowsEditModal() {
//        // Arrange
//        var adventureId = Guid.NewGuid();
//        var adventures = new[] {
//            new Adventure { Id = adventureId, Name = "Adventure to Edit", Visibility = Visibility.Public },
//                               };

//        _gameServiceClient.GetAdventuresAsync().Returns(adventures);

//        // Act
//        var cut = RenderComponent<Adventures>();

//        // Wait for component to initialize
//        WaitForState(() => cut.Instance.State?.Adventures != null);

//        // Click edit button
//        var editButton = cut.Find("button.btn-secondary");
//        editButton.Click();

//        // Assert
//        // Modal should be visible
//        cut.Find(".modal.show").Should().NotBeNull();

//        // The form should be pre-filled with adventure data
//        var nameInput = cut.Find(".modal-body input");
//        nameInput.GetAttribute("value").Should().Be("Adventure to Edit");

//        var visibilitySelect = cut.Find(".modal-body select");
//        visibilitySelect.GetAttribute("value").Should().Be(Visibility.Public.ToString());

//        // Verify that edit state is set
//        cut.Instance.State.IsEditing.Should().BeTrue();
//        cut.Instance.State.EditingAdventureId.Should().Be(adventureId);
//    }

//    [Fact]
//    public void Clicking_DeleteButton_CallsDeleteAdventure() {
//        // Arrange
//        var adventureId = Guid.NewGuid();
//        var adventures = new[] {
//            new Adventure { Id = adventureId, Name = "Adventure to Delete", Visibility = Visibility.Public },
//                               };

//        _gameServiceClient.GetAdventuresAsync().Returns(adventures);

//        // Act
//        var cut = RenderComponent<Adventures>();

//        // Wait for component to initialize
//        WaitForState(() => cut.Instance.State?.Adventures != null);

//        // Click delete button
//        var deleteButton = cut.Find("button.btn-danger");
//        deleteButton.Click();

//        // Assert
//        _gameServiceClient.Received(1).DeleteAdventureAsync(adventureId);
//    }

//    [Fact]
//    public void Clicking_CloneButton_CallsCloneAdventure() {
//        // Arrange
//        var adventureId = Guid.NewGuid();
//        var adventures = new[] {
//            new Adventure { Id = adventureId, Name = "Adventure to Clone", Visibility = Visibility.Public },
//                               };

//        _gameServiceClient.GetAdventuresAsync().Returns(adventures);

//        // Act
//        var cut = RenderComponent<Adventures>();

//        // Wait for component to initialize
//        WaitForState(() => cut.Instance.State?.Adventures != null);

//        // Click clone button
//        var cloneButton = cut.Find("button.btn-info");
//        cloneButton.Click();

//        // Assert
//        _gameServiceClient.Received(1).CloneAdventureAsync(adventureId);
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