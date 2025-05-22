namespace VttTools.WebApp.Pages.Assets;

public class AssetsPageHandlerTests
    : ComponentTestContext {
    private readonly IAssetsServerHttpClient _serverHttpClient = Substitute.For<IAssetsServerHttpClient>();
    private readonly AssetsPage _page = Substitute.For<AssetsPage>();

    public AssetsPageHandlerTests() {
        var assets = new[] {
            new Asset { Name = "Asset 1", Description = "Asset 1 Description", IsPublished = true, IsPublic = true },
            new Asset { Name = "Asset 2", Description = "Asset 2 Description", IsPublished = true, IsPublic = true },
        };
        _serverHttpClient.GetAssetsAsync().Returns(assets);
        _page.HttpContext.Returns(HttpContext);
        _page.NavigationManager.Returns(NavigationManager);
        _page.Logger.Returns(NullLogger.Instance);
    }

    [Fact]
    public async Task InitializeAsync_LoadsAssets_And_ReturnsHandler() {
        // Arrange & Act
        var handler = await CreateHandler();

        // Assert
        handler.Should().NotBeNull();
        _page.State.Assets.Should().NotBeEmpty();
    }

    [Fact]
    public async Task CreateAssetAsync_WithValidInput_CreatesAssetAndResetsInput() {
        // Arrange
        var handler = await CreateHandler();
        _page.State.Input = new() {
            Name = "New Asset",
            Description = "New Asset Description",
        };
        var newAsset = new Asset {
            Name = "New Asset",
            Description = "New Asset Description",
        };

        _serverHttpClient.CreateAssetAsync(Arg.Any<CreateAssetRequest>()).Returns(newAsset);

        // Act
        await handler.SaveCreatedAsset();

        // Assert
        _page.State.Assets.Should().HaveCount(3);
    }

    [Fact]
    public async Task DeleteAssetAsync_RemovesAssetAndReloadsAssets() {
        // Arrange
        var handler = await CreateHandler();
        var assetId = _page.State.Assets[1].Id;
        _serverHttpClient.DeleteAssetAsync(Arg.Any<Guid>()).Returns(true);

        // Act
        await handler.DeleteAsset(assetId);

        // Assert
        _page.State.Assets.Should().HaveCount(1);
    }

    private async Task<AssetsPageHandler> CreateHandler(bool isAuthorized = true, bool isConfigured = true) {
        if (isAuthorized) EnsureAuthenticated();
        var handler = new AssetsPageHandler(_page);
        if (isConfigured) await handler.LoadAssetsAsync(_serverHttpClient);
        return handler;
    }
}