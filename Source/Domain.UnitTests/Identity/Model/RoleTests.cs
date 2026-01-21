namespace VttTools.Identity.Model;

public class RoleTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var role = new Role {
            Name = "TestRole",
        };

        // Assert
        role.Id.Should().NotBeEmpty();
        role.Name.Should().Be("TestRole");
        role.Claims.Should().BeEmpty();
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        var id = Guid.CreateVersion7();

        // Act
        var role = new Role {
            Id = id,
            Name = "Administrator",
            Claims = ["users:read", "users:write", "admin:access"],
        };

        // Assert
        role.Id.Should().Be(id);
        role.Name.Should().Be("Administrator");
        role.Claims.Should().BeEquivalentTo(["users:read", "users:write", "admin:access"]);
    }
}