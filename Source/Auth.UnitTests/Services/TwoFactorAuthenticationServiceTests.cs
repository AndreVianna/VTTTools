namespace VttTools.Auth.Services;

public class TwoFactorAuthenticationServiceTests {
    private readonly UserManager<UserEntity> _mockUserManager;
    private readonly ILogger<TwoFactorAuthenticationService> _mockLogger;
    private readonly TwoFactorAuthenticationService _twoFactorService;

    public TwoFactorAuthenticationServiceTests() {
        _mockUserManager = CreateUserManagerMock();
        _mockLogger = Substitute.For<ILogger<TwoFactorAuthenticationService>>();
        _twoFactorService = new TwoFactorAuthenticationService(_mockUserManager, _mockLogger);
    }

    #region InitiateSetupAsync Tests

    [Fact]
    public async Task InitiateSetupAsync_WithValidUser_ReturnsSetupResponse() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        const string sharedKey = "JBSWY3DPEHPK3PXP";

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.GetAuthenticatorKeyAsync(testUser).Returns(sharedKey);

        // Act
        var result = await _twoFactorService.InitiateSetupAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Null(result.Message);
        Assert.Equal(sharedKey, result.SharedKey);
        Assert.Equal($"otpauth://totp/VTTTools:{testUser.Email}?secret={sharedKey}&issuer=VTTTools", result.AuthenticatorUri);

        await _mockUserManager.Received(1).FindByIdAsync(testUser.Id.ToString());
        await _mockUserManager.Received(1).GetAuthenticatorKeyAsync(testUser);
        await _mockUserManager.DidNotReceive().ResetAuthenticatorKeyAsync(Arg.Any<UserEntity>());
    }

    [Fact]
    public async Task InitiateSetupAsync_WithNonExistentUser_ReturnsNotFound() {
        // Arrange
        var userId = Guid.CreateVersion7();
        _mockUserManager.FindByIdAsync(userId.ToString()).Returns((UserEntity?)null);

        // Act
        var result = await _twoFactorService.InitiateSetupAsync(userId, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("User not found", result.Message);
        Assert.Equal(string.Empty, result.SharedKey);
        Assert.Equal(string.Empty, result.AuthenticatorUri);

        await _mockUserManager.Received(1).FindByIdAsync(userId.ToString());
        await _mockUserManager.DidNotReceive().GetAuthenticatorKeyAsync(Arg.Any<UserEntity>());
        await _mockUserManager.DidNotReceive().ResetAuthenticatorKeyAsync(Arg.Any<UserEntity>());
    }

    [Fact]
    public async Task InitiateSetupAsync_WithNullKey_ResetsAndReturnsNewKey() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        const string newSharedKey = "NEWKEY123456ABCD";

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.GetAuthenticatorKeyAsync(testUser).Returns(null, newSharedKey);
        _mockUserManager.ResetAuthenticatorKeyAsync(testUser).Returns(IdentityResult.Success);

        // Act
        var result = await _twoFactorService.InitiateSetupAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Null(result.Message);
        Assert.Equal(newSharedKey, result.SharedKey);
        Assert.Equal($"otpauth://totp/VTTTools:{testUser.Email}?secret={newSharedKey}&issuer=VTTTools", result.AuthenticatorUri);

        await _mockUserManager.Received(1).FindByIdAsync(testUser.Id.ToString());
        await _mockUserManager.Received(2).GetAuthenticatorKeyAsync(testUser);
        await _mockUserManager.Received(1).ResetAuthenticatorKeyAsync(testUser);
    }

    [Fact]
    public async Task InitiateSetupAsync_WithKeyGenerationFails_ReturnsError() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.GetAuthenticatorKeyAsync(testUser).Returns(null, (string?)null);
        _mockUserManager.ResetAuthenticatorKeyAsync(testUser).Returns(IdentityResult.Success);

        // Act
        var result = await _twoFactorService.InitiateSetupAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Failed to generate authenticator key", result.Message);
        Assert.Equal(string.Empty, result.SharedKey);
        Assert.Equal(string.Empty, result.AuthenticatorUri);

        await _mockUserManager.Received(1).FindByIdAsync(testUser.Id.ToString());
        await _mockUserManager.Received(2).GetAuthenticatorKeyAsync(testUser);
        await _mockUserManager.Received(1).ResetAuthenticatorKeyAsync(testUser);
    }

    [Fact]
    public async Task InitiateSetupAsync_WhenExceptionThrown_ReturnsInternalError() {
        // Arrange
        var userId = Guid.CreateVersion7();
        _mockUserManager.FindByIdAsync(userId.ToString())
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _twoFactorService.InitiateSetupAsync(userId, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);
        Assert.Equal(string.Empty, result.SharedKey);
        Assert.Equal(string.Empty, result.AuthenticatorUri);

        await _mockUserManager.Received(1).FindByIdAsync(userId.ToString());
    }

    [Fact]
    public async Task InitiateSetupAsync_WithUserWithoutEmail_UsesUserNameInUri() {
        // Arrange
        var testUser = CreateTestUser("testuser", "Test User");
        testUser.Email = string.Empty;
        const string sharedKey = "JBSWY3DPEHPK3PXP";

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.GetAuthenticatorKeyAsync(testUser).Returns(sharedKey);

        // Act
        var result = await _twoFactorService.InitiateSetupAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal($"otpauth://totp/VTTTools:{testUser.UserName}?secret={sharedKey}&issuer=VTTTools", result.AuthenticatorUri);
    }

    [Fact]
    public async Task InitiateSetupAsync_WithUserWithoutEmailOrUserName_UsesUserIdInUri() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        testUser.Email = string.Empty;
        testUser.UserName = null;
        const string sharedKey = "JBSWY3DPEHPK3PXP";

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.GetAuthenticatorKeyAsync(testUser).Returns(sharedKey);

        // Act
        var result = await _twoFactorService.InitiateSetupAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal($"otpauth://totp/VTTTools:{testUser.Id}?secret={sharedKey}&issuer=VTTTools", result.AuthenticatorUri);
    }

    #endregion

    #region VerifySetupAsync Tests

    [Fact]
    public async Task VerifySetupAsync_WithValidCode_EnablesTwoFactorAndReturnsRecoveryCodes() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new VerifySetupRequest { Code = "123456" };
        var recoveryCodes = new[] { "CODE1", "CODE2", "CODE3", "CODE4", "CODE5", "CODE6", "CODE7", "CODE8", "CODE9", "CODE10" };

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.VerifyTwoFactorTokenAsync(testUser, "Authenticator", request.Code).Returns(true);
        _mockUserManager.SetTwoFactorEnabledAsync(testUser, true).Returns(IdentityResult.Success);
        _mockUserManager.GenerateNewTwoFactorRecoveryCodesAsync(testUser, 10).Returns(recoveryCodes);

        // Act
        var result = await _twoFactorService.VerifySetupAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("Two-factor authentication enabled successfully", result.Message);
        Assert.NotNull(result.RecoveryCodes);
        Assert.Equal(10, result.RecoveryCodes.Length);
        Assert.Equal(recoveryCodes, result.RecoveryCodes);

        await _mockUserManager.Received(1).FindByIdAsync(testUser.Id.ToString());
        await _mockUserManager.Received(1).VerifyTwoFactorTokenAsync(testUser, "Authenticator", request.Code);
        await _mockUserManager.Received(1).SetTwoFactorEnabledAsync(testUser, true);
        await _mockUserManager.Received(1).GenerateNewTwoFactorRecoveryCodesAsync(testUser, 10);
    }

    [Fact]
    public async Task VerifySetupAsync_WithInvalidCode_ReturnsError() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new VerifySetupRequest { Code = "999999" };

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.VerifyTwoFactorTokenAsync(testUser, "Authenticator", request.Code).Returns(false);

        // Act
        var result = await _twoFactorService.VerifySetupAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Invalid verification code", result.Message);
        Assert.Null(result.RecoveryCodes);

        await _mockUserManager.Received(1).FindByIdAsync(testUser.Id.ToString());
        await _mockUserManager.Received(1).VerifyTwoFactorTokenAsync(testUser, "Authenticator", request.Code);
        await _mockUserManager.DidNotReceive().SetTwoFactorEnabledAsync(Arg.Any<UserEntity>(), Arg.Any<bool>());
        await _mockUserManager.DidNotReceive().GenerateNewTwoFactorRecoveryCodesAsync(Arg.Any<UserEntity>(), Arg.Any<int>());
    }

    [Fact]
    public async Task VerifySetupAsync_WithNonExistentUser_ReturnsNotFound() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var request = new VerifySetupRequest { Code = "123456" };
        _mockUserManager.FindByIdAsync(userId.ToString()).Returns((UserEntity?)null);

        // Act
        var result = await _twoFactorService.VerifySetupAsync(userId, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("User not found", result.Message);
        Assert.Null(result.RecoveryCodes);

        await _mockUserManager.Received(1).FindByIdAsync(userId.ToString());
        await _mockUserManager.DidNotReceive().VerifyTwoFactorTokenAsync(Arg.Any<UserEntity>(), Arg.Any<string>(), Arg.Any<string>());
        await _mockUserManager.DidNotReceive().SetTwoFactorEnabledAsync(Arg.Any<UserEntity>(), Arg.Any<bool>());
        await _mockUserManager.DidNotReceive().GenerateNewTwoFactorRecoveryCodesAsync(Arg.Any<UserEntity>(), Arg.Any<int>());
    }

    [Fact]
    public async Task VerifySetupAsync_WithRecoveryCodesGenerated_Returns10Codes() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new VerifySetupRequest { Code = "123456" };
        var recoveryCodes = Enumerable.Range(1, 10).Select(i => $"CODE-{i:D4}").ToArray();

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.VerifyTwoFactorTokenAsync(testUser, "Authenticator", request.Code).Returns(true);
        _mockUserManager.SetTwoFactorEnabledAsync(testUser, true).Returns(IdentityResult.Success);
        _mockUserManager.GenerateNewTwoFactorRecoveryCodesAsync(testUser, 10).Returns(recoveryCodes);

        // Act
        var result = await _twoFactorService.VerifySetupAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.RecoveryCodes);
        Assert.Equal(10, result.RecoveryCodes.Length);

        await _mockUserManager.Received(1).GenerateNewTwoFactorRecoveryCodesAsync(testUser, 10);
    }

    [Fact]
    public async Task VerifySetupAsync_WithTwoFactorEnabledAfterVerification_ConfirmsEnabled() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new VerifySetupRequest { Code = "123456" };
        var recoveryCodes = new[] { "CODE1", "CODE2", "CODE3", "CODE4", "CODE5", "CODE6", "CODE7", "CODE8", "CODE9", "CODE10" };

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.VerifyTwoFactorTokenAsync(testUser, "Authenticator", request.Code).Returns(true);
        _mockUserManager.SetTwoFactorEnabledAsync(testUser, true).Returns(IdentityResult.Success);
        _mockUserManager.GenerateNewTwoFactorRecoveryCodesAsync(testUser, 10).Returns(recoveryCodes);

        // Act
        var result = await _twoFactorService.VerifySetupAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);

        await _mockUserManager.Received(1).SetTwoFactorEnabledAsync(testUser, true);
    }

    [Fact]
    public async Task VerifySetupAsync_WhenExceptionThrown_ReturnsInternalError() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var request = new VerifySetupRequest { Code = "123456" };
        _mockUserManager.FindByIdAsync(userId.ToString())
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _twoFactorService.VerifySetupAsync(userId, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);
        Assert.Null(result.RecoveryCodes);

        await _mockUserManager.Received(1).FindByIdAsync(userId.ToString());
    }

    [Fact]
    public async Task VerifySetupAsync_WithNullRecoveryCodes_ReturnsNullRecoveryCodes() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new VerifySetupRequest { Code = "123456" };

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.VerifyTwoFactorTokenAsync(testUser, "Authenticator", request.Code).Returns(true);
        _mockUserManager.SetTwoFactorEnabledAsync(testUser, true).Returns(IdentityResult.Success);
        _mockUserManager.GenerateNewTwoFactorRecoveryCodesAsync(testUser, 10).Returns((IEnumerable<string>?)null);

        // Act
        var result = await _twoFactorService.VerifySetupAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Null(result.RecoveryCodes);
    }

    #endregion

    #region DisableTwoFactorAsync Tests

    [Fact]
    public async Task DisableTwoFactorAsync_WithValidPassword_DisablesTwoFactor() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        testUser.TwoFactorEnabled = true;
        var request = new DisableTwoFactorRequest { Password = "Password123!" };

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CheckPasswordAsync(testUser, request.Password).Returns(true);
        _mockUserManager.SetTwoFactorEnabledAsync(testUser, false).Returns(IdentityResult.Success);

        // Act
        var result = await _twoFactorService.DisableTwoFactorAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("Two-factor authentication disabled successfully", result.Message);

        await _mockUserManager.Received(1).FindByIdAsync(testUser.Id.ToString());
        await _mockUserManager.Received(1).CheckPasswordAsync(testUser, request.Password);
        await _mockUserManager.Received(1).SetTwoFactorEnabledAsync(testUser, false);
    }

    [Fact]
    public async Task DisableTwoFactorAsync_WithInvalidPassword_ReturnsError() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        testUser.TwoFactorEnabled = true;
        var request = new DisableTwoFactorRequest { Password = "WrongPassword!" };

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CheckPasswordAsync(testUser, request.Password).Returns(false);

        // Act
        var result = await _twoFactorService.DisableTwoFactorAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Password is incorrect", result.Message);

        await _mockUserManager.Received(1).FindByIdAsync(testUser.Id.ToString());
        await _mockUserManager.Received(1).CheckPasswordAsync(testUser, request.Password);
        await _mockUserManager.DidNotReceive().SetTwoFactorEnabledAsync(Arg.Any<UserEntity>(), Arg.Any<bool>());
    }

    [Fact]
    public async Task DisableTwoFactorAsync_WithNonExistentUser_ReturnsNotFound() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var request = new DisableTwoFactorRequest { Password = "Password123!" };
        _mockUserManager.FindByIdAsync(userId.ToString()).Returns((UserEntity?)null);

        // Act
        var result = await _twoFactorService.DisableTwoFactorAsync(userId, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("User not found", result.Message);

        await _mockUserManager.Received(1).FindByIdAsync(userId.ToString());
        await _mockUserManager.DidNotReceive().CheckPasswordAsync(Arg.Any<UserEntity>(), Arg.Any<string>());
        await _mockUserManager.DidNotReceive().SetTwoFactorEnabledAsync(Arg.Any<UserEntity>(), Arg.Any<bool>());
    }

    [Fact]
    public async Task DisableTwoFactorAsync_WithTwoFactorDisabledAfterSuccess_ConfirmsDisabled() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        testUser.TwoFactorEnabled = true;
        var request = new DisableTwoFactorRequest { Password = "Password123!" };

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CheckPasswordAsync(testUser, request.Password).Returns(true);
        _mockUserManager.SetTwoFactorEnabledAsync(testUser, false).Returns(IdentityResult.Success);

        // Act
        var result = await _twoFactorService.DisableTwoFactorAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);

        await _mockUserManager.Received(1).SetTwoFactorEnabledAsync(testUser, false);
    }

    [Fact]
    public async Task DisableTwoFactorAsync_WithPasswordRequired_SecurityCheck() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        testUser.TwoFactorEnabled = true;
        var request = new DisableTwoFactorRequest { Password = "Password123!" };

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CheckPasswordAsync(testUser, request.Password).Returns(true);
        _mockUserManager.SetTwoFactorEnabledAsync(testUser, false).Returns(IdentityResult.Success);

        // Act
        var result = await _twoFactorService.DisableTwoFactorAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);

        await _mockUserManager.Received(1).CheckPasswordAsync(testUser, request.Password);
    }

    [Fact]
    public async Task DisableTwoFactorAsync_WhenExceptionThrown_ReturnsInternalError() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var request = new DisableTwoFactorRequest { Password = "Password123!" };
        _mockUserManager.FindByIdAsync(userId.ToString())
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _twoFactorService.DisableTwoFactorAsync(userId, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);

        await _mockUserManager.Received(1).FindByIdAsync(userId.ToString());
    }

    [Fact]
    public async Task DisableTwoFactorAsync_WhenCheckPasswordThrowsException_ReturnsInternalError() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new DisableTwoFactorRequest { Password = "Password123!" };

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CheckPasswordAsync(testUser, request.Password)
            .ThrowsAsync(new InvalidOperationException("Password check failed"));

        // Act
        var result = await _twoFactorService.DisableTwoFactorAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);

        await _mockUserManager.Received(1).CheckPasswordAsync(testUser, request.Password);
    }

    [Fact]
    public async Task DisableTwoFactorAsync_WhenSetTwoFactorEnabledThrowsException_ReturnsInternalError() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new DisableTwoFactorRequest { Password = "Password123!" };

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CheckPasswordAsync(testUser, request.Password).Returns(true);
        _mockUserManager.SetTwoFactorEnabledAsync(testUser, false)
            .ThrowsAsync(new InvalidOperationException("Disable two-factor failed"));

        // Act
        var result = await _twoFactorService.DisableTwoFactorAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);

        await _mockUserManager.Received(1).SetTwoFactorEnabledAsync(testUser, false);
    }

    #endregion

    #region Helper Methods

    private static UserManager<UserEntity> CreateUserManagerMock() {
        var userStore = Substitute.For<IUserStore<UserEntity>>();
        return Substitute.For<UserManager<UserEntity>>(
            userStore, null, null, null, null, null, null, null, null);
    }

    private static UserEntity CreateTestUser(string email, string name)
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