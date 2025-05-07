namespace VttTools.WebApp.Pages.Assets;

public class AssetsPageHandlerTests
    : WebAppTestContext {
    private readonly IGameService _service = Substitute.For<IGameService>();

    public AssetsPageHandlerTests() {
        var assets = new[] {
            new Asset { Name = "Asset 1", Visibility = Visibility.Public },
            new Asset { Name = "Asset 2", Visibility = Visibility.Private },
        };
        _service.GetAssetsAsync().Returns(assets);
    }

    [Fact]
    public async Task InitializeAsync_LoadsAssets_And_ReturnsHandler() {
        // Arrange & Act
        var handler = await CreateHandler();

        // Assert
        handler.Should().NotBeNull();
        handler.State.Assets.Should().NotBeEmpty();
    }

    [Fact]
    public async Task CreateAssetAsync_WithValidInput_CreatesAssetAndResetsInput() {
        // Arrange
        var handler = await CreateHandler();
        handler.State.Input = new() {
            Name = "New Asset",
            Visibility = Visibility.Private,
        };
        var newAsset = new Asset {
            Name = "New Asset",
            Visibility = Visibility.Private,
        };

        _service.CreateAssetAsync(Arg.Any<CreateAssetRequest>()).Returns(newAsset);

        // Act
        await handler.SaveCreatedAsset();

        // Assert
        handler.State.Assets.Should().HaveCount(3);
    }

    [Fact]
    public async Task DeleteAssetAsync_RemovesAssetAndReloadsAssets() {
        // Arrange
        var handler = await CreateHandler();
        var assetId = handler.State.Assets[1].Id;
        _service.DeleteAssetAsync(Arg.Any<Guid>()).Returns(true);

        // Act
        await handler.DeleteAsset(assetId);

        // Assert
        handler.State.Assets.Should().HaveCount(1);
    }

    private async Task<AssetsPageHandler> CreateHandler(bool isAuthorized = true, bool isConfigured = true) {
        if (isAuthorized)
            EnsureAuthenticated();
        var handler = new AssetsPageHandler(HttpContext, NavigationManager, CurrentUser!, NullLoggerFactory.Instance);
        if (isConfigured)
            await handler.ConfigureAsync(_service);
        return handler;
    }
}