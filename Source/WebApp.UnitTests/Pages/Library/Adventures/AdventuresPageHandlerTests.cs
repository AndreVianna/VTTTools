namespace VttTools.WebApp.Pages.Library.Adventures;

public class AdventuresPageHandlerTests
    : ComponentTestContext {
    private readonly AdventuresPage _page = Substitute.For<AdventuresPage>();
    private readonly ILibraryClient _client = Substitute.For<ILibraryClient>();

    public AdventuresPageHandlerTests() {
        var adventures = new[] {
            new AdventureListItem {
                Name = "Adventure 1",
                Description = "Adventure 1 Description",
                Type = AdventureType.Survival,
                ImagePath = "path/to/image1.png",
                IsVisible = true,
                IsPublic = true,
            },
            new AdventureListItem {
                Name = "Adventure 2",
                Description = "Adventure 2 Description",
                Type = AdventureType.OpenWorld,
                ImagePath = "path/to/image2.png",
                IsVisible = false,
                IsPublic = false,
            },
        };
        _client.GetAdventuresAsync().Returns(adventures);
        _page.HttpContext.Returns(HttpContext);
        _page.NavigationManager.Returns(NavigationManager);
        _page.Logger.Returns(NullLogger.Instance);
    }

    [Fact]
    public async Task InitializeAsync_LoadsAdventures_And_ReturnsPageState() {
        // Arrange & Act
        var handler = await CreateHandler();

        // Assert
        handler.Should().NotBeNull();
        _page.State.Adventures.Should().NotBeEmpty();
    }

    [Fact]
    public async Task DeleteAdventureAsync_RemovesAdventureAndReloadsAdventures() {
        // Arrange
        var handler = await CreateHandler();
        var adventureId = _page.State.Adventures[1].Id;
        _client.DeleteAdventureAsync(Arg.Any<Guid>()).Returns(true);

        // Act
        await handler.DeleteAdventure(adventureId);

        // Assert
        _page.State.Adventures.Should().HaveCount(1);
    }

    [Fact]
    public async Task CloneAdventureAsync_ClonesAdventureAndReloadsAdventures() {
        // Arrange
        var handler = await CreateHandler();
        var adventureId = Guid.NewGuid();
        _page.State.Adventures = [new AdventureListItem { Id = adventureId, Name = "Adventure 1" }];
        var clonedAdventure = new AdventureListItem { Id = Guid.NewGuid(), Name = "Adventure 1 (Copy)" };
        var adventuresAfterClone = new[] {
            new AdventureListItem { Id = adventureId, Name = "Adventure 1" },
            new AdventureListItem { Id = clonedAdventure.Id, Name = clonedAdventure.Name },
        };

        _client.CloneAdventureAsync(adventureId, Arg.Any<CloneAdventureRequest>()).Returns(clonedAdventure);

        // Act
        await handler.CloneAdventure(adventureId);

        // Assert
        _page.State.Adventures.Should().BeEquivalentTo(adventuresAfterClone);
    }

    private async Task<AdventuresHandler> CreateHandler(bool isAuthorized = true, bool isConfigured = true) {
        if (isAuthorized) EnsureAuthenticated();
        var handler = new AdventuresHandler(_page);
        if (isConfigured) await handler.LoadAdventuresAsync(_client);
        return handler;
    }
}