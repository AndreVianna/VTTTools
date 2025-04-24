namespace VttTools.WebApp.Components.Game.Pages;

public class AssetsHandlerTests {
    private readonly GameServiceClient _gameServiceClient = Substitute.For<GameServiceClient>();
    private readonly HttpClient _httpClient = Substitute.For<HttpClient>();
    private readonly Assets.Handler _handler;

    public AssetsHandlerTests() {
        _gameServiceClient.Api.Returns(_httpClient);
        _handler = new();
    }

    [Fact]
    public async Task InitializeAsync_LoadsAssets_And_ReturnsPageState() {
        // Arrange
        var assets = new[] {
            new Asset {
                Id = Guid.NewGuid(),
                Name = "Asset 1",
                Type = AssetType.Character,
                Source = "https://example.com/asset1",
                Visibility = Visibility.Public,
                      },
            new Asset {
                Id = Guid.NewGuid(),
                Name = "Asset 2",
                Type = AssetType.NPC,
                Source = "https://example.com/asset2",
                Visibility = Visibility.Private,
                      },
                           };

        _gameServiceClient.GetAssetsAsync().Returns(assets);

        // Act
        var state = await _handler.InitializeAsync(_gameServiceClient);

        // Assert
        state.Should().NotBeNull();
        state.Assets.Should().BeEquivalentTo(assets);
        await _gameServiceClient.Received(1).GetAssetsAsync();
    }

    [Fact]
    public async Task LoadAssetsAsync_UpdatesStateWithAssets() {
        // Arrange
        var state = new Assets.PageState();
        var assets = new[] {
            new Asset {
                Id = Guid.NewGuid(),
                Name = "Asset 1",
                Type = AssetType.Character,
                Source = "https://example.com/asset1",
                Visibility = Visibility.Public,
                      },
                           };

        _gameServiceClient.GetAssetsAsync().Returns(assets);

        // Act
        await _handler.LoadAssetsAsync(state);

        // Assert
        state.Assets.Should().BeEquivalentTo(assets);
        await _gameServiceClient.Received(1).GetAssetsAsync();
    }

    [Fact]
    public async Task CreateAssetAsync_WithValidInput_CreatesAssetAndResetsInput() {
        // Arrange
        var state = new Assets.PageState {
            Input = new() {
                              Name = "New Asset",
                              Source = "https://example.com/newasset",
                              Type = AssetType.Character,
                              Visibility = Visibility.Private,
                          },
                                         };

        _gameServiceClient.CreateAssetAsync(Arg.Any<CreateAssetRequest>())
            .Returns(Result.Success());

        var assets = new[] {
            new Asset {
                Id = Guid.NewGuid(),
                Name = "New Asset",
                Type = AssetType.Character,
                Source = "https://example.com/newasset",
                Visibility = Visibility.Private,
                      },
                           };
        _gameServiceClient.GetAssetsAsync().Returns(assets);

        // Act
        await _handler.CreateAssetAsync(state);

        // Assert
        await _gameServiceClient.Received(1).CreateAssetAsync(Arg.Is<CreateAssetRequest>(r =>
            r.Name == "New Asset" &&
            r.Source == "https://example.com/newasset" &&
            r.Type == AssetType.Character &&
            r.Visibility == Visibility.Private));

        state.Input.Name.Should().BeEmpty();
        state.Input.Source.Should().BeEmpty();
        state.Input.Type.Should().Be(AssetType.Placeholder);
        state.Input.Visibility.Should().Be(Visibility.Hidden);
        state.Assets.Should().BeEquivalentTo(assets);
    }

    [Fact]
    public async Task DeleteAssetAsync_RemovesAssetAndReloadsAssets() {
        // Arrange
        var assetId = Guid.NewGuid();
        var state = new Assets.PageState();

        var assetsAfterDelete = new Asset[] { };
        _gameServiceClient.GetAssetsAsync().Returns(assetsAfterDelete);

        // Act
        await _handler.DeleteAssetAsync(state, assetId);

        // Assert
        await _gameServiceClient.Received(1).DeleteAssetAsync(assetId);
        await _gameServiceClient.Received(1).GetAssetsAsync();
        state.Assets.Should().BeEquivalentTo(assetsAfterDelete);
    }
}