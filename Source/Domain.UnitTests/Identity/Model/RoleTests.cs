namespace VttTools.Identity.Model;

public class RoleTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var role = new Role();

        // Assert
        role.Id.Should().NotBeEmpty();
        role.Name.Should().BeNull();
        role.NormalizedName.Should().BeNull();
        role.ConcurrencyStamp.Should().NotBeNull();
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        var id = Guid.CreateVersion7();
        const string name = "Admin";
        const string normalizedName = "ADMIN";
        var concurrencyStamp = Guid.CreateVersion7().ToString();

        // Act
        var role = new Role {
            Id = id,
            Name = name,
            NormalizedName = normalizedName,
            ConcurrencyStamp = concurrencyStamp,
        };

        // Assert
        role.Id.Should().Be(id);
        role.Name.Should().Be(name);
        role.NormalizedName.Should().Be(normalizedName);
        role.ConcurrencyStamp.Should().Be(concurrencyStamp);
    }
}