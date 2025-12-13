
namespace VttTools.Common.UnitTests.Extensions;

public class ClaimsPrincipalExtensionsTests {
    [Fact]
    public void GetUserId_WithValidUserId_ReturnsGuid() {
        var userId = Guid.NewGuid();
        var principal = new ClaimsPrincipal(new ClaimsIdentity([
            new Claim(ClaimTypes.NameIdentifier, userId.ToString())
        ]));

        var result = principal.GetUserId();

        result.Should().Be(userId);
    }

    [Fact]
    public void GetUserId_WithValidUserIdInDifferentFormat_ReturnsGuid() {
        var userId = Guid.NewGuid();
        var principal = new ClaimsPrincipal(new ClaimsIdentity([
            new Claim(ClaimTypes.NameIdentifier, userId.ToString("N"))
        ]));

        var result = principal.GetUserId();

        result.Should().Be(userId);
    }

    [Fact]
    public void GetUserId_WithMissingClaim_ThrowsUnauthorizedAccessException() {
        var principal = new ClaimsPrincipal(new ClaimsIdentity([
            new Claim(ClaimTypes.Email, "test@example.com")
        ]));

        var act = principal.GetUserId;

        act.Should().Throw<UnauthorizedAccessException>()
            .WithMessage("*User ID claim is missing or invalid*");
    }

    [Fact]
    public void GetUserId_WithEmptyClaim_ThrowsUnauthorizedAccessException() {
        var principal = new ClaimsPrincipal(new ClaimsIdentity([
            new Claim(ClaimTypes.NameIdentifier, string.Empty)
        ]));

        var act = principal.GetUserId;

        act.Should().Throw<UnauthorizedAccessException>()
            .WithMessage("*User ID claim is missing or invalid*");
    }

    [Fact]
    public void GetUserId_WithNullClaim_ThrowsUnauthorizedAccessException() {
        var principal = new ClaimsPrincipal(new ClaimsIdentity());

        var act = principal.GetUserId;

        act.Should().Throw<UnauthorizedAccessException>()
            .WithMessage("*User ID claim is missing or invalid*");
    }

    [Fact]
    public void GetUserId_WithInvalidGuidFormat_ThrowsUnauthorizedAccessException() {
        var principal = new ClaimsPrincipal(new ClaimsIdentity([
            new Claim(ClaimTypes.NameIdentifier, "not-a-guid")
        ]));

        var act = principal.GetUserId;

        act.Should().Throw<UnauthorizedAccessException>()
            .WithMessage("*User ID claim is missing or invalid*");
    }

    [Fact]
    public void GetUserId_WithWhitespaceClaim_ThrowsUnauthorizedAccessException() {
        var principal = new ClaimsPrincipal(new ClaimsIdentity([
            new Claim(ClaimTypes.NameIdentifier, "   ")
        ]));

        var act = principal.GetUserId;

        act.Should().Throw<UnauthorizedAccessException>()
            .WithMessage("*User ID claim is missing or invalid*");
    }

    [Fact]
    public void GetUserId_WithMultipleNameIdentifierClaims_ReturnsFirstValidGuid() {
        var userId = Guid.NewGuid();
        var principal = new ClaimsPrincipal(new ClaimsIdentity([
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString())
        ]));

        var result = principal.GetUserId();

        result.Should().Be(userId);
    }

    [Fact]
    public void GetUserId_WithEmptyIdentity_ThrowsUnauthorizedAccessException() {
        var principal = new ClaimsPrincipal();

        var act = principal.GetUserId;

        act.Should().Throw<UnauthorizedAccessException>()
            .WithMessage("*User ID claim is missing or invalid*");
    }

    [Fact]
    public void GetUserId_WithDifferentClaimTypes_ThrowsUnauthorizedAccessException() {
        var userId = Guid.NewGuid();
        var principal = new ClaimsPrincipal(new ClaimsIdentity([
            new Claim(ClaimTypes.Name, userId.ToString()),
            new Claim(ClaimTypes.Email, "test@example.com")
        ]));

        var act = principal.GetUserId;

        act.Should().Throw<UnauthorizedAccessException>()
            .WithMessage("*User ID claim is missing or invalid*");
    }

    [Fact]
    public void GetUserId_WithUpperCaseGuid_ReturnsGuid() {
        var userId = Guid.NewGuid();
        var principal = new ClaimsPrincipal(new ClaimsIdentity([
            new Claim(ClaimTypes.NameIdentifier, userId.ToString().ToUpperInvariant())
        ]));

        var result = principal.GetUserId();

        result.Should().Be(userId);
    }

    [Fact]
    public void GetUserId_WithBracedGuid_ReturnsGuid() {
        var userId = Guid.NewGuid();
        var principal = new ClaimsPrincipal(new ClaimsIdentity([
            new Claim(ClaimTypes.NameIdentifier, userId.ToString("B"))
        ]));

        var result = principal.GetUserId();

        result.Should().Be(userId);
    }
}
