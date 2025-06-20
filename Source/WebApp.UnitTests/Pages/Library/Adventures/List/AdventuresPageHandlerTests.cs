namespace VttTools.WebApp.Pages.Library.Adventures.List;

public class AdventuresPageHandlerTests
    : ComponentTestContext {
    private readonly AdventuresPage _page = Substitute.For<AdventuresPage>();
    private readonly IAdventuresHttpClient _serverHttpClient = Substitute.For<IAdventuresHttpClient>();

    public AdventuresPageHandlerTests() {
        var adventures = new[] {
            new AdventureListItem {
                Id = Guid.NewGuid(),
                Name = "Adventure 1",
                Description = "Adventure 1 Description",
                Type = AdventureType.Survival,
                IsPublished = true,
                IsPublic = true,
                ScenesCount = 3,
                OwnerId = Guid.NewGuid(),
            },
            new AdventureListItem {
                Id = Guid.NewGuid(),
                Name = "Adventure 2",
                Description = "Adventure 2 Description",
                Type = AdventureType.OpenWorld,
                IsPublished = false,
                IsPublic = false,
                ScenesCount = 1,
                OwnerId = Guid.NewGuid(),
            },
        };
        _serverHttpClient.GetAdventuresAsync().Returns(adventures);
        _page.HttpContext.Returns(HttpContext);
        _page.NavigationManager.Returns(NavigationManager);
        _page.Logger.Returns(NullLogger.Instance);
        _page.User.Returns(new LoggedUser(DefaultUser.Id, DefaultUser.DisplayName, DefaultUser.IsAdministrator));
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
        _serverHttpClient.DeleteAdventureAsync(Arg.Any<Guid>()).Returns(true);

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

        _serverHttpClient.CloneAdventureAsync(adventureId).Returns(clonedAdventure);

        // Act
        await handler.CloneAdventure(adventureId);

        // Assert
        _page.State.Adventures.Should().BeEquivalentTo(adventuresAfterClone);
    }

    private async Task<AdventuresHandler> CreateHandler(bool isAuthorized = true, bool isConfigured = true) {
        if (isAuthorized)
            EnsureAuthenticated();
        var handler = new AdventuresHandler(_page);
        if (isConfigured)
            await handler.LoadAdventuresAsync(_serverHttpClient);
        return handler;
    }
}