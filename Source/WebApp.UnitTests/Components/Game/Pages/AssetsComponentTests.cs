//namespace VttTools.WebApp.Components.Game.Pages;

//public class AssetsComponentTests : Bunit.TestContext {
//    private readonly GameService _gameServiceClient = Substitute.For<GameService>();
//    private readonly HttpClient _httpClient = Substitute.For<HttpClient>();

//    public AssetsComponentTests() {
//        _gameServiceClient.Api.Returns(_httpClient);
//        Services.AddSingleton<GameService>(_gameServiceClient);
//    }

//    [Fact]
//    public void Assets_RendersLoadingState_WhenStateIsNull() {
//        // Act
//        var cut = RenderComponent<Assets>();

//        // Assert
//        cut.Find("p").TextContent.Should().Contain("Loading");
//    }

//    [Fact]
//    public void Assets_RendersAssetsList_WhenStateHasAssets() {
//        // Arrange
//        var assets = new[] {
//            new Asset {
//                Id = Guid.NewGuid(),
//                Name = "Asset 1",
//                Type = AssetType.Character,
//                Source = "https://example.com/asset1",
//                Visibility = Visibility.Public,
//                      },
//            new Asset {
//                Id = Guid.NewGuid(),
//                Name = "Asset 2",
//                Type = AssetType.Map,
//                Source = "https://example.com/asset2",
//                Visibility = Visibility.Private,
//                      },
//                           };

//        _gameServiceClient.GetAssetsAsync().Returns(assets);

//        // Act
//        var cut = RenderComponent<Assets>();

//        // Allow the component to initialize asynchronously
//        WaitForState(() => cut.Instance.State?.Assets != null);

//        // Assert
//        var rows = cut.FindAll("tbody tr");
//        rows.Count.Should().Be(2);

//        var firstRowCells = rows[0].FindAll("td");
//        firstRowCells[0].TextContent.Should().Be("Asset 1");
//        firstRowCells[1].TextContent.Should().Be(AssetType.Character.ToString());
//        firstRowCells[3].TextContent.Should().Be(Visibility.Public.ToString());

//        var secondRowCells = rows[1].FindAll("td");
//        secondRowCells[0].TextContent.Should().Be("Asset 2");
//        secondRowCells[1].TextContent.Should().Be(AssetType.Map.ToString());
//        secondRowCells[3].TextContent.Should().Be(Visibility.Private.ToString());
//    }

//    [Fact]
//    public void Creating_Asset_CallsCreateAssetMethod() {
//        // Arrange
//        _gameServiceClient.GetAssetsAsync().Returns([]);

//        // Act
//        var cut = RenderComponent<Assets>();

//        // Fill in the form
//        var nameInput = cut.Find("input[placeholder='Subject']");
//        nameInput.Change("New Test Asset");

//        var sourceInput = cut.Find("input[placeholder='Source URL']");
//        sourceInput.Change("https://example.com/newasset");

//        var typeSelect = cut.FindAll("select")[0];
//        typeSelect.Change(AssetType.Token.ToString());

//        var visibilitySelect = cut.FindAll("select")[1];
//        visibilitySelect.Change(Visibility.Public.ToString());

//        // Click create button
//        var createButton = cut.Find("button.btn-primary");
//        createButton.Click();

//        // Assert
//        _gameServiceClient.Received(1).CreateAssetAsync(Arg.Is<CreateAssetRequest>(r =>
//            r.Name == "New Test Asset" &&
//            r.Source == "https://example.com/newasset" &&
//            r.Type == AssetType.Token &&
//            r.Visibility == Visibility.Public));
//    }

//    [Fact]
//    public void Clicking_DeleteButton_CallsDeleteAsset() {
//        // Arrange
//        var assetId = Guid.NewGuid();
//        var assets = new[] {
//            new Asset {
//                Id = assetId,
//                Name = "Asset to Delete",
//                Type = AssetType.Token,
//                Source = "https://example.com/delete",
//                Visibility = Visibility.Public,
//                      },
//                           };

//        _gameServiceClient.GetAssetsAsync().Returns(assets);

//        // Act
//        var cut = RenderComponent<Assets>();

//        // Wait for component to initialize
//        WaitForState(() => cut.Instance.State?.Assets != null);

//        // Click delete button
//        var deleteButton = cut.Find("button.btn-danger");
//        deleteButton.Click();

//        // Assert
//        _gameServiceClient.Received(1).DeleteAssetAsync(assetId);
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