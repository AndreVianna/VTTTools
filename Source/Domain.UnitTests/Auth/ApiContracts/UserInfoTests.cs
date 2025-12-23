namespace VttTools.Auth.ApiContracts;

public class UserInfoTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var userInfo = new UserInfo();

        // Assert
        userInfo.Id.Should().Be(Guid.Empty);
        userInfo.Email.Should().Be(string.Empty);
        userInfo.EmailConfirmed.Should().BeFalse();
        userInfo.Name.Should().Be(string.Empty);
        userInfo.DisplayName.Should().Be(string.Empty);
        userInfo.IsAdministrator.Should().BeFalse();
        userInfo.TwoFactorEnabled.Should().BeFalse();
        userInfo.PreferredUnitSystem.Should().Be(UnitSystem.Imperial);
    }

    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var originalId = Guid.CreateVersion7();
        var newId = Guid.CreateVersion7();
        var original = new UserInfo {
            Id = originalId,
            Email = "old@example.com",
            EmailConfirmed = false,
            Name = "Old Name",
            DisplayName = "OldDisplay",
            IsAdministrator = false,
            TwoFactorEnabled = false,
            PreferredUnitSystem = UnitSystem.Imperial,
        };

        // Act
        var updated = original with {
            Id = newId,
            Email = "new@example.com",
            EmailConfirmed = true,
            Name = "New Name",
            DisplayName = "NewDisplay",
            IsAdministrator = true,
            TwoFactorEnabled = true,
            PreferredUnitSystem = UnitSystem.Metric,
        };

        // Assert
        updated.Id.Should().Be(newId);
        updated.Email.Should().Be("new@example.com");
        updated.EmailConfirmed.Should().BeTrue();
        updated.Name.Should().Be("New Name");
        updated.DisplayName.Should().Be("NewDisplay");
        updated.IsAdministrator.Should().BeTrue();
        updated.TwoFactorEnabled.Should().BeTrue();
        updated.PreferredUnitSystem.Should().Be(UnitSystem.Metric);
        original.Id.Should().Be(originalId);
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var id = Guid.CreateVersion7();
        var userInfo1 = new UserInfo {
            Id = id,
            Email = "test@example.com",
            EmailConfirmed = true,
            Name = "Test User",
            DisplayName = "TestDisplay",
            IsAdministrator = true,
            TwoFactorEnabled = true,
            PreferredUnitSystem = UnitSystem.Metric,
        };
        var userInfo2 = new UserInfo {
            Id = id,
            Email = "test@example.com",
            EmailConfirmed = true,
            Name = "Test User",
            DisplayName = "TestDisplay",
            IsAdministrator = true,
            TwoFactorEnabled = true,
            PreferredUnitSystem = UnitSystem.Metric,
        };

        // Act & Assert
        userInfo1.Should().Be(userInfo2);
        (userInfo1 == userInfo2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var userInfo1 = new UserInfo {
            Id = Guid.CreateVersion7(),
            Email = "test@example.com",
            EmailConfirmed = true,
            Name = "Test User",
            DisplayName = "TestDisplay",
            IsAdministrator = true,
            TwoFactorEnabled = true,
            PreferredUnitSystem = UnitSystem.Metric,
        };
        var userInfo2 = new UserInfo {
            Id = Guid.CreateVersion7(),
            Email = "different@example.com",
            EmailConfirmed = true,
            Name = "Test User",
            DisplayName = "TestDisplay",
            IsAdministrator = true,
            TwoFactorEnabled = true,
            PreferredUnitSystem = UnitSystem.Metric,
        };

        // Act & Assert
        userInfo1.Should().NotBe(userInfo2);
        (userInfo1 != userInfo2).Should().BeTrue();
    }
}
