namespace VttTools.Identity.Model;

public class RoleClaimTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var roleClaim = new RoleClaim();

        // Assert
        roleClaim.Id.Should().Be(0);
        roleClaim.RoleId.Should().Be(Guid.Empty);
        roleClaim.ClaimType.Should().BeNull();
        roleClaim.ClaimValue.Should().BeNull();
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        const int id = 123;
        var roleId = Guid.NewGuid();
        const string claimType = "ClaimType1";
        const string claimValue = "ClaimValue1";

        // Act
        var roleClaim = new RoleClaim {
            Id = id,
            RoleId = roleId,
            ClaimType = claimType,
            ClaimValue = claimValue,
        };

        // Assert
        roleClaim.Id.Should().Be(id);
        roleClaim.RoleId.Should().Be(roleId);
        roleClaim.ClaimType.Should().Be(claimType);
        roleClaim.ClaimValue.Should().Be(claimValue);
    }
}