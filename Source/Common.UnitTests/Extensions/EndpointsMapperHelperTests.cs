namespace VttTools.Extensions;

public class ClaimsPrincipalExtensionsTests {
    [Fact]
    public void GetUserId_WithValidId_ReturnsGuid() {
        // Create claims principal with NameIdentifier claim
        var userId = Guid.NewGuid();
        var claim = new Claim(ClaimTypes.NameIdentifier, userId.ToString());
        var claims = new List<Claim> { claim };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        // Act
        var result = principal.GetUserId();

        // Assert
        result.Should().Be(userId);
    }

    [Fact]
    public void GetUserId_WithInvalidId_ReturnsNull() {
        // Create claims principal with non-guid NameIdentifier claim
        var claim = new Claim(ClaimTypes.NameIdentifier, "not-a-guid");
        var claims = new List<Claim> { claim };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        // Act
        var result = principal.GetUserId();

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public void GetUserId_WithNoId_ReturnsEmptyGuid() {
        // Create claims principal without NameIdentifier claim
        var identity = new ClaimsIdentity([], "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        // Act
        var result = principal.GetUserId();

        // Assert
        result.Should().BeEmpty();
    }
}