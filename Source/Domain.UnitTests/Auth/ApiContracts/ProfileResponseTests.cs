namespace VttTools.Auth.ApiContracts;

public class ProfileResponseTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var response = new ProfileResponse();

        // Assert
        response.Id.Should().Be(Guid.Empty);
        response.Name.Should().Be(string.Empty);
        response.DisplayName.Should().Be(string.Empty);
        response.Email.Should().Be(string.Empty);
        response.EmailConfirmed.Should().BeFalse();
        response.PhoneNumber.Should().BeNull();
        response.AvatarId.Should().BeNull();
        response.AvatarUrl.Should().BeNull();
        response.PreferredUnitSystem.Should().Be(UnitSystem.Imperial);
        response.Success.Should().BeFalse();
        response.Message.Should().BeNull();
    }

    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var originalId = Guid.CreateVersion7();
        var newId = Guid.CreateVersion7();
        var avatarId = Guid.CreateVersion7();
        var original = new ProfileResponse {
            Id = originalId,
            Name = "Old Name",
            DisplayName = "OldDisplay",
            Email = "old@example.com",
            EmailConfirmed = false,
            PhoneNumber = null,
            AvatarId = null,
            AvatarUrl = null,
            PreferredUnitSystem = UnitSystem.Imperial,
            Success = false,
            Message = "Original message",
        };

        // Act
        var updated = original with {
            Id = newId,
            Name = "New Name",
            DisplayName = "NewDisplay",
            Email = "new@example.com",
            EmailConfirmed = true,
            PhoneNumber = "555-0100",
            AvatarId = avatarId,
            AvatarUrl = "/avatars/123.png",
            PreferredUnitSystem = UnitSystem.Metric,
            Success = true,
            Message = "Updated message",
        };

        // Assert
        updated.Id.Should().Be(newId);
        updated.Name.Should().Be("New Name");
        updated.DisplayName.Should().Be("NewDisplay");
        updated.Email.Should().Be("new@example.com");
        updated.EmailConfirmed.Should().BeTrue();
        updated.PhoneNumber.Should().Be("555-0100");
        updated.AvatarId.Should().Be(avatarId);
        updated.AvatarUrl.Should().Be("/avatars/123.png");
        updated.PreferredUnitSystem.Should().Be(UnitSystem.Metric);
        updated.Success.Should().BeTrue();
        updated.Message.Should().Be("Updated message");
        original.Id.Should().Be(originalId);
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var id = Guid.CreateVersion7();
        var avatarId = Guid.CreateVersion7();
        var response1 = new ProfileResponse {
            Id = id,
            Name = "Test User",
            DisplayName = "TestDisplay",
            Email = "test@example.com",
            EmailConfirmed = true,
            PhoneNumber = "555-0100",
            AvatarId = avatarId,
            AvatarUrl = "/avatars/123.png",
            PreferredUnitSystem = UnitSystem.Metric,
            Success = true,
            Message = "Profile loaded",
        };
        var response2 = new ProfileResponse {
            Id = id,
            Name = "Test User",
            DisplayName = "TestDisplay",
            Email = "test@example.com",
            EmailConfirmed = true,
            PhoneNumber = "555-0100",
            AvatarId = avatarId,
            AvatarUrl = "/avatars/123.png",
            PreferredUnitSystem = UnitSystem.Metric,
            Success = true,
            Message = "Profile loaded",
        };

        // Act & Assert
        response1.Should().Be(response2);
        (response1 == response2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var response1 = new ProfileResponse {
            Id = Guid.CreateVersion7(),
            Name = "Test User",
            DisplayName = "TestDisplay",
            Email = "test@example.com",
            EmailConfirmed = true,
            PhoneNumber = "555-0100",
            AvatarId = null,
            AvatarUrl = null,
            PreferredUnitSystem = UnitSystem.Metric,
            Success = true,
            Message = "Profile loaded",
        };
        var response2 = new ProfileResponse {
            Id = Guid.CreateVersion7(),
            Name = "Different User",
            DisplayName = "TestDisplay",
            Email = "test@example.com",
            EmailConfirmed = true,
            PhoneNumber = "555-0100",
            AvatarId = null,
            AvatarUrl = null,
            PreferredUnitSystem = UnitSystem.Metric,
            Success = true,
            Message = "Profile loaded",
        };

        // Act & Assert
        response1.Should().NotBe(response2);
        (response1 != response2).Should().BeTrue();
    }
}
