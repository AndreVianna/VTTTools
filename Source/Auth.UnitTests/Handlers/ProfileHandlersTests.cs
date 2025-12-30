namespace VttTools.Auth.Handlers;

public class ProfileHandlersTests {
    private readonly IProfileService _mockProfileService = Substitute.For<IProfileService>();
    private readonly IResourceService _mockResourceService = Substitute.For<IResourceService>();
    private readonly HttpContext _mockHttpContext = Substitute.For<HttpContext>();

    private void SetupAuthenticatedUser(Guid userId) {
        var claims = new List<Claim> {
            new(ClaimTypes.NameIdentifier, userId.ToString())
        };
        var identity = new ClaimsIdentity(claims, "Test");
        var claimsPrincipal = new ClaimsPrincipal(identity);
        _mockHttpContext.User.Returns(claimsPrincipal);
    }

    private void SetupUnauthenticatedUser() {
        var identity = new ClaimsIdentity();
        var claimsPrincipal = new ClaimsPrincipal(identity);
        _mockHttpContext.User.Returns(claimsPrincipal);
    }

    #region GetProfileHandler Tests

    [Fact]
    public async Task GetProfileHandler_WithAuthenticatedUser_ReturnsOkResult() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var expectedProfile = new ProfileResponse {
            Id = userId,
            Name = "Test User",
            DisplayName = "TestUser",
            Email = "test@example.com",
            EmailConfirmed = true,
            Success = true
        };

        _mockProfileService.GetProfileAsync(userId, Arg.Any<CancellationToken>())
            .Returns(expectedProfile);

        var result = await ProfileHandlers.GetProfileHandler(_mockHttpContext, _mockProfileService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<ProfileResponse>>();
        var okResult = (Ok<ProfileResponse>)result;
        okResult.Value.Should().BeEquivalentTo(expectedProfile);
        await _mockProfileService.Received(1).GetProfileAsync(userId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetProfileHandler_WithUnauthenticatedUser_ReturnsUnauthorized() {
        SetupUnauthenticatedUser();

        var act = () => ProfileHandlers.GetProfileHandler(_mockHttpContext, _mockProfileService, TestContext.Current.CancellationToken);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()

            .WithMessage("User ID claim is missing or invalid.");
        await _mockProfileService.DidNotReceive().GetProfileAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetProfileHandler_WhenServiceFails_ReturnsValidationProblem() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var failureResponse = new ProfileResponse {
            Success = false,
            Message = "Profile not found"
        };

        _mockProfileService.GetProfileAsync(userId, Arg.Any<CancellationToken>())
            .Returns(failureResponse);

        var result = await ProfileHandlers.GetProfileHandler(_mockHttpContext, _mockProfileService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion

    #region UpdateProfileHandler Tests

    [Fact]
    public async Task UpdateProfileHandler_WithValidData_ReturnsOkResult() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var request = new UpdateProfileRequest {
            Name = "Updated Name",
            DisplayName = "UpdatedUser",
            PhoneNumber = "123-456-7890",
            PreferredUnitSystem = UnitSystem.Metric
        };

        var successResponse = new ProfileResponse {
            Id = userId,
            Name = "Updated Name",
            DisplayName = "UpdatedUser",
            PhoneNumber = "123-456-7890",
            PreferredUnitSystem = UnitSystem.Metric,
            Email = "test@example.com",
            Success = true
        };

        _mockProfileService.UpdateProfileAsync(userId, request, Arg.Any<CancellationToken>())
            .Returns(successResponse);

        var result = await ProfileHandlers.UpdateProfileHandler(_mockHttpContext, request, _mockProfileService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<ProfileResponse>>();
        var okResult = (Ok<ProfileResponse>)result;
        okResult.Value.Should().BeEquivalentTo(successResponse);
        await _mockProfileService.Received(1).UpdateProfileAsync(userId, request, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateProfileHandler_WithUnauthenticatedUser_ReturnsUnauthorized() {
        SetupUnauthenticatedUser();

        var request = new UpdateProfileRequest {
            Name = "Updated Name",
            DisplayName = "UpdatedUser"
        };

        var act = () => ProfileHandlers.UpdateProfileHandler(_mockHttpContext, request, _mockProfileService, TestContext.Current.CancellationToken);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()

            .WithMessage("User ID claim is missing or invalid.");
        await _mockProfileService.DidNotReceive().UpdateProfileAsync(
            Arg.Any<Guid>(),
            Arg.Any<UpdateProfileRequest>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateProfileHandler_WhenServiceFails_ReturnsValidationProblem() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var request = new UpdateProfileRequest {
            Name = "",
            DisplayName = ""
        };

        var failureResponse = new ProfileResponse {
            Success = false,
            Message = "Invalid profile data"
        };

        _mockProfileService.UpdateProfileAsync(userId, request, Arg.Any<CancellationToken>())
            .Returns(failureResponse);

        var result = await ProfileHandlers.UpdateProfileHandler(_mockHttpContext, request, _mockProfileService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion

    #region UpdateAvatarHandler Tests

    [Fact]
    public async Task UpdateAvatarHandler_WithValidImageFile_ReturnsOkResult() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var mockFile = Substitute.For<IFormFile>();
        mockFile.Length.Returns(1024);
        mockFile.ContentType.Returns("image/png");
        mockFile.FileName.Returns("avatar.png");
        mockFile.OpenReadStream().Returns(new MemoryStream([1, 2, 3]));

        var uploadResult = Result.Success(new ResourceMetadata { Id = Guid.CreateVersion7() });

        _mockResourceService.UploadResourceAsync(
            userId,
            Arg.Any<UploadResourceData>(),
            Arg.Any<CancellationToken>())
            .Returns(uploadResult);

        var successResponse = new ProfileResponse {
            Id = userId,
            AvatarId = Guid.CreateVersion7(),
            Success = true
        };

        _mockProfileService.UpdateAvatarAsync(
            userId,
            Arg.Any<Guid>(),
            Arg.Any<CancellationToken>())
            .Returns(successResponse);

        var result = await ProfileHandlers.UpdateAvatarHandler(_mockHttpContext, mockFile, _mockProfileService, _mockResourceService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<ProfileResponse>>();
    }

    [Fact]
    public async Task UpdateAvatarHandler_WithNullFile_ReturnsValidationProblem() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var result = await ProfileHandlers.UpdateAvatarHandler(_mockHttpContext, null!, _mockProfileService, _mockResourceService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
        await _mockResourceService.DidNotReceive().UploadResourceAsync(
            Arg.Any<Guid>(),
            Arg.Any<UploadResourceData>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAvatarHandler_WithEmptyFile_ReturnsValidationProblem() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var mockFile = Substitute.For<IFormFile>();
        mockFile.Length.Returns(0);

        var result = await ProfileHandlers.UpdateAvatarHandler(_mockHttpContext, mockFile, _mockProfileService, _mockResourceService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
        await _mockResourceService.DidNotReceive().UploadResourceAsync(
            Arg.Any<Guid>(),
            Arg.Any<UploadResourceData>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAvatarHandler_WithNonImageFile_ReturnsValidationProblem() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var mockFile = Substitute.For<IFormFile>();
        mockFile.Length.Returns(1024);
        mockFile.ContentType.Returns("application/pdf");
        mockFile.FileName.Returns("document.pdf");

        var result = await ProfileHandlers.UpdateAvatarHandler(_mockHttpContext, mockFile, _mockProfileService, _mockResourceService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
        await _mockResourceService.DidNotReceive().UploadResourceAsync(
            Arg.Any<Guid>(),
            Arg.Any<UploadResourceData>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAvatarHandler_WithUnauthenticatedUser_ReturnsUnauthorized() {
        SetupUnauthenticatedUser();

        var mockFile = Substitute.For<IFormFile>();
        mockFile.Length.Returns(1024);
        mockFile.ContentType.Returns("image/png");

        var act = () => ProfileHandlers.UpdateAvatarHandler(_mockHttpContext, mockFile, _mockProfileService, _mockResourceService, TestContext.Current.CancellationToken);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()

            .WithMessage("User ID claim is missing or invalid.");
    }

    [Fact]
    public async Task UpdateAvatarHandler_WhenUploadFails_ReturnsValidationProblem() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var mockFile = Substitute.For<IFormFile>();
        mockFile.Length.Returns(1024);
        mockFile.ContentType.Returns("image/png");
        mockFile.FileName.Returns("avatar.png");
        mockFile.OpenReadStream().Returns(new MemoryStream([1, 2, 3]));

        var uploadResult = Result.Failure<ResourceMetadata>(null!, new Error("Upload failed", "UPLOAD_ERROR"));

        _mockResourceService.UploadResourceAsync(
            userId,
            Arg.Any<UploadResourceData>(),
            Arg.Any<CancellationToken>())
            .Returns(uploadResult);

        var result = await ProfileHandlers.UpdateAvatarHandler(_mockHttpContext, mockFile, _mockProfileService, _mockResourceService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
        await _mockProfileService.DidNotReceive().UpdateAvatarAsync(
            Arg.Any<Guid>(),
            Arg.Any<Guid>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAvatarHandler_WhenExceptionThrown_ReturnsValidationProblem() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var mockFile = Substitute.For<IFormFile>();
        mockFile.Length.Returns(1024);
        mockFile.ContentType.Returns("image/png");
        mockFile.FileName.Returns("avatar.png");
        mockFile.When(f => f.OpenReadStream())
            .Do(_ => throw new IOException("File access error"));

        var result = await ProfileHandlers.UpdateAvatarHandler(_mockHttpContext, mockFile, _mockProfileService, _mockResourceService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    [Fact]
    public async Task UpdateAvatarHandler_WhenProfileServiceFails_ReturnsValidationProblem() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var mockFile = Substitute.For<IFormFile>();
        mockFile.Length.Returns(1024);
        mockFile.ContentType.Returns("image/png");
        mockFile.FileName.Returns("avatar.png");
        mockFile.OpenReadStream().Returns(new MemoryStream([1, 2, 3]));

        var uploadResult = Result.Success(new ResourceMetadata { Id = Guid.CreateVersion7() });

        _mockResourceService.UploadResourceAsync(
            userId,
            Arg.Any<UploadResourceData>(),
            Arg.Any<CancellationToken>())
            .Returns(uploadResult);

        var failureResponse = new ProfileResponse {
            Success = false,
            Message = "Failed to update avatar in database"
        };

        _mockProfileService.UpdateAvatarAsync(
            userId,
            Arg.Any<Guid>(),
            Arg.Any<CancellationToken>())
            .Returns(failureResponse);

        var result = await ProfileHandlers.UpdateAvatarHandler(_mockHttpContext, mockFile, _mockProfileService, _mockResourceService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion

    #region RemoveAvatarHandler Tests

    [Fact]
    public async Task RemoveAvatarHandler_WithAuthenticatedUser_ReturnsOkResult() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var successResponse = new ProfileResponse {
            Id = userId,
            AvatarId = null,
            Success = true
        };

        _mockProfileService.RemoveAvatarAsync(userId, Arg.Any<CancellationToken>())
            .Returns(successResponse);

        var result = await ProfileHandlers.RemoveAvatarHandler(_mockHttpContext, _mockProfileService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<ProfileResponse>>();
        var okResult = (Ok<ProfileResponse>)result;
        okResult.Value.Should().BeEquivalentTo(successResponse);
        await _mockProfileService.Received(1).RemoveAvatarAsync(userId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveAvatarHandler_WithUnauthenticatedUser_ReturnsUnauthorized() {
        SetupUnauthenticatedUser();

        var act = () => ProfileHandlers.RemoveAvatarHandler(_mockHttpContext, _mockProfileService, TestContext.Current.CancellationToken);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()

            .WithMessage("User ID claim is missing or invalid.");
        await _mockProfileService.DidNotReceive().RemoveAvatarAsync(
            Arg.Any<Guid>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveAvatarHandler_WhenServiceFails_ReturnsValidationProblem() {
        var userId = Guid.CreateVersion7();
        SetupAuthenticatedUser(userId);

        var failureResponse = new ProfileResponse {
            Success = false,
            Message = "Failed to remove avatar"
        };

        _mockProfileService.RemoveAvatarAsync(userId, Arg.Any<CancellationToken>())
            .Returns(failureResponse);

        var result = await ProfileHandlers.RemoveAvatarHandler(_mockHttpContext, _mockProfileService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion
}
