namespace VttTools.Auth.Services;

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