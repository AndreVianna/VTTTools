namespace VttTools.WebApp.Pages.Game;

public class AssetsPageTests : WebAppTestContext {
    private readonly IGameService _service = Substitute.For<IGameService>();

    public AssetsPageTests() {
        Services.AddScoped<IGameService>(_ => _service);
        UseDefaultUser();
    }

    [Fact]
    public void Assets_WhenIsLoading_RendersLoadingState() {
        _service.GetAssetsAsync().Returns(Task.Delay(1000).ContinueWith(_ => Array.Empty<Asset>()));

        // Act
        var cut = RenderComponent<AssetsPage>();

        // Assert
        cut.Markup.Should().Contain("""<span class="visually-hidden">Loading...</span>""");
    }

    [Fact]
    public void Assets_RendersAssetsList_WhenStateHasAssets() {
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
                Type = AssetType.Creature,
                Source = "https://example.com/asset2",
                Visibility = Visibility.Private,
            },
        };

        _service.GetAssetsAsync().Returns(assets);

        // Act
        var cut = RenderComponent<AssetsPage>();
        cut.WaitForState(() => cut.Instance.IsReady);

        // Assert
        cut.Markup.Should().NotContain("""<span class="visually-hidden">Loading...</span>""");

        var rows = cut.FindAll("tbody tr");
        rows.Count.Should().Be(2);

        var firstRowCells = rows[0].QuerySelectorAll("td");
        firstRowCells[0].TextContent.Should().Be("Asset 1");
        firstRowCells[1].TextContent.Should().Be(nameof(AssetType.Character));
        firstRowCells[2].TextContent.Should().Be("Link");
        firstRowCells[3].TextContent.Should().Be(nameof(Visibility.Public));
        firstRowCells[4].TextContent.Should().Be("Delete");

        var secondRowCells = rows[1].QuerySelectorAll("td");
        secondRowCells[0].TextContent.Should().Be("Asset 2");
        secondRowCells[1].TextContent.Should().Be(nameof(AssetType.Creature));
        secondRowCells[2].TextContent.Should().Be("Link");
        secondRowCells[3].TextContent.Should().Be(nameof(Visibility.Private));
        secondRowCells[4].TextContent.Should().Be("Delete");
    }

    [Fact]
    public void Creating_Asset_CallsCreateAssetMethod() {
        // Arrange
        var newAsset = new Asset {
            Name = "New Test Asset",
            Source = "https://example.com/newasset",
            Type = AssetType.NPC,
            Visibility = Visibility.Public,
        };

        var cut = RenderComponent<AssetsPage>();
        cut.WaitForState(() => cut.Instance.IsReady);
        cut.Markup.Should().NotContain("""<span class="visually-hidden">Loading...</span>""");
        var nameInput = cut.Find("input[placeholder='Subject']");
        nameInput.Change(newAsset.Name);
        var sourceInput = cut.Find("input[placeholder='Source URL']");
        sourceInput.Change(newAsset.Source);
        var typeSelect = cut.FindAll("select")[0];
        typeSelect.Change(newAsset.Type.ToString());
        var visibilitySelect = cut.FindAll("select")[1];
        visibilitySelect.Change(newAsset.Visibility.ToString());
        var createButton = cut.Find("button.btn-primary");

        _service.CreateAssetAsync(Arg.Any<CreateAssetRequest>()).Returns(newAsset);

        // Act
        createButton.Click();

        // Assert
        _service.Received(1).CreateAssetAsync(Arg.Any<CreateAssetRequest>());
    }

    [Fact]
    public void Clicking_DeleteButton_CallsDeleteAsset() {
        // Arrange
        var assetId = Guid.NewGuid();
        var assets = new[] {
            new Asset {
                Id = assetId,
                Name = "Asset to Delete",
                Type = AssetType.NPC,
                Source = "https://example.com/delete",
                Visibility = Visibility.Public,
            },
        };

        _service.GetAssetsAsync().Returns(assets);

        var cut = RenderComponent<AssetsPage>();
        cut.WaitForState(() => cut.Instance.IsReady);
        cut.Markup.Should().NotContain("""<span class="visually-hidden">Loading...</span>""");
        var deleteButton = cut.Find("button.btn-danger");

        // Act
        deleteButton.Click();

        // Assert
        _service.Received(1).DeleteAssetAsync(assetId);
    }
}