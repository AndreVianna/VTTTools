using DotNetToolbox;

using VttTools.Common.Model;
using VttTools.Identity.Model;
using VttTools.Identity.Storage;

namespace VttTools.Admin.Services;

public class UserAdminServiceTests
    : IAsyncLifetime {
    private readonly IUserStorage _mockUserStorage;
    private readonly IRoleStorage _mockRoleStorage;
    private readonly IAuditLogService _mockAuditLogService;
    private readonly ILogger<UserAdminService> _mockLogger;
    private readonly UserAdminService _sut;

    public UserAdminServiceTests() {
        _mockUserStorage = Substitute.For<IUserStorage>();
        _mockRoleStorage = Substitute.For<IRoleStorage>();
        _mockAuditLogService = Substitute.For<IAuditLogService>();
        _mockLogger = Substitute.For<ILogger<UserAdminService>>();
        _sut = new(_mockUserStorage, _mockRoleStorage, _mockAuditLogService, _mockLogger);
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

        _mockUserStorage.SearchAsync(
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            Arg.Any<Pagination?>(),
            Arg.Any<CancellationToken>())
            .Returns(([.. users.Take(10)], 15));

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
        var matchingUsers = new User[] {
            CreateTestUser("john@example.com", "John Doe"),
            CreateTestUser("johnson@example.com", "Bob Johnson")
        };

        _mockUserStorage.SearchAsync(
            "john",
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            Arg.Any<Pagination?>(),
            Arg.Any<CancellationToken>())
            .Returns((matchingUsers, 2));

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
        var activeUser = CreateTestUser("active@example.com", "Active User", emailConfirmed: true);

        _mockUserStorage.SearchAsync(
            Arg.Any<string?>(),
            "active",
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            Arg.Any<Pagination?>(),
            Arg.Any<CancellationToken>())
            .Returns(([activeUser], 1));

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
        var lockedUser = CreateTestUser("locked@example.com", "Locked User", emailConfirmed: true, lockoutEnabled: true, lockoutEnd: DateTimeOffset.UtcNow.AddDays(1));

        _mockUserStorage.SearchAsync(
            Arg.Any<string?>(),
            "locked",
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            Arg.Any<Pagination?>(),
            Arg.Any<CancellationToken>())
            .Returns(([lockedUser], 1));

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
        var adminUsers = new User[] {
            CreateTestUser("admin1@example.com", "Admin 1", roles: ["Administrator"]),
            CreateTestUser("admin2@example.com", "Admin 2", roles: ["Administrator"])
        };

        _mockUserStorage.SearchAsync(
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            "Administrator",
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            Arg.Any<Pagination?>(),
            Arg.Any<CancellationToken>())
            .Returns((adminUsers, 2));

        var request = new UserSearchRequest {
            Role = "Administrator",
            Skip = 0,
            Take = 10
        };

        var result = await _sut.SearchUsersAsync(request, TestContext.Current.CancellationToken);

        result.Users.Count.Should().Be(2);
        result.Users.All(u => u.Roles.Contains("Administrator")).Should().BeTrue();
    }

    #endregion

    #region GetUserByIdAsync Tests

    [Fact]
    public async Task GetUserByIdAsync_WithExistingUser_ReturnsUserDetail() {
        var user = CreateTestUser("test@example.com", "Test User", roles: ["User", "Editor"]);
        var createdDate = DateTime.UtcNow.AddDays(-30);
        var lastLoginDate = DateTime.UtcNow.AddDays(-1);
        var lastModifiedDate = DateTime.UtcNow;

        _mockUserStorage.FindByIdAsync(user.Id, Arg.Any<CancellationToken>()).Returns(user);
        _mockAuditLogService.GetUserCreatedDateAsync(user.Id, Arg.Any<CancellationToken>()).Returns(createdDate);
        _mockAuditLogService.GetUserLastLoginDateAsync(user.Id, Arg.Any<CancellationToken>()).Returns(lastLoginDate);
        _mockAuditLogService.GetUserLastModifiedDateAsync(user.Id, Arg.Any<CancellationToken>()).Returns(lastModifiedDate);

        var result = await _sut.GetUserByIdAsync(user.Id, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Id.Should().Be(user.Id);
        result.Email.Should().Be(user.Email);
        result.DisplayName.Should().Be(user.DisplayName);
        result.EmailConfirmed.Should().Be(user.EmailConfirmed);
        result.Roles.Should().BeEquivalentTo(["User", "Editor"]);
    }

    [Fact]
    public async Task GetUserByIdAsync_WithNonExistentUser_ThrowsUserNotFoundException() {
        var userId = Guid.CreateVersion7();
        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((User?)null);

        var act = () => _sut.GetUserByIdAsync(userId, default);

        await act.Should().ThrowAsync<UserNotFoundException>()
            .WithMessage($"User with ID '{userId}' was not found.");
    }

    [Fact]
    public async Task GetUserByIdAsync_WithLockedUser_ReturnsIsLockedOutTrue() {
        var user = CreateTestUser("locked@example.com", "Locked User", lockoutEnabled: true, lockoutEnd: DateTimeOffset.UtcNow.AddDays(1));
        var createdDate = DateTime.UtcNow.AddDays(-30);

        _mockUserStorage.FindByIdAsync(user.Id, Arg.Any<CancellationToken>()).Returns(user);
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
        var summary = new UsersSummary { TotalUsers = 5, TotalAdministrators = 2, LockedUsers = 0, UnconfirmedEmails = 0 };

        _mockUserStorage.FindByIdAsync(user.Id, Arg.Any<CancellationToken>()).Returns(user);
        _mockUserStorage.GetSummaryAsync(Arg.Any<CancellationToken>()).Returns(summary);
        _mockUserStorage.UpdateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        var result = await _sut.LockUserAsync(user.Id, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.LockedUntil.Should().NotBeNull();
        result.LockedUntil!.Value.Should().BeAfter(DateTimeOffset.UtcNow.AddYears(99));

        await _mockUserStorage.Received(1).UpdateAsync(
            Arg.Is<User>(u => u.LockoutEnabled && u.LockoutEnd > DateTimeOffset.UtcNow.AddYears(99)),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task LockUserAsync_WithNonExistentUser_ThrowsUserNotFoundException() {
        var userId = Guid.CreateVersion7();
        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((User?)null);

        var act = () => _sut.LockUserAsync(userId, TestContext.Current.CancellationToken);

        await act.Should().ThrowAsync<UserNotFoundException>()
            .WithMessage($"User with ID '{userId}' was not found.");
    }

    [Fact]
    public async Task LockUserAsync_WhenLockingLastAdmin_ThrowsLastAdminException() {
        var user = CreateTestUser("admin@example.com", "Admin User", roles: ["Administrator"]);
        var summary = new UsersSummary { TotalUsers = 1, TotalAdministrators = 1, LockedUsers = 0, UnconfirmedEmails = 0 };

        _mockUserStorage.FindByIdAsync(user.Id, Arg.Any<CancellationToken>()).Returns(user);
        _mockUserStorage.GetSummaryAsync(Arg.Any<CancellationToken>()).Returns(summary);

        var act = () => _sut.LockUserAsync(user.Id, TestContext.Current.CancellationToken);

        await act.Should().ThrowAsync<LastAdminException>()
            .WithMessage("Cannot remove or lock the last administrator account.");
    }

    [Fact]
    public async Task LockUserAsync_WithMultipleAdmins_LocksAdminSuccessfully() {
        var admin = CreateTestUser("admin1@example.com", "Admin 1", roles: ["Administrator"]);
        var summary = new UsersSummary { TotalUsers = 2, TotalAdministrators = 2, LockedUsers = 0, UnconfirmedEmails = 0 };

        _mockUserStorage.FindByIdAsync(admin.Id, Arg.Any<CancellationToken>()).Returns(admin);
        _mockUserStorage.GetSummaryAsync(Arg.Any<CancellationToken>()).Returns(summary);
        _mockUserStorage.UpdateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        var result = await _sut.LockUserAsync(admin.Id, TestContext.Current.CancellationToken);

        result.Success.Should().BeTrue();
    }

    [Fact]
    public async Task LockUserAsync_WhenUpdateFails_ReturnsFailure() {
        var user = CreateTestUser("test@example.com", "Test User");
        var summary = new UsersSummary { TotalUsers = 5, TotalAdministrators = 2, LockedUsers = 0, UnconfirmedEmails = 0 };

        _mockUserStorage.FindByIdAsync(user.Id, Arg.Any<CancellationToken>()).Returns(user);
        _mockUserStorage.GetSummaryAsync(Arg.Any<CancellationToken>()).Returns(summary);
        _mockUserStorage.UpdateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure(new Error("Lockout failed")));

        var result = await _sut.LockUserAsync(user.Id, TestContext.Current.CancellationToken);

        result.Success.Should().BeFalse();
        result.LockedUntil.Should().BeNull();
    }

    #endregion

    #region UnlockUserAsync Tests

    [Fact]
    public async Task UnlockUserAsync_WithLockedUser_UnlocksSuccessfully() {
        var user = CreateTestUser("locked@example.com", "Locked User", lockoutEnabled: true, lockoutEnd: DateTimeOffset.UtcNow.AddDays(1));

        _mockUserStorage.FindByIdAsync(user.Id, Arg.Any<CancellationToken>()).Returns(user);
        _mockUserStorage.UpdateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        var result = await _sut.UnlockUserAsync(user.Id, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Success.Should().BeTrue();

        await _mockUserStorage.Received(1).UpdateAsync(
            Arg.Is<User>(u => u.LockoutEnd == null),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UnlockUserAsync_WithNonExistentUser_ThrowsUserNotFoundException() {
        var userId = Guid.CreateVersion7();
        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((User?)null);

        var act = () => _sut.UnlockUserAsync(userId, TestContext.Current.CancellationToken);

        await act.Should().ThrowAsync<UserNotFoundException>()
            .WithMessage($"User with ID '{userId}' was not found.");
    }

    [Fact]
    public async Task UnlockUserAsync_WhenUpdateFails_ReturnsFailure() {
        var user = CreateTestUser("test@example.com", "Test User");

        _mockUserStorage.FindByIdAsync(user.Id, Arg.Any<CancellationToken>()).Returns(user);
        _mockUserStorage.UpdateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure(new Error("Unlock failed")));

        var result = await _sut.UnlockUserAsync(user.Id, TestContext.Current.CancellationToken);

        result.Success.Should().BeFalse();
    }

    #endregion

    #region VerifyEmailAsync Tests

    [Fact]
    public async Task VerifyEmailAsync_WithUnconfirmedEmail_ConfirmsSuccessfully() {
        var user = CreateTestUser("test@example.com", "Test User", emailConfirmed: false);

        _mockUserStorage.FindByIdAsync(user.Id, Arg.Any<CancellationToken>()).Returns(user);
        _mockUserStorage.ConfirmEmailAsync(user.Id, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        var result = await _sut.VerifyEmailAsync(user.Id, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.EmailConfirmed.Should().BeTrue();

        await _mockUserStorage.Received(1).ConfirmEmailAsync(user.Id, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task VerifyEmailAsync_WithAlreadyConfirmedEmail_ReturnsSuccess() {
        var user = CreateTestUser("test@example.com", "Test User", emailConfirmed: true);

        _mockUserStorage.FindByIdAsync(user.Id, Arg.Any<CancellationToken>()).Returns(user);

        var result = await _sut.VerifyEmailAsync(user.Id, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.EmailConfirmed.Should().BeTrue();

        await _mockUserStorage.DidNotReceive().ConfirmEmailAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task VerifyEmailAsync_WithNonExistentUser_ThrowsUserNotFoundException() {
        var userId = Guid.CreateVersion7();
        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((User?)null);

        var act = () => _sut.VerifyEmailAsync(userId, default);

        await act.Should().ThrowAsync<UserNotFoundException>()
            .WithMessage($"User with ID '{userId}' was not found.");
    }

    [Fact]
    public async Task VerifyEmailAsync_WhenConfirmationFails_ReturnsFailure() {
        var user = CreateTestUser("test@example.com", "Test User", emailConfirmed: false);

        _mockUserStorage.FindByIdAsync(user.Id, Arg.Any<CancellationToken>()).Returns(user);
        _mockUserStorage.ConfirmEmailAsync(user.Id, Arg.Any<CancellationToken>())
            .Returns(Result.Failure(new Error("Confirmation failed")));

        var result = await _sut.VerifyEmailAsync(user.Id, TestContext.Current.CancellationToken);

        result.Success.Should().BeFalse();
        result.EmailConfirmed.Should().BeFalse();
    }

    #endregion

    #region SendPasswordResetAsync Tests

    [Fact]
    public async Task SendPasswordResetAsync_WithExistingUser_ReturnsSuccess() {
        var user = CreateTestUser("test@example.com", "Test User");

        _mockUserStorage.FindByIdAsync(user.Id, Arg.Any<CancellationToken>()).Returns(user);
        _mockUserStorage.GeneratePasswordResetTokenAsync(user.Id, Arg.Any<CancellationToken>())
            .Returns("reset-token");

        var result = await _sut.SendPasswordResetAsync(user.Id, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.EmailSent.Should().BeTrue();

        await _mockUserStorage.Received(1).GeneratePasswordResetTokenAsync(user.Id, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SendPasswordResetAsync_WithNonExistentUser_ReturnsSuccessForSecurity() {
        var userId = Guid.CreateVersion7();
        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((User?)null);

        var result = await _sut.SendPasswordResetAsync(userId, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.EmailSent.Should().BeTrue();

        await _mockUserStorage.DidNotReceive().GeneratePasswordResetTokenAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    #endregion

    #region AssignRoleAsync Tests

    [Fact]
    public async Task AssignRoleAsync_WithValidRequest_AssignsRoleSuccessfully() {
        var user = CreateTestUser("test@example.com", "Test User");
        var updatedUser = CreateTestUser("test@example.com", "Test User", roles: ["User", "Editor"]);
        updatedUser = updatedUser with { Id = user.Id };
        var adminUserId = Guid.CreateVersion7();
        const string roleName = "Editor";
        var role = new Role { Id = Guid.CreateVersion7(), Name = roleName };

        _mockUserStorage.FindByIdAsync(user.Id, Arg.Any<CancellationToken>())
            .Returns(user, updatedUser);
        _mockRoleStorage.FindByNameAsync(roleName, Arg.Any<CancellationToken>()).Returns(role);
        _mockUserStorage.AddToRoleAsync(user.Id, roleName, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        var result = await _sut.AssignRoleAsync(user.Id, roleName, adminUserId, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Roles.Should().BeEquivalentTo(["User", "Editor"]);

        await _mockUserStorage.Received(1).AddToRoleAsync(user.Id, roleName, Arg.Any<CancellationToken>());
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

        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((User?)null);

        var act = () => _sut.AssignRoleAsync(userId, roleName, adminUserId, default);

        await act.Should().ThrowAsync<UserNotFoundException>()
            .WithMessage($"User with ID '{userId}' was not found.");
    }

    [Fact]
    public async Task AssignRoleAsync_WithNonExistentRole_ThrowsArgumentException() {
        var user = CreateTestUser("test@example.com", "Test User");
        var adminUserId = Guid.CreateVersion7();
        const string roleName = "InvalidRole";

        _mockUserStorage.FindByIdAsync(user.Id, Arg.Any<CancellationToken>()).Returns(user);
        _mockRoleStorage.FindByNameAsync(roleName, Arg.Any<CancellationToken>()).Returns((Role?)null);

        var act = () => _sut.AssignRoleAsync(user.Id, roleName, adminUserId, default);

        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage($"Role '{roleName}' does not exist.*");
    }

    [Fact]
    public async Task AssignRoleAsync_WhenAddToRoleFails_ReturnsFailure() {
        var user = CreateTestUser("test@example.com", "Test User");
        var adminUserId = Guid.CreateVersion7();
        const string roleName = "Editor";
        var role = new Role { Id = Guid.CreateVersion7(), Name = roleName };

        _mockUserStorage.FindByIdAsync(user.Id, Arg.Any<CancellationToken>()).Returns(user);
        _mockRoleStorage.FindByNameAsync(roleName, Arg.Any<CancellationToken>()).Returns(role);
        _mockUserStorage.AddToRoleAsync(user.Id, roleName, Arg.Any<CancellationToken>())
            .Returns(Result.Failure(new Error("Role assignment failed")));

        var result = await _sut.AssignRoleAsync(user.Id, roleName, adminUserId, TestContext.Current.CancellationToken);

        result.Success.Should().BeFalse();
        result.Roles.Should().BeEmpty();
    }

    #endregion

    #region RemoveRoleAsync Tests

    [Fact]
    public async Task RemoveRoleAsync_WithValidRequest_RemovesRoleSuccessfully() {
        var user = CreateTestUser("test@example.com", "Test User", roles: ["User", "Editor"]);
        var updatedUser = CreateTestUser("test@example.com", "Test User", roles: ["User"]);
        updatedUser = updatedUser with { Id = user.Id };
        var adminUserId = Guid.CreateVersion7();
        const string roleName = "Editor";
        var summary = new UsersSummary { TotalUsers = 5, TotalAdministrators = 2, LockedUsers = 0, UnconfirmedEmails = 0 };

        _mockUserStorage.FindByIdAsync(user.Id, Arg.Any<CancellationToken>())
            .Returns(user, updatedUser);
        _mockUserStorage.GetSummaryAsync(Arg.Any<CancellationToken>()).Returns(summary);
        _mockUserStorage.RemoveFromRoleAsync(user.Id, roleName, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        var result = await _sut.RemoveRoleAsync(user.Id, roleName, adminUserId, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Roles.Should().BeEquivalentTo(["User"]);

        await _mockUserStorage.Received(1).RemoveFromRoleAsync(user.Id, roleName, Arg.Any<CancellationToken>());
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

        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((User?)null);

        var act = () => _sut.RemoveRoleAsync(userId, roleName, adminUserId, default);

        await act.Should().ThrowAsync<UserNotFoundException>()
            .WithMessage($"User with ID '{userId}' was not found.");
    }

    [Fact]
    public async Task RemoveRoleAsync_WhenRemovingLastAdminRole_ThrowsLastAdminException() {
        var user = CreateTestUser("admin@example.com", "Admin User", roles: ["Administrator"]);
        var adminUserId = Guid.CreateVersion7();
        var summary = new UsersSummary { TotalUsers = 1, TotalAdministrators = 1, LockedUsers = 0, UnconfirmedEmails = 0 };

        _mockUserStorage.FindByIdAsync(user.Id, Arg.Any<CancellationToken>()).Returns(user);
        _mockUserStorage.GetSummaryAsync(Arg.Any<CancellationToken>()).Returns(summary);

        var act = () => _sut.RemoveRoleAsync(user.Id, "Administrator", adminUserId, default);

        await act.Should().ThrowAsync<LastAdminException>()
            .WithMessage("Cannot remove or lock the last administrator account.");
    }

    [Fact]
    public async Task RemoveRoleAsync_WithMultipleAdmins_RemovesAdminRoleSuccessfully() {
        var admin1 = CreateTestUser("admin1@example.com", "Admin 1", roles: ["Administrator"]);
        var updatedAdmin = CreateTestUser("admin1@example.com", "Admin 1", roles: []);
        updatedAdmin = updatedAdmin with { Id = admin1.Id };
        var adminUserId = Guid.CreateVersion7();
        var summary = new UsersSummary { TotalUsers = 2, TotalAdministrators = 2, LockedUsers = 0, UnconfirmedEmails = 0 };

        _mockUserStorage.FindByIdAsync(admin1.Id, Arg.Any<CancellationToken>())
            .Returns(admin1, updatedAdmin);
        _mockUserStorage.GetSummaryAsync(Arg.Any<CancellationToken>()).Returns(summary);
        _mockUserStorage.RemoveFromRoleAsync(admin1.Id, "Administrator", Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        var result = await _sut.RemoveRoleAsync(admin1.Id, "Administrator", adminUserId, TestContext.Current.CancellationToken);

        result.Success.Should().BeTrue();
    }

    [Fact]
    public async Task RemoveRoleAsync_WhenRemoveFromRoleFails_ReturnsFailure() {
        var user = CreateTestUser("test@example.com", "Test User");
        var adminUserId = Guid.CreateVersion7();
        const string roleName = "Editor";
        var summary = new UsersSummary { TotalUsers = 5, TotalAdministrators = 2, LockedUsers = 0, UnconfirmedEmails = 0 };

        _mockUserStorage.FindByIdAsync(user.Id, Arg.Any<CancellationToken>()).Returns(user);
        _mockUserStorage.GetSummaryAsync(Arg.Any<CancellationToken>()).Returns(summary);
        _mockUserStorage.RemoveFromRoleAsync(user.Id, roleName, Arg.Any<CancellationToken>())
            .Returns(Result.Failure(new Error("Role removal failed")));

        var result = await _sut.RemoveRoleAsync(user.Id, roleName, adminUserId, TestContext.Current.CancellationToken);

        result.Success.Should().BeFalse();
        result.Roles.Should().BeEmpty();
    }

    #endregion

    #region GetUserStatsAsync Tests

    [Fact]
    public async Task GetUserStatsAsync_ReturnsCorrectCounts() {
        var summary = new UsersSummary {
            TotalUsers = 4,
            TotalAdministrators = 1,
            LockedUsers = 1,
            UnconfirmedEmails = 1
        };

        _mockUserStorage.GetSummaryAsync(Arg.Any<CancellationToken>()).Returns(summary);

        var result = await _sut.GetUserStatsAsync(TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.TotalUsers.Should().Be(4);
        result.TotalAdministrators.Should().Be(1);
        result.LockedUsers.Should().Be(1);
        result.UnconfirmedEmails.Should().Be(1);
    }

    [Fact]
    public async Task GetUserStatsAsync_WithNoAdminRole_ReturnsZeroAdministrators() {
        var summary = new UsersSummary {
            TotalUsers = 3,
            TotalAdministrators = 0,
            LockedUsers = 0,
            UnconfirmedEmails = 0
        };

        _mockUserStorage.GetSummaryAsync(Arg.Any<CancellationToken>()).Returns(summary);

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

    private static User CreateTestUser(
        string email,
        string name,
        bool emailConfirmed = true,
        bool lockoutEnabled = false,
        DateTimeOffset? lockoutEnd = null,
        IReadOnlyList<string>? roles = null) => new() {
        Id = Guid.CreateVersion7(),
        Email = email,
        Name = name,
        DisplayName = name,
        EmailConfirmed = emailConfirmed,
        LockoutEnabled = lockoutEnabled,
        LockoutEnd = lockoutEnd,
        TwoFactorEnabled = false,
        Roles = roles ?? ["User"]
    };

    private static List<User> CreateTestUsers(int count) {
        var users = new List<User>();
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
