namespace VttTools.Identity.Model;

public class UserRoleTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var userRole = new UserRole();

        // Assert
        userRole.UserId.Should().Be(Guid.Empty);
        userRole.RoleId.Should().Be(Guid.Empty);
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        var userId = Guid.NewGuid();
        var roleId = Guid.NewGuid();

        // Act
        var userRole = new UserRole {
            UserId = userId,
            RoleId = roleId,
        };

        // Assert
        userRole.UserId.Should().Be(userId);
        userRole.RoleId.Should().Be(roleId);
    }
}