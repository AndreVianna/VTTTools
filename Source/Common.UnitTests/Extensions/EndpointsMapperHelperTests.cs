namespace VttTools.Extensions;

public class ClaimsPrincipalExtensionsTests {
    [Fact]
    public void GetUserId_WithValidId_ReturnsGuid() {
        // Create claims principal with NameIdentifier claim
        var userId = Guid.CreateVersion7();
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
    public void GetUserId_WithInvalidId_ThrowsUnauthorizedAccessException() {
        var claim = new Claim(ClaimTypes.NameIdentifier, "not-a-guid");
        var claims = new List<Claim> { claim };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        var act = principal.GetUserId;

        act.Should().Throw<UnauthorizedAccessException>()
            .WithMessage("User ID claim is missing or invalid.");
    }

    [Fact]
    public void GetUserId_WithNoId_ThrowsUnauthorizedAccessException() {
        var identity = new ClaimsIdentity([], "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        var act = principal.GetUserId;

        act.Should().Throw<UnauthorizedAccessException>()
            .WithMessage("User ID claim is missing or invalid.");
    }
}