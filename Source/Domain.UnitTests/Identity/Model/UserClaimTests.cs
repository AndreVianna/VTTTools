namespace VttTools.Identity.Model;

public class UserClaimTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var userClaim = new UserClaim();

        // Assert
        userClaim.Id.Should().Be(0);
        userClaim.UserId.Should().Be(Guid.Empty);
        userClaim.ClaimType.Should().BeNull();
        userClaim.ClaimValue.Should().BeNull();
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        const int id = 123;
        var userId = Guid.CreateVersion7();
        const string claimType = "ClaimType1";
        const string claimValue = "ClaimValue1";

        // Act
        var userClaim = new UserClaim {
            Id = id,
            UserId = userId,
            ClaimType = claimType,
            ClaimValue = claimValue,
        };

        // Assert
        userClaim.Id.Should().Be(id);
        userClaim.UserId.Should().Be(userId);
        userClaim.ClaimType.Should().Be(claimType);
        userClaim.ClaimValue.Should().Be(claimValue);
    }
}