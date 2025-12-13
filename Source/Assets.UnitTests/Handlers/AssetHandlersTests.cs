namespace VttTools.Assets.Handlers;

public class AssetHandlersTests {
    private readonly IAssetService _assetService;
    private readonly Guid _userId = Guid.CreateVersion7();
    private readonly CancellationToken _ct;

    public AssetHandlersTests() {
        _assetService = Substitute.For<IAssetService>();
        _ct = TestContext.Current.CancellationToken;
    }

    private HttpContext CreateHttpContext() {
        var context = new DefaultHttpContext();
        var claims = new List<Claim> {
            new(ClaimTypes.NameIdentifier, _userId.ToString())
        };
        context.User = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));
        return context;
    }

    [Fact]
    public async Task GetAssetsHandler_WithNoFilters_ReturnsAllAssets() {
        var context = CreateHttpContext();
        var assets = new Asset[] {
            new() {
                Id = Guid.CreateVersion7(),
                Name = "Asset 1",
                Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Goblin")
            },
            new() {
                Id = Guid.CreateVersion7(),
                Name = "Asset 2",
                Classification = new AssetClassification(AssetKind.Object, "Furniture", "Container", null)
            }
        };
        _assetService.SearchAssetsAsync(_userId, null, null, null, null, null, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>())
            .Returns((assets, assets.Length));

        var result = await AssetHandlers.GetAssetsHandler(
            context,
            null, null, null, null, null, null, null, null, null, null, null, null,
            _assetService);

        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
        var okResult = result as IStatusCodeHttpResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(200);
        await _assetService.Received(1).SearchAssetsAsync(_userId, null, null, null, null, null, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAssetsHandler_WithKindFilter_FiltersAssets() {
        var context = CreateHttpContext();
        var assets = new Asset[] {
            new() {
                Id = Guid.CreateVersion7(),
                Name = "Creature Asset",
                Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Goblin")
            }
        };
        _assetService.SearchAssetsAsync(_userId, null, AssetKind.Creature, null, null, null, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>())
            .Returns((assets, assets.Length));

        var result = await AssetHandlers.GetAssetsHandler(
            context,
            null, "Creature", null, null, null, null, null, null, null, null, null, null,
            _assetService);

        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
        var okResult = result as IStatusCodeHttpResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(200);
        await _assetService.Received(1).SearchAssetsAsync(_userId, null, AssetKind.Creature, null, null, null, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAssetsHandler_WithCategoryFilter_FiltersAssets() {
        var context = CreateHttpContext();
        const string category = "Humanoid";
        var assets = new Asset[] {
            new() {
                Id = Guid.CreateVersion7(),
                Name = "Humanoid Asset",
                Classification = new AssetClassification(AssetKind.Creature, category, "Goblinoid", "Goblin")
            }
        };
        _assetService.SearchAssetsAsync(_userId, null, null, category, null, null, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>())
            .Returns((assets, assets.Length));

        var result = await AssetHandlers.GetAssetsHandler(
            context,
            null, null, category, null, null, null, null, null, null, null, null, null,
            _assetService);

        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
        var okResult = result as IStatusCodeHttpResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(200);
        await _assetService.Received(1).SearchAssetsAsync(_userId, null, null, category, null, null, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAssetsHandler_WithSearchTerm_SearchesAssets() {
        var context = CreateHttpContext();
        const string searchTerm = "goblin";
        var assets = new Asset[] {
            new() {
                Id = Guid.CreateVersion7(),
                Name = "Goblin Warrior",
                Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Goblin")
            }
        };
        _assetService.SearchAssetsAsync(_userId, null, null, null, null, null, searchTerm, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>())
            .Returns((assets, assets.Length));

        var result = await AssetHandlers.GetAssetsHandler(
            context,
            null, null, null, null, null, searchTerm, null, null, null, null, null, null,
            _assetService);

        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
        var okResult = result as IStatusCodeHttpResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(200);
        await _assetService.Received(1).SearchAssetsAsync(_userId, null, null, null, null, null, searchTerm, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAssetsHandler_WithPagination_ReturnsPaginatedResults() {
        var context = CreateHttpContext();
        const int pageIndex = 0;
        const int pageSize = 10;
        const int totalCount = 25;
        var assets = new Asset[pageSize];
        _assetService.SearchAssetsAsync(_userId, null, null, null, null, null, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, Arg.Is<Pagination>(p => p.Index == pageIndex && p.Size == pageSize), Arg.Any<CancellationToken>())
            .Returns((assets, totalCount));

        var result = await AssetHandlers.GetAssetsHandler(
            context,
            null, null, null, null, null, null, null, null, null, null, pageIndex, pageSize,
            _assetService);

        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
        var okResult = result as IStatusCodeHttpResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(200);
        await _assetService.Received(1).SearchAssetsAsync(_userId, null, null, null, null, null, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, Arg.Is<Pagination>(p => p.Index == pageIndex && p.Size == pageSize), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAssetsHandler_WithSorting_ReturnsSortedResults() {
        var context = CreateHttpContext();
        var assets = Array.Empty<Asset>();
        _assetService.SearchAssetsAsync(_userId, null, null, null, null, null, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), AssetSortBy.Name, SortDirection.Ascending, null, Arg.Any<CancellationToken>())
            .Returns((assets, 0));

        var result = await AssetHandlers.GetAssetsHandler(
            context,
            null, null, null, null, null, null, null, null, "Name", "Ascending", null, null,
            _assetService);

        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
        var okResult = result as IStatusCodeHttpResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(200);
        await _assetService.Received(1).SearchAssetsAsync(_userId, null, null, null, null, null, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), AssetSortBy.Name, SortDirection.Ascending, null, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAssetByIdHandler_WithExistingAsset_ReturnsAsset() {
        var context = CreateHttpContext();
        var assetId = Guid.CreateVersion7();
        var asset = new Asset {
            Id = assetId,
            Name = "Test Asset",
            Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Goblin"),
            OwnerId = _userId,
            IsPublic = false,
            IsPublished = false
        };
        _assetService.GetAssetByIdAsync(_userId, assetId, Arg.Any<CancellationToken>()).Returns(asset);

        var result = await AssetHandlers.GetAssetByIdHandler(context, assetId, _assetService);

        result.Should().BeOfType<Ok<Asset>>();
        var okResult = (Ok<Asset>)result;
        okResult.Value.Should().BeEquivalentTo(asset);
    }

    [Fact]
    public async Task GetAssetByIdHandler_WithNonExistentAsset_ReturnsNotFound() {
        var context = CreateHttpContext();
        var assetId = Guid.CreateVersion7();
        _assetService.GetAssetByIdAsync(_userId, assetId, Arg.Any<CancellationToken>()).Returns((Asset?)null);

        var result = await AssetHandlers.GetAssetByIdHandler(context, assetId, _assetService);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task GetAssetByIdHandler_WithNonOwnerPrivateAsset_ReturnsForbid() {
        var context = CreateHttpContext();
        var assetId = Guid.CreateVersion7();
        var asset = new Asset {
            Id = assetId,
            Name = "Private Asset",
            Classification = new AssetClassification(AssetKind.Object, "Furniture", "Container", null),
            OwnerId = Guid.CreateVersion7(),
            IsPublic = false,
            IsPublished = false
        };
        _assetService.GetAssetByIdAsync(_userId, assetId, Arg.Any<CancellationToken>()).Returns(asset);

        var result = await AssetHandlers.GetAssetByIdHandler(context, assetId, _assetService);

        result.Should().BeOfType<ForbidHttpResult>();
    }

    [Fact]
    public async Task GetAssetByIdHandler_WithPublicPublishedAsset_ReturnsAsset() {
        var context = CreateHttpContext();
        var assetId = Guid.CreateVersion7();
        var asset = new Asset {
            Id = assetId,
            Name = "Public Asset",
            Classification = new AssetClassification(AssetKind.Object, "Furniture", "Container", null),
            OwnerId = Guid.CreateVersion7(),
            IsPublic = true,
            IsPublished = true
        };
        _assetService.GetAssetByIdAsync(_userId, assetId, Arg.Any<CancellationToken>()).Returns(asset);

        var result = await AssetHandlers.GetAssetByIdHandler(context, assetId, _assetService);

        result.Should().BeOfType<Ok<Asset>>();
    }

    [Fact]
    public async Task CreateAssetHandler_WithValidData_ReturnsCreated() {
        var context = CreateHttpContext();
        var request = new CreateAssetRequest {
            Kind = AssetKind.Creature,
            Category = "Humanoid",
            Type = "Goblinoid",
            Subtype = "Goblin",
            Name = "New Asset",
            Description = "New Description"
        };
        var createdAsset = new Asset {
            Id = Guid.CreateVersion7(),
            Name = request.Name,
            Description = request.Description,
            Classification = new AssetClassification(request.Kind, request.Category, request.Type, request.Subtype),
            OwnerId = _userId
        };
        _assetService.CreateAssetAsync(_userId, Arg.Any<CreateAssetData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(createdAsset));

        var result = await AssetHandlers.CreateAssetHandler(context, request, _assetService);

        result.Should().BeOfType<Created<Asset>>();
        var createdResult = (Created<Asset>)result;
        createdResult.Value.Should().BeEquivalentTo(createdAsset);
        createdResult.Location.Should().Be($"/api/assets/{createdAsset.Id}");
    }

    [Fact]
    public async Task CreateAssetHandler_WithValidationErrors_ReturnsValidationProblem() {
        var context = CreateHttpContext();
        var request = new CreateAssetRequest {
            Kind = AssetKind.Creature,
            Category = "",
            Type = "",
            Name = "",
            Description = ""
        };
        var errors = new Error[] {
            new("The asset category cannot be null or empty.", "GeneratedContentType"),
            new("The asset type cannot be null or empty.", "Type"),
            new("The asset name cannot be null or empty.", "Name"),
            new("The asset description cannot be null or empty.", "Description")
        };
        _assetService.CreateAssetAsync(_userId, Arg.Any<CreateAssetData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure<Asset>(null!, errors));

        var result = await AssetHandlers.CreateAssetHandler(context, request, _assetService);

        result.Should().BeOfType<ProblemHttpResult>();
        var problemResult = (ProblemHttpResult)result;
        problemResult.StatusCode.Should().Be(400);
    }

    [Fact]
    public async Task CreateAssetHandler_WithDuplicateName_ReturnsConflict() {
        var context = CreateHttpContext();
        var request = new CreateAssetRequest {
            Kind = AssetKind.Creature,
            Category = "Humanoid",
            Type = "Goblinoid",
            Name = "Duplicate Asset",
            Description = "Description"
        };
        _assetService.CreateAssetAsync(_userId, Arg.Any<CreateAssetData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure<Asset>(null!, new Error("Duplicate asset name. An asset named 'Duplicate Asset' already exists for this user.")));

        var result = await AssetHandlers.CreateAssetHandler(context, request, _assetService);

        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
        var conflictResult = result as IStatusCodeHttpResult;
        conflictResult.Should().NotBeNull();
        conflictResult!.StatusCode.Should().Be(409);
    }

    [Fact]
    public async Task UpdateAssetHandler_WithValidData_ReturnsNoContent() {
        var context = CreateHttpContext();
        var assetId = Guid.CreateVersion7();
        var request = new UpdateAssetRequest {
            Name = "Updated Name",
            Description = "Updated Description"
        };
        var updatedAsset = new Asset {
            Id = assetId,
            Name = request.Name.Value,
            Description = request.Description.Value,
            Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Goblin"),
            OwnerId = _userId
        };
        _assetService.UpdateAssetAsync(_userId, assetId, Arg.Any<UpdateAssetData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(updatedAsset));

        var result = await AssetHandlers.UpdateAssetHandler(context, assetId, request, _assetService);

        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task UpdateAssetHandler_WithNonExistentAsset_ReturnsNotFound() {
        var context = CreateHttpContext();
        var assetId = Guid.CreateVersion7();
        var request = new UpdateAssetRequest {
            Name = "Updated Name"
        };
        _assetService.UpdateAssetAsync(_userId, assetId, Arg.Any<UpdateAssetData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure<Asset>(null!, new Error("NotFound")));

        var result = await AssetHandlers.UpdateAssetHandler(context, assetId, request, _assetService);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task UpdateAssetHandler_WithNonOwner_ReturnsForbid() {
        var context = CreateHttpContext();
        var assetId = Guid.CreateVersion7();
        var request = new UpdateAssetRequest {
            Name = "Updated Name"
        };
        _assetService.UpdateAssetAsync(_userId, assetId, Arg.Any<UpdateAssetData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure<Asset>(null!, new Error("NotAllowed")));

        var result = await AssetHandlers.UpdateAssetHandler(context, assetId, request, _assetService);

        result.Should().BeOfType<ForbidHttpResult>();
    }

    [Fact]
    public async Task UpdateAssetHandler_WithValidationErrors_ReturnsValidationProblem() {
        var context = CreateHttpContext();
        var assetId = Guid.CreateVersion7();
        var request = new UpdateAssetRequest {
            Name = ""
        };
        var errors = new Error[] {
            new("When set, the asset name cannot be null or empty.", "Name")
        };
        _assetService.UpdateAssetAsync(_userId, assetId, Arg.Any<UpdateAssetData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure<Asset>(null!, errors));

        var result = await AssetHandlers.UpdateAssetHandler(context, assetId, request, _assetService);

        result.Should().BeOfType<ProblemHttpResult>();
        var problemResult = (ProblemHttpResult)result;
        problemResult.StatusCode.Should().Be(400);
    }

    [Fact]
    public async Task DeleteAssetHandler_WithOwner_ReturnsNoContent() {
        var context = CreateHttpContext();
        var assetId = Guid.CreateVersion7();
        _assetService.DeleteAssetAsync(_userId, assetId, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        var result = await AssetHandlers.DeleteAssetHandler(context, assetId, _assetService);

        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task DeleteAssetHandler_WithNonExistentAsset_ReturnsNotFound() {
        var context = CreateHttpContext();
        var assetId = Guid.CreateVersion7();
        _assetService.DeleteAssetAsync(_userId, assetId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure(new Error("NotFound")));

        var result = await AssetHandlers.DeleteAssetHandler(context, assetId, _assetService);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task DeleteAssetHandler_WithNonOwner_ReturnsForbid() {
        var context = CreateHttpContext();
        var assetId = Guid.CreateVersion7();
        _assetService.DeleteAssetAsync(_userId, assetId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure(new Error("NotAllowed")));

        var result = await AssetHandlers.DeleteAssetHandler(context, assetId, _assetService);

        result.Should().BeOfType<ForbidHttpResult>();
    }

    [Fact]
    public async Task CloneAssetHandler_WithOwner_ReturnsCreated() {
        var context = CreateHttpContext();
        var templateId = Guid.CreateVersion7();
        var clonedAsset = new Asset {
            Id = Guid.CreateVersion7(),
            Name = "Cloned Asset",
            Description = "Cloned Description",
            Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Goblin"),
            OwnerId = _userId
        };
        _assetService.CloneAssetAsync(_userId, templateId, Arg.Any<CancellationToken>())
            .Returns(Result.Success(clonedAsset));

        var result = await AssetHandlers.CloneAssetHandler(context, templateId, _assetService);

        result.Should().BeOfType<Created<Asset>>();
        var createdResult = (Created<Asset>)result;
        createdResult.Value.Should().BeEquivalentTo(clonedAsset);
        createdResult.Location.Should().Be($"/api/assets/{clonedAsset.Id}");
    }

    [Fact]
    public async Task CloneAssetHandler_WithNonExistentAsset_ReturnsNotFound() {
        var context = CreateHttpContext();
        var templateId = Guid.CreateVersion7();
        _assetService.CloneAssetAsync(_userId, templateId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure<Asset>(null!, new Error("NotFound")));

        var result = await AssetHandlers.CloneAssetHandler(context, templateId, _assetService);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task CloneAssetHandler_WithPrivateAsset_ReturnsForbid() {
        var context = CreateHttpContext();
        var templateId = Guid.CreateVersion7();
        _assetService.CloneAssetAsync(_userId, templateId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure<Asset>(null!, new Error("NotAllowed")));

        var result = await AssetHandlers.CloneAssetHandler(context, templateId, _assetService);

        result.Should().BeOfType<ForbidHttpResult>();
    }

    [Fact]
    public async Task CloneAssetHandler_WithPublicPublishedAsset_ReturnsCreated() {
        var context = CreateHttpContext();
        var templateId = Guid.CreateVersion7();
        var clonedAsset = new Asset {
            Id = Guid.CreateVersion7(),
            Name = "Cloned Public Asset",
            Description = "Cloned from public template",
            Classification = new AssetClassification(AssetKind.Object, "Furniture", "Container", null),
            OwnerId = _userId
        };
        _assetService.CloneAssetAsync(_userId, templateId, Arg.Any<CancellationToken>())
            .Returns(Result.Success(clonedAsset));

        var result = await AssetHandlers.CloneAssetHandler(context, templateId, _assetService);

        result.Should().BeOfType<Created<Asset>>();
    }

    [Fact]
    public async Task GetAssetsHandler_WithAvailabilityFilter_FiltersAssets() {
        var context = CreateHttpContext();
        var assets = Array.Empty<Asset>();
        _assetService.SearchAssetsAsync(_userId, Availability.Public, null, null, null, null, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>())
            .Returns((assets, 0));

        var result = await AssetHandlers.GetAssetsHandler(
            context,
            "Public", null, null, null, null, null, null, null, null, null, null, null,
            _assetService);

        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
        var okResult = result as IStatusCodeHttpResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(200);
        await _assetService.Received(1).SearchAssetsAsync(_userId, Availability.Public, null, null, null, null, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAssetsHandler_WithTypeFilter_FiltersAssets() {
        var context = CreateHttpContext();
        const string type = "Goblinoid";
        var assets = Array.Empty<Asset>();
        _assetService.SearchAssetsAsync(_userId, null, null, null, type, null, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>())
            .Returns((assets, 0));

        var result = await AssetHandlers.GetAssetsHandler(
            context,
            null, null, null, type, null, null, null, null, null, null, null, null,
            _assetService);

        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
        var okResult = result as IStatusCodeHttpResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(200);
        await _assetService.Received(1).SearchAssetsAsync(_userId, null, null, null, type, null, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAssetsHandler_WithSubtypeFilter_FiltersAssets() {
        var context = CreateHttpContext();
        const string subtype = "Goblin";
        var assets = Array.Empty<Asset>();
        _assetService.SearchAssetsAsync(_userId, null, null, null, null, subtype, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>())
            .Returns((assets, 0));

        var result = await AssetHandlers.GetAssetsHandler(
            context,
            null, null, null, null, subtype, null, null, null, null, null, null, null,
            _assetService);

        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
        var okResult = result as IStatusCodeHttpResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(200);
        await _assetService.Received(1).SearchAssetsAsync(_userId, null, null, null, null, subtype, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAssetsHandler_WithTagsFilter_FiltersAssets() {
        var context = CreateHttpContext();
        var tags = new[] { "hostile", "undead" };
        var assets = Array.Empty<Asset>();
        _assetService.SearchAssetsAsync(_userId, null, null, null, null, null, null, tags, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>())
            .Returns((assets, 0));

        var result = await AssetHandlers.GetAssetsHandler(
            context,
            null, null, null, null, null, null, tags, null, null, null, null, null,
            _assetService);

        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
        var okResult = result as IStatusCodeHttpResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(200);
        await _assetService.Received(1).SearchAssetsAsync(_userId, null, null, null, null, null, null, tags, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAssetsHandler_WithNullAdvancedFilters_UsesEmptyFilters() {
        var context = CreateHttpContext();
        var assets = Array.Empty<Asset>();
        _assetService.SearchAssetsAsync(_userId, null, null, null, null, null, null, null, Arg.Is<ICollection<AdvancedSearchFilter>>(f => f.Count == 0), null, null, null, Arg.Any<CancellationToken>())
            .Returns((assets, 0));

        var result = await AssetHandlers.GetAssetsHandler(
            context,
            null, null, null, null, null, null, null, null, null, null, null, null,
            _assetService);

        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
        var okResult = result as IStatusCodeHttpResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task GetAssetsHandler_WithInvalidKind_UsesNullFilter() {
        var context = CreateHttpContext();
        var assets = Array.Empty<Asset>();
        _assetService.SearchAssetsAsync(_userId, null, null, null, null, null, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>())
            .Returns((assets, 0));

        var result = await AssetHandlers.GetAssetsHandler(
            context,
            null, "InvalidKind", null, null, null, null, null, null, null, null, null, null,
            _assetService);

        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
        await _assetService.Received(1).SearchAssetsAsync(_userId, null, null, null, null, null, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAssetsHandler_WithInvalidAvailability_UsesNullFilter() {
        var context = CreateHttpContext();
        var assets = Array.Empty<Asset>();
        _assetService.SearchAssetsAsync(_userId, null, null, null, null, null, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>())
            .Returns((assets, 0));

        var result = await AssetHandlers.GetAssetsHandler(
            context,
            "InvalidAvailability", null, null, null, null, null, null, null, null, null, null, null,
            _assetService);

        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
        await _assetService.Received(1).SearchAssetsAsync(_userId, null, null, null, null, null, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAssetsHandler_WithInvalidSortBy_UsesNullFilter() {
        var context = CreateHttpContext();
        var assets = Array.Empty<Asset>();
        _assetService.SearchAssetsAsync(_userId, null, null, null, null, null, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>())
            .Returns((assets, 0));

        var result = await AssetHandlers.GetAssetsHandler(
            context,
            null, null, null, null, null, null, null, null, "InvalidSort", null, null, null,
            _assetService);

        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
        await _assetService.Received(1).SearchAssetsAsync(_userId, null, null, null, null, null, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAssetsHandler_WithInvalidSortDirection_UsesNullFilter() {
        var context = CreateHttpContext();
        var assets = Array.Empty<Asset>();
        _assetService.SearchAssetsAsync(_userId, null, null, null, null, null, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>())
            .Returns((assets, 0));

        var result = await AssetHandlers.GetAssetsHandler(
            context,
            null, null, null, null, null, null, null, null, null, "InvalidDirection", null, null,
            _assetService);

        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
        await _assetService.Received(1).SearchAssetsAsync(_userId, null, null, null, null, null, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAssetsHandler_WithNegativePageIndex_UsesNoPagination() {
        var context = CreateHttpContext();
        var assets = Array.Empty<Asset>();
        _assetService.SearchAssetsAsync(_userId, null, null, null, null, null, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>())
            .Returns((assets, 0));

        var result = await AssetHandlers.GetAssetsHandler(
            context,
            null, null, null, null, null, null, null, null, null, null, -1, 10,
            _assetService);

        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
        await _assetService.Received(1).SearchAssetsAsync(_userId, null, null, null, null, null, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAssetsHandler_WithZeroPageSize_UsesNoPagination() {
        var context = CreateHttpContext();
        var assets = Array.Empty<Asset>();
        _assetService.SearchAssetsAsync(_userId, null, null, null, null, null, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>())
            .Returns((assets, 0));

        var result = await AssetHandlers.GetAssetsHandler(
            context,
            null, null, null, null, null, null, null, null, null, null, 0, 0,
            _assetService);

        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
        await _assetService.Received(1).SearchAssetsAsync(_userId, null, null, null, null, null, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAssetsHandler_WithNoPaginationParameters_ReturnsAllResults() {
        var context = CreateHttpContext();
        var assets = new Asset[25];
        _assetService.SearchAssetsAsync(_userId, null, null, null, null, null, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>())
            .Returns((assets, 25));

        var result = await AssetHandlers.GetAssetsHandler(
            context,
            null, null, null, null, null, null, null, null, null, null, null, null,
            _assetService);

        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
        var okResult = result as IStatusCodeHttpResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(200);
        await _assetService.Received(1).SearchAssetsAsync(_userId, null, null, null, null, null, null, null, Arg.Any<ICollection<AdvancedSearchFilter>>(), null, null, null, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAssetByIdHandler_WithAssetContainingTokens_FiltersTokensByOwnership() {
        var context = CreateHttpContext();
        var assetId = Guid.CreateVersion7();
        var ownedTokenId = Guid.CreateVersion7();
        var publicTokenId = Guid.CreateVersion7();
        var privateTokenId = Guid.CreateVersion7();
        var asset = new Asset {
            Id = assetId,
            Name = "Asset with Tokens",
            Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Goblin"),
            OwnerId = _userId,
            Tokens = [
                new ResourceMetadata { Id = ownedTokenId, Path = "/token1.png", ResourceType = ResourceType.Token, ContentType = "image/png", FileName = "token1.png", FileLength = 1024, OwnerId = _userId, IsPublic = false, IsPublished = false },
                new ResourceMetadata { Id = publicTokenId, Path = "/token2.png", ResourceType = ResourceType.Token, ContentType = "image/png", FileName = "token2.png", FileLength = 2048, OwnerId = Guid.CreateVersion7(), IsPublic = true, IsPublished = true },
                new ResourceMetadata { Id = privateTokenId, Path = "/token3.png", ResourceType = ResourceType.Token, ContentType = "image/png", FileName = "token3.png", FileLength = 3072, OwnerId = Guid.CreateVersion7(), IsPublic = false, IsPublished = false }
            ]
        };
        _assetService.GetAssetByIdAsync(_userId, assetId, Arg.Any<CancellationToken>()).Returns(asset);

        var result = await AssetHandlers.GetAssetByIdHandler(context, assetId, _assetService);

        result.Should().BeOfType<Ok<Asset>>();
        var okResult = (Ok<Asset>)result;
        okResult.Value!.Tokens.Should().HaveCount(2);
        okResult.Value!.Tokens.Should().Contain(t => t.Id == ownedTokenId);
        okResult.Value!.Tokens.Should().Contain(t => t.Id == publicTokenId);
        okResult.Value!.Tokens.Should().NotContain(t => t.Id == privateTokenId);
    }

    [Fact]
    public async Task GetAssetByIdHandler_WithUnpublishedPublicAsset_ReturnsForbid() {
        var context = CreateHttpContext();
        var assetId = Guid.CreateVersion7();
        var asset = new Asset {
            Id = assetId,
            Name = "Unpublished Public Asset",
            Classification = new AssetClassification(AssetKind.Object, "Furniture", "Container", null),
            OwnerId = Guid.CreateVersion7(),
            IsPublic = true,
            IsPublished = false
        };
        _assetService.GetAssetByIdAsync(_userId, assetId, Arg.Any<CancellationToken>()).Returns(asset);

        var result = await AssetHandlers.GetAssetByIdHandler(context, assetId, _assetService);

        result.Should().BeOfType<ForbidHttpResult>();
    }

    [Fact]
    public async Task CreateAssetHandler_WithPortraitId_CreatesAssetWithPortrait() {
        var context = CreateHttpContext();
        var portraitId = Guid.CreateVersion7();
        var request = new CreateAssetRequest {
            Kind = AssetKind.Creature,
            Category = "Humanoid",
            Type = "Goblinoid",
            Name = "Asset with Portrait",
            Description = "Description",
            PortraitId = portraitId
        };
        var createdAsset = new Asset {
            Id = Guid.CreateVersion7(),
            Name = request.Name,
            Description = request.Description,
            Classification = new AssetClassification(request.Kind, request.Category, request.Type, null),
            OwnerId = _userId,
            Portrait = new ResourceMetadata { Id = portraitId, Path = "/path/to/portrait.jpg", ResourceType = ResourceType.Portrait, ContentType = "image/jpeg" }
        };
        _assetService.CreateAssetAsync(_userId, Arg.Is<CreateAssetData>(d => d.PortraitId == portraitId), Arg.Any<CancellationToken>())
            .Returns(Result.Success(createdAsset));

        var result = await AssetHandlers.CreateAssetHandler(context, request, _assetService);

        result.Should().BeOfType<Created<Asset>>();
        var createdResult = (Created<Asset>)result;
        createdResult.Value!.Portrait.Should().NotBeNull();
        createdResult.Value!.Portrait!.Id.Should().Be(portraitId);
    }

    [Fact]
    public async Task CloneAssetHandler_WithValidationErrors_ReturnsValidationProblem() {
        var context = CreateHttpContext();
        var templateId = Guid.CreateVersion7();
        var errors = new Error[] { new("Some validation error", "Field") };
        _assetService.CloneAssetAsync(_userId, templateId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure<Asset>(null!, errors));

        var result = await AssetHandlers.CloneAssetHandler(context, templateId, _assetService);

        result.Should().BeOfType<ProblemHttpResult>();
        var problemResult = (ProblemHttpResult)result;
        problemResult.StatusCode.Should().Be(400);
    }

    [Fact]
    public async Task DeleteAssetHandler_WithValidationErrors_ReturnsValidationProblem() {
        var context = CreateHttpContext();
        var assetId = Guid.CreateVersion7();
        var errors = new Error[] { new("Some validation error", "Field") };
        _assetService.DeleteAssetAsync(_userId, assetId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure(errors));

        var result = await AssetHandlers.DeleteAssetHandler(context, assetId, _assetService);

        result.Should().BeOfType<ProblemHttpResult>();
        var problemResult = (ProblemHttpResult)result;
        problemResult.StatusCode.Should().Be(400);
    }
}
