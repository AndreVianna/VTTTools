namespace VttTools.WebApp.Pages.Library.Adventures.Single;

[Trait("Category", "UI")]
public class AdventurePageTests
    : ComponentTestContext {
    private readonly IAdventuresHttpClient _client = Substitute.For<IAdventuresHttpClient>();
    private readonly AdventureDetails _testAdventure = new() {
        Name = "Test Adventure",
        Description = "Test Description",
        Type = AdventureType.OpenWorld,
        IsPublished = true,
        IsPublic = true,
    };

    public AdventurePageTests() {
        Services.AddSingleton(_client);
        Services.AddSingleton<IServiceScopeFactory>(Substitute.For<IServiceScopeFactory>());
        EnsureAuthenticated();
        _testAdventure.OwnerId = CurrentUser!.Id;
    }

    [Fact]
    public void AdventurePage_InViewMode_DisplaysCorrectButtons() {
        // Arrange
        var guid = Guid.NewGuid();
        _client.GetAdventureByIdAsync(guid).Returns(_testAdventure);

        // Act
        var cut = RenderComponent<AdventurePage>(parameters => parameters
            .Add(p => p.Action, "view")
            .Add(p => p.Id, guid));

        // Wait for async operations
        cut.WaitForState(() => cut.Instance.IsReady);
        cut.Render();

        // Assert
        cut.Find("#clone-button").Should().NotBeNull();
        cut.Find("#back-button").Should().NotBeNull();

        // Should not show edit mode buttons
        cut.FindAll("#save-continue-button").Should().BeEmpty();
        cut.FindAll("#save-finish-button").Should().BeEmpty();
        cut.FindAll("#discard-button").Should().BeEmpty();
        cut.FindAll("#cancel-button").Should().BeEmpty();
    }

    [Fact]
    public void AdventurePage_InCreateMode_DisplaysCorrectButtons() {
        // Act
        var cut = RenderComponent<AdventurePage>(parameters => parameters
            .Add(p => p.Action, "create"));

        // Wait for async operations
        cut.WaitForState(() => cut.Instance.IsReady);
        cut.Render();

        // Assert
        cut.Find("#save-continue-button").Should().NotBeNull();
        cut.Find("#save-finish-button").Should().NotBeNull();
        cut.Find("#discard-button").Should().NotBeNull();
        cut.Find("#cancel-button").Should().NotBeNull();

        // Should not show view mode buttons
        cut.FindAll("#edit-button").Should().BeEmpty();
        cut.FindAll("#clone-button").Should().BeEmpty();
        cut.FindAll("#back-button").Should().BeEmpty();
    }

    [Fact]
    public void AdventurePage_InEditMode_DisplaysCorrectButtons() {
        // Arrange
        var guid = Guid.NewGuid();
        _client.GetAdventureByIdAsync(guid).Returns(_testAdventure);

        // Act
        var cut = RenderComponent<AdventurePage>(parameters => parameters
            .Add(p => p.Action, "edit")
            .Add(p => p.Id, guid));

        // Wait for async operations
        cut.WaitForState(() => cut.Instance.IsReady);
        cut.Render();

        // Assert
        cut.Find("#save-continue-button").Should().NotBeNull();
        cut.Find("#save-finish-button").Should().NotBeNull();
        cut.Find("#discard-button").Should().NotBeNull();
        cut.Find("#cancel-button").Should().NotBeNull();

        // Should not show view mode buttons
        cut.FindAll("#edit-button").Should().BeEmpty();
        cut.FindAll("#clone-button").Should().BeEmpty();
        cut.FindAll("#back-button").Should().BeEmpty();
    }

    [Fact]
    public void AdventurePage_InCloneMode_DisplaysCorrectButtons() {
        // Arrange
        var guid = Guid.NewGuid();
        _client.GetAdventureByIdAsync(guid).Returns(_testAdventure);

        // Act
        var cut = RenderComponent<AdventurePage>(parameters => parameters
            .Add(p => p.Action, "clone")
            .Add(p => p.Id, guid));

        // Wait for async operations
        cut.WaitForState(() => cut.Instance.IsReady);
        cut.Render();

        // Assert
        cut.Find("#save-continue-button").Should().NotBeNull();
        cut.Find("#save-finish-button").Should().NotBeNull();
        cut.Find("#discard-button").Should().NotBeNull();
        cut.Find("#cancel-button").Should().NotBeNull();

        // Should not show view mode buttons
        cut.FindAll("#edit-button").Should().BeEmpty();
        cut.FindAll("#clone-button").Should().BeEmpty();
        cut.FindAll("#back-button").Should().BeEmpty();
    }

    [Fact]
    public void AdventurePage_InViewMode_WithIdParameter_LoadsAdventureData() {
        // Arrange
        var guid = Guid.NewGuid();
        _client.GetAdventureByIdAsync(guid).Returns(_testAdventure);

        // Act
        var cut = RenderComponent<AdventurePage>(parameters => parameters
            .Add(p => p.Action, "view")
            .Add(p => p.Id, guid));

        // Wait for async operations
        cut.WaitForState(() => cut.Instance.IsReady);
        cut.Render();

        // Assert
        cut.Find(".card-header h2").TextContent.Should().Be(_testAdventure.Name);
        cut.Find(".card-body").TextContent.Should().Contain(_testAdventure.Description);
        cut.Find(".card-body").TextContent.Should().Contain(_testAdventure.Type.ToString());
    }

    [Fact]
    public void AdventurePage_SaveButton_SubmitsForm() {
        // Arrange
        _client.CreateAdventureAsync(Arg.Any<CreateAdventureRequest>())
            .Returns(Result.Success(new AdventureListItem { Id = Guid.NewGuid() }));

        var cut = RenderComponent<AdventurePage>(parameters => parameters
            .Add(p => p.Action, "create"));

        // Wait for async operations
        cut.WaitForState(() => cut.Instance.IsReady);
        cut.Render();

        // Fill form
        cut.Find("#name").Change("New Test Adventure");
        cut.Find("#description").Change("New Test Description");

        // Act
        cut.Find("#save-finish-button").Click();

        // Assert
        _client.Received(1).CreateAdventureAsync(Arg.Is<CreateAdventureRequest>(request =>
            request.Name == "New Test Adventure" &&
            request.Description == "New Test Description"));
    }

    [Fact]
    public void AdventurePage_DiscardChangesButton_ResetsValues() {
        // Arrange
        var guid = Guid.NewGuid();
        _client.GetAdventureByIdAsync(guid).Returns(_testAdventure);

        var cut = RenderComponent<AdventurePage>(parameters => parameters
            .Add(p => p.Action, "edit")
            .Add(p => p.Id, guid));

        // Wait for async operations
        cut.WaitForState(() => cut.Instance.IsReady);
        cut.Render();

        // Make a change
        var nameInput = cut.Find("#name");
        nameInput.Change("Changed Name");
        nameInput.GetAttribute("value").Should().Be("Changed Name");

        // Act
        cut.Find("#discard-button").Click();

        // Assert - values should be reset to original
        cut.Find("#name").GetAttribute("value").Should().Be(_testAdventure.Name);
    }

    [Fact]
    public void AdventurePage_DeleteButton_ShowsDeleteConfirmationModal() {
        // Arrange
        var guid = Guid.NewGuid();
        _client.GetAdventureByIdAsync(guid).Returns(_testAdventure);

        var cut = RenderComponent<AdventurePage>(parameters => parameters
            .Add(p => p.Action, "edit")
            .Add(p => p.Id, guid));

        // Wait for async operations
        cut.WaitForState(() => cut.Instance.IsReady);
        cut.Render();

        // Act
        cut.Find("#delete-button").Click();

        // Assert
        cut.FindAll(".modal.show").Should().NotBeEmpty();
        cut.Find(".modal.show .modal-title").TextContent.Should().Contain("Confirm Deletion");
    }

    [Fact]
    public void AdventurePage_NavigatingAway_WithChanges_ShowsUnsavedChangesModal() {
        // Arrange
        var guid = Guid.NewGuid();
        _client.GetAdventureByIdAsync(guid).Returns(_testAdventure);

        var cut = RenderComponent<AdventurePage>(parameters => parameters
            .Add(p => p.Action, "edit")
            .Add(p => p.Id, guid));

        // Wait for async operations
        cut.WaitForState(() => cut.Instance.IsReady);
        cut.Render();

        // Make a change
        cut.Find("#name").Change("Changed Name");

        // Act - try to navigate away
        cut.Find("#cancel-button").Click();

        // Assert
        cut.FindAll(".modal.show").Should().NotBeEmpty();
        cut.Find(".modal.show .modal-title").TextContent.Should().Contain("Unsaved Changes");
    }
}