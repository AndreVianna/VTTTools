namespace VttTools.Auth.Services;

public class SecurityServiceTests {
    private readonly IUserStorage _mockUserStorage;
    private readonly ILogger<SecurityService> _mockLogger;
    private readonly SecurityService _securityService;

    public SecurityServiceTests() {
        _mockUserStorage = Substitute.For<IUserStorage>();
        _mockLogger = Substitute.For<ILogger<SecurityService>>();
        _securityService = new SecurityService(_mockUserStorage, _mockLogger);
    }

    #region GetSecuritySettingsAsync Tests

    [Fact]
    public async Task GetSecuritySettingsAsync_WithValidUserId_ReturnsSettings() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User") with {
            HasPassword = true,
            TwoFactorEnabled = false,
        };

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.CountRecoveryCodesAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(5);

        // Act
        var result = await _securityService.GetSecuritySettingsAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Null(result.Message);
        Assert.True(result.HasPassword);
        Assert.False(result.TwoFactorEnabled);
        Assert.Equal(5, result.RecoveryCodesRemaining);

        await _mockUserStorage.Received(1).FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).CountRecoveryCodesAsync(testUser.Id, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetSecuritySettingsAsync_WithNonExistentUser_ReturnsNotFound() {
        // Arrange
        var userId = Guid.CreateVersion7();
        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((User?)null);

        // Act
        var result = await _securityService.GetSecuritySettingsAsync(userId, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("User not found", result.Message);
        Assert.False(result.HasPassword);
        Assert.False(result.TwoFactorEnabled);
        Assert.Equal(0, result.RecoveryCodesRemaining);

        await _mockUserStorage.Received(1).FindByIdAsync(userId, Arg.Any<CancellationToken>());
        await _mockUserStorage.DidNotReceive().CountRecoveryCodesAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetSecuritySettingsAsync_WithUserWithoutPassword_ReturnsFalseHasPassword() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User") with {
            HasPassword = false,
            TwoFactorEnabled = false,
        };

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.CountRecoveryCodesAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(0);

        // Act
        var result = await _securityService.GetSecuritySettingsAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Null(result.Message);
        Assert.False(result.HasPassword);
        Assert.False(result.TwoFactorEnabled);
        Assert.Equal(0, result.RecoveryCodesRemaining);

        await _mockUserStorage.Received(1).FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).CountRecoveryCodesAsync(testUser.Id, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetSecuritySettingsAsync_WithTwoFactorEnabled_ReturnsTrueTwoFactorEnabled() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User") with {
            HasPassword = true,
            TwoFactorEnabled = true,
        };

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.CountRecoveryCodesAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(10);

        // Act
        var result = await _securityService.GetSecuritySettingsAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Null(result.Message);
        Assert.True(result.HasPassword);
        Assert.True(result.TwoFactorEnabled);
        Assert.Equal(10, result.RecoveryCodesRemaining);

        await _mockUserStorage.Received(1).FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).CountRecoveryCodesAsync(testUser.Id, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetSecuritySettingsAsync_WithRecoveryCodes_ReturnsCorrectCount() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User") with {
            HasPassword = true,
            TwoFactorEnabled = true,
        };

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.CountRecoveryCodesAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(3);

        // Act
        var result = await _securityService.GetSecuritySettingsAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal(3, result.RecoveryCodesRemaining);

        await _mockUserStorage.Received(1).CountRecoveryCodesAsync(testUser.Id, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetSecuritySettingsAsync_WhenExceptionThrown_ReturnsInternalError() {
        // Arrange
        var userId = Guid.CreateVersion7();
        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _securityService.GetSecuritySettingsAsync(userId, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);
        Assert.False(result.HasPassword);
        Assert.False(result.TwoFactorEnabled);
        Assert.Equal(0, result.RecoveryCodesRemaining);

        await _mockUserStorage.Received(1).FindByIdAsync(userId, Arg.Any<CancellationToken>());
    }

    #endregion

    #region Helper Methods

    private static User CreateTestUser(string email, string name)
        => new() {
            Id = Guid.CreateVersion7(),
            Email = email,
            Name = name,
            EmailConfirmed = true,
            HasPassword = true,
            TwoFactorEnabled = false,
        };

    #endregion
}
