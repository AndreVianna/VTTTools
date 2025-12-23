namespace VttTools.Auth.Services;

public class ProfileServiceTests {
    private readonly UserManager<User> _mockUserManager;
    private readonly ILogger<ProfileService> _mockLogger;
    private readonly ProfileService _profileService;

    public ProfileServiceTests() {
        _mockUserManager = CreateUserManagerMock();
        _mockLogger = Substitute.For<ILogger<ProfileService>>();
        _profileService = new ProfileService(_mockUserManager, _mockLogger);
    }

    #region GetProfileAsync Tests

    [Fact]
    public async Task GetProfileAsync_WithValidUserId_ReturnsProfileResponse() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);

        // Act
        var result = await _profileService.GetProfileAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal(testUser.Id, result.Id);
        Assert.Equal("Test User", result.Name);
        Assert.Equal("test@example.com", result.Email);
        Assert.Null(result.Message);

        await _mockUserManager.Received(1).FindByIdAsync(testUser.Id.ToString());
    }

    [Fact]
    public async Task GetProfileAsync_WithNonExistentUser_ReturnsNotFoundError() {
        // Arrange
        var userId = Guid.CreateVersion7();
        _mockUserManager.FindByIdAsync(userId.ToString()).Returns((User?)null);

        // Act
        var result = await _profileService.GetProfileAsync(userId, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("User not found", result.Message);
        Assert.Equal(Guid.Empty, result.Id);

        await _mockUserManager.Received(1).FindByIdAsync(userId.ToString());
    }

    [Fact]
    public async Task GetProfileAsync_WithAvatarId_ReturnsAvatarUrl() {
        // Arrange
        var avatarId = Guid.CreateVersion7();
        var testUser = CreateTestUser("test@example.com", "Test User");
        testUser.AvatarId = avatarId;
        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);

        // Act
        var result = await _profileService.GetProfileAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal(avatarId, result.AvatarId);
        Assert.Equal($"/api/resources/{avatarId}", result.AvatarUrl);

        await _mockUserManager.Received(1).FindByIdAsync(testUser.Id.ToString());
    }

    [Fact]
    public async Task GetProfileAsync_WithoutAvatarResourceId_ReturnsNullAvatarUrl() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        testUser.AvatarId = null;
        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);

        // Act
        var result = await _profileService.GetProfileAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Null(result.AvatarId);
        Assert.Null(result.AvatarUrl);

        await _mockUserManager.Received(1).FindByIdAsync(testUser.Id.ToString());
    }

    [Fact]
    public async Task GetProfileAsync_WhenExceptionThrown_ReturnsInternalServerError() {
        // Arrange
        var userId = Guid.CreateVersion7();
        _mockUserManager.FindByIdAsync(userId.ToString())
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _profileService.GetProfileAsync(userId, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);

        await _mockUserManager.Received(1).FindByIdAsync(userId.ToString());
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
            PhoneNumber = "+1234567890"
        };

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.FindByEmailAsync(request.Email!).Returns((User?)null);
        _mockUserManager.UpdateAsync(testUser).Returns(IdentityResult.Success);

        // Act
        var result = await _profileService.UpdateProfileAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("Updated Name", testUser.Name);
        Assert.Equal("UpdatedDisplay", testUser.DisplayName);
        Assert.Equal("updated@example.com", testUser.Email);
        Assert.Equal("updated@example.com", testUser.UserName);
        Assert.Equal("+1234567890", testUser.PhoneNumber);

        await _mockUserManager.Received(1).FindByIdAsync(testUser.Id.ToString());
        await _mockUserManager.Received(1).FindByEmailAsync(request.Email!);
        await _mockUserManager.Received(1).UpdateAsync(testUser);
    }

    [Fact]
    public async Task UpdateProfileAsync_WithPartialUpdate_OnlyUpdatesProvidedFields() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Original Name");
        testUser.DisplayName = "OriginalDisplay";
        testUser.PhoneNumber = "+0000000000";

        var request = new UpdateProfileRequest {
            Name = "Updated Name",
            DisplayName = null,
            Email = null,
            PhoneNumber = null
        };

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.UpdateAsync(testUser).Returns(IdentityResult.Success);

        // Act
        var result = await _profileService.UpdateProfileAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("Updated Name", testUser.Name);
        Assert.Equal("OriginalDisplay", testUser.DisplayName);
        Assert.Equal("test@example.com", testUser.Email);
        Assert.Equal("+0000000000", testUser.PhoneNumber);

        await _mockUserManager.Received(1).FindByIdAsync(testUser.Id.ToString());
        await _mockUserManager.DidNotReceive().FindByEmailAsync(Arg.Any<string>());
        await _mockUserManager.Received(1).UpdateAsync(testUser);
    }

    [Fact]
    public async Task UpdateProfileAsync_WithEmailChange_UpdatesUserNameToo() {
        // Arrange
        var testUser = CreateTestUser("old@example.com", "Test User");
        var request = new UpdateProfileRequest {
            Email = "new@example.com"
        };

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.FindByEmailAsync(request.Email!).Returns((User?)null);
        _mockUserManager.UpdateAsync(testUser).Returns(IdentityResult.Success);

        // Act
        var result = await _profileService.UpdateProfileAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("new@example.com", testUser.Email);
        Assert.Equal("new@example.com", testUser.UserName);

        await _mockUserManager.Received(1).FindByEmailAsync(request.Email!);
    }

    [Fact]
    public async Task UpdateProfileAsync_WithSameEmail_DoesNotCheckForDuplicate() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new UpdateProfileRequest {
            Name = "Updated Name",
            Email = "test@example.com"
        };

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.UpdateAsync(testUser).Returns(IdentityResult.Success);

        // Act
        var result = await _profileService.UpdateProfileAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("Updated Name", testUser.Name);

        await _mockUserManager.DidNotReceive().FindByEmailAsync(Arg.Any<string>());
        await _mockUserManager.Received(1).UpdateAsync(testUser);
    }

    [Fact]
    public async Task UpdateProfileAsync_WithDuplicateEmail_ReturnsError() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var existingUser = CreateTestUser("existing@example.com", "Existing User");
        var request = new UpdateProfileRequest {
            Email = "existing@example.com"
        };

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.FindByEmailAsync(request.Email!).Returns(existingUser);

        // Act
        var result = await _profileService.UpdateProfileAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Email address is already in use", result.Message);

        await _mockUserManager.Received(1).FindByIdAsync(testUser.Id.ToString());
        await _mockUserManager.Received(1).FindByEmailAsync(request.Email!);
        await _mockUserManager.DidNotReceive().UpdateAsync(Arg.Any<User>());
    }

    [Fact]
    public async Task UpdateProfileAsync_WithNonExistentUser_ReturnsNotFoundError() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var request = new UpdateProfileRequest {
            Name = "New Name"
        };

        _mockUserManager.FindByIdAsync(userId.ToString()).Returns((User?)null);

        // Act
        var result = await _profileService.UpdateProfileAsync(userId, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("User not found", result.Message);

        await _mockUserManager.Received(1).FindByIdAsync(userId.ToString());
        await _mockUserManager.DidNotReceive().UpdateAsync(Arg.Any<User>());
    }

    [Fact]
    public async Task UpdateProfileAsync_WithIdentityError_ReturnsErrorMessage() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var request = new UpdateProfileRequest {
            Name = "Invalid Name"
        };

        var identityErrors = new List<IdentityError> {
            new() { Description = "Name contains invalid characters" },
            new() { Description = "Name is too long" }
        };
        var failedResult = IdentityResult.Failed([.. identityErrors]);

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.UpdateAsync(testUser).Returns(failedResult);

        // Act
        var result = await _profileService.UpdateProfileAsync(testUser.Id, request, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Contains("Name contains invalid characters", result.Message);
        Assert.Contains("Name is too long", result.Message);

        await _mockUserManager.Received(1).UpdateAsync(testUser);
    }

    [Fact]
    public async Task UpdateProfileAsync_WhenExceptionThrown_ReturnsInternalServerError() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var request = new UpdateProfileRequest {
            Name = "Updated Name"
        };

        _mockUserManager.FindByIdAsync(userId.ToString())
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

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.UpdateAsync(testUser).Returns(IdentityResult.Success);

        // Act
        var result = await _profileService.UpdateAvatarAsync(testUser.Id, avatarId, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Equal(avatarId, testUser.AvatarId);
        Assert.Equal(avatarId, result.AvatarId);
        Assert.Equal($"/api/resources/{avatarId}", result.AvatarUrl);

        await _mockUserManager.Received(1).FindByIdAsync(testUser.Id.ToString());
        await _mockUserManager.Received(1).UpdateAsync(testUser);
    }

    [Fact]
    public async Task UpdateAvatarAsync_WithNonExistentUser_ReturnsNotFoundError() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var avatarId = Guid.CreateVersion7();

        _mockUserManager.FindByIdAsync(userId.ToString()).Returns((User?)null);

        // Act
        var result = await _profileService.UpdateAvatarAsync(userId, avatarId, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("User not found", result.Message);

        await _mockUserManager.Received(1).FindByIdAsync(userId.ToString());
        await _mockUserManager.DidNotReceive().UpdateAsync(Arg.Any<User>());
    }

    [Fact]
    public async Task UpdateAvatarAsync_WithIdentityError_ReturnsErrorMessage() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        var avatarId = Guid.CreateVersion7();

        var identityErrors = new List<IdentityError> {
            new() { Description = "Avatar resource not found" }
        };
        var failedResult = IdentityResult.Failed([.. identityErrors]);

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.UpdateAsync(testUser).Returns(failedResult);

        // Act
        var result = await _profileService.UpdateAvatarAsync(testUser.Id, avatarId, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Avatar resource not found", result.Message);

        await _mockUserManager.Received(1).UpdateAsync(testUser);
    }

    [Fact]
    public async Task UpdateAvatarAsync_WhenExceptionThrown_ReturnsInternalServerError() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var avatarId = Guid.CreateVersion7();

        _mockUserManager.FindByIdAsync(userId.ToString())
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
        var testUser = CreateTestUser("test@example.com", "Test User");
        testUser.AvatarId = Guid.CreateVersion7();

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.UpdateAsync(testUser).Returns(IdentityResult.Success);

        // Act
        var result = await _profileService.RemoveAvatarAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.True(result.Success);
        Assert.Null(testUser.AvatarId);
        Assert.Null(result.AvatarId);
        Assert.Null(result.AvatarUrl);

        await _mockUserManager.Received(1).FindByIdAsync(testUser.Id.ToString());
        await _mockUserManager.Received(1).UpdateAsync(testUser);
    }

    [Fact]
    public async Task RemoveAvatarAsync_WithNonExistentUser_ReturnsNotFoundError() {
        // Arrange
        var userId = Guid.CreateVersion7();

        _mockUserManager.FindByIdAsync(userId.ToString()).Returns((User?)null);

        // Act
        var result = await _profileService.RemoveAvatarAsync(userId, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("User not found", result.Message);

        await _mockUserManager.Received(1).FindByIdAsync(userId.ToString());
        await _mockUserManager.DidNotReceive().UpdateAsync(Arg.Any<User>());
    }

    [Fact]
    public async Task RemoveAvatarAsync_WithIdentityError_ReturnsErrorMessage() {
        // Arrange
        var testUser = CreateTestUser("test@example.com", "Test User");
        testUser.AvatarId = Guid.CreateVersion7();

        var identityErrors = new List<IdentityError> {
            new() { Description = "Failed to update user" }
        };
        var failedResult = IdentityResult.Failed([.. identityErrors]);

        _mockUserManager.FindByIdAsync(testUser.Id.ToString()).Returns(testUser);
        _mockUserManager.UpdateAsync(testUser).Returns(failedResult);

        // Act
        var result = await _profileService.RemoveAvatarAsync(testUser.Id, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Failed to update user", result.Message);

        await _mockUserManager.Received(1).UpdateAsync(testUser);
    }

    [Fact]
    public async Task RemoveAvatarAsync_WhenExceptionThrown_ReturnsInternalServerError() {
        // Arrange
        var userId = Guid.CreateVersion7();

        _mockUserManager.FindByIdAsync(userId.ToString())
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _profileService.RemoveAvatarAsync(userId, TestContext.Current.CancellationToken);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Internal server error", result.Message);
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
            AvatarId = null
        };

    #endregion
}