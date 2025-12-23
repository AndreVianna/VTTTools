namespace VttTools.Auth.Services;

public class RecoveryCodeServiceTests {
    private readonly UserManager<User> _mockUserManager;
    private readonly ILogger<RecoveryCodeService> _mockLogger;
    private readonly RecoveryCodeService _recoveryCodeService;

    public RecoveryCodeServiceTests() {
        _mockUserManager = CreateUserManagerMock();
        _mockLogger = Substitute.For<ILogger<RecoveryCodeService>>();
        _recoveryCodeService = new RecoveryCodeService(_mockUserManager, _mockLogger);
    }

    #region GenerateNewCodesAsync Tests

    [Fact]
    public async Task GenerateNewCodesAsync_WithValidPassword_ReturnsSuccess() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new GenerateRecoveryCodesRequest { Password = "Password123!" };
        var recoveryCodes = new[] { "CODE1", "CODE2", "CODE3", "CODE4", "CODE5", "CODE6", "CODE7", "CODE8", "CODE9", "CODE10" };

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CheckPasswordAsync(testUser, request.Password).Returns(true);
        _mockUserManager.GenerateNewTwoFactorRecoveryCodesAsync(testUser, 10).Returns(recoveryCodes);

        // Act
        var result = await _recoveryCodeService.GenerateNewCodesAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("Recovery codes generated successfully", result.Message);
        Assert.NotNull(result.RecoveryCodes);
        Assert.Equal(10, result.RecoveryCodes.Length);
        Assert.Equal(recoveryCodes, result.RecoveryCodes);

        await _mockUserManager.Received(1).FindByIdAsync(testUser.Id.ToString());
        await _mockUserManager.Received(1).CheckPasswordAsync(testUser, request.Password);
        await _mockUserManager.Received(1).GenerateNewTwoFactorRecoveryCodesAsync(testUser, 10);
    }

    [Fact]
    public async Task GenerateNewCodesAsync_WithInvalidPassword_ReturnsUnauthorized() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new GenerateRecoveryCodesRequest { Password = "WrongPassword!" };

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CheckPasswordAsync(testUser, request.Password).Returns(false);

        // Act
        var result = await _recoveryCodeService.GenerateNewCodesAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Password is incorrect", result.Message);
        Assert.Null(result.RecoveryCodes);

        await _mockUserManager.Received(1).FindByIdAsync(testUser.Id.ToString());
        await _mockUserManager.Received(1).CheckPasswordAsync(testUser, request.Password);
        await _mockUserManager.DidNotReceive().GenerateNewTwoFactorRecoveryCodesAsync(Arg.Any<User>(), Arg.Any<int>());
    }

    [Fact]
    public async Task GenerateNewCodesAsync_WithNonExistentUser_ReturnsNotFound() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var request = new GenerateRecoveryCodesRequest { Password = "Password123!" };
        _mockUserManager.FindByIdAsync(userId.ToString()).Returns((User?)null);

        // Act
        var result = await _recoveryCodeService.GenerateNewCodesAsync(userId, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("User not found", result.Message);
        Assert.Null(result.RecoveryCodes);

        await _mockUserManager.Received(1).FindByIdAsync(userId.ToString());
        await _mockUserManager.DidNotReceive().CheckPasswordAsync(Arg.Any<User>(), Arg.Any<string>());
        await _mockUserManager.DidNotReceive().GenerateNewTwoFactorRecoveryCodesAsync(Arg.Any<User>(), Arg.Any<int>());
    }

    [Fact]
    public async Task GenerateNewCodesAsync_WithNullRecoveryCodes_ReturnsSuccessWithNull() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new GenerateRecoveryCodesRequest { Password = "Password123!" };

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CheckPasswordAsync(testUser, request.Password).Returns(true);
        _mockUserManager.GenerateNewTwoFactorRecoveryCodesAsync(testUser, 10).Returns((IEnumerable<string>?)null);

        // Act
        var result = await _recoveryCodeService.GenerateNewCodesAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("Recovery codes generated successfully", result.Message);
        Assert.Null(result.RecoveryCodes);

        await _mockUserManager.Received(1).FindByIdAsync(testUser.Id.ToString());
        await _mockUserManager.Received(1).CheckPasswordAsync(testUser, request.Password);
        await _mockUserManager.Received(1).GenerateNewTwoFactorRecoveryCodesAsync(testUser, 10);
    }

    [Fact]
    public async Task GenerateNewCodesAsync_WhenExceptionOccurs_ReturnsError() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var request = new GenerateRecoveryCodesRequest { Password = "Password123!" };
        _mockUserManager.FindByIdAsync(userId.ToString())
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _recoveryCodeService.GenerateNewCodesAsync(userId, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);
        Assert.Null(result.RecoveryCodes);

        await _mockUserManager.Received(1).FindByIdAsync(userId.ToString());

        _mockLogger.Received(1).Log(
            LogLevel.Error,
            Arg.Any<EventId>(),
            Arg.Is<object>(o => o.ToString()!.Contains("Error generating recovery codes for user ID")),
            Arg.Is<Exception>(ex => ex.Message == "Database error"),
            Arg.Any<Func<object, Exception?, string>>());
    }

    [Fact]
    public async Task GenerateNewCodesAsync_LogsWarningForNonExistentUser() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var request = new GenerateRecoveryCodesRequest { Password = "Password123!" };
        _mockUserManager.FindByIdAsync(userId.ToString()).Returns((User?)null);

        // Act
        var result = await _recoveryCodeService.GenerateNewCodesAsync(userId, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("User not found", result.Message);

        _mockLogger.Received(1).Log(
            LogLevel.Warning,
            Arg.Any<EventId>(),
            Arg.Is<object>(o => o.ToString()!.Contains("Recovery code generation attempted for non-existent user ID")),
            Arg.Any<Exception>(),
            Arg.Any<Func<object, Exception?, string>>());
    }

    [Fact]
    public async Task GenerateNewCodesAsync_LogsWarningForIncorrectPassword() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new GenerateRecoveryCodesRequest { Password = "WrongPassword!" };

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CheckPasswordAsync(testUser, request.Password).Returns(false);

        // Act
        var result = await _recoveryCodeService.GenerateNewCodesAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Password is incorrect", result.Message);

        _mockLogger.Received(1).Log(
            LogLevel.Warning,
            Arg.Any<EventId>(),
            Arg.Is<object>(o => o.ToString()!.Contains("Recovery code generation failed - incorrect password for user")),
            Arg.Any<Exception>(),
            Arg.Any<Func<object, Exception?, string>>());
    }

    [Fact]
    public async Task GenerateNewCodesAsync_LogsInformationOnSuccess() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new GenerateRecoveryCodesRequest { Password = "Password123!" };
        var recoveryCodes = new[] { "CODE1", "CODE2", "CODE3", "CODE4", "CODE5", "CODE6", "CODE7", "CODE8", "CODE9", "CODE10" };

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CheckPasswordAsync(testUser, request.Password).Returns(true);
        _mockUserManager.GenerateNewTwoFactorRecoveryCodesAsync(testUser, 10).Returns(recoveryCodes);

        // Act
        var result = await _recoveryCodeService.GenerateNewCodesAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);

        _mockLogger.Received(1).Log(
            LogLevel.Information,
            Arg.Any<EventId>(),
            Arg.Is<object>(o => o.ToString()!.Contains("Recovery codes generated successfully for user")),
            Arg.Any<Exception>(),
            Arg.Any<Func<object, Exception?, string>>());
    }

    [Fact]
    public async Task GenerateNewCodesAsync_WhenCheckPasswordThrowsException_ReturnsInternalError() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new GenerateRecoveryCodesRequest { Password = "Password123!" };

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CheckPasswordAsync(testUser, request.Password)
            .ThrowsAsync(new InvalidOperationException("Password check failed"));

        // Act
        var result = await _recoveryCodeService.GenerateNewCodesAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);
        Assert.Null(result.RecoveryCodes);

        await _mockUserManager.Received(1).CheckPasswordAsync(testUser, request.Password);

        _mockLogger.Received(1).Log(
            LogLevel.Error,
            Arg.Any<EventId>(),
            Arg.Is<object>(o => o.ToString()!.Contains("Error generating recovery codes for user ID")),
            Arg.Is<Exception>(ex => ex.Message == "Password check failed"),
            Arg.Any<Func<object, Exception?, string>>());
    }

    [Fact]
    public async Task GenerateNewCodesAsync_WhenGenerateCodesThrowsException_ReturnsInternalError() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new GenerateRecoveryCodesRequest { Password = "Password123!" };

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CheckPasswordAsync(testUser, request.Password).Returns(true);
        _mockUserManager.GenerateNewTwoFactorRecoveryCodesAsync(testUser, 10)
            .ThrowsAsync(new InvalidOperationException("Code generation failed"));

        // Act
        var result = await _recoveryCodeService.GenerateNewCodesAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);
        Assert.Null(result.RecoveryCodes);

        await _mockUserManager.Received(1).GenerateNewTwoFactorRecoveryCodesAsync(testUser, 10);

        _mockLogger.Received(1).Log(
            LogLevel.Error,
            Arg.Any<EventId>(),
            Arg.Is<object>(o => o.ToString()!.Contains("Error generating recovery codes for user ID")),
            Arg.Is<Exception>(ex => ex.Message == "Code generation failed"),
            Arg.Any<Func<object, Exception?, string>>());
    }

    #endregion

    #region GetStatusAsync Tests

    [Fact]
    public async Task GetStatusAsync_WithValidUser_ReturnsCount() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CountRecoveryCodesAsync(testUser).Returns(5);

        // Act
        var result = await _recoveryCodeService.GetStatusAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Null(result.Message);
        Assert.Equal(5, result.RemainingCount);

        await _mockUserManager.Received(1).FindByIdAsync(testUser.Id.ToString());
        await _mockUserManager.Received(1).CountRecoveryCodesAsync(testUser);
    }

    [Fact]
    public async Task GetStatusAsync_WithNonExistentUser_ReturnsNotFound() {
        // Arrange
        var userId = Guid.CreateVersion7();
        _mockUserManager.FindByIdAsync(userId.ToString()).Returns((User?)null);

        // Act
        var result = await _recoveryCodeService.GetStatusAsync(userId, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("User not found", result.Message);
        Assert.Equal(0, result.RemainingCount);

        await _mockUserManager.Received(1).FindByIdAsync(userId.ToString());
        await _mockUserManager.DidNotReceive().CountRecoveryCodesAsync(Arg.Any<User>());
    }

    [Fact]
    public async Task GetStatusAsync_WhenExceptionOccurs_ReturnsError() {
        // Arrange
        var userId = Guid.CreateVersion7();
        _mockUserManager.FindByIdAsync(userId.ToString())
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _recoveryCodeService.GetStatusAsync(userId, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);
        Assert.Equal(0, result.RemainingCount);

        await _mockUserManager.Received(1).FindByIdAsync(userId.ToString());

        _mockLogger.Received(1).Log(
            LogLevel.Error,
            Arg.Any<EventId>(),
            Arg.Is<object>(o => o.ToString()!.Contains("Error retrieving recovery code status for user ID")),
            Arg.Is<Exception>(ex => ex.Message == "Database error"),
            Arg.Any<Func<object, Exception?, string>>());
    }

    [Fact]
    public async Task GetStatusAsync_LogsInformationWithCount() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CountRecoveryCodesAsync(testUser).Returns(7);

        // Act
        var result = await _recoveryCodeService.GetStatusAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal(7, result.RemainingCount);

        _mockLogger.Received(1).Log(
            LogLevel.Information,
            Arg.Any<EventId>(),
            Arg.Is<object>(o => o.ToString()!.Contains("Recovery code status retrieved for user") && o.ToString()!.Contains("remaining count: 7")),
            Arg.Any<Exception>(),
            Arg.Any<Func<object, Exception?, string>>());
    }

    [Fact]
    public async Task GetStatusAsync_WithZeroRecoveryCodes_ReturnsZero() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CountRecoveryCodesAsync(testUser).Returns(0);

        // Act
        var result = await _recoveryCodeService.GetStatusAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Null(result.Message);
        Assert.Equal(0, result.RemainingCount);

        await _mockUserManager.Received(1).CountRecoveryCodesAsync(testUser);
    }

    [Fact]
    public async Task GetStatusAsync_LogsWarningForNonExistentUser() {
        // Arrange
        var userId = Guid.CreateVersion7();
        _mockUserManager.FindByIdAsync(userId.ToString()).Returns((User?)null);

        // Act
        var result = await _recoveryCodeService.GetStatusAsync(userId, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("User not found", result.Message);

        _mockLogger.Received(1).Log(
            LogLevel.Warning,
            Arg.Any<EventId>(),
            Arg.Is<object>(o => o.ToString()!.Contains("Recovery code status check attempted for non-existent user ID")),
            Arg.Any<Exception>(),
            Arg.Any<Func<object, Exception?, string>>());
    }

    [Fact]
    public async Task GetStatusAsync_WhenCountRecoveryCodesThrowsException_ReturnsInternalError() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.CountRecoveryCodesAsync(testUser)
            .ThrowsAsync(new InvalidOperationException("Count recovery codes failed"));

        // Act
        var result = await _recoveryCodeService.GetStatusAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);
        Assert.Equal(0, result.RemainingCount);

        await _mockUserManager.Received(1).CountRecoveryCodesAsync(testUser);

        _mockLogger.Received(1).Log(
            LogLevel.Error,
            Arg.Any<EventId>(),
            Arg.Is<object>(o => o.ToString()!.Contains("Error retrieving recovery code status for user ID")),
            Arg.Is<Exception>(ex => ex.Message == "Count recovery codes failed"),
            Arg.Any<Func<object, Exception?, string>>());
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