namespace VttTools.Auth.UnitTests.Services;

public class SecurityServiceTests {
    private readonly UserManager<User> _mockUserManager;
    private readonly ILogger<SecurityService> _mockLogger;
    private readonly SecurityService _securityService;

    public SecurityServiceTests() {
        _mockUserManager = CreateUserManagerMock();
        _mockLogger = Substitute.For<ILogger<SecurityService>>();
        _securityService = new SecurityService(_mockUserManager, _mockLogger);
    }

    #region GetSecuritySettingsAsync Tests

    [Fact]
    public async Task GetSecuritySettingsAsync_WithValidUserId_ReturnsSettings() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        testUser.PasswordHash = "hashed_password";
        testUser.TwoFactorEnabled = false;

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CountRecoveryCodesAsync(testUser).Returns(5);

        // Act
        var result = await _securityService.GetSecuritySettingsAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Null(result.Message);
        Assert.True(result.HasPassword);
        Assert.False(result.TwoFactorEnabled);
        Assert.Equal(5, result.RecoveryCodesRemaining);

        await _mockUserManager.Received(1).FindByIdAsync(testUser.Id.ToString());
        await _mockUserManager.Received(1).CountRecoveryCodesAsync(testUser);
    }

    [Fact]
    public async Task GetSecuritySettingsAsync_WithNonExistentUser_ReturnsNotFound() {
        // Arrange
        var userId = Guid.CreateVersion7();
        _mockUserManager.FindByIdAsync(userId.ToString()).Returns((User?)null);

        // Act
        var result = await _securityService.GetSecuritySettingsAsync(userId, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("User not found", result.Message);
        Assert.False(result.HasPassword);
        Assert.False(result.TwoFactorEnabled);
        Assert.Equal(0, result.RecoveryCodesRemaining);

        await _mockUserManager.Received(1).FindByIdAsync(userId.ToString());
        await _mockUserManager.DidNotReceive().CountRecoveryCodesAsync(Arg.Any<User>());
    }

    [Fact]
    public async Task GetSecuritySettingsAsync_WithUserWithoutPassword_ReturnsFalseHasPassword() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        testUser.PasswordHash = null;
        testUser.TwoFactorEnabled = false;

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CountRecoveryCodesAsync(testUser).Returns(0);

        // Act
        var result = await _securityService.GetSecuritySettingsAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Null(result.Message);
        Assert.False(result.HasPassword);
        Assert.False(result.TwoFactorEnabled);
        Assert.Equal(0, result.RecoveryCodesRemaining);

        await _mockUserManager.Received(1).FindByIdAsync(testUser.Id.ToString());
        await _mockUserManager.Received(1).CountRecoveryCodesAsync(testUser);
    }

    [Fact]
    public async Task GetSecuritySettingsAsync_WithUserWithEmptyPasswordHash_ReturnsFalseHasPassword() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        testUser.PasswordHash = string.Empty;
        testUser.TwoFactorEnabled = false;

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CountRecoveryCodesAsync(testUser).Returns(0);

        // Act
        var result = await _securityService.GetSecuritySettingsAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Null(result.Message);
        Assert.False(result.HasPassword);
        Assert.False(result.TwoFactorEnabled);
        Assert.Equal(0, result.RecoveryCodesRemaining);

        await _mockUserManager.Received(1).FindByIdAsync(testUser.Id.ToString());
    }

    [Fact]
    public async Task GetSecuritySettingsAsync_WithTwoFactorEnabled_ReturnsTrueTwoFactorEnabled() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        testUser.PasswordHash = "hashed_password";
        testUser.TwoFactorEnabled = true;

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CountRecoveryCodesAsync(testUser).Returns(10);

        // Act
        var result = await _securityService.GetSecuritySettingsAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Null(result.Message);
        Assert.True(result.HasPassword);
        Assert.True(result.TwoFactorEnabled);
        Assert.Equal(10, result.RecoveryCodesRemaining);

        await _mockUserManager.Received(1).FindByIdAsync(testUser.Id.ToString());
        await _mockUserManager.Received(1).CountRecoveryCodesAsync(testUser);
    }

    [Fact]
    public async Task GetSecuritySettingsAsync_WithRecoveryCodes_ReturnsCorrectCount() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        testUser.PasswordHash = "hashed_password";
        testUser.TwoFactorEnabled = true;

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CountRecoveryCodesAsync(testUser).Returns(3);

        // Act
        var result = await _securityService.GetSecuritySettingsAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal(3, result.RecoveryCodesRemaining);

        await _mockUserManager.Received(1).CountRecoveryCodesAsync(testUser);
    }

    [Fact]
    public async Task GetSecuritySettingsAsync_WhenExceptionThrown_ReturnsInternalError() {
        // Arrange
        var userId = Guid.CreateVersion7();
        _mockUserManager.FindByIdAsync(userId.ToString())
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _securityService.GetSecuritySettingsAsync(userId, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);
        Assert.False(result.HasPassword);
        Assert.False(result.TwoFactorEnabled);
        Assert.Equal(0, result.RecoveryCodesRemaining);

        await _mockUserManager.Received(1).FindByIdAsync(userId.ToString());
    }

    #endregion

    #region ChangePasswordAsync Tests

    [Fact]
    public async Task ChangePasswordAsync_WithValidRequest_ReturnsSuccess() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        testUser.PasswordHash = "old_hashed_password";

        var request = new ChangePasswordRequest {
            CurrentPassword = "OldPassword123!",
            NewPassword = "NewPassword456!",
            ConfirmNewPassword = "NewPassword456!"
        };

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CheckPasswordAsync(testUser, request.CurrentPassword).Returns(true);
        _mockUserManager.ChangePasswordAsync(testUser, request.CurrentPassword, request.NewPassword)
            .Returns(IdentityResult.Success);

        // Act
        var result = await _securityService.ChangePasswordAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("Password changed successfully", result.Message);

        await _mockUserManager.Received(1).FindByIdAsync(testUser.Id.ToString());
        await _mockUserManager.Received(1).CheckPasswordAsync(testUser, request.CurrentPassword);
        await _mockUserManager.Received(1).ChangePasswordAsync(testUser, request.CurrentPassword, request.NewPassword);
    }

    [Fact]
    public async Task ChangePasswordAsync_WithNonExistentUser_ReturnsNotFound() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var request = new ChangePasswordRequest {
            CurrentPassword = "OldPassword123!",
            NewPassword = "NewPassword456!",
            ConfirmNewPassword = "NewPassword456!"
        };

        _mockUserManager.FindByIdAsync(userId.ToString()).Returns((User?)null);

        // Act
        var result = await _securityService.ChangePasswordAsync(userId, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("User not found", result.Message);

        await _mockUserManager.Received(1).FindByIdAsync(userId.ToString());
        await _mockUserManager.DidNotReceive().CheckPasswordAsync(Arg.Any<User>(), Arg.Any<string>());
        await _mockUserManager.DidNotReceive().ChangePasswordAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public async Task ChangePasswordAsync_WithIncorrectCurrentPassword_ReturnsError() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        testUser.PasswordHash = "hashed_password";

        var request = new ChangePasswordRequest {
            CurrentPassword = "WrongPassword123!",
            NewPassword = "NewPassword456!",
            ConfirmNewPassword = "NewPassword456!"
        };

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CheckPasswordAsync(testUser, request.CurrentPassword).Returns(false);

        // Act
        var result = await _securityService.ChangePasswordAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Current password is incorrect", result.Message);

        await _mockUserManager.Received(1).FindByIdAsync(testUser.Id.ToString());
        await _mockUserManager.Received(1).CheckPasswordAsync(testUser, request.CurrentPassword);
        await _mockUserManager.DidNotReceive().ChangePasswordAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public async Task ChangePasswordAsync_WithWeakNewPassword_ReturnsValidationError() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        testUser.PasswordHash = "old_hashed_password";

        var request = new ChangePasswordRequest {
            CurrentPassword = "OldPassword123!",
            NewPassword = "weak",
            ConfirmNewPassword = "weak"
        };

        var identityErrors = new List<IdentityError> {
            new() { Description = "Passwords must be at least 8 characters" },
            new() { Description = "Passwords must have at least one uppercase letter" }
        };
        var failedResult = IdentityResult.Failed([.. identityErrors]);

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CheckPasswordAsync(testUser, request.CurrentPassword).Returns(true);
        _mockUserManager.ChangePasswordAsync(testUser, request.CurrentPassword, request.NewPassword)
            .Returns(failedResult);

        // Act
        var result = await _securityService.ChangePasswordAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Contains("Passwords must be at least 8 characters", result.Message);
        Assert.Contains("Passwords must have at least one uppercase letter", result.Message);

        await _mockUserManager.Received(1).ChangePasswordAsync(testUser, request.CurrentPassword, request.NewPassword);
    }

    [Fact]
    public async Task ChangePasswordAsync_WithIdentityResultErrors_ReturnsErrorMessages() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        testUser.PasswordHash = "old_hashed_password";

        var request = new ChangePasswordRequest {
            CurrentPassword = "OldPassword123!",
            NewPassword = "NewPassword456!",
            ConfirmNewPassword = "NewPassword456!"
        };

        var identityErrors = new List<IdentityError> {
            new() { Description = "Password cannot be the same as the old password" },
            new() { Description = "Password must contain a special character" }
        };
        var failedResult = IdentityResult.Failed([.. identityErrors]);

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CheckPasswordAsync(testUser, request.CurrentPassword).Returns(true);
        _mockUserManager.ChangePasswordAsync(testUser, request.CurrentPassword, request.NewPassword)
            .Returns(failedResult);

        // Act
        var result = await _securityService.ChangePasswordAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Contains("Password cannot be the same as the old password", result.Message);
        Assert.Contains("Password must contain a special character", result.Message);

        await _mockUserManager.Received(1).ChangePasswordAsync(testUser, request.CurrentPassword, request.NewPassword);
    }

    [Fact]
    public async Task ChangePasswordAsync_WithSamePassword_HandledByIdentityResult() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        testUser.PasswordHash = "hashed_password";

        var request = new ChangePasswordRequest {
            CurrentPassword = "SamePassword123!",
            NewPassword = "SamePassword123!",
            ConfirmNewPassword = "SamePassword123!"
        };

        var identityErrors = new List<IdentityError> {
            new() { Description = "New password must be different from the current password" }
        };
        var failedResult = IdentityResult.Failed([.. identityErrors]);

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CheckPasswordAsync(testUser, request.CurrentPassword).Returns(true);
        _mockUserManager.ChangePasswordAsync(testUser, request.CurrentPassword, request.NewPassword)
            .Returns(failedResult);

        // Act
        var result = await _securityService.ChangePasswordAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Contains("New password must be different from the current password", result.Message);

        await _mockUserManager.Received(1).ChangePasswordAsync(testUser, request.CurrentPassword, request.NewPassword);
    }

    [Fact]
    public async Task ChangePasswordAsync_WithMultipleIdentityErrors_ReturnsCommaSeparatedErrors() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        testUser.PasswordHash = "old_hashed_password";

        var request = new ChangePasswordRequest {
            CurrentPassword = "OldPassword123!",
            NewPassword = "NewPassword456!",
            ConfirmNewPassword = "NewPassword456!"
        };

        var identityErrors = new List<IdentityError> {
            new() { Description = "Error 1" },
            new() { Description = "Error 2" },
            new() { Description = "Error 3" }
        };
        var failedResult = IdentityResult.Failed([.. identityErrors]);

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CheckPasswordAsync(testUser, request.CurrentPassword).Returns(true);
        _mockUserManager.ChangePasswordAsync(testUser, request.CurrentPassword, request.NewPassword)
            .Returns(failedResult);

        // Act
        var result = await _securityService.ChangePasswordAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Error 1, Error 2, Error 3", result.Message);

        await _mockUserManager.Received(1).ChangePasswordAsync(testUser, request.CurrentPassword, request.NewPassword);
    }

    [Fact]
    public async Task ChangePasswordAsync_WhenExceptionThrown_ReturnsInternalError() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var request = new ChangePasswordRequest {
            CurrentPassword = "OldPassword123!",
            NewPassword = "NewPassword456!",
            ConfirmNewPassword = "NewPassword456!"
        };

        _mockUserManager.FindByIdAsync(userId.ToString())
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _securityService.ChangePasswordAsync(userId, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);

        await _mockUserManager.Received(1).FindByIdAsync(userId.ToString());
    }

    [Fact]
    public async Task ChangePasswordAsync_WhenCheckPasswordThrowsException_ReturnsInternalError() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new ChangePasswordRequest {
            CurrentPassword = "OldPassword123!",
            NewPassword = "NewPassword456!",
            ConfirmNewPassword = "NewPassword456!"
        };

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CheckPasswordAsync(testUser, request.CurrentPassword)
            .ThrowsAsync(new InvalidOperationException("Password check failed"));

        // Act
        var result = await _securityService.ChangePasswordAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);

        await _mockUserManager.Received(1).CheckPasswordAsync(testUser, request.CurrentPassword);
    }

    [Fact]
    public async Task ChangePasswordAsync_WhenChangePasswordThrowsException_ReturnsInternalError() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new ChangePasswordRequest {
            CurrentPassword = "OldPassword123!",
            NewPassword = "NewPassword456!",
            ConfirmNewPassword = "NewPassword456!"
        };

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CheckPasswordAsync(testUser, request.CurrentPassword).Returns(true);
        _mockUserManager.ChangePasswordAsync(testUser, request.CurrentPassword, request.NewPassword)
            .ThrowsAsync(new InvalidOperationException("Change password failed"));

        // Act
        var result = await _securityService.ChangePasswordAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);

        await _mockUserManager.Received(1).ChangePasswordAsync(testUser, request.CurrentPassword, request.NewPassword);
    }

    #endregion

    #region Helper Methods

    private static UserManager<User> CreateUserManagerMock() {
        var userStore = Substitute.For<IUserStore<User>>();
        return Substitute.For<UserManager<User>>(
            userStore, null, null, null, null, null, null, null, null);
    }

    private static User CreateTestUser(string email, string name)
        => new() {
            Id = Guid.CreateVersion7(),
            UserName = email,
            Email = email,
            Name = name,
            DisplayName = name,
            EmailConfirmed = true,
            PasswordHash = "default_hashed_password",
            TwoFactorEnabled = false
        };

    #endregion
}
