namespace VttTools.Identity.Model;

public class UserTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var user = new User {
            Email = "test@example.com",
            Name = "Test User",
        };

        // Assert
        user.Id.Should().NotBeEmpty();
        user.Email.Should().Be("test@example.com");
        user.Name.Should().Be("Test User");
        user.DisplayName.Should().Be("Test");
        user.AvatarId.Should().BeNull();
        user.UnitSystem.Should().Be(UnitSystem.Imperial);
        user.EmailConfirmed.Should().BeFalse();
        user.TwoFactorEnabled.Should().BeFalse();
        user.LockoutEnabled.Should().BeFalse();
        user.LockoutEnd.Should().BeNull();
        user.HasPassword.Should().BeFalse();
        user.Roles.Should().BeEmpty();
        user.IsAdministrator.Should().BeFalse();
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        var id = Guid.CreateVersion7();
        var avatarId = Guid.CreateVersion7();
        var lockoutEnd = DateTimeOffset.UtcNow.AddHours(1);

        // Act
        var user = new User {
            Id = id,
            Email = "admin@example.com",
            Name = "Admin User",
            DisplayName = "AdminDisplay",
            AvatarId = avatarId,
            UnitSystem = UnitSystem.Metric,
            EmailConfirmed = true,
            TwoFactorEnabled = true,
            LockoutEnabled = true,
            LockoutEnd = lockoutEnd,
            HasPassword = true,
            Roles = ["User", "Administrator"],
        };

        // Assert
        user.Id.Should().Be(id);
        user.Email.Should().Be("admin@example.com");
        user.Name.Should().Be("Admin User");
        user.DisplayName.Should().Be("AdminDisplay");
        user.AvatarId.Should().Be(avatarId);
        user.UnitSystem.Should().Be(UnitSystem.Metric);
        user.EmailConfirmed.Should().BeTrue();
        user.TwoFactorEnabled.Should().BeTrue();
        user.LockoutEnabled.Should().BeTrue();
        user.LockoutEnd.Should().Be(lockoutEnd);
        user.HasPassword.Should().BeTrue();
        user.Roles.Should().BeEquivalentTo(["User", "Administrator"]);
        user.IsAdministrator.Should().BeTrue();
    }

    [Fact]
    public void DisplayName_WhenEmpty_ReturnsFirstNameFromName() {
        // Arrange & Act
        var user = new User {
            Email = "test@example.com",
            Name = "John Doe Smith",
        };

        // Assert
        user.DisplayName.Should().Be("John");
    }

    [Fact]
    public void IsAdministrator_WhenRolesContainsAdministrator_ReturnsTrue() {
        // Arrange
        var user = new User {
            Email = "admin@example.com",
            Name = "Admin",
            Roles = ["Administrator"],
        };

        // Assert
        user.IsAdministrator.Should().BeTrue();
    }

    [Fact]
    public void IsAdministrator_WhenRolesDoesNotContainAdministrator_ReturnsFalse() {
        // Arrange
        var user = new User {
            Email = "user@example.com",
            Name = "User",
            Roles = ["User"],
        };

        // Assert
        user.IsAdministrator.Should().BeFalse();
    }
}
