namespace VttTools.Auth.Services;

public class TwoFactorAuthenticationServiceTests {
    private readonly IUserStorage _mockUserStorage;
    private readonly ILogger<TwoFactorAuthenticationService> _mockLogger;
    private readonly TwoFactorAuthenticationService _twoFactorService;

    public TwoFactorAuthenticationServiceTests() {
        _mockUserStorage = Substitute.For<IUserStorage>();
        _mockLogger = Substitute.For<ILogger<TwoFactorAuthenticationService>>();
        _twoFactorService = new TwoFactorAuthenticationService(_mockUserStorage, _mockLogger);
    }

    #region InitiateSetupAsync Tests

    [Fact]
    public async Task InitiateSetupAsync_WithValidUser_ReturnsSetupResponse() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        const string sharedKey = "JBSWY3DPEHPK3PXP";

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.GetAuthenticatorKeyAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(sharedKey);

        // Act
        var result = await _twoFactorService.InitiateSetupAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Null(result.Message);
        Assert.Equal(sharedKey, result.SharedKey);
        Assert.Equal($"otpauth://totp/VTTTools:{testUser.Email}?secret={sharedKey}&issuer=VTTTools", result.AuthenticatorUri);

        await _mockUserStorage.Received(1).FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).GetAuthenticatorKeyAsync(testUser.Id, Arg.Any<CancellationToken>());
        await _mockUserStorage.DidNotReceive().ResetAuthenticatorKeyAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task InitiateSetupAsync_WithNonExistentUser_ReturnsNotFound() {
        // Arrange
        var userId = Guid.CreateVersion7();
        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((User?)null);

        // Act
        var result = await _twoFactorService.InitiateSetupAsync(userId, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("User not found", result.Message);
        Assert.Equal(string.Empty, result.SharedKey);
        Assert.Equal(string.Empty, result.AuthenticatorUri);

        await _mockUserStorage.Received(1).FindByIdAsync(userId, Arg.Any<CancellationToken>());
        await _mockUserStorage.DidNotReceive().GetAuthenticatorKeyAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
        await _mockUserStorage.DidNotReceive().ResetAuthenticatorKeyAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task InitiateSetupAsync_WithNullKey_ResetsAndReturnsNewKey() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        const string newSharedKey = "NEWKEY123456ABCD";

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.GetAuthenticatorKeyAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns((string?)null);
        _mockUserStorage.ResetAuthenticatorKeyAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(newSharedKey);

        // Act
        var result = await _twoFactorService.InitiateSetupAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Null(result.Message);
        Assert.Equal(newSharedKey, result.SharedKey);
        Assert.Equal($"otpauth://totp/VTTTools:{testUser.Email}?secret={newSharedKey}&issuer=VTTTools", result.AuthenticatorUri);

        await _mockUserStorage.Received(1).FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).GetAuthenticatorKeyAsync(testUser.Id, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).ResetAuthenticatorKeyAsync(testUser.Id, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task InitiateSetupAsync_WithKeyGenerationFails_ReturnsError() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.GetAuthenticatorKeyAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns((string?)null);
        _mockUserStorage.ResetAuthenticatorKeyAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns((string?)null);

        // Act
        var result = await _twoFactorService.InitiateSetupAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Failed to generate authenticator key", result.Message);
        Assert.Equal(string.Empty, result.SharedKey);
        Assert.Equal(string.Empty, result.AuthenticatorUri);

        await _mockUserStorage.Received(1).FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).GetAuthenticatorKeyAsync(testUser.Id, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).ResetAuthenticatorKeyAsync(testUser.Id, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task InitiateSetupAsync_WhenExceptionThrown_ReturnsInternalError() {
        // Arrange
        var userId = Guid.CreateVersion7();
        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _twoFactorService.InitiateSetupAsync(userId, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);
        Assert.Equal(string.Empty, result.SharedKey);
        Assert.Equal(string.Empty, result.AuthenticatorUri);

        await _mockUserStorage.Received(1).FindByIdAsync(userId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task InitiateSetupAsync_WithUserWithoutEmail_UsesUserIdInUri() {
        // Arrange
        var testUser = CreateTestUser(string.Empty, "Test User");
        const string sharedKey = "JBSWY3DPEHPK3PXP";

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.GetAuthenticatorKeyAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(sharedKey);

        // Act
        var result = await _twoFactorService.InitiateSetupAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal($"otpauth://totp/VTTTools:{testUser.Id}?secret={sharedKey}&issuer=VTTTools", result.AuthenticatorUri);
    }

    [Fact]
    public async Task InitiateSetupAsync_WithUserWithWhitespaceEmail_UsesUserIdInUri() {
        // Arrange
        var testUser = CreateTestUser("   ", "Test User");
        const string sharedKey = "JBSWY3DPEHPK3PXP";

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.GetAuthenticatorKeyAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(sharedKey);

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

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.VerifyTwoFactorCodeAsync(testUser.Id, request.Code, Arg.Any<CancellationToken>()).Returns(true);
        _mockUserStorage.SetTwoFactorEnabledAsync(testUser.Id, true, Arg.Any<CancellationToken>()).Returns(Result.Success());
        _mockUserStorage.GenerateRecoveryCodesAsync(testUser.Id, 10, Arg.Any<CancellationToken>()).Returns(recoveryCodes);

        // Act
        var result = await _twoFactorService.VerifySetupAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("Two-factor authentication enabled successfully", result.Message);
        Assert.NotNull(result.RecoveryCodes);
        Assert.Equal(10, result.RecoveryCodes.Length);
        Assert.Equal(recoveryCodes, result.RecoveryCodes);

        await _mockUserStorage.Received(1).FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).VerifyTwoFactorCodeAsync(testUser.Id, request.Code, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).SetTwoFactorEnabledAsync(testUser.Id, true, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).GenerateRecoveryCodesAsync(testUser.Id, 10, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task VerifySetupAsync_WithInvalidCode_ReturnsError() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new VerifySetupRequest { Code = "999999" };

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.VerifyTwoFactorCodeAsync(testUser.Id, request.Code, Arg.Any<CancellationToken>()).Returns(false);

        // Act
        var result = await _twoFactorService.VerifySetupAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Invalid verification code", result.Message);
        Assert.Null(result.RecoveryCodes);

        await _mockUserStorage.Received(1).FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).VerifyTwoFactorCodeAsync(testUser.Id, request.Code, Arg.Any<CancellationToken>());
        await _mockUserStorage.DidNotReceive().SetTwoFactorEnabledAsync(Arg.Any<Guid>(), Arg.Any<bool>(), Arg.Any<CancellationToken>());
        await _mockUserStorage.DidNotReceive().GenerateRecoveryCodesAsync(Arg.Any<Guid>(), Arg.Any<int>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task VerifySetupAsync_WithNonExistentUser_ReturnsNotFound() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var request = new VerifySetupRequest { Code = "123456" };
        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((User?)null);

        // Act
        var result = await _twoFactorService.VerifySetupAsync(userId, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("User not found", result.Message);
        Assert.Null(result.RecoveryCodes);

        await _mockUserStorage.Received(1).FindByIdAsync(userId, Arg.Any<CancellationToken>());
        await _mockUserStorage.DidNotReceive().VerifyTwoFactorCodeAsync(Arg.Any<Guid>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
        await _mockUserStorage.DidNotReceive().SetTwoFactorEnabledAsync(Arg.Any<Guid>(), Arg.Any<bool>(), Arg.Any<CancellationToken>());
        await _mockUserStorage.DidNotReceive().GenerateRecoveryCodesAsync(Arg.Any<Guid>(), Arg.Any<int>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task VerifySetupAsync_WithRecoveryCodesGenerated_Returns10Codes() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new VerifySetupRequest { Code = "123456" };
        var recoveryCodes = Enumerable.Range(1, 10).Select(i => $"CODE-{i:D4}").ToArray();

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.VerifyTwoFactorCodeAsync(testUser.Id, request.Code, Arg.Any<CancellationToken>()).Returns(true);
        _mockUserStorage.SetTwoFactorEnabledAsync(testUser.Id, true, Arg.Any<CancellationToken>()).Returns(Result.Success());
        _mockUserStorage.GenerateRecoveryCodesAsync(testUser.Id, 10, Arg.Any<CancellationToken>()).Returns(recoveryCodes);

        // Act
        var result = await _twoFactorService.VerifySetupAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.RecoveryCodes);
        Assert.Equal(10, result.RecoveryCodes.Length);

        await _mockUserStorage.Received(1).GenerateRecoveryCodesAsync(testUser.Id, 10, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task VerifySetupAsync_WithTwoFactorEnabledAfterVerification_ConfirmsEnabled() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new VerifySetupRequest { Code = "123456" };
        var recoveryCodes = new[] { "CODE1", "CODE2", "CODE3", "CODE4", "CODE5", "CODE6", "CODE7", "CODE8", "CODE9", "CODE10" };

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.VerifyTwoFactorCodeAsync(testUser.Id, request.Code, Arg.Any<CancellationToken>()).Returns(true);
        _mockUserStorage.SetTwoFactorEnabledAsync(testUser.Id, true, Arg.Any<CancellationToken>()).Returns(Result.Success());
        _mockUserStorage.GenerateRecoveryCodesAsync(testUser.Id, 10, Arg.Any<CancellationToken>()).Returns(recoveryCodes);

        // Act
        var result = await _twoFactorService.VerifySetupAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);

        await _mockUserStorage.Received(1).SetTwoFactorEnabledAsync(testUser.Id, true, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task VerifySetupAsync_WhenExceptionThrown_ReturnsInternalError() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var request = new VerifySetupRequest { Code = "123456" };
        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _twoFactorService.VerifySetupAsync(userId, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);
        Assert.Null(result.RecoveryCodes);

        await _mockUserStorage.Received(1).FindByIdAsync(userId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task VerifySetupAsync_WithNullRecoveryCodes_ReturnsNullRecoveryCodes() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new VerifySetupRequest { Code = "123456" };

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.VerifyTwoFactorCodeAsync(testUser.Id, request.Code, Arg.Any<CancellationToken>()).Returns(true);
        _mockUserStorage.SetTwoFactorEnabledAsync(testUser.Id, true, Arg.Any<CancellationToken>()).Returns(Result.Success());
        _mockUserStorage.GenerateRecoveryCodesAsync(testUser.Id, 10, Arg.Any<CancellationToken>()).Returns((string[]?)null);

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
        var testUser = CreateTestUser("test@example.com", "Test User", twoFactorEnabled: true);
        var request = new DisableTwoFactorRequest { Password = "Password123!" };

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.CheckPasswordAsync(testUser.Id, request.Password, Arg.Any<CancellationToken>()).Returns(true);
        _mockUserStorage.SetTwoFactorEnabledAsync(testUser.Id, false, Arg.Any<CancellationToken>()).Returns(Result.Success());

        // Act
        var result = await _twoFactorService.DisableTwoFactorAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("Two-factor authentication disabled successfully", result.Message);

        await _mockUserStorage.Received(1).FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).CheckPasswordAsync(testUser.Id, request.Password, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).SetTwoFactorEnabledAsync(testUser.Id, false, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DisableTwoFactorAsync_WithInvalidPassword_ReturnsError() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User", twoFactorEnabled: true);
        var request = new DisableTwoFactorRequest { Password = "WrongPassword!" };

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.CheckPasswordAsync(testUser.Id, request.Password, Arg.Any<CancellationToken>()).Returns(false);

        // Act
        var result = await _twoFactorService.DisableTwoFactorAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Password is incorrect", result.Message);

        await _mockUserStorage.Received(1).FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).CheckPasswordAsync(testUser.Id, request.Password, Arg.Any<CancellationToken>());
        await _mockUserStorage.DidNotReceive().SetTwoFactorEnabledAsync(Arg.Any<Guid>(), Arg.Any<bool>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DisableTwoFactorAsync_WithNonExistentUser_ReturnsNotFound() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var request = new DisableTwoFactorRequest { Password = "Password123!" };
        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((User?)null);

        // Act
        var result = await _twoFactorService.DisableTwoFactorAsync(userId, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("User not found", result.Message);

        await _mockUserStorage.Received(1).FindByIdAsync(userId, Arg.Any<CancellationToken>());
        await _mockUserStorage.DidNotReceive().CheckPasswordAsync(Arg.Any<Guid>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
        await _mockUserStorage.DidNotReceive().SetTwoFactorEnabledAsync(Arg.Any<Guid>(), Arg.Any<bool>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DisableTwoFactorAsync_WithTwoFactorDisabledAfterSuccess_ConfirmsDisabled() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User", twoFactorEnabled: true);
        var request = new DisableTwoFactorRequest { Password = "Password123!" };

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.CheckPasswordAsync(testUser.Id, request.Password, Arg.Any<CancellationToken>()).Returns(true);
        _mockUserStorage.SetTwoFactorEnabledAsync(testUser.Id, false, Arg.Any<CancellationToken>()).Returns(Result.Success());

        // Act
        var result = await _twoFactorService.DisableTwoFactorAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);

        await _mockUserStorage.Received(1).SetTwoFactorEnabledAsync(testUser.Id, false, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DisableTwoFactorAsync_WithPasswordRequired_SecurityCheck() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User", twoFactorEnabled: true);
        var request = new DisableTwoFactorRequest { Password = "Password123!" };

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.CheckPasswordAsync(testUser.Id, request.Password, Arg.Any<CancellationToken>()).Returns(true);
        _mockUserStorage.SetTwoFactorEnabledAsync(testUser.Id, false, Arg.Any<CancellationToken>()).Returns(Result.Success());

        // Act
        var result = await _twoFactorService.DisableTwoFactorAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);

        await _mockUserStorage.Received(1).CheckPasswordAsync(testUser.Id, request.Password, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DisableTwoFactorAsync_WhenExceptionThrown_ReturnsInternalError() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var request = new DisableTwoFactorRequest { Password = "Password123!" };
        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _twoFactorService.DisableTwoFactorAsync(userId, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);

        await _mockUserStorage.Received(1).FindByIdAsync(userId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DisableTwoFactorAsync_WhenCheckPasswordThrowsException_ReturnsInternalError() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new DisableTwoFactorRequest { Password = "Password123!" };

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.CheckPasswordAsync(testUser.Id, request.Password, Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Password check failed"));

        // Act
        var result = await _twoFactorService.DisableTwoFactorAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);

        await _mockUserStorage.Received(1).CheckPasswordAsync(testUser.Id, request.Password, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DisableTwoFactorAsync_WhenSetTwoFactorEnabledThrowsException_ReturnsInternalError() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new DisableTwoFactorRequest { Password = "Password123!" };

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.CheckPasswordAsync(testUser.Id, request.Password, Arg.Any<CancellationToken>()).Returns(true);
        _mockUserStorage.SetTwoFactorEnabledAsync(testUser.Id, false, Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Disable two-factor failed"));

        // Act
        var result = await _twoFactorService.DisableTwoFactorAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);

        await _mockUserStorage.Received(1).SetTwoFactorEnabledAsync(testUser.Id, false, Arg.Any<CancellationToken>());
    }

    #endregion

    #region Helper Methods

    private static User CreateTestUser(string email, string name, bool twoFactorEnabled = false)
        => new() {
            Id = Guid.CreateVersion7(),
            Email = email,
            Name = name,
            DisplayName = name,
            EmailConfirmed = true,
            TwoFactorEnabled = twoFactorEnabled,
        };

    #endregion
}