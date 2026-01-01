namespace VttTools.Admin.Services;

public class UserAdminServiceTests
    : IAsyncLifetime {
    private readonly UserManager<UserEntity> _mockUserManager;
    private readonly RoleManager<RoleEntity> _mockRoleManager;
    private readonly IAuditLogService _mockAuditLogService;
    private readonly ILogger<UserAdminService> _mockLogger;
    private readonly UserAdminService _sut;

    public UserAdminServiceTests() {
        _mockUserManager = CreateUserManagerMock();
        _mockRoleManager = CreateRoleManagerMock();
        _mockAuditLogService = Substitute.For<IAuditLogService>();
        _mockLogger = Substitute.For<ILogger<UserAdminService>>();
        _sut = new(_mockUserManager, _mockRoleManager, _mockAuditLogService, _mockLogger);
    }

    public ValueTask InitializeAsync() => ValueTask.CompletedTask;

    public async ValueTask DisposeAsync() {
        await ValueTask.CompletedTask;
        GC.SuppressFinalize(this);
    }

    #region SearchUsersAsync Tests

    [Fact]
    public async Task SearchUsersAsync_WithValidRequest_ReturnsPagedResults() {
        var users = CreateTestUsers(15);
        var queryable = users.BuildMock();

        _mockUserManager.Users.Returns(queryable);

        foreach (var user in users) {
            _mockUserManager.GetRolesAsync(user).Returns(["User"]);
        }

        var request = new UserSearchRequest {
            Skip = 0,
            Take = 10
        };

        var result = await _sut.SearchUsersAsync(request, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Users.Should().NotBeNull();
        result.Users.Count.Should().Be(10);
        result.TotalCount.Should().Be(15);
        result.HasMore.Should().BeTrue();
    }

    [Fact]
    public async Task SearchUsersAsync_WithSearchTerm_ReturnsFilteredResults() {
        var users = new List<UserEntity> {
            CreateTestUser("john@example.com", "John Doe"),
            CreateTestUser("jane@example.com", "Jane Smith"),
            CreateTestUser("bob@example.com", "Bob Johnson")
        };
        var queryable = users.BuildMock();

        _mockUserManager.Users.Returns(queryable);

        foreach (var user in users) {
            _mockUserManager.GetRolesAsync(user).Returns(["User"]);
        }

        var request = new UserSearchRequest {
            Search = "john",
            Skip = 0,
            Take = 10
        };

        var result = await _sut.SearchUsersAsync(request, TestContext.Current.CancellationToken);

        result.Users.Count.Should().Be(2);
        result.Users.Should().Contain(u => u.Email.Contains("john", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task SearchUsersAsync_WithStatusActive_ReturnsActiveUsers() {
        var activeUser = CreateTestUser("active@example.com", "Active User");
        activeUser.EmailConfirmed = true;

        var lockedUser = CreateTestUser("locked@example.com", "Locked User");
        lockedUser.EmailConfirmed = true;
        lockedUser.LockoutEnabled = true;
        lockedUser.LockoutEnd = DateTimeOffset.UtcNow.AddDays(1);

        var unconfirmedUser = CreateTestUser("unconfirmed@example.com", "Unconfirmed User");
        unconfirmedUser.EmailConfirmed = false;

        var users = new List<UserEntity> { activeUser, lockedUser, unconfirmedUser };
        var queryable = users.BuildMock();

        _mockUserManager.Users.Returns(queryable);

        foreach (var user in users) {
            _mockUserManager.GetRolesAsync(user).Returns(["User"]);
        }

        var request = new UserSearchRequest {
            Status = "active",
            Skip = 0,
            Take = 10
        };

        var result = await _sut.SearchUsersAsync(request, TestContext.Current.CancellationToken);

        result.Users.Count.Should().Be(1);
        result.Users[0].Email.Should().Be("active@example.com");
    }

    [Fact]
    public async Task SearchUsersAsync_WithStatusLocked_ReturnsLockedUsers() {
        var activeUser = CreateTestUser("active@example.com", "Active User");
        activeUser.EmailConfirmed = true;

        var lockedUser = CreateTestUser("locked@example.com", "Locked User");
        lockedUser.EmailConfirmed = true;
        lockedUser.LockoutEnabled = true;
        lockedUser.LockoutEnd = DateTimeOffset.UtcNow.AddDays(1);

        var users = new List<UserEntity> { activeUser, lockedUser };
        var queryable = users.BuildMock();

        _mockUserManager.Users.Returns(queryable);

        foreach (var user in users) {
            _mockUserManager.GetRolesAsync(user).Returns(["User"]);
        }

        var request = new UserSearchRequest {
            Status = "locked",
            Skip = 0,
            Take = 10
        };

        var result = await _sut.SearchUsersAsync(request, TestContext.Current.CancellationToken);

        result.Users.Count.Should().Be(1);
        result.Users[0].Email.Should().Be("locked@example.com");
        result.Users[0].IsLockedOut.Should().BeTrue();
    }

    [Fact]
    public async Task SearchUsersAsync_WithRoleFilter_ReturnsUsersWithRole() {
        var users = CreateTestUsers(5);
        var queryable = users.BuildMock();

        _mockUserManager.Users.Returns(queryable);

        _mockUserManager.GetRolesAsync(users[0]).Returns(["Administrator"]);
        _mockUserManager.GetRolesAsync(users[1]).Returns(["User"]);
        _mockUserManager.GetRolesAsync(users[2]).Returns(["Administrator"]);
        _mockUserManager.GetRolesAsync(users[3]).Returns(["User"]);
        _mockUserManager.GetRolesAsync(users[4]).Returns(["Editor"]);

        var request = new UserSearchRequest {
            Role = "Administrator",
            Skip = 0,
            Take = 10
        };

        var result = await _sut.SearchUsersAsync(request, TestContext.Current.CancellationToken);

        result.Users.Count.Should().Be(2);
        result.Users.All(u => u.Roles.Contains("Administrator")).Should().BeTrue();
    }

    [Fact]
    public async Task SearchUsersAsync_WithSortByEmail_ReturnsSortedResults() {
        var users = new List<UserEntity> {
            CreateTestUser("charlie@example.com", "Charlie"),
            CreateTestUser("alice@example.com", "Alice"),
            CreateTestUser("bob@example.com", "Bob")
        };
        var queryable = users.BuildMock();

        _mockUserManager.Users.Returns(queryable);

        foreach (var user in users) {
            _mockUserManager.GetRolesAsync(user).Returns(["User"]);
        }

        var request = new UserSearchRequest {
            SortBy = "email",
            SortOrder = "asc",
            Skip = 0,
            Take = 10
        };

        var result = await _sut.SearchUsersAsync(request, TestContext.Current.CancellationToken);

        result.Users[0].Email.Should().Be("alice@example.com");
        result.Users[result.Users.Count - 1].Email.Should().Be("charlie@example.com");
    }

    [Fact]
    public async Task SearchUsersAsync_WithSortByCreatedDate_ReturnsSortedResults() {
        var user1 = CreateTestUser("user1@example.com", "User 1");
        var user2 = CreateTestUser("user2@example.com", "User 2");
        var user3 = CreateTestUser("user3@example.com", "User 3");

        var users = new List<UserEntity> { user1, user2, user3 };
        var queryable = users.BuildMock();

        _mockUserManager.Users.Returns(queryable);

        foreach (var user in users) {
            _mockUserManager.GetRolesAsync(user).Returns(["User"]);
        }

        var request = new UserSearchRequest {
            SortBy = "createddate",
            SortOrder = "desc",
            Skip = 0,
            Take = 10
        };

        var result = await _sut.SearchUsersAsync(request, TestContext.Current.CancellationToken);

        result.Users[0].Email.Should().Be("user3@example.com");
        result.Users[result.Users.Count - 1].Email.Should().Be("user1@example.com");
    }

    [Fact]
    public async Task SearchUsersAsync_WithDateFilters_ReturnsFilteredResults() {
        var now = DateTime.UtcNow;
        var user1 = CreateTestUser("user1@example.com", "User 1");
        var user2 = CreateTestUser("user2@example.com", "User 2");
        var user3 = CreateTestUser("user3@example.com", "User 3");

        var users = new List<UserEntity> { user1, user2, user3 };
        var queryable = users.BuildMock();

        _mockUserManager.Users.Returns(queryable);

        foreach (var user in users) {
            _mockUserManager.GetRolesAsync(user).Returns(["User"]);
        }

        var request = new UserSearchRequest {
            Skip = 0,
            Take = 2
        };

        var result = await _sut.SearchUsersAsync(request, TestContext.Current.CancellationToken);

        result.Users.Count.Should().Be(2);
        result.Users.Should().Contain(u => u.Email == "user1@example.com");
        result.Users.Should().Contain(u => u.Email == "user2@example.com");
    }

    #endregion

    #region GetUserByIdAsync Tests

    [Fact]
    public async Task GetUserByIdAsync_WithExistingUser_ReturnsUserDetail() {
        var user = CreateTestUser("test@example.com", "Test User");
        var roles = new List<string> { "User", "Editor" };
        var createdDate = DateTime.UtcNow.AddDays(-30);
        var lastLoginDate = DateTime.UtcNow.AddDays(-1);
        var lastModifiedDate = DateTime.UtcNow;

        _mockUserManager.FindByIdAsync(user.Id.ToString()).Returns(user);
        _mockUserManager.GetRolesAsync(user).Returns(roles);
        _mockAuditLogService.GetUserCreatedDateAsync(user.Id, Arg.Any<CancellationToken>()).Returns(createdDate);
        _mockAuditLogService.GetUserLastLoginDateAsync(user.Id, Arg.Any<CancellationToken>()).Returns(lastLoginDate);
        _mockAuditLogService.GetUserLastModifiedDateAsync(user.Id, Arg.Any<CancellationToken>()).Returns(lastModifiedDate);

        var result = await _sut.GetUserByIdAsync(user.Id, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Id.Should().Be(user.Id);
        result.Email.Should().Be(user.Email);
        result.DisplayName.Should().Be(user.DisplayName);
        result.EmailConfirmed.Should().Be(user.EmailConfirmed);
        result.Roles.Should().BeEquivalentTo(roles);
    }

    [Fact]
    public async Task GetUserByIdAsync_WithNonExistentUser_ThrowsUserNotFoundException() {
        var userId = Guid.CreateVersion7();
        _mockUserManager.FindByIdAsync(userId.ToString()).Returns((UserEntity?)null);

        var act = () => _sut.GetUserByIdAsync(userId, default);

        await act.Should().ThrowAsync<UserNotFoundException>()
            .WithMessage($"User with ID '{userId}' was not found.");
    }

    [Fact]
    public async Task GetUserByIdAsync_WithLockedUser_ReturnsIsLockedOutTrue() {
        var user = CreateTestUser("locked@example.com", "Locked User");
        user.LockoutEnabled = true;
        user.LockoutEnd = DateTimeOffset.UtcNow.AddDays(1);
        var createdDate = DateTime.UtcNow.AddDays(-30);

        _mockUserManager.FindByIdAsync(user.Id.ToString()).Returns(user);
        _mockUserManager.GetRolesAsync(user).Returns(["User"]);
        _mockAuditLogService.GetUserCreatedDateAsync(user.Id, Arg.Any<CancellationToken>()).Returns(createdDate);
        _mockAuditLogService.GetUserLastLoginDateAsync(user.Id, Arg.Any<CancellationToken>()).Returns((DateTime?)null);
        _mockAuditLogService.GetUserLastModifiedDateAsync(user.Id, Arg.Any<CancellationToken>()).Returns((DateTime?)null);

        var result = await _sut.GetUserByIdAsync(user.Id, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.IsLockedOut.Should().BeTrue();
        result.LockoutEnabled.Should().BeTrue();
        result.LockoutEnd.Should().NotBeNull();
    }

    #endregion

    #region LockUserAsync Tests

    [Fact]
    public async Task LockUserAsync_WithValidUser_LocksUserSuccessfully() {
        var user = CreateTestUser("test@example.com", "Test User");

        _mockUserManager.FindByIdAsync(user.Id.ToString()).Returns(user);
        _mockUserManager.GetRolesAsync(user).Returns(["User"]);
        _mockUserManager.SetLockoutEnabledAsync(user, true).Returns(IdentityResult.Success);
        _mockUserManager.SetLockoutEndDateAsync(user, Arg.Any<DateTimeOffset?>()).Returns(IdentityResult.Success);

        var result = await _sut.LockUserAsync(user.Id, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.LockedUntil.Should().NotBeNull();
        result.LockedUntil!.Value.Should().BeAfter(DateTimeOffset.UtcNow.AddYears(99));

        await _mockUserManager.Received(1).SetLockoutEnabledAsync(user, true);
        await _mockUserManager.Received(1).SetLockoutEndDateAsync(user, Arg.Any<DateTimeOffset?>());
    }

    [Fact]
    public async Task LockUserAsync_WithNonExistentUser_ThrowsUserNotFoundException() {
        var userId = Guid.CreateVersion7();
        _mockUserManager.FindByIdAsync(userId.ToString()).Returns((UserEntity?)null);

        var act = () => _sut.LockUserAsync(userId, TestContext.Current.CancellationToken);

        await act.Should().ThrowAsync<UserNotFoundException>()
            .WithMessage($"User with ID '{userId}' was not found.");
    }

    [Fact]
    public async Task LockUserAsync_WhenLockingLastAdmin_ThrowsLastAdminException() {
        var user = CreateTestUser("admin@example.com", "Admin User");
        var allUsers = new List<UserEntity> { user }.BuildMock();

        _mockUserManager.FindByIdAsync(user.Id.ToString()).Returns(user);
        _mockUserManager.GetRolesAsync(user).Returns(["Administrator"]);
        _mockUserManager.Users.Returns(allUsers);

        var adminRole = new RoleEntity { Name = "Administrator", Id = Guid.CreateVersion7() };
        _mockRoleManager.FindByNameAsync("Administrator").Returns(adminRole);

        var act = () => _sut.LockUserAsync(user.Id, TestContext.Current.CancellationToken);

        await act.Should().ThrowAsync<LastAdminException>()
            .WithMessage("Cannot remove or lock the last administrator account.");
    }

    [Fact]
    public async Task LockUserAsync_WithMultipleAdmins_LocksAdminSuccessfully() {
        var admin1 = CreateTestUser("admin1@example.com", "Admin 1");
        var admin2 = CreateTestUser("admin2@example.com", "Admin 2");
        var allUsers = new List<UserEntity> { admin1, admin2 }.BuildMock();

        _mockUserManager.FindByIdAsync(admin1.Id.ToString()).Returns(admin1);
        _mockUserManager.GetRolesAsync(admin1).Returns(["Administrator"]);
        _mockUserManager.GetRolesAsync(admin2).Returns(["Administrator"]);
        _mockUserManager.Users.Returns(allUsers);
        _mockUserManager.SetLockoutEnabledAsync(admin1, true).Returns(IdentityResult.Success);
        _mockUserManager.SetLockoutEndDateAsync(admin1, Arg.Any<DateTimeOffset?>()).Returns(IdentityResult.Success);

        var adminRole = new RoleEntity { Name = "Administrator", Id = Guid.CreateVersion7() };
        _mockRoleManager.FindByNameAsync("Administrator").Returns(adminRole);

        var result = await _sut.LockUserAsync(admin1.Id, TestContext.Current.CancellationToken);

        result.Success.Should().BeTrue();
    }

    [Fact]
    public async Task LockUserAsync_WhenSetLockoutFails_ReturnsFailure() {
        var user = CreateTestUser("test@example.com", "Test User");

        _mockUserManager.FindByIdAsync(user.Id.ToString()).Returns(user);
        _mockUserManager.GetRolesAsync(user).Returns(["User"]);
        _mockUserManager.SetLockoutEnabledAsync(user, true)
            .Returns(IdentityResult.Failed(new IdentityError { Description = "Lockout failed" }));

        var result = await _sut.LockUserAsync(user.Id, TestContext.Current.CancellationToken);

        result.Success.Should().BeFalse();
        result.LockedUntil.Should().BeNull();
    }

    #endregion

    #region UnlockUserAsync Tests

    [Fact]
    public async Task UnlockUserAsync_WithLockedUser_UnlocksSuccessfully() {
        var user = CreateTestUser("locked@example.com", "Locked User");
        user.LockoutEnabled = true;
        user.LockoutEnd = DateTimeOffset.UtcNow.AddDays(1);
        user.AccessFailedCount = 3;

        _mockUserManager.FindByIdAsync(user.Id.ToString()).Returns(user);
        _mockUserManager.SetLockoutEndDateAsync(user, null).Returns(IdentityResult.Success);
        _mockUserManager.ResetAccessFailedCountAsync(user).Returns(IdentityResult.Success);

        var result = await _sut.UnlockUserAsync(user.Id, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Success.Should().BeTrue();

        await _mockUserManager.Received(1).SetLockoutEndDateAsync(user, null);
        await _mockUserManager.Received(1).ResetAccessFailedCountAsync(user);
    }

    [Fact]
    public async Task UnlockUserAsync_WithNonExistentUser_ThrowsUserNotFoundException() {
        var userId = Guid.CreateVersion7();
        _mockUserManager.FindByIdAsync(userId.ToString()).Returns((UserEntity?)null);

        var act = () => _sut.UnlockUserAsync(userId, TestContext.Current.CancellationToken);

        await act.Should().ThrowAsync<UserNotFoundException>()
            .WithMessage($"User with ID '{userId}' was not found.");
    }

    [Fact]
    public async Task UnlockUserAsync_WhenUnlockFails_ReturnsFailure() {
        var user = CreateTestUser("test@example.com", "Test User");

        _mockUserManager.FindByIdAsync(user.Id.ToString()).Returns(user);
        _mockUserManager.SetLockoutEndDateAsync(user, null)
            .Returns(IdentityResult.Failed(new IdentityError { Description = "Unlock failed" }));

        var result = await _sut.UnlockUserAsync(user.Id, TestContext.Current.CancellationToken);

        result.Success.Should().BeFalse();
    }

    #endregion

    #region VerifyEmailAsync Tests

    [Fact]
    public async Task VerifyEmailAsync_WithUnconfirmedEmail_ConfirmsSuccessfully() {
        var user = CreateTestUser("test@example.com", "Test User");
        user.EmailConfirmed = false;

        _mockUserManager.FindByIdAsync(user.Id.ToString()).Returns(user);
        _mockUserManager.GenerateEmailConfirmationTokenAsync(user).Returns("test-token");
        _mockUserManager.ConfirmEmailAsync(user, "test-token").Returns(IdentityResult.Success);

        var result = await _sut.VerifyEmailAsync(user.Id, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.EmailConfirmed.Should().BeTrue();

        await _mockUserManager.Received(1).GenerateEmailConfirmationTokenAsync(user);
        await _mockUserManager.Received(1).ConfirmEmailAsync(user, "test-token");
    }

    [Fact]
    public async Task VerifyEmailAsync_WithAlreadyConfirmedEmail_ReturnsSuccess() {
        var user = CreateTestUser("test@example.com", "Test User");
        user.EmailConfirmed = true;

        _mockUserManager.FindByIdAsync(user.Id.ToString()).Returns(user);

        var result = await _sut.VerifyEmailAsync(user.Id, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.EmailConfirmed.Should().BeTrue();

        await _mockUserManager.DidNotReceive().GenerateEmailConfirmationTokenAsync(Arg.Any<UserEntity>());
    }

    [Fact]
    public async Task VerifyEmailAsync_WithNonExistentUser_ThrowsUserNotFoundException() {
        var userId = Guid.CreateVersion7();
        _mockUserManager.FindByIdAsync(userId.ToString()).Returns((UserEntity?)null);

        var act = () => _sut.VerifyEmailAsync(userId, default);

        await act.Should().ThrowAsync<UserNotFoundException>()
            .WithMessage($"User with ID '{userId}' was not found.");
    }

    [Fact]
    public async Task VerifyEmailAsync_WhenConfirmationFails_ReturnsFailure() {
        var user = CreateTestUser("test@example.com", "Test User");
        user.EmailConfirmed = false;

        _mockUserManager.FindByIdAsync(user.Id.ToString()).Returns(user);
        _mockUserManager.GenerateEmailConfirmationTokenAsync(user).Returns("test-token");
        _mockUserManager.ConfirmEmailAsync(user, "test-token")
            .Returns(IdentityResult.Failed(new IdentityError { Description = "Confirmation failed" }));

        var result = await _sut.VerifyEmailAsync(user.Id, TestContext.Current.CancellationToken);

        result.Success.Should().BeFalse();
        result.EmailConfirmed.Should().BeFalse();
    }

    #endregion

    #region SendPasswordResetAsync Tests

    [Fact]
    public async Task SendPasswordResetAsync_WithExistingUser_ReturnsSuccess() {
        var user = CreateTestUser("test@example.com", "Test User");

        _mockUserManager.FindByIdAsync(user.Id.ToString()).Returns(user);
        _mockUserManager.GeneratePasswordResetTokenAsync(user).Returns("reset-token");

        var result = await _sut.SendPasswordResetAsync(user.Id, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.EmailSent.Should().BeTrue();

        await _mockUserManager.Received(1).GeneratePasswordResetTokenAsync(user);
    }

    [Fact]
    public async Task SendPasswordResetAsync_WithNonExistentUser_ReturnsSuccessForSecurity() {
        var userId = Guid.CreateVersion7();
        _mockUserManager.FindByIdAsync(userId.ToString()).Returns((UserEntity?)null);

        var result = await _sut.SendPasswordResetAsync(userId, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.EmailSent.Should().BeTrue();

        await _mockUserManager.DidNotReceive().GeneratePasswordResetTokenAsync(Arg.Any<UserEntity>());
    }

    #endregion

    #region AssignRoleAsync Tests

    [Fact]
    public async Task AssignRoleAsync_WithValidRequest_AssignsRoleSuccessfully() {
        var user = CreateTestUser("test@example.com", "Test User");
        var adminUserId = Guid.CreateVersion7();
        const string roleName = "Editor";
        var updatedRoles = new List<string> { "User", "Editor" };

        _mockUserManager.FindByIdAsync(user.Id.ToString()).Returns(user);
        _mockRoleManager.RoleExistsAsync(roleName).Returns(true);
        _mockUserManager.AddToRoleAsync(user, roleName).Returns(IdentityResult.Success);
        _mockUserManager.GetRolesAsync(user).Returns(updatedRoles);

        var result = await _sut.AssignRoleAsync(user.Id, roleName, adminUserId, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Roles.Should().BeEquivalentTo(updatedRoles);

        await _mockUserManager.Received(1).AddToRoleAsync(user, roleName);
    }

    [Fact]
    public async Task AssignRoleAsync_WhenAdminModifiesOwnRoles_ThrowsCannotModifySelfException() {
        var userId = Guid.CreateVersion7();
        const string roleName = "Editor";

        var act = () => _sut.AssignRoleAsync(userId, roleName, userId, default);

        await act.Should().ThrowAsync<CannotModifySelfException>()
            .WithMessage("Administrators cannot modify their own account.");
    }

    [Fact]
    public async Task AssignRoleAsync_WithNonExistentUser_ThrowsUserNotFoundException() {
        var userId = Guid.CreateVersion7();
        var adminUserId = Guid.CreateVersion7();
        const string roleName = "Editor";

        _mockUserManager.FindByIdAsync(userId.ToString()).Returns((UserEntity?)null);

        var act = () => _sut.AssignRoleAsync(userId, roleName, adminUserId, default);

        await act.Should().ThrowAsync<UserNotFoundException>()
            .WithMessage($"User with ID '{userId}' was not found.");
    }

    [Fact]
    public async Task AssignRoleAsync_WithNonExistentRole_ThrowsArgumentException() {
        var user = CreateTestUser("test@example.com", "Test User");
        var adminUserId = Guid.CreateVersion7();
        const string roleName = "InvalidRole";

        _mockUserManager.FindByIdAsync(user.Id.ToString()).Returns(user);
        _mockRoleManager.RoleExistsAsync(roleName).Returns(false);

        var act = () => _sut.AssignRoleAsync(user.Id, roleName, adminUserId, default);

        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage($"IsDefault '{roleName}' does not exist.*");
    }

    [Fact]
    public async Task AssignRoleAsync_WhenAddToRoleFails_ReturnsFailure() {
        var user = CreateTestUser("test@example.com", "Test User");
        var adminUserId = Guid.CreateVersion7();
        const string roleName = "Editor";

        _mockUserManager.FindByIdAsync(user.Id.ToString()).Returns(user);
        _mockRoleManager.RoleExistsAsync(roleName).Returns(true);
        _mockUserManager.AddToRoleAsync(user, roleName)
            .Returns(IdentityResult.Failed(new IdentityError { Description = "IsDefault assignment failed" }));

        var result = await _sut.AssignRoleAsync(user.Id, roleName, adminUserId, TestContext.Current.CancellationToken);

        result.Success.Should().BeFalse();
        result.Roles.Should().BeEmpty();
    }

    #endregion

    #region RemoveRoleAsync Tests

    [Fact]
    public async Task RemoveRoleAsync_WithValidRequest_RemovesRoleSuccessfully() {
        var user = CreateTestUser("test@example.com", "Test User");
        var adminUserId = Guid.CreateVersion7();
        const string roleName = "Editor";
        var updatedRoles = new List<string> { "User" };

        _mockUserManager.FindByIdAsync(user.Id.ToString()).Returns(user);
        _mockUserManager.RemoveFromRoleAsync(user, roleName).Returns(IdentityResult.Success);
        _mockUserManager.GetRolesAsync(user).Returns(updatedRoles);

        var result = await _sut.RemoveRoleAsync(user.Id, roleName, adminUserId, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Roles.Should().BeEquivalentTo(updatedRoles);

        await _mockUserManager.Received(1).RemoveFromRoleAsync(user, roleName);
    }

    [Fact]
    public async Task RemoveRoleAsync_WhenAdminModifiesOwnRoles_ThrowsCannotModifySelfException() {
        var userId = Guid.CreateVersion7();
        const string roleName = "Editor";

        var act = () => _sut.RemoveRoleAsync(userId, roleName, userId, default);

        await act.Should().ThrowAsync<CannotModifySelfException>()
            .WithMessage("Administrators cannot modify their own account.");
    }

    [Fact]
    public async Task RemoveRoleAsync_WithNonExistentUser_ThrowsUserNotFoundException() {
        var userId = Guid.CreateVersion7();
        var adminUserId = Guid.CreateVersion7();
        const string roleName = "Editor";

        _mockUserManager.FindByIdAsync(userId.ToString()).Returns((UserEntity?)null);

        var act = () => _sut.RemoveRoleAsync(userId, roleName, adminUserId, default);

        await act.Should().ThrowAsync<UserNotFoundException>()
            .WithMessage($"User with ID '{userId}' was not found.");
    }

    [Fact]
    public async Task RemoveRoleAsync_WhenRemovingLastAdminRole_ThrowsLastAdminException() {
        var user = CreateTestUser("admin@example.com", "Admin User");
        var adminUserId = Guid.CreateVersion7();
        var allUsers = new List<UserEntity> { user }.BuildMock();

        _mockUserManager.FindByIdAsync(user.Id.ToString()).Returns(user);
        _mockUserManager.GetRolesAsync(user).Returns(["Administrator"]);
        _mockUserManager.Users.Returns(allUsers);

        var adminRole = new RoleEntity { Name = "Administrator", Id = Guid.CreateVersion7() };
        _mockRoleManager.FindByNameAsync("Administrator").Returns(adminRole);

        var act = () => _sut.RemoveRoleAsync(user.Id, "Administrator", adminUserId, default);

        await act.Should().ThrowAsync<LastAdminException>()
            .WithMessage("Cannot remove or lock the last administrator account.");
    }

    [Fact]
    public async Task RemoveRoleAsync_WithMultipleAdmins_RemovesAdminRoleSuccessfully() {
        var admin1 = CreateTestUser("admin1@example.com", "Admin 1");
        var admin2 = CreateTestUser("admin2@example.com", "Admin 2");
        var adminUserId = Guid.CreateVersion7();
        var allUsers = new List<UserEntity> { admin1, admin2 }.BuildMock();

        _mockUserManager.FindByIdAsync(admin1.Id.ToString()).Returns(admin1);
        _mockUserManager.GetRolesAsync(admin1).Returns(["Administrator"]);
        _mockUserManager.GetRolesAsync(admin2).Returns(["Administrator"]);
        _mockUserManager.Users.Returns(allUsers);
        _mockUserManager.RemoveFromRoleAsync(admin1, "Administrator").Returns(IdentityResult.Success);

        var adminRole = new RoleEntity { Name = "Administrator", Id = Guid.CreateVersion7() };
        _mockRoleManager.FindByNameAsync("Administrator").Returns(adminRole);

        var result = await _sut.RemoveRoleAsync(admin1.Id, "Administrator", adminUserId, TestContext.Current.CancellationToken);

        result.Success.Should().BeTrue();
    }

    [Fact]
    public async Task RemoveRoleAsync_WhenRemoveFromRoleFails_ReturnsFailure() {
        var user = CreateTestUser("test@example.com", "Test User");
        var adminUserId = Guid.CreateVersion7();
        const string roleName = "Editor";

        _mockUserManager.FindByIdAsync(user.Id.ToString()).Returns(user);
        _mockUserManager.RemoveFromRoleAsync(user, roleName)
            .Returns(IdentityResult.Failed(new IdentityError { Description = "IsDefault removal failed" }));

        var result = await _sut.RemoveRoleAsync(user.Id, roleName, adminUserId, TestContext.Current.CancellationToken);

        result.Success.Should().BeFalse();
        result.Roles.Should().BeEmpty();
    }

    #endregion

    #region GetUserStatsAsync Tests

    [Fact]
    public async Task GetUserStatsAsync_ReturnsCorrectCounts() {
        var user1 = CreateTestUser("user1@example.com", "User 1");
        user1.EmailConfirmed = true;

        var user2 = CreateTestUser("user2@example.com", "User 2");
        user2.EmailConfirmed = false;

        var lockedUser = CreateTestUser("locked@example.com", "Locked User");
        lockedUser.EmailConfirmed = true;
        lockedUser.LockoutEnabled = true;
        lockedUser.LockoutEnd = DateTimeOffset.UtcNow.AddDays(1);

        var adminUser = CreateTestUser("admin@example.com", "Admin User");
        adminUser.EmailConfirmed = true;

        var users = new List<UserEntity> { user1, user2, lockedUser, adminUser };
        var queryable = users.BuildMock();

        _mockUserManager.Users.Returns(queryable);

        var adminRole = new RoleEntity { Name = "Administrator", Id = Guid.CreateVersion7() };
        _mockRoleManager.FindByNameAsync("Administrator").Returns(adminRole);

        _mockUserManager.GetRolesAsync(users[0]).Returns(["User"]);
        _mockUserManager.GetRolesAsync(users[1]).Returns(["User"]);
        _mockUserManager.GetRolesAsync(users[2]).Returns(["User"]);
        _mockUserManager.GetRolesAsync(users[3]).Returns(["Administrator"]);

        var result = await _sut.GetUserStatsAsync(TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.TotalUsers.Should().Be(4);
        result.TotalAdministrators.Should().Be(1);
        result.LockedUsers.Should().Be(1);
        result.UnconfirmedEmails.Should().Be(1);
    }

    [Fact]
    public async Task GetUserStatsAsync_WithNoAdminRole_ReturnsZeroAdministrators() {
        var users = CreateTestUsers(3);
        var queryable = users.BuildMock();

        _mockUserManager.Users.Returns(queryable);
        _mockRoleManager.FindByNameAsync("Administrator").Returns((RoleEntity?)null);

        foreach (var user in users) {
            _mockUserManager.GetRolesAsync(user).Returns(["User"]);
        }

        var result = await _sut.GetUserStatsAsync(TestContext.Current.CancellationToken);

        result.TotalAdministrators.Should().Be(0);
    }

    #endregion

    #region GetUserAuditTrailAsync Tests

    [Fact]
    public async Task GetUserAuditTrailAsync_ReturnsPagedLogs() {
        var userId = Guid.CreateVersion7();
        var logs = new List<VttTools.Audit.Model.AuditLog> {
            CreateDomainAuditLog(userId, "User.Login"),
            CreateDomainAuditLog(userId, "User.UpdateProfile"),
            CreateDomainAuditLog(userId, "User.Logout")
        };

        _mockAuditLogService.QueryAsync(
            userId: userId,
            skip: 0,
            take: 10,
            ct: Arg.Any<CancellationToken>()
        ).Returns((logs, 3));

        var result = await _sut.GetUserAuditTrailAsync(userId, 1, 10, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Logs.Should().HaveCount(3);
        result.TotalCount.Should().Be(3);
        result.Page.Should().Be(1);
        result.PageSize.Should().Be(10);
    }

    [Fact]
    public async Task GetUserAuditTrailAsync_WithPagination_ReturnsCorrectPage() {
        var userId = Guid.CreateVersion7();
        var logs = new List<VttTools.Audit.Model.AuditLog>();
        for (var i = 0; i < 10; i++) {
            logs.Add(CreateDomainAuditLog(userId, $"Action.{i}"));
        }

        _mockAuditLogService.QueryAsync(
            userId: userId,
            skip: 10,
            take: 10,
            ct: Arg.Any<CancellationToken>()
        ).Returns((logs, 25));

        var result = await _sut.GetUserAuditTrailAsync(userId, 2, 10, TestContext.Current.CancellationToken);

        result.Logs.Should().HaveCount(10);
        result.TotalCount.Should().Be(25);
        result.Page.Should().Be(2);
    }

    [Fact]
    public async Task GetUserAuditTrailAsync_WithNoLogs_ReturnsEmptyList() {
        var userId = Guid.CreateVersion7();
        var emptyLogs = new List<VttTools.Audit.Model.AuditLog>();

        _mockAuditLogService.QueryAsync(
            userId: userId,
            skip: 0,
            take: 10,
            ct: Arg.Any<CancellationToken>()
        ).Returns((emptyLogs, 0));

        var result = await _sut.GetUserAuditTrailAsync(userId, 1, 10, TestContext.Current.CancellationToken);

        result.Logs.Should().BeEmpty();
        result.TotalCount.Should().Be(0);
    }

    #endregion

    #region Helper Methods

    private static UserManager<UserEntity> CreateUserManagerMock() {
        var userStore = Substitute.For<IUserStore<UserEntity>>();
        return Substitute.For<UserManager<UserEntity>>(
            userStore, null, null, null, null, null, null, null, null);
    }

    private static RoleManager<RoleEntity> CreateRoleManagerMock() {
        var roleStore = Substitute.For<IRoleStore<RoleEntity>>();
        return Substitute.For<RoleManager<RoleEntity>>(
            roleStore, null, null, null, null);
    }

    private static UserEntity CreateTestUser(string email, string name) => new() {
        Id = Guid.CreateVersion7(),
        UserName = email,
        Email = email,
        Name = name,
        DisplayName = name,
        EmailConfirmed = true,
        PasswordHash = "default_hashed_password",
        TwoFactorEnabled = false
    };

    private static List<UserEntity> CreateTestUsers(int count) {
        var users = new List<UserEntity>();
        for (var i = 0; i < count; i++) {
            users.Add(CreateTestUser($"user{i}@example.com", $"User {i}"));
        }
        return users;
    }

    private static AuditLog CreateDomainAuditLog(Guid userId, string action) => new() {
        Id = Guid.CreateVersion7(),
        UserId = userId,
        Timestamp = DateTime.UtcNow,
        Action = action,
        EntityType = "User",
        EntityId = userId.ToString()
    };

    #endregion
}