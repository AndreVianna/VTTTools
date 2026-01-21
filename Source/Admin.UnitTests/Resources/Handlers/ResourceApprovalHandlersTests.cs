namespace VttTools.Admin.Resources.Handlers;

public sealed class ResourceApprovalHandlersTests {
    private readonly IMediaServiceClient _mockMediaClient;
    private readonly IResourceApprovalService _mockService;
    private readonly IAuditLogService _mockAuditLogService;
    private readonly HttpContext _mockHttpContext;
    private readonly Guid _userId;

    public ResourceApprovalHandlersTests() {
        _mockMediaClient = Substitute.For<IMediaServiceClient>();
        _mockService = Substitute.For<IResourceApprovalService>();
        _mockAuditLogService = Substitute.For<IAuditLogService>();
        _mockHttpContext = Substitute.For<HttpContext>();
        _userId = Guid.CreateVersion7();

        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, _userId.ToString()) };
        var user = new ClaimsPrincipal(new ClaimsIdentity(claims));
        _mockHttpContext.User.Returns(user);
    }

    #region ListUnpublishedHandler Tests

    [Fact]
    public async Task ListUnpublishedHandler_WithValidRequest_ReturnsOk() {
        // Arrange
        var request = new VttTools.Admin.Resources.ApiContracts.ResourceFilterRequest {
            Skip = 0,
            Take = 10,
        };
        var response = new ResourceListResponse {
            Items = [],
            TotalCount = 0,
            Skip = 0,
            Take = 10,
        };

        _mockMediaClient.ListUnpublishedResourcesAsync(Arg.Any<VttTools.Admin.Resources.ApiContracts.ResourceFilterRequest>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(response));

        // Act
        var result = await ResourceApprovalHandlers.ListUnpublishedHandler(
            request,
            _mockMediaClient,
            TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeOfType<Ok<ResourceListResponse>>();
        var okResult = (Ok<ResourceListResponse>)result;
        okResult.Value.Should().Be(response);
    }

    [Fact]
    public async Task ListUnpublishedHandler_WithFilters_ReturnsFilteredResults() {
        // Arrange
        var request = new VttTools.Admin.Resources.ApiContracts.ResourceFilterRequest {
            Skip = 10,
            Take = 20,
            Role = ResourceRole.Portrait,
            SearchText = "dragon",
        };
        var response = new ResourceListResponse {
            Items = [],
            TotalCount = 5,
            Skip = 10,
            Take = 20,
        };

        _mockMediaClient.ListUnpublishedResourcesAsync(Arg.Any<VttTools.Admin.Resources.ApiContracts.ResourceFilterRequest>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(response));

        // Act
        var result = await ResourceApprovalHandlers.ListUnpublishedHandler(
            request,
            _mockMediaClient,
            TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeOfType<Ok<ResourceListResponse>>();
        await _mockMediaClient.Received(1).ListUnpublishedResourcesAsync(
            Arg.Is<VttTools.Admin.Resources.ApiContracts.ResourceFilterRequest>(r =>
                r.SearchText == "dragon"),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ListUnpublishedHandler_WhenClientReturnsFailure_ReturnsBadRequest() {
        // Arrange
        var request = new VttTools.Admin.Resources.ApiContracts.ResourceFilterRequest {
            Skip = 0,
            Take = 10,
        };

        _mockMediaClient.ListUnpublishedResourcesAsync(Arg.Any<VttTools.Admin.Resources.ApiContracts.ResourceFilterRequest>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Media service error").WithNo<ResourceListResponse>());

        // Act
        var result = await ResourceApprovalHandlers.ListUnpublishedHandler(
            request,
            _mockMediaClient,
            TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeAssignableTo<IStatusCodeHttpResult>();
        ((IStatusCodeHttpResult)result).StatusCode.Should().Be(400);
    }

    [Fact]
    public async Task ListUnpublishedHandler_WhenExceptionThrown_ReturnsProblem() {
        // Arrange
        var request = new VttTools.Admin.Resources.ApiContracts.ResourceFilterRequest {
            Skip = 0,
            Take = 10,
        };

        _mockMediaClient.ListUnpublishedResourcesAsync(Arg.Any<VttTools.Admin.Resources.ApiContracts.ResourceFilterRequest>(), Arg.Any<CancellationToken>())
            .ThrowsAsync(new Exception("Unexpected error"));

        // Act
        var result = await ResourceApprovalHandlers.ListUnpublishedHandler(
            request,
            _mockMediaClient,
            TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeOfType<ProblemHttpResult>();
        var problemResult = (ProblemHttpResult)result;
        problemResult.ProblemDetails.Detail.Should().Be("An unexpected error occurred while listing resources");
    }

    #endregion

    #region ApproveHandler Tests

    [Fact]
    public async Task ApproveHandler_WithValidRequest_ReturnsOkAndLogsAudit() {
        // Arrange
        var assetId = Guid.CreateVersion7();
        var resourceId = Guid.CreateVersion7();
        var request = new ApproveResourceRequest {
            ResourceId = resourceId,
            AssetName = "Dragon",
            GenerationType = "Portrait",
            Kind = AssetKind.Character,
            Category = "Fantasy",
            Type = "Dragon",
            Description = "A mighty dragon",
            Tags = ["dragon", "fantasy"],
            AssetId = null,
        };

        _mockService.ApproveAsync(Arg.Any<ApproveResourceData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(assetId));

        // Act
        var result = await ResourceApprovalHandlers.ApproveHandler(
            _mockHttpContext,
            request,
            _mockService,
            _mockAuditLogService,
            TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeAssignableTo<IStatusCodeHttpResult>();
        ((IStatusCodeHttpResult)result).StatusCode.Should().Be(200);

        await _mockService.Received(1).ApproveAsync(
            Arg.Is<ApproveResourceData>(d =>
                d.ResourceId == resourceId &&
                d.AssetName == "Dragon" &&
                d.GenerationType == "Portrait" &&
                d.Kind == AssetKind.Character),
            Arg.Any<CancellationToken>());

        await _mockAuditLogService.Received(1).AddAsync(
            Arg.Is<AuditLog>(log =>
                log.UserId == _userId &&
                log.Action == "Display:Approved:ByUser" &&
                log.EntityType == "Display" &&
                log.EntityId == resourceId.ToString()),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ApproveHandler_WithExistingAsset_UpdatesAsset() {
        // Arrange
        var assetId = Guid.CreateVersion7();
        var resourceId = Guid.CreateVersion7();
        var request = new ApproveResourceRequest {
            ResourceId = resourceId,
            AssetName = "Dragon",
            GenerationType = "Token",
            Kind = AssetKind.Character,
            AssetId = assetId,
        };

        _mockService.ApproveAsync(Arg.Any<ApproveResourceData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(assetId));

        // Act
        var result = await ResourceApprovalHandlers.ApproveHandler(
            _mockHttpContext,
            request,
            _mockService,
            _mockAuditLogService,
            TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeAssignableTo<IStatusCodeHttpResult>();
        ((IStatusCodeHttpResult)result).StatusCode.Should().Be(200);
        await _mockService.Received(1).ApproveAsync(
            Arg.Is<ApproveResourceData>(d =>
                d.AssetId == assetId &&
                d.GenerationType == "Token"),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ApproveHandler_WhenServiceReturnsFailure_ReturnsBadRequestWithoutAudit() {
        // Arrange
        var request = new ApproveResourceRequest {
            ResourceId = Guid.CreateVersion7(),
            AssetName = "Dragon",
            GenerationType = "Portrait",
            Kind = AssetKind.Character,
        };

        _mockService.ApproveAsync(Arg.Any<ApproveResourceData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Validation error").WithNo<Guid>());

        // Act
        var result = await ResourceApprovalHandlers.ApproveHandler(
            _mockHttpContext,
            request,
            _mockService,
            _mockAuditLogService,
            TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeAssignableTo<IStatusCodeHttpResult>();
        ((IStatusCodeHttpResult)result).StatusCode.Should().Be(400);
        await _mockAuditLogService.DidNotReceive().AddAsync(Arg.Any<AuditLog>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ApproveHandler_WhenExceptionThrown_ReturnsProblem() {
        // Arrange
        var request = new ApproveResourceRequest {
            ResourceId = Guid.CreateVersion7(),
            AssetName = "Dragon",
            GenerationType = "Portrait",
            Kind = AssetKind.Character,
        };

        _mockService.ApproveAsync(Arg.Any<ApproveResourceData>(), Arg.Any<CancellationToken>())
            .ThrowsAsync(new Exception("Unexpected error"));

        // Act
        var result = await ResourceApprovalHandlers.ApproveHandler(
            _mockHttpContext,
            request,
            _mockService,
            _mockAuditLogService,
            TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeOfType<ProblemHttpResult>();
        var problemResult = (ProblemHttpResult)result;
        problemResult.ProblemDetails.Detail.Should().Be("An unexpected error occurred while approving resource");
    }

    #endregion

    #region RegenerateHandler Tests

    [Fact]
    public async Task RegenerateHandler_WithValidRequest_ReturnsOkAndLogsAudit() {
        // Arrange
        var newResourceId = Guid.CreateVersion7();
        var oldResourceId = Guid.CreateVersion7();
        var request = new RegenerateResourceRequest {
            ResourceId = oldResourceId,
            AssetName = "Dragon",
            GenerationType = "Portrait",
            Kind = AssetKind.Character,
            Category = "Fantasy",
            Type = "Dragon",
            Description = "A mighty dragon",
        };

        _mockService.RegenerateAsync(Arg.Any<RegenerateResourceData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(newResourceId));

        // Act
        var result = await ResourceApprovalHandlers.RegenerateHandler(
            _mockHttpContext,
            request,
            _mockService,
            _mockAuditLogService,
            TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeAssignableTo<IStatusCodeHttpResult>();
        ((IStatusCodeHttpResult)result).StatusCode.Should().Be(200);

        await _mockAuditLogService.Received(1).AddAsync(
            Arg.Is<AuditLog>(log =>
                log.UserId == _userId &&
                log.Action == "Display:Regenerated:ByUser" &&
                log.EntityType == "Display" &&
                log.EntityId == oldResourceId.ToString()),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RegenerateHandler_WhenServiceReturnsFailure_ReturnsBadRequestWithoutAudit() {
        // Arrange
        var request = new RegenerateResourceRequest {
            ResourceId = Guid.CreateVersion7(),
            AssetName = "Dragon",
            GenerationType = "Portrait",
            Kind = AssetKind.Character,
        };

        _mockService.RegenerateAsync(Arg.Any<RegenerateResourceData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Generation failed").WithNo<Guid>());

        // Act
        var result = await ResourceApprovalHandlers.RegenerateHandler(
            _mockHttpContext,
            request,
            _mockService,
            _mockAuditLogService,
            TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeAssignableTo<IStatusCodeHttpResult>();
        ((IStatusCodeHttpResult)result).StatusCode.Should().Be(400);
        await _mockAuditLogService.DidNotReceive().AddAsync(Arg.Any<AuditLog>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RegenerateHandler_WhenExceptionThrown_ReturnsProblem() {
        // Arrange
        var request = new RegenerateResourceRequest {
            ResourceId = Guid.CreateVersion7(),
            AssetName = "Dragon",
            GenerationType = "Portrait",
            Kind = AssetKind.Character,
        };

        _mockService.RegenerateAsync(Arg.Any<RegenerateResourceData>(), Arg.Any<CancellationToken>())
            .ThrowsAsync(new Exception("Unexpected error"));

        // Act
        var result = await ResourceApprovalHandlers.RegenerateHandler(
            _mockHttpContext,
            request,
            _mockService,
            _mockAuditLogService,
            TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeOfType<ProblemHttpResult>();
        var problemResult = (ProblemHttpResult)result;
        problemResult.ProblemDetails.Detail.Should().Be("An unexpected error occurred while regenerating resource");
    }

    #endregion

    #region RejectHandler Tests

    [Fact]
    public async Task RejectHandler_WithValidRequest_ReturnsNoContentAndLogsAudit() {
        // Arrange
        var resourceId = Guid.CreateVersion7();
        var request = new RejectResourceRequest {
            ResourceId = resourceId,
        };

        _mockService.RejectAsync(Arg.Any<RejectResourceData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        // Act
        var result = await ResourceApprovalHandlers.RejectHandler(
            _mockHttpContext,
            request,
            _mockService,
            _mockAuditLogService,
            TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeOfType<NoContent>();
        await _mockService.Received(1).RejectAsync(
            Arg.Is<RejectResourceData>(d => d.ResourceId == request.ResourceId),
            Arg.Any<CancellationToken>());

        await _mockAuditLogService.Received(1).AddAsync(
            Arg.Is<AuditLog>(log =>
                log.UserId == _userId &&
                log.Action == "Display:Rejected:ByUser" &&
                log.EntityType == "Display" &&
                log.EntityId == resourceId.ToString()),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RejectHandler_WhenServiceReturnsFailure_ReturnsBadRequestWithoutAudit() {
        // Arrange
        var request = new RejectResourceRequest {
            ResourceId = Guid.CreateVersion7(),
        };

        _mockService.RejectAsync(Arg.Any<RejectResourceData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Display not found"));

        // Act
        var result = await ResourceApprovalHandlers.RejectHandler(
            _mockHttpContext,
            request,
            _mockService,
            _mockAuditLogService,
            TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeAssignableTo<IStatusCodeHttpResult>();
        ((IStatusCodeHttpResult)result).StatusCode.Should().Be(400);
        await _mockAuditLogService.DidNotReceive().AddAsync(Arg.Any<AuditLog>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RejectHandler_WhenExceptionThrown_ReturnsProblem() {
        // Arrange
        var request = new RejectResourceRequest {
            ResourceId = Guid.CreateVersion7(),
        };

        _mockService.RejectAsync(Arg.Any<RejectResourceData>(), Arg.Any<CancellationToken>())
            .ThrowsAsync(new Exception("Unexpected error"));

        // Act
        var result = await ResourceApprovalHandlers.RejectHandler(
            _mockHttpContext,
            request,
            _mockService,
            _mockAuditLogService,
            TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeOfType<ProblemHttpResult>();
        var problemResult = (ProblemHttpResult)result;
        problemResult.ProblemDetails.Detail.Should().Be("An unexpected error occurred while rejecting resource");
    }

    #endregion
}