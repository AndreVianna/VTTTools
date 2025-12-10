
namespace VttTools.Assets.Services;

public class AssetServiceTests {
    private readonly IAssetStorage _assetStorage;
    private readonly IMediaStorage _mediaStorage;
    private readonly Guid _userId = Guid.CreateVersion7();
    private readonly CancellationToken _ct;

    public AssetServiceTests() {
        _assetStorage = Substitute.For<IAssetStorage>();
        _mediaStorage = Substitute.For<IMediaStorage>();
        _ct = TestContext.Current.CancellationToken;
    }

    private AssetService CreateServiceForTests()
        => new(_assetStorage, _mediaStorage);

    [Fact]
    public async Task GetAssetsAsync_CallsStorage() {
        var service = CreateServiceForTests();
        var assets = new Asset[] {
            new() {
                Id = Guid.CreateVersion7(),
                Name = "Test Asset 1",
                Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Goblin")
            },
            new() {
                Id = Guid.CreateVersion7(),
                Name = "Test Asset 2",
                Classification = new AssetClassification(AssetKind.Object, "Furniture", "Container", null)
            },
        };
        _assetStorage.GetAllAsync(Arg.Any<CancellationToken>()).Returns(assets);

        var result = await service.GetAssetsAsync(_ct);

        result.Should().BeEquivalentTo(assets);
        await _assetStorage.Received(1).GetAllAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAssetAsync_CallsStorage() {
        var service = CreateServiceForTests();
        var assetId = Guid.CreateVersion7();
        var asset = new Asset {
            Id = assetId,
            Name = "Test Asset",
            Description = "Test Description",
            Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Goblin"),
            OwnerId = _userId
        };
        _assetStorage.FindByIdAsync(_userId, assetId, Arg.Any<CancellationToken>()).Returns(asset);

        var result = await service.GetAssetByIdAsync(_userId, assetId, _ct);

        result.Should().BeEquivalentTo(asset);
        await _assetStorage.Received(1).FindByIdAsync(_userId, assetId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAssetAsync_CreatesNewAsset() {
        var service = CreateServiceForTests();
        var portraitId = Guid.CreateVersion7();
        var data = new CreateAssetData {
            Name = "New Asset",
            Description = "New Description",
            Kind = AssetKind.Creature,
            Category = "Humanoid",
            Type = "Goblinoid",
            Subtype = "Goblin",
            PortraitId = portraitId,
            TokenSize = new NamedSize(SizeName.Medium),
            Tags = ["hostile"]
        };
        _assetStorage.SearchAsync(_userId, search: data.Name, ct: Arg.Any<CancellationToken>())
            .Returns(([], 0));

        var result = await service.CreateAssetAsync(_userId, data, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().BeOfType<Asset>();
        result.Value.Name.Should().Be(data.Name);
        result.Value.Description.Should().Be(data.Description);
        result.Value.Classification.Kind.Should().Be(AssetKind.Creature);
        result.Value.Classification.Category.Should().Be("Humanoid");
        result.Value.Classification.Type.Should().Be("Goblinoid");
        result.Value.Classification.Subtype.Should().Be("Goblin");
        result.Value.OwnerId.Should().Be(_userId);
        await _assetStorage.Received(1).AddAsync(Arg.Any<Asset>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAssetAsync_WithOwner_UpdatesAsset() {
        var service = CreateServiceForTests();
        var assetId = Guid.CreateVersion7();
        var asset = new Asset {
            Id = assetId,
            Name = "Old Name",
            Description = "Old Description",
            Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Goblin"),
            OwnerId = _userId,
        };

        var portraitId = Guid.CreateVersion7();
        var data = new UpdateAssetData {
            Name = "Updated Name",
            Description = "Updated Description",
            PortraitId = Optional<Guid?>.Some(portraitId),
            IsPublished = true,
            IsPublic = true,
        };

        _assetStorage.FindByIdAsync(_userId, assetId, Arg.Any<CancellationToken>()).Returns(asset);

        var result = await service.UpdateAssetAsync(_userId, assetId, data, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be(data.Name.Value);
        result.Value.Description.Should().Be(data.Description.Value);
        result.Value.IsPublished.Should().Be(data.IsPublished.Value);
        result.Value.IsPublic.Should().Be(data.IsPublic.Value);
        result.Value.OwnerId.Should().Be(_userId);
        await _assetStorage.Received(1).UpdateAsync(Arg.Any<Asset>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAssetAsync_WithNonOwner_ReturnsNotAllowed() {
        var service = CreateServiceForTests();
        var assetId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var asset = new Asset {
            Id = assetId,
            Name = "Asset",
            Classification = new AssetClassification(AssetKind.Object, "Furniture", "Container", null),
            OwnerId = _userId,
        };

        var data = new UpdateAssetData {
            Name = "Updated Name",
        };

        _assetStorage.FindByIdAsync(nonOwnerId, assetId, Arg.Any<CancellationToken>()).Returns(asset);

        var result = await service.UpdateAssetAsync(nonOwnerId, assetId, data, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("NotAllowed");
        await _assetStorage.DidNotReceive().UpdateAsync(Arg.Any<Asset>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAssetAsync_WithPartialUpdate_OnlyUpdatesProvidedFields() {
        var service = CreateServiceForTests();
        var assetId = Guid.CreateVersion7();
        var asset = new Asset {
            Id = assetId,
            Name = "Original Name",
            Description = "Original Description",
            Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Goblin"),
            OwnerId = _userId,
        };

        var data = new UpdateAssetData {
            Name = "Updated Name",
        };

        _assetStorage.FindByIdAsync(_userId, assetId, Arg.Any<CancellationToken>()).Returns(asset);

        var result = await service.UpdateAssetAsync(_userId, assetId, data, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().BeOfType<Asset>();
        result.Value.Name.Should().Be(data.Name.Value);
        result.Value.Description.Should().Be(asset.Description);
        result.Value.Classification.Should().Be(asset.Classification);
        await _assetStorage.Received(1).UpdateAsync(Arg.Any<Asset>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteAssetAsync_WithOwner_DeletesAsset() {
        var service = CreateServiceForTests();
        var assetId = Guid.CreateVersion7();
        var asset = new Asset {
            Id = assetId,
            Name = "Asset",
            Classification = new AssetClassification(AssetKind.Object, "Furniture", "Container", null),
            OwnerId = _userId,
        };

        _assetStorage.FindByIdAsync(_userId, assetId, Arg.Any<CancellationToken>()).Returns(asset);

        var result = await service.DeleteAssetAsync(_userId, assetId, _ct);

        result.IsSuccessful.Should().BeTrue();
        await _assetStorage.Received(1).SoftDeleteAsync(assetId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteAssetAsync_WithNonOwner_ReturnsNotAllowed() {
        var service = CreateServiceForTests();
        var assetId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var asset = new Asset {
            Id = assetId,
            Name = "Asset",
            Classification = new AssetClassification(AssetKind.Object, "Furniture", "Container", null),
            OwnerId = _userId,
        };

        _assetStorage.FindByIdAsync(nonOwnerId, assetId, Arg.Any<CancellationToken>()).Returns(asset);

        var result = await service.DeleteAssetAsync(nonOwnerId, assetId, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("NotAllowed");
        await _assetStorage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteAssetAsync_WithNonExistentAsset_ReturnsNotFound() {
        var service = CreateServiceForTests();
        var assetId = Guid.CreateVersion7();
        _assetStorage.FindByIdAsync(_userId, assetId, Arg.Any<CancellationToken>()).Returns((Asset?)null);

        var result = await service.DeleteAssetAsync(_userId, assetId, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("NotFound");
        await _assetStorage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAssetAsync_WithNonExistentAsset_ReturnsNotFound() {
        var service = CreateServiceForTests();
        var assetId = Guid.CreateVersion7();
        var data = new UpdateAssetData {
            Name = "Updated Name",
        };

        _assetStorage.FindByIdAsync(_userId, assetId, Arg.Any<CancellationToken>()).Returns((Asset?)null);

        var result = await service.UpdateAssetAsync(_userId, assetId, data, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("NotFound");
        await _assetStorage.DidNotReceive().UpdateAsync(Arg.Any<Asset>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneAssetAsync_WithOwner_ClonesAsset() {
        var service = CreateServiceForTests();
        var templateId = Guid.CreateVersion7();
        var originalAsset = new Asset {
            Id = templateId,
            Name = "Original Asset",
            Description = "Original Description",
            Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Goblin"),
            OwnerId = _userId,
            Tags = ["tag1", "tag2"],
        };

        _assetStorage.FindByIdAsync(_userId, templateId, Arg.Any<CancellationToken>()).Returns(originalAsset);

        var result = await service.CloneAssetAsync(_userId, templateId, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Id.Should().NotBe(templateId);
        result.Value.Name.Should().Be(originalAsset.Name);
        result.Value.Description.Should().Be(originalAsset.Description);
        result.Value.Classification.Should().Be(originalAsset.Classification);
        result.Value.OwnerId.Should().Be(_userId);
        result.Value.Tags.Should().BeEquivalentTo(originalAsset.Tags);
        await _assetStorage.Received(1).AddAsync(Arg.Any<Asset>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneAssetAsync_WithPublicPublishedAsset_ClonesForNonOwner() {
        var service = CreateServiceForTests();
        var templateId = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var publicAsset = new Asset {
            Id = templateId,
            Name = "Public Asset",
            Description = "Public Description",
            Classification = new AssetClassification(AssetKind.Object, "Furniture", "Container", null),
            OwnerId = ownerId,
            IsPublic = true,
            IsPublished = true,
            Tags = ["public"],
        };

        _assetStorage.FindByIdAsync(_userId, templateId, Arg.Any<CancellationToken>()).Returns(publicAsset);

        var result = await service.CloneAssetAsync(_userId, templateId, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.OwnerId.Should().Be(_userId);
        result.Value.Tags.Should().BeEquivalentTo(publicAsset.Tags);
        await _assetStorage.Received(1).AddAsync(Arg.Any<Asset>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneAssetAsync_WithPrivateAsset_ReturnsNotAllowed() {
        var service = CreateServiceForTests();
        var templateId = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var privateAsset = new Asset {
            Id = templateId,
            Name = "Private Asset",
            Classification = new AssetClassification(AssetKind.Object, "Furniture", "Container", null),
            OwnerId = ownerId,
            IsPublic = false,
            IsPublished = false,
        };

        _assetStorage.FindByIdAsync(_userId, templateId, Arg.Any<CancellationToken>()).Returns(privateAsset);

        var result = await service.CloneAssetAsync(_userId, templateId, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("NotAllowed");
        await _assetStorage.DidNotReceive().AddAsync(Arg.Any<Asset>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneAssetAsync_WithUnpublishedPublicAsset_ReturnsNotAllowed() {
        var service = CreateServiceForTests();
        var templateId = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var unpublishedAsset = new Asset {
            Id = templateId,
            Name = "Unpublished Asset",
            Classification = new AssetClassification(AssetKind.Object, "Furniture", "Container", null),
            OwnerId = ownerId,
            IsPublic = true,
            IsPublished = false,
        };

        _assetStorage.FindByIdAsync(_userId, templateId, Arg.Any<CancellationToken>()).Returns(unpublishedAsset);

        var result = await service.CloneAssetAsync(_userId, templateId, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("NotAllowed");
        await _assetStorage.DidNotReceive().AddAsync(Arg.Any<Asset>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneAssetAsync_WithNonExistentAsset_ReturnsNotFound() {
        var service = CreateServiceForTests();
        var templateId = Guid.CreateVersion7();
        _assetStorage.FindByIdAsync(_userId, templateId, Arg.Any<CancellationToken>()).Returns((Asset?)null);

        var result = await service.CloneAssetAsync(_userId, templateId, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("NotFound");
        await _assetStorage.DidNotReceive().AddAsync(Arg.Any<Asset>(), Arg.Any<CancellationToken>());
    }
}