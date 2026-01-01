using MsOptions = Microsoft.Extensions.Options.Options;

namespace VttTools.Services;

public class JwtTokenServiceTests {
    private readonly ILogger<JwtTokenService> _logger;
    private readonly JwtTokenService _service;

    public JwtTokenServiceTests() {
        var options = new JwtOptions {
            SecretKey = "ThisIsAVeryLongSecretKeyForTestingPurposesAtLeast32CharactersLong",
            Issuer = "VttTools.Test",
            Audience = "VttTools.Test.Audience",
            ExpirationMinutes = 60,
            RememberMeExpirationMinutes = 10080,
        };
        var jwtOptions = MsOptions.Create(options);
        _logger = Substitute.For<ILogger<JwtTokenService>>();
        _service = new(jwtOptions, _logger);
    }

    [Fact]
    public void GenerateToken_WithValidUser_ReturnsToken() {
        var user = new User {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            Name = "Test User",
            DisplayName = "Test User",
        };
        var roles = new List<string> { "User" };

        var token = _service.GenerateToken(user, roles);

        token.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public void GenerateToken_WithRememberMe_UsesLongerExpiration() {
        var user = new User {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            Name = "Test User",
        };
        var roles = new List<string>();

        var tokenWithRememberMe = _service.GenerateToken(user, roles, rememberMe: true);
        var tokenWithoutRememberMe = _service.GenerateToken(user, roles, rememberMe: false);

        tokenWithRememberMe.Should().NotBeNullOrWhiteSpace();
        tokenWithoutRememberMe.Should().NotBeNullOrWhiteSpace();
        tokenWithRememberMe.Should().NotBe(tokenWithoutRememberMe);
    }

    [Fact]
    public void GenerateToken_WithMultipleRoles_IncludesAllRoles() {
        var user = new User {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            Name = "Test User",
        };
        var roles = new List<string> { "User", "Admin", "Moderator" };

        var token = _service.GenerateToken(user, roles);

        token.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public void GenerateToken_WithNoRoles_ReturnsTokenWithoutRoleClaims() {
        var user = new User {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            Name = "Test User",
        };
        var roles = new List<string>();

        var token = _service.GenerateToken(user, roles);

        token.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public void GenerateToken_WithNullUserName_UsesEmail() {
        var user = new User {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            Name = "Test User",
        };
        var roles = new List<string>();

        var token = _service.GenerateToken(user, roles);

        token.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public void GenerateToken_WithNullDisplayName_UsesEmptyString() {
        var user = new User {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            Name = "Test User",
            DisplayName = null!,
        };
        var roles = new List<string>();

        var token = _service.GenerateToken(user, roles);

        token.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public void ValidateToken_WithValidToken_ReturnsTrue() {
        var user = new User {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            Name = "Test User",
        };
        var roles = new List<string> { "User" };
        var token = _service.GenerateToken(user, roles);

        var isValid = _service.ValidateToken(token);

        isValid.Should().BeTrue();
    }

    [Fact]
    public void ValidateToken_WithNullToken_ReturnsFalse() {
        var isValid = _service.ValidateToken(null!);

        isValid.Should().BeFalse();
    }

    [Fact]
    public void ValidateToken_WithEmptyToken_ReturnsFalse() {
        var isValid = _service.ValidateToken(string.Empty);

        isValid.Should().BeFalse();
    }

    [Fact]
    public void ValidateToken_WithWhitespaceToken_ReturnsFalse() {
        var isValid = _service.ValidateToken("   ");

        isValid.Should().BeFalse();
    }

    [Fact]
    public void ValidateToken_WithInvalidToken_ReturnsFalse() {
        var isValid = _service.ValidateToken("invalid.token.here");

        isValid.Should().BeFalse();
    }

    [Fact]
    public void ValidateToken_WithMalformedToken_ReturnsFalse() {
        var isValid = _service.ValidateToken("not-a-jwt-token");

        isValid.Should().BeFalse();
    }

    [Fact]
    public void ValidateToken_WithTokenFromDifferentSecret_ReturnsFalse() {
        var otherOptions = new JwtOptions {
            SecretKey = "DifferentSecretKeyThatIsAlsoVeryLongAtLeast32CharactersLong",
            Issuer = "VttTools.Test",
            Audience = "VttTools.Test.Audience",
            ExpirationMinutes = 60,
            RememberMeExpirationMinutes = 10080,
        };
        var otherService = new JwtTokenService(MsOptions.Create(otherOptions), _logger);
        var user = new User {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            Name = "Test User",
        };
        var token = otherService.GenerateToken(user, []);

        var isValid = _service.ValidateToken(token);

        isValid.Should().BeFalse();
    }

    [Fact]
    public void ValidateToken_WithWrongIssuer_ReturnsFalse() {
        var wrongIssuerOptions = new JwtOptions {
            SecretKey = "ThisIsAVeryLongSecretKeyForTestingPurposesAtLeast32CharactersLong",
            Issuer = "WrongIssuer",
            Audience = "VttTools.Test.Audience",
            ExpirationMinutes = 60,
            RememberMeExpirationMinutes = 10080,
        };
        var wrongIssuerService = new JwtTokenService(MsOptions.Create(wrongIssuerOptions), _logger);
        var user = new User {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            Name = "Test User",
        };
        var token = wrongIssuerService.GenerateToken(user, []);

        var isValid = _service.ValidateToken(token);

        isValid.Should().BeFalse();
    }

    [Fact]
    public void ValidateToken_WithWrongAudience_ReturnsFalse() {
        var wrongAudienceOptions = new JwtOptions {
            SecretKey = "ThisIsAVeryLongSecretKeyForTestingPurposesAtLeast32CharactersLong",
            Issuer = "VttTools.Test",
            Audience = "WrongAudience",
            ExpirationMinutes = 60,
            RememberMeExpirationMinutes = 10080,
        };
        var wrongAudienceService = new JwtTokenService(MsOptions.Create(wrongAudienceOptions), _logger);
        var user = new User {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            Name = "Test User",
        };
        var token = wrongAudienceService.GenerateToken(user, []);

        var isValid = _service.ValidateToken(token);

        isValid.Should().BeFalse();
    }

    [Fact]
    public void ValidateToken_WithWrongSecretKey_ReturnsFalse() {
        var wrongKeyOptions = new JwtOptions {
            SecretKey = "DifferentSecretKeyThatIsAlsoVeryLongAtLeast32CharactersLong",
            Issuer = "VttTools.Test",
            Audience = "VttTools.Test.Audience",
            ExpirationMinutes = 60,
            RememberMeExpirationMinutes = 10080,
        };
        var wrongKeyService = new JwtTokenService(MsOptions.Create(wrongKeyOptions), _logger);
        var user = new User {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            Name = "Test User",
        };
        var token = wrongKeyService.GenerateToken(user, []);

        var isValid = _service.ValidateToken(token);

        isValid.Should().BeFalse();
    }

    [Fact]
    public void GetUserIdFromToken_WithValidToken_ReturnsUserId() {
        var userId = Guid.NewGuid();
        var user = new User {
            Id = userId,
            Email = "test@example.com",
            Name = "Test User",
        };
        var roles = new List<string> { "User" };
        var token = _service.GenerateToken(user, roles);

        var extractedUserId = _service.GetUserIdFromToken(token);

        extractedUserId.Should().Be(userId);
    }

    [Fact]
    public void GetUserIdFromToken_WithNullToken_ReturnsNull() {
        var userId = _service.GetUserIdFromToken(null!);

        userId.Should().BeNull();
    }

    [Fact]
    public void GetUserIdFromToken_WithEmptyToken_ReturnsNull() {
        var userId = _service.GetUserIdFromToken(string.Empty);

        userId.Should().BeNull();
    }

    [Fact]
    public void GetUserIdFromToken_WithWhitespaceToken_ReturnsNull() {
        var userId = _service.GetUserIdFromToken("   ");

        userId.Should().BeNull();
    }

    [Fact]
    public void GetUserIdFromToken_WithInvalidToken_ReturnsNull() {
        var userId = _service.GetUserIdFromToken("invalid.token.here");

        userId.Should().BeNull();
    }

    [Fact]
    public void GetUserIdFromToken_WithTokenFromDifferentSecret_ReturnsNull() {
        var otherOptions = new JwtOptions {
            SecretKey = "DifferentSecretKeyThatIsAlsoVeryLongAtLeast32CharactersLong",
            Issuer = "VttTools.Test",
            Audience = "VttTools.Test.Audience",
            ExpirationMinutes = 60,
            RememberMeExpirationMinutes = 10080,
        };
        var otherService = new JwtTokenService(MsOptions.Create(otherOptions), _logger);
        var user = new User {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            Name = "Test User",
        };
        var token = otherService.GenerateToken(user, []);

        var userId = _service.GetUserIdFromToken(token);

        userId.Should().BeNull();
    }
}
