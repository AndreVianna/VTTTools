namespace VttTools.Admin.Handlers;

public sealed class UserAdminHandlersTests {
    private readonly IUserAdminService _mockService = Substitute.For<IUserAdminService>();

    #region SearchUsersHandler Tests

    [Fact]
    public async Task SearchUsersHandler_WithValidRequest_ReturnsOk() {
        var request = new UserSearchRequest { Skip = 0, Take = 10 };
        var response = new UserSearchResponse { Users = [], TotalCount = 0, HasMore = false };

        _mockService.SearchUsersAsync(Arg.Any<UserSearchRequest>(), Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await UserAdminHandlers.SearchUsersHandler(
            0, 10, null, null, null, null, null,
            _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<UserSearchResponse>>();
        var okResult = (Ok<UserSearchResponse>)result;
        okResult.Value.Should().Be(response);
    }

    [Fact]
    public async Task SearchUsersHandler_WithSearchFilters_ReturnsFilteredResults() {
        var response = new UserSearchResponse { Users = [], TotalCount = 5, HasMore = false };

        _mockService.SearchUsersAsync(Arg.Any<UserSearchRequest>(), Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await UserAdminHandlers.SearchUsersHandler(
            0, 10, "test", "Admin", "active", "name", "asc",
            _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<UserSearchResponse>>();
        await _mockService.Received(1).SearchUsersAsync(
            Arg.Is<UserSearchRequest>(r =>
                r.Search == "test" &&
                r.Role == "Admin" &&
                r.Status == "active"),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SearchUsersHandler_WhenExceptionThrown_ReturnsProblem() {
        _mockService.SearchUsersAsync(Arg.Any<UserSearchRequest>(), Arg.Any<CancellationToken>())
            .ThrowsAsync(new Exception("Test exception"));

        var result = await UserAdminHandlers.SearchUsersHandler(
            0, 10, null, null, null, null, null,
            _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion

    #region GetUserByIdHandler Tests

    [Fact]
    public async Task GetUserByIdHandler_WithValidUserId_ReturnsOk() {
        var userId = Guid.CreateVersion7();
        var response = new UserDetailResponse {
            Id = userId,
            Email = "test@example.com",
            DisplayName = "Test User",
            Roles = ["User"],
            EmailConfirmed = true,
            PhoneNumberConfirmed = false,
            TwoFactorEnabled = false,
            LockoutEnabled = true,
            IsLockedOut = false,
            AccessFailedCount = 0,
            CreatedDate = DateTime.UtcNow
        };

        _mockService.GetUserByIdAsync(userId, Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await UserAdminHandlers.GetUserByIdHandler(
            userId, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<UserDetailResponse>>();
        var okResult = (Ok<UserDetailResponse>)result;
        okResult.Value.Should().Be(response);
    }

    [Fact]
    public async Task GetUserByIdHandler_WhenUserNotFound_ReturnsNotFound() {
        var userId = Guid.CreateVersion7();

        _mockService.GetUserByIdAsync(userId, Arg.Any<CancellationToken>())
            .Returns((UserDetailResponse?)null);

        var result = await UserAdminHandlers.GetUserByIdHandler(
            userId, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task GetUserByIdHandler_WhenUserNotFoundExceptionThrown_ReturnsNotFound() {
        var userId = Guid.CreateVersion7();

        _mockService.GetUserByIdAsync(userId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new UserNotFoundException(userId));

        var result = await UserAdminHandlers.GetUserByIdHandler(
            userId, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task GetUserByIdHandler_WhenExceptionThrown_ReturnsProblem() {
        var userId = Guid.CreateVersion7();

        _mockService.GetUserByIdAsync(userId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new Exception("Test exception"));

        var result = await UserAdminHandlers.GetUserByIdHandler(
            userId, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion

    #region LockUserHandler Tests

    [Fact]
    public async Task LockUserHandler_WithValidRequest_ReturnsOk() {
        var userId = Guid.CreateVersion7();
        var adminUserId = Guid.CreateVersion7();
        var response = new LockUserResponse { Success = true };

        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, adminUserId.ToString()) };
        var user = new ClaimsPrincipal(new ClaimsIdentity(claims));

        _mockService.LockUserAsync(userId, Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await UserAdminHandlers.LockUserHandler(
            userId, user, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<LockUserResponse>>();
    }

    [Fact]
    public async Task LockUserHandler_WhenAdminTriesToLockSelf_ReturnsBadRequest() {
        var userId = Guid.CreateVersion7();

        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, userId.ToString()) };
        var user = new ClaimsPrincipal(new ClaimsIdentity(claims));

        var result = await UserAdminHandlers.LockUserHandler(
            userId, user, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeAssignableTo<IStatusCodeHttpResult>()
            .Which.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
    }

    [Fact]
    public async Task LockUserHandler_WithInvalidClaims_ReturnsBadRequest() {
        var userId = Guid.CreateVersion7();
        var user = new ClaimsPrincipal(new ClaimsIdentity());

        var result = await UserAdminHandlers.LockUserHandler(
            userId, user, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeAssignableTo<IStatusCodeHttpResult>()
            .Which.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
    }

    [Fact]
    public async Task LockUserHandler_WhenCannotModifySelfExceptionThrown_ReturnsBadRequest() {
        var userId = Guid.CreateVersion7();
        var adminUserId = Guid.CreateVersion7();

        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, adminUserId.ToString()) };
        var user = new ClaimsPrincipal(new ClaimsIdentity(claims));

        _mockService.LockUserAsync(userId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new CannotModifySelfException());

        var result = await UserAdminHandlers.LockUserHandler(
            userId, user, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeAssignableTo<IStatusCodeHttpResult>()
            .Which.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
    }

    [Fact]
    public async Task LockUserHandler_WhenLastAdminExceptionThrown_ReturnsBadRequest() {
        var userId = Guid.CreateVersion7();
        var adminUserId = Guid.CreateVersion7();

        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, adminUserId.ToString()) };
        var user = new ClaimsPrincipal(new ClaimsIdentity(claims));

        _mockService.LockUserAsync(userId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new LastAdminException());

        var result = await UserAdminHandlers.LockUserHandler(
            userId, user, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeAssignableTo<IStatusCodeHttpResult>()
            .Which.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
    }

    [Fact]
    public async Task LockUserHandler_WhenUserNotFoundExceptionThrown_ReturnsNotFound() {
        var userId = Guid.CreateVersion7();
        var adminUserId = Guid.CreateVersion7();

        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, adminUserId.ToString()) };
        var user = new ClaimsPrincipal(new ClaimsIdentity(claims));

        _mockService.LockUserAsync(userId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new UserNotFoundException(userId));

        var result = await UserAdminHandlers.LockUserHandler(
            userId, user, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task LockUserHandler_WhenServiceReturnsFalse_ReturnsBadRequest() {
        var userId = Guid.CreateVersion7();
        var adminUserId = Guid.CreateVersion7();
        var response = new LockUserResponse { Success = false };

        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, adminUserId.ToString()) };
        var user = new ClaimsPrincipal(new ClaimsIdentity(claims));

        _mockService.LockUserAsync(userId, Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await UserAdminHandlers.LockUserHandler(
            userId, user, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeAssignableTo<IStatusCodeHttpResult>()
            .Which.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
    }

    #endregion

    #region UnlockUserHandler Tests

    [Fact]
    public async Task UnlockUserHandler_WithValidRequest_ReturnsOk() {
        var userId = Guid.CreateVersion7();
        var response = new UnlockUserResponse { Success = true };

        _mockService.UnlockUserAsync(userId, Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await UserAdminHandlers.UnlockUserHandler(
            userId, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<UnlockUserResponse>>();
    }

    [Fact]
    public async Task UnlockUserHandler_WhenUserNotFoundExceptionThrown_ReturnsNotFound() {
        var userId = Guid.CreateVersion7();

        _mockService.UnlockUserAsync(userId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new UserNotFoundException(userId));

        var result = await UserAdminHandlers.UnlockUserHandler(
            userId, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task UnlockUserHandler_WhenServiceReturnsFalse_ReturnsBadRequest() {
        var userId = Guid.CreateVersion7();
        var response = new UnlockUserResponse { Success = false };

        _mockService.UnlockUserAsync(userId, Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await UserAdminHandlers.UnlockUserHandler(
            userId, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeAssignableTo<IStatusCodeHttpResult>()
            .Which.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
    }

    #endregion

    #region VerifyEmailHandler Tests

    [Fact]
    public async Task VerifyEmailHandler_WithValidRequest_ReturnsOk() {
        var userId = Guid.CreateVersion7();
        var response = new VerifyEmailResponse { Success = true, EmailConfirmed = true };

        _mockService.VerifyEmailAsync(userId, Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await UserAdminHandlers.VerifyEmailHandler(
            userId, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<VerifyEmailResponse>>();
    }

    [Fact]
    public async Task VerifyEmailHandler_WhenUserNotFoundExceptionThrown_ReturnsNotFound() {
        var userId = Guid.CreateVersion7();

        _mockService.VerifyEmailAsync(userId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new UserNotFoundException(userId));

        var result = await UserAdminHandlers.VerifyEmailHandler(
            userId, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task VerifyEmailHandler_WhenServiceReturnsFalse_ReturnsBadRequest() {
        var userId = Guid.CreateVersion7();
        var response = new VerifyEmailResponse { Success = false, EmailConfirmed = false };

        _mockService.VerifyEmailAsync(userId, Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await UserAdminHandlers.VerifyEmailHandler(
            userId, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeAssignableTo<IStatusCodeHttpResult>()
            .Which.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
    }

    #endregion

    #region SendPasswordResetHandler Tests

    [Fact]
    public async Task SendPasswordResetHandler_WithValidRequest_ReturnsOk() {
        var userId = Guid.CreateVersion7();
        var response = new PasswordResetResponse { Success = true, EmailSent = true };

        _mockService.SendPasswordResetAsync(userId, Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await UserAdminHandlers.SendPasswordResetHandler(
            userId, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<PasswordResetResponse>>();
    }

    [Fact]
    public async Task SendPasswordResetHandler_WhenExceptionThrown_ReturnsProblem() {
        var userId = Guid.CreateVersion7();

        _mockService.SendPasswordResetAsync(userId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new Exception("Test exception"));

        var result = await UserAdminHandlers.SendPasswordResetHandler(
            userId, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion

    #region AssignRoleHandler Tests

    [Fact]
    public async Task AssignRoleHandler_WithValidRequest_ReturnsOk() {
        var userId = Guid.CreateVersion7();
        var adminUserId = Guid.CreateVersion7();
        var request = new AssignRoleRequest { RoleName = "Admin" };
        var response = new AssignRoleResponse { Success = true, Roles = ["User", "Admin"] };

        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, adminUserId.ToString()) };
        var user = new ClaimsPrincipal(new ClaimsIdentity(claims));

        _mockService.AssignRoleAsync(userId, request.RoleName, adminUserId, Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await UserAdminHandlers.AssignRoleHandler(
            userId, request, user, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<AssignRoleResponse>>();
    }

    [Fact]
    public async Task AssignRoleHandler_WithInvalidClaims_ReturnsBadRequest() {
        var userId = Guid.CreateVersion7();
        var request = new AssignRoleRequest { RoleName = "Admin" };
        var user = new ClaimsPrincipal(new ClaimsIdentity());

        var result = await UserAdminHandlers.AssignRoleHandler(
            userId, request, user, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeAssignableTo<IStatusCodeHttpResult>()
            .Which.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
    }

    [Fact]
    public async Task AssignRoleHandler_WhenCannotModifySelfExceptionThrown_ReturnsBadRequest() {
        var userId = Guid.CreateVersion7();
        var adminUserId = Guid.CreateVersion7();
        var request = new AssignRoleRequest { RoleName = "Admin" };

        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, adminUserId.ToString()) };
        var user = new ClaimsPrincipal(new ClaimsIdentity(claims));

        _mockService.AssignRoleAsync(userId, request.RoleName, adminUserId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new CannotModifySelfException());

        var result = await UserAdminHandlers.AssignRoleHandler(
            userId, request, user, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeAssignableTo<IStatusCodeHttpResult>()
            .Which.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
    }

    [Fact]
    public async Task AssignRoleHandler_WhenArgumentExceptionThrown_ReturnsBadRequest() {
        var userId = Guid.CreateVersion7();
        var adminUserId = Guid.CreateVersion7();
        var request = new AssignRoleRequest { RoleName = "InvalidRole" };

        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, adminUserId.ToString()) };
        var user = new ClaimsPrincipal(new ClaimsIdentity(claims));

        _mockService.AssignRoleAsync(userId, request.RoleName, adminUserId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new ArgumentException("Invalid role"));

        var result = await UserAdminHandlers.AssignRoleHandler(
            userId, request, user, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeAssignableTo<IStatusCodeHttpResult>()
            .Which.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
    }

    [Fact]
    public async Task AssignRoleHandler_WhenUserNotFoundExceptionThrown_ReturnsNotFound() {
        var userId = Guid.CreateVersion7();
        var adminUserId = Guid.CreateVersion7();
        var request = new AssignRoleRequest { RoleName = "Admin" };

        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, adminUserId.ToString()) };
        var user = new ClaimsPrincipal(new ClaimsIdentity(claims));

        _mockService.AssignRoleAsync(userId, request.RoleName, adminUserId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new UserNotFoundException(userId));

        var result = await UserAdminHandlers.AssignRoleHandler(
            userId, request, user, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task AssignRoleHandler_WhenServiceReturnsFalse_ReturnsBadRequest() {
        var userId = Guid.CreateVersion7();
        var adminUserId = Guid.CreateVersion7();
        var request = new AssignRoleRequest { RoleName = "Admin" };
        var response = new AssignRoleResponse { Success = false, Roles = [] };

        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, adminUserId.ToString()) };
        var user = new ClaimsPrincipal(new ClaimsIdentity(claims));

        _mockService.AssignRoleAsync(userId, request.RoleName, adminUserId, Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await UserAdminHandlers.AssignRoleHandler(
            userId, request, user, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeAssignableTo<IStatusCodeHttpResult>()
            .Which.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
    }

    #endregion

    #region RemoveRoleHandler Tests

    [Fact]
    public async Task RemoveRoleHandler_WithValidRequest_ReturnsOk() {
        var userId = Guid.CreateVersion7();
        var adminUserId = Guid.CreateVersion7();
        const string roleName = "Admin";
        var response = new RemoveRoleResponse { Success = true, Roles = ["User"] };

        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, adminUserId.ToString()) };
        var user = new ClaimsPrincipal(new ClaimsIdentity(claims));

        _mockService.RemoveRoleAsync(userId, roleName, adminUserId, Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await UserAdminHandlers.RemoveRoleHandler(
            userId, roleName, user, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<RemoveRoleResponse>>();
    }

    [Fact]
    public async Task RemoveRoleHandler_WithInvalidClaims_ReturnsBadRequest() {
        var userId = Guid.CreateVersion7();
        const string roleName = "Admin";
        var user = new ClaimsPrincipal(new ClaimsIdentity());

        var result = await UserAdminHandlers.RemoveRoleHandler(
            userId, roleName, user, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeAssignableTo<IStatusCodeHttpResult>()
            .Which.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
    }

    [Fact]
    public async Task RemoveRoleHandler_WhenCannotModifySelfExceptionThrown_ReturnsBadRequest() {
        var userId = Guid.CreateVersion7();
        var adminUserId = Guid.CreateVersion7();
        const string roleName = "Admin";

        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, adminUserId.ToString()) };
        var user = new ClaimsPrincipal(new ClaimsIdentity(claims));

        _mockService.RemoveRoleAsync(userId, roleName, adminUserId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new CannotModifySelfException());

        var result = await UserAdminHandlers.RemoveRoleHandler(
            userId, roleName, user, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeAssignableTo<IStatusCodeHttpResult>()
            .Which.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
    }

    [Fact]
    public async Task RemoveRoleHandler_WhenLastAdminExceptionThrown_ReturnsBadRequest() {
        var userId = Guid.CreateVersion7();
        var adminUserId = Guid.CreateVersion7();
        const string roleName = "Admin";

        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, adminUserId.ToString()) };
        var user = new ClaimsPrincipal(new ClaimsIdentity(claims));

        _mockService.RemoveRoleAsync(userId, roleName, adminUserId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new LastAdminException());

        var result = await UserAdminHandlers.RemoveRoleHandler(
            userId, roleName, user, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeAssignableTo<IStatusCodeHttpResult>()
            .Which.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
    }

    [Fact]
    public async Task RemoveRoleHandler_WhenUserNotFoundExceptionThrown_ReturnsNotFound() {
        var userId = Guid.CreateVersion7();
        var adminUserId = Guid.CreateVersion7();
        const string roleName = "Admin";

        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, adminUserId.ToString()) };
        var user = new ClaimsPrincipal(new ClaimsIdentity(claims));

        _mockService.RemoveRoleAsync(userId, roleName, adminUserId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new UserNotFoundException(userId));

        var result = await UserAdminHandlers.RemoveRoleHandler(
            userId, roleName, user, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task RemoveRoleHandler_WhenServiceReturnsFalse_ReturnsBadRequest() {
        var userId = Guid.CreateVersion7();
        var adminUserId = Guid.CreateVersion7();
        const string roleName = "Admin";
        var response = new RemoveRoleResponse { Success = false, Roles = [] };

        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, adminUserId.ToString()) };
        var user = new ClaimsPrincipal(new ClaimsIdentity(claims));

        _mockService.RemoveRoleAsync(userId, roleName, adminUserId, Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await UserAdminHandlers.RemoveRoleHandler(
            userId, roleName, user, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeAssignableTo<IStatusCodeHttpResult>()
            .Which.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
    }

    #endregion

    #region GetUserAuditTrailHandler Tests

    [Fact]
    public async Task GetUserAuditTrailHandler_WithValidRequest_ReturnsOk() {
        var userId = Guid.CreateVersion7();
        var response = new AuditTrailResponse {
            Logs = [],
            TotalCount = 0,
            Page = 1,
            PageSize = 10
        };

        _mockService.GetUserAuditTrailAsync(userId, 1, 10, Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await UserAdminHandlers.GetUserAuditTrailHandler(
            userId, 1, 10, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<AuditTrailResponse>>();
    }

    [Fact]
    public async Task GetUserAuditTrailHandler_WithInvalidPage_ReturnsBadRequest() {
        var userId = Guid.CreateVersion7();

        var result = await UserAdminHandlers.GetUserAuditTrailHandler(
            userId, 0, 10, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeAssignableTo<IStatusCodeHttpResult>()
            .Which.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
    }

    [Fact]
    public async Task GetUserAuditTrailHandler_WithInvalidPageSize_ReturnsBadRequest() {
        var userId = Guid.CreateVersion7();

        var result = await UserAdminHandlers.GetUserAuditTrailHandler(
            userId, 1, 0, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeAssignableTo<IStatusCodeHttpResult>()
            .Which.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
    }

    [Fact]
    public async Task GetUserAuditTrailHandler_WithPageSizeTooLarge_ReturnsBadRequest() {
        var userId = Guid.CreateVersion7();

        var result = await UserAdminHandlers.GetUserAuditTrailHandler(
            userId, 1, 101, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeAssignableTo<IStatusCodeHttpResult>()
            .Which.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
    }

    #endregion

    #region GetUserStatsHandler Tests

    [Fact]
    public async Task GetUserStatsHandler_WithValidRequest_ReturnsOk() {
        var response = new UserStatsResponse {
            TotalUsers = 100,
            TotalAdministrators = 5,
            LockedUsers = 10,
            UnconfirmedEmails = 10
        };

        _mockService.GetUserStatsAsync(Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await UserAdminHandlers.GetUserStatsHandler(
            _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<UserStatsResponse>>();
        var okResult = (Ok<UserStatsResponse>)result;
        okResult.Value.Should().Be(response);
    }

    [Fact]
    public async Task GetUserStatsHandler_WhenExceptionThrown_ReturnsProblem() {
        _mockService.GetUserStatsAsync(Arg.Any<CancellationToken>())
            .ThrowsAsync(new Exception("Test exception"));

        var result = await UserAdminHandlers.GetUserStatsHandler(
            _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion
}
