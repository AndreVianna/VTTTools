namespace VttTools.Identity.Model;

public class UserTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var user = new User();

        // Assert
        user.Id.Should().NotBeEmpty();
        user.UserName.Should().BeNull();
        user.NormalizedUserName.Should().BeNull();
        user.Email.Should().BeNull();
        user.NormalizedEmail.Should().BeNull();
        user.EmailConfirmed.Should().BeFalse();
        user.PasswordHash.Should().BeNull();
        user.SecurityStamp.Should().BeNull();
        user.ConcurrencyStamp.Should().NotBeNull();
        user.PhoneNumber.Should().BeNull();
        user.PhoneNumberConfirmed.Should().BeFalse();
        user.TwoFactorEnabled.Should().BeFalse();
        user.LockoutEnd.Should().BeNull();
        user.LockoutEnabled.Should().BeFalse();
        user.AccessFailedCount.Should().Be(0);
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        var id = Guid.CreateVersion7();
        const string userName = "test_user";
        const string email = "test@example.com";

        // Act
        var user = new User {
            Id = id,
            UserName = userName,
            Email = email,
            EmailConfirmed = true,
            PhoneNumberConfirmed = true,
            TwoFactorEnabled = true,
            LockoutEnabled = true,
            AccessFailedCount = 3,
            Name = "Some Title",
            DisplayName = "Some",
        };

        // Assert
        user.Id.Should().Be(id);
        user.UserName.Should().Be(userName);
        user.Email.Should().Be(email);
        user.EmailConfirmed.Should().BeTrue();
        user.PhoneNumberConfirmed.Should().BeTrue();
        user.TwoFactorEnabled.Should().BeTrue();
        user.LockoutEnabled.Should().BeTrue();
        user.AccessFailedCount.Should().Be(3);
        user.Name.Should().Be("Some Title");
        user.DisplayName.Should().Be("Some");
    }
}