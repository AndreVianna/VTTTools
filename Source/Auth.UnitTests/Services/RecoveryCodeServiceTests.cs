namespace VttTools.Auth.Services;

public class RecoveryCodeServiceTests {
    private readonly IUserStorage _mockUserStorage;
    private readonly ILogger<RecoveryCodeService> _mockLogger;
    private readonly RecoveryCodeService _recoveryCodeService;

    public RecoveryCodeServiceTests() {
        _mockUserStorage = Substitute.For<IUserStorage>();
        _mockLogger = Substitute.For<ILogger<RecoveryCodeService>>();
        _recoveryCodeService = new RecoveryCodeService(_mockUserStorage, _mockLogger);
    }

    #region GenerateNewCodesAsync Tests

    [Fact]
    public async Task GenerateNewCodesAsync_WithValidPassword_ReturnsSuccess() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new GenerateRecoveryCodesRequest { Password = "Password123!" };
        var recoveryCodes = new[] { "CODE1", "CODE2", "CODE3", "CODE4", "CODE5", "CODE6", "CODE7", "CODE8", "CODE9", "CODE10" };

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.CheckPasswordAsync(testUser.Id, request.Password, Arg.Any<CancellationToken>()).Returns(true);
        _mockUserStorage.GenerateRecoveryCodesAsync(testUser.Id, 10, Arg.Any<CancellationToken>()).Returns(recoveryCodes);

        // Act
        var result = await _recoveryCodeService.GenerateNewCodesAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("Recovery codes generated successfully", result.Message);
        Assert.NotNull(result.RecoveryCodes);
        Assert.Equal(10, result.RecoveryCodes.Length);
        Assert.Equal(recoveryCodes, result.RecoveryCodes);

        await _mockUserStorage.Received(1).FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).CheckPasswordAsync(testUser.Id, request.Password, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).GenerateRecoveryCodesAsync(testUser.Id, 10, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GenerateNewCodesAsync_WithInvalidPassword_ReturnsUnauthorized() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new GenerateRecoveryCodesRequest { Password = "WrongPassword!" };

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.CheckPasswordAsync(testUser.Id, request.Password, Arg.Any<CancellationToken>()).Returns(false);

        // Act
        var result = await _recoveryCodeService.GenerateNewCodesAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Password is incorrect", result.Message);
        Assert.Null(result.RecoveryCodes);

        await _mockUserStorage.Received(1).FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).CheckPasswordAsync(testUser.Id, request.Password, Arg.Any<CancellationToken>());
        await _mockUserStorage.DidNotReceive().GenerateRecoveryCodesAsync(Arg.Any<Guid>(), Arg.Any<int>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GenerateNewCodesAsync_WithNonExistentUser_ReturnsNotFound() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var request = new GenerateRecoveryCodesRequest { Password = "Password123!" };
        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((User?)null);

        // Act
        var result = await _recoveryCodeService.GenerateNewCodesAsync(userId, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("User not found", result.Message);
        Assert.Null(result.RecoveryCodes);

        await _mockUserStorage.Received(1).FindByIdAsync(userId, Arg.Any<CancellationToken>());
        await _mockUserStorage.DidNotReceive().CheckPasswordAsync(Arg.Any<Guid>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
        await _mockUserStorage.DidNotReceive().GenerateRecoveryCodesAsync(Arg.Any<Guid>(), Arg.Any<int>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GenerateNewCodesAsync_WithNullRecoveryCodes_ReturnsSuccessWithNull() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new GenerateRecoveryCodesRequest { Password = "Password123!" };

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.CheckPasswordAsync(testUser.Id, request.Password, Arg.Any<CancellationToken>()).Returns(true);
        _mockUserStorage.GenerateRecoveryCodesAsync(testUser.Id, 10, Arg.Any<CancellationToken>()).Returns((string[]?)null);

        // Act
        var result = await _recoveryCodeService.GenerateNewCodesAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("Recovery codes generated successfully", result.Message);
        Assert.Null(result.RecoveryCodes);

        await _mockUserStorage.Received(1).FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).CheckPasswordAsync(testUser.Id, request.Password, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).GenerateRecoveryCodesAsync(testUser.Id, 10, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GenerateNewCodesAsync_WhenExceptionOccurs_ReturnsError() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var request = new GenerateRecoveryCodesRequest { Password = "Password123!" };
        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _recoveryCodeService.GenerateNewCodesAsync(userId, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);
        Assert.Null(result.RecoveryCodes);

        await _mockUserStorage.Received(1).FindByIdAsync(userId, Arg.Any<CancellationToken>());

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
        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((User?)null);

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

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.CheckPasswordAsync(testUser.Id, request.Password, Arg.Any<CancellationToken>()).Returns(false);

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

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.CheckPasswordAsync(testUser.Id, request.Password, Arg.Any<CancellationToken>()).Returns(true);
        _mockUserStorage.GenerateRecoveryCodesAsync(testUser.Id, 10, Arg.Any<CancellationToken>()).Returns(recoveryCodes);

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

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.CheckPasswordAsync(testUser.Id, request.Password, Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Password check failed"));

        // Act
        var result = await _recoveryCodeService.GenerateNewCodesAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);
        Assert.Null(result.RecoveryCodes);

        await _mockUserStorage.Received(1).CheckPasswordAsync(testUser.Id, request.Password, Arg.Any<CancellationToken>());

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

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.CheckPasswordAsync(testUser.Id, request.Password, Arg.Any<CancellationToken>()).Returns(true);
        _mockUserStorage.GenerateRecoveryCodesAsync(testUser.Id, 10, Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Code generation failed"));

        // Act
        var result = await _recoveryCodeService.GenerateNewCodesAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);
        Assert.Null(result.RecoveryCodes);

        await _mockUserStorage.Received(1).GenerateRecoveryCodesAsync(testUser.Id, 10, Arg.Any<CancellationToken>());

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
        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.CountRecoveryCodesAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(5);

        // Act
        var result = await _recoveryCodeService.GetStatusAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Null(result.Message);
        Assert.Equal(5, result.RemainingCount);

        await _mockUserStorage.Received(1).FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).CountRecoveryCodesAsync(testUser.Id, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetStatusAsync_WithNonExistentUser_ReturnsNotFound() {
        // Arrange
        var userId = Guid.CreateVersion7();
        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((User?)null);

        // Act
        var result = await _recoveryCodeService.GetStatusAsync(userId, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("User not found", result.Message);
        Assert.Equal(0, result.RemainingCount);

        await _mockUserStorage.Received(1).FindByIdAsync(userId, Arg.Any<CancellationToken>());
        await _mockUserStorage.DidNotReceive().CountRecoveryCodesAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetStatusAsync_WhenExceptionOccurs_ReturnsError() {
        // Arrange
        var userId = Guid.CreateVersion7();
        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _recoveryCodeService.GetStatusAsync(userId, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);
        Assert.Equal(0, result.RemainingCount);

        await _mockUserStorage.Received(1).FindByIdAsync(userId, Arg.Any<CancellationToken>());

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
        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.CountRecoveryCodesAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(7);

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
        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.CountRecoveryCodesAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(0);

        // Act
        var result = await _recoveryCodeService.GetStatusAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Null(result.Message);
        Assert.Equal(0, result.RemainingCount);

        await _mockUserStorage.Received(1).CountRecoveryCodesAsync(testUser.Id, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetStatusAsync_LogsWarningForNonExistentUser() {
        // Arrange
        var userId = Guid.CreateVersion7();
        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((User?)null);

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

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.CountRecoveryCodesAsync(testUser.Id, Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Count recovery codes failed"));

        // Act
        var result = await _recoveryCodeService.GetStatusAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);
        Assert.Equal(0, result.RemainingCount);

        await _mockUserStorage.Received(1).CountRecoveryCodesAsync(testUser.Id, Arg.Any<CancellationToken>());

        _mockLogger.Received(1).Log(
            LogLevel.Error,
            Arg.Any<EventId>(),
            Arg.Is<object>(o => o.ToString()!.Contains("Error retrieving recovery code status for user ID")),
            Arg.Is<Exception>(ex => ex.Message == "Count recovery codes failed"),
            Arg.Any<Func<object, Exception?, string>>());
    }

    #endregion

    #region Helper Methods

    private static User CreateTestUser(string email, string name)
        => new() {
            Id = Guid.CreateVersion7(),
            Email = email,
            Name = name,
            DisplayName = name,
            EmailConfirmed = true,
            TwoFactorEnabled = false
        };

    #endregion
}
