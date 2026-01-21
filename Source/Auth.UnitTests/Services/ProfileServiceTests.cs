namespace VttTools.Auth.Services;

public class ProfileServiceTests {
    private readonly IUserStorage _mockUserStorage;
    private readonly ILogger<ProfileService> _mockLogger;
    private readonly ProfileService _profileService;

    public ProfileServiceTests() {
        _mockUserStorage = Substitute.For<IUserStorage>();
        _mockLogger = Substitute.For<ILogger<ProfileService>>();
        _profileService = new ProfileService(_mockUserStorage, _mockLogger);
    }

    #region GetProfileAsync Tests

    [Fact]
    public async Task GetProfileAsync_WithValidUserId_ReturnsProfileResponse() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);

        // Act
        var result = await _profileService.GetProfileAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal(testUser.Id, result.Id);
        Assert.Equal("Test User", result.Name);
        Assert.Equal("test@example.com", result.Email);
        Assert.Null(result.Message);

        await _mockUserStorage.Received(1).FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetProfileAsync_WithNonExistentUser_ReturnsNotFoundError() {
        // Arrange
        var userId = Guid.CreateVersion7();
        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((User?)null);

        // Act
        var result = await _profileService.GetProfileAsync(userId, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("User not found", result.Message);
        Assert.Equal(Guid.Empty, result.Id);

        await _mockUserStorage.Received(1).FindByIdAsync(userId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetProfileAsync_WithAvatarId_ReturnsAvatarUrl() {
        // Arrange
        var avatarId = Guid.CreateVersion7();
        var testUser = CreateTestUser("test@example.com", "Test User") with { AvatarId = avatarId };
        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);

        // Act
        var result = await _profileService.GetProfileAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal(avatarId, result.AvatarId);
        Assert.Equal($"/api/resources/{avatarId}", result.AvatarUrl);

        await _mockUserStorage.Received(1).FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetProfileAsync_WithoutAvatarResourceId_ReturnsNullAvatarUrl() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User") with { AvatarId = null };
        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);

        // Act
        var result = await _profileService.GetProfileAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Null(result.AvatarId);
        Assert.Null(result.AvatarUrl);

        await _mockUserStorage.Received(1).FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetProfileAsync_WhenExceptionThrown_ReturnsInternalServerError() {
        // Arrange
        var userId = Guid.CreateVersion7();
        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _profileService.GetProfileAsync(userId, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);

        await _mockUserStorage.Received(1).FindByIdAsync(userId, Arg.Any<CancellationToken>());
    }

    #endregion

    #region UpdateProfileAsync Tests

    [Fact]
    public async Task UpdateProfileAsync_WithValidRequest_UpdatesProfile() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Original Name");
        var request = new UpdateProfileRequest {
            Name = "Updated Name",
            DisplayName = "UpdatedDisplay",
            Email = "updated@example.com",
        };

        var updatedUser = testUser with {
            Name = "Updated Name",
            DisplayName = "UpdatedDisplay",
            Email = "updated@example.com",
        };

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser, updatedUser);
        _mockUserStorage.FindByEmailAsync(request.Email!, Arg.Any<CancellationToken>()).Returns((User?)null);
        _mockUserStorage.UpdateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>()).Returns(Result.Success());

        // Act
        var result = await _profileService.UpdateProfileAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("Updated Name", result.Name);
        Assert.Equal("UpdatedDisplay", result.DisplayName);
        Assert.Equal("updated@example.com", result.Email);

        await _mockUserStorage.Received(2).FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).FindByEmailAsync(request.Email!, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).UpdateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateProfileAsync_WithPartialUpdate_OnlyUpdatesProvidedFields() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Original Name") with {
            DisplayName = "OriginalDisplay",
        };

        var request = new UpdateProfileRequest {
            Name = "Updated Name",
            DisplayName = null,
            Email = null,
        };

        var updatedUser = testUser with {
            Name = "Updated Name",
        };

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser, updatedUser);
        _mockUserStorage.UpdateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>()).Returns(Result.Success());

        // Act
        var result = await _profileService.UpdateProfileAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("Updated Name", result.Name);
        Assert.Equal("OriginalDisplay", result.DisplayName);
        Assert.Equal("test@example.com", result.Email);

        await _mockUserStorage.Received(2).FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>());
        await _mockUserStorage.DidNotReceive().FindByEmailAsync(Arg.Any<string>(), Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).UpdateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateProfileAsync_WithEmailChange_ChecksForDuplicate() {
        // Arrange
        var testUser = CreateTestUser("old@example.com", "Test User");
        var request = new UpdateProfileRequest {
            Email = "new@example.com"
        };

        var updatedUser = testUser with { Email = "new@example.com" };

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser, updatedUser);
        _mockUserStorage.FindByEmailAsync(request.Email!, Arg.Any<CancellationToken>()).Returns((User?)null);
        _mockUserStorage.UpdateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>()).Returns(Result.Success());

        // Act
        var result = await _profileService.UpdateProfileAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("new@example.com", result.Email);

        await _mockUserStorage.Received(1).FindByEmailAsync(request.Email!, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateProfileAsync_WithSameEmail_DoesNotCheckForDuplicate() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new UpdateProfileRequest {
            Name = "Updated Name",
            Email = "test@example.com"
        };

        var updatedUser = testUser with { Name = "Updated Name" };

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser, updatedUser);
        _mockUserStorage.UpdateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>()).Returns(Result.Success());

        // Act
        var result = await _profileService.UpdateProfileAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("Updated Name", result.Name);

        await _mockUserStorage.DidNotReceive().FindByEmailAsync(Arg.Any<string>(), Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).UpdateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateProfileAsync_WithDuplicateEmail_ReturnsError() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var existingUser = CreateTestUser("existing@example.com", "Existing User");
        var request = new UpdateProfileRequest {
            Email = "existing@example.com"
        };

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.FindByEmailAsync(request.Email!, Arg.Any<CancellationToken>()).Returns(existingUser);

        // Act
        var result = await _profileService.UpdateProfileAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Email address is already in use", result.Message);

        await _mockUserStorage.Received(1).FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).FindByEmailAsync(request.Email!, Arg.Any<CancellationToken>());
        await _mockUserStorage.DidNotReceive().UpdateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateProfileAsync_WithNonExistentUser_ReturnsNotFoundError() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var request = new UpdateProfileRequest {
            Name = "New Name"
        };

        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((User?)null);

        // Act
        var result = await _profileService.UpdateProfileAsync(userId, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("User not found", result.Message);

        await _mockUserStorage.Received(1).FindByIdAsync(userId, Arg.Any<CancellationToken>());
        await _mockUserStorage.DidNotReceive().UpdateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateProfileAsync_WithUpdateError_ReturnsErrorMessage() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new UpdateProfileRequest {
            Name = "Invalid Name"
        };

        var failedResult = Result.Failure(new Error("Name contains invalid characters"), new Error("Name is too long"));

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.UpdateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>()).Returns(failedResult);

        // Act
        var result = await _profileService.UpdateProfileAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Contains("Name contains invalid characters", result.Message);
        Assert.Contains("Name is too long", result.Message);

        await _mockUserStorage.Received(1).UpdateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateProfileAsync_WhenExceptionThrown_ReturnsInternalServerError() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var request = new UpdateProfileRequest {
            Name = "Updated Name"
        };

        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _profileService.UpdateProfileAsync(userId, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);
    }

    #endregion

    #region UpdateAvatarAsync Tests

    [Fact]
    public async Task UpdateAvatarAsync_WithValidResourceId_UpdatesAvatar() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var avatarId = Guid.CreateVersion7();

        var updatedUser = testUser with { AvatarId = avatarId };

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser, updatedUser);
        _mockUserStorage.UpdateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>()).Returns(Result.Success());

        // Act
        var result = await _profileService.UpdateAvatarAsync(testUser.Id, avatarId, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal(avatarId, result.AvatarId);
        Assert.Equal($"/api/resources/{avatarId}", result.AvatarUrl);

        await _mockUserStorage.Received(2).FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).UpdateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAvatarAsync_WithNonExistentUser_ReturnsNotFoundError() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var avatarId = Guid.CreateVersion7();

        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((User?)null);

        // Act
        var result = await _profileService.UpdateAvatarAsync(userId, avatarId, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("User not found", result.Message);

        await _mockUserStorage.Received(1).FindByIdAsync(userId, Arg.Any<CancellationToken>());
        await _mockUserStorage.DidNotReceive().UpdateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAvatarAsync_WithUpdateError_ReturnsErrorMessage() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var avatarId = Guid.CreateVersion7();

        var failedResult = Result.Failure(new Error("Avatar resource not found"));

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.UpdateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>()).Returns(failedResult);

        // Act
        var result = await _profileService.UpdateAvatarAsync(testUser.Id, avatarId, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Avatar resource not found", result.Message);

        await _mockUserStorage.Received(1).UpdateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAvatarAsync_WhenExceptionThrown_ReturnsInternalServerError() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var avatarId = Guid.CreateVersion7();

        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _profileService.UpdateAvatarAsync(userId, avatarId, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);
    }

    #endregion

    #region RemoveAvatarAsync Tests

    [Fact]
    public async Task RemoveAvatarAsync_WithValidUserId_RemovesAvatar() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User") with { AvatarId = Guid.CreateVersion7() };

        var updatedUser = testUser with { AvatarId = null };

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser, updatedUser);
        _mockUserStorage.UpdateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>()).Returns(Result.Success());

        // Act
        var result = await _profileService.RemoveAvatarAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Null(result.AvatarId);
        Assert.Null(result.AvatarUrl);

        await _mockUserStorage.Received(2).FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>());
        await _mockUserStorage.Received(1).UpdateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveAvatarAsync_WithNonExistentUser_ReturnsNotFoundError() {
        // Arrange
        var userId = Guid.CreateVersion7();

        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((User?)null);

        // Act
        var result = await _profileService.RemoveAvatarAsync(userId, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("User not found", result.Message);

        await _mockUserStorage.Received(1).FindByIdAsync(userId, Arg.Any<CancellationToken>());
        await _mockUserStorage.DidNotReceive().UpdateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveAvatarAsync_WithUpdateError_ReturnsErrorMessage() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User") with { AvatarId = Guid.CreateVersion7() };

        var failedResult = Result.Failure(new Error("Failed to update user"));

        _mockUserStorage.FindByIdAsync(testUser.Id, Arg.Any<CancellationToken>()).Returns(testUser);
        _mockUserStorage.UpdateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>()).Returns(failedResult);

        // Act
        var result = await _profileService.RemoveAvatarAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Failed to update user", result.Message);

        await _mockUserStorage.Received(1).UpdateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveAvatarAsync_WhenExceptionThrown_ReturnsInternalServerError() {
        // Arrange
        var userId = Guid.CreateVersion7();

        _mockUserStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _profileService.RemoveAvatarAsync(userId, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);
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
            AvatarId = null
        };

    #endregion
}