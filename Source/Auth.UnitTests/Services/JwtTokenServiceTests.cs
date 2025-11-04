namespace VttTools.Auth.UnitTests.Services;

public class JwtTokenServiceTests {
    private readonly JwtOptions _jwtOptions;
    private readonly JwtTokenService _jwtTokenService;
    private readonly ILogger<JwtTokenService> _mockLogger;

    public JwtTokenServiceTests() {
        _jwtOptions = new JwtOptions {
            SecretKey = "test-secret-key-with-minimum-32-characters-for-security",
            Issuer = "VttTools.Auth.Tests",
            Audience = "VttTools.Services.Tests",
            ExpirationMinutes = 60,
            RememberMeExpirationMinutes = 43200
        };

        var options = Options.Create(_jwtOptions);
        _mockLogger = Substitute.For<ILogger<JwtTokenService>>();
        _jwtTokenService = new JwtTokenService(options, _mockLogger);
    }

    private static User CreateTestUser(string email, string name, Guid? id = null)
        => new() {
            Id = id ?? Guid.NewGuid(),
            Email = email,
            UserName = email,
            Name = name,
            DisplayName = name.Split(' ').FirstOrDefault() ?? name
        };

    #region GenerateToken Tests

    [Fact]
    public void GenerateToken_ValidUser_ReturnsNonEmptyToken() {
        var user = CreateTestUser("test@example.com", "Test User");
        var roles = new List<string> { "User" };

        var token = _jwtTokenService.GenerateToken(user, roles, rememberMe: false);

        Assert.NotNull(token);
        Assert.NotEmpty(token);
        Assert.Contains(".", token);
    }

    [Fact]
    public void GenerateToken_ContainsCorrectClaims() {
        var userId = Guid.NewGuid();
        var user = CreateTestUser("test@example.com", "Test User", userId);
        var roles = new List<string> { "User", "Administrator" };

        var token = _jwtTokenService.GenerateToken(user, roles, rememberMe: false);

        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        var nameIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type is "nameid" or ClaimTypes.NameIdentifier);
        Assert.NotNull(nameIdClaim);
        Assert.Equal(userId.ToString("n"), nameIdClaim.Value);

        var emailClaim = jwtToken.Claims.FirstOrDefault(c => c.Type is "email" or ClaimTypes.Email);
        Assert.NotNull(emailClaim);
        Assert.Equal("test@example.com", emailClaim.Value);

        var nameClaim = jwtToken.Claims.FirstOrDefault(c => c.Type is "unique_name" or ClaimTypes.Name);
        Assert.NotNull(nameClaim);
        Assert.Equal("test@example.com", nameClaim.Value);

        var displayNameClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "DisplayName");
        Assert.NotNull(displayNameClaim);
        Assert.Equal("Test", displayNameClaim.Value);

        var roleClaims = jwtToken.Claims.Where(c => c.Type is "role" or ClaimTypes.Role).Select(c => c.Value).ToList();
        Assert.Equal(2, roleClaims.Count);
        Assert.Contains("User", roleClaims);
        Assert.Contains("Administrator", roleClaims);
    }

    [Fact]
    public void GenerateToken_RememberMeFalse_SetsShortExpiration() {
        var user = CreateTestUser("test@example.com", "Test User");
        var roles = new List<string> { "User" };

        var token = _jwtTokenService.GenerateToken(user, roles, rememberMe: false);

        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);
        var expirationTime = jwtToken.ValidTo;
        var expectedExpiration = DateTime.UtcNow.AddMinutes(_jwtOptions.ExpirationMinutes);

        Assert.True(Math.Abs((expirationTime - expectedExpiration).TotalSeconds) < 5);
    }

    [Fact]
    public void GenerateToken_RememberMeTrue_SetsLongExpiration() {
        var user = CreateTestUser("test@example.com", "Test User");
        var roles = new List<string> { "User" };

        var token = _jwtTokenService.GenerateToken(user, roles, rememberMe: true);

        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);
        var expirationTime = jwtToken.ValidTo;
        var expectedExpiration = DateTime.UtcNow.AddMinutes(_jwtOptions.RememberMeExpirationMinutes);

        Assert.True(Math.Abs((expirationTime - expectedExpiration).TotalSeconds) < 5);
    }

    [Fact]
    public void GenerateToken_NoRoles_GeneratesValidToken() {
        var user = CreateTestUser("test@example.com", "Test User");
        var roles = new List<string>();

        var token = _jwtTokenService.GenerateToken(user, roles, rememberMe: false);

        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);
        var roleClaims = jwtToken.Claims.Where(c => c.Type is "role" or ClaimTypes.Role).ToList();

        Assert.NotNull(token);
        Assert.Empty(roleClaims);
    }

    [Fact]
    public void GenerateToken_MultipleRoles_EncodesAllRoles() {
        var user = CreateTestUser("test@example.com", "Test User");
        var roles = new List<string> { "User", "Administrator", "Moderator" };

        var token = _jwtTokenService.GenerateToken(user, roles, rememberMe: false);

        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);
        var roleClaims = jwtToken.Claims.Where(c => c.Type is "role" or ClaimTypes.Role).Select(c => c.Value).ToList();

        Assert.Equal(3, roleClaims.Count);
        Assert.Contains("User", roleClaims);
        Assert.Contains("Administrator", roleClaims);
        Assert.Contains("Moderator", roleClaims);
    }

    [Fact]
    public void GenerateToken_ContainsCorrectIssuerAndAudience() {
        var user = CreateTestUser("test@example.com", "Test User");
        var roles = new List<string> { "User" };

        var token = _jwtTokenService.GenerateToken(user, roles, rememberMe: false);

        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        Assert.Equal(_jwtOptions.Issuer, jwtToken.Issuer);
        Assert.Contains(_jwtOptions.Audience, jwtToken.Audiences);
    }

    #endregion

    #region ValidateToken Tests

    [Fact]
    public void ValidateToken_ValidToken_ReturnsTrue() {
        var user = CreateTestUser("test@example.com", "Test User");
        var roles = new List<string> { "User" };
        var token = _jwtTokenService.GenerateToken(user, roles, rememberMe: false);

        var isValid = _jwtTokenService.ValidateToken(token);

        Assert.True(isValid);
    }

    [Fact]
    public void ValidateToken_EmptyToken_ReturnsFalse() {
        var isValid = _jwtTokenService.ValidateToken(string.Empty);

        Assert.False(isValid);
    }

    [Fact]
    public void ValidateToken_NullToken_ReturnsFalse() {
        var isValid = _jwtTokenService.ValidateToken(null!);

        Assert.False(isValid);
    }

    [Fact]
    public void ValidateToken_WhitespaceToken_ReturnsFalse() {
        var isValid = _jwtTokenService.ValidateToken("   ");

        Assert.False(isValid);
    }

    [Fact]
    public void ValidateToken_TamperedToken_ReturnsFalse() {
        var user = CreateTestUser("test@example.com", "Test User");
        var roles = new List<string> { "User" };
        var token = _jwtTokenService.GenerateToken(user, roles, rememberMe: false);

        var tamperedToken = token[..^10] + "0000000000";

        var isValid = _jwtTokenService.ValidateToken(tamperedToken);

        Assert.False(isValid);
    }

    [Fact]
    public void ValidateToken_ExpiredToken_ReturnsFalse() {
        var handler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_jwtOptions.SecretKey);
        var user = CreateTestUser("test@example.com", "Test User");

        var now = DateTime.UtcNow;
        var tokenDescriptor = new SecurityTokenDescriptor {
            Subject = new ClaimsIdentity(
            [
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email)
            ]),
            NotBefore = now.AddMinutes(-10),
            Expires = now.AddSeconds(-1),
            Issuer = _jwtOptions.Issuer,
            Audience = _jwtOptions.Audience,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = handler.CreateToken(tokenDescriptor);
        var tokenString = handler.WriteToken(token);

        var isValid = _jwtTokenService.ValidateToken(tokenString);

        Assert.False(isValid);
    }

    [Fact]
    public void ValidateToken_WrongIssuer_ReturnsFalse() {
        var wrongIssuerOptions = new JwtOptions {
            SecretKey = "test-secret-key-with-minimum-32-characters-for-security",
            Issuer = "WrongIssuer",
            Audience = "VttTools.Services.Tests",
            ExpirationMinutes = 60,
            RememberMeExpirationMinutes = 43200
        };

        var mockLogger = Substitute.For<ILogger<JwtTokenService>>();
        var wrongIssuerService = new JwtTokenService(Options.Create(wrongIssuerOptions), mockLogger);
        var user = CreateTestUser("test@example.com", "Test User");
        var roles = new List<string> { "User" };
        var token = wrongIssuerService.GenerateToken(user, roles, rememberMe: false);

        var isValid = _jwtTokenService.ValidateToken(token);

        Assert.False(isValid);
    }

    [Fact]
    public void ValidateToken_WrongAudience_ReturnsFalse() {
        var wrongAudienceOptions = new JwtOptions {
            SecretKey = "test-secret-key-with-minimum-32-characters-for-security",
            Issuer = "VttTools.Auth.Tests",
            Audience = "WrongAudience",
            ExpirationMinutes = 60,
            RememberMeExpirationMinutes = 43200
        };

        var mockLogger = Substitute.For<ILogger<JwtTokenService>>();
        var wrongAudienceService = new JwtTokenService(Options.Create(wrongAudienceOptions), mockLogger);
        var user = CreateTestUser("test@example.com", "Test User");
        var roles = new List<string> { "User" };
        var token = wrongAudienceService.GenerateToken(user, roles, rememberMe: false);

        var isValid = _jwtTokenService.ValidateToken(token);

        Assert.False(isValid);
    }

    [Fact]
    public void ValidateToken_WrongSigningKey_ReturnsFalse() {
        var wrongKeyOptions = new JwtOptions {
            SecretKey = "different-secret-key-minimum-32-characters-required-here",
            Issuer = "VttTools.Auth.Tests",
            Audience = "VttTools.Services.Tests",
            ExpirationMinutes = 60,
            RememberMeExpirationMinutes = 43200
        };

        var mockLogger = Substitute.For<ILogger<JwtTokenService>>();
        var wrongKeyService = new JwtTokenService(Options.Create(wrongKeyOptions), mockLogger);
        var user = CreateTestUser("test@example.com", "Test User");
        var roles = new List<string> { "User" };
        var token = wrongKeyService.GenerateToken(user, roles, rememberMe: false);

        var isValid = _jwtTokenService.ValidateToken(token);

        Assert.False(isValid);
    }

    #endregion

    #region GetUserIdFromToken Tests

    [Fact]
    public void GetUserIdFromToken_ValidToken_ReturnsUserId() {
        var userId = Guid.NewGuid();
        var user = CreateTestUser("test@example.com", "Test User", userId);
        var roles = new List<string> { "User" };
        var token = _jwtTokenService.GenerateToken(user, roles, rememberMe: false);

        var extractedUserId = _jwtTokenService.GetUserIdFromToken(token);

        Assert.NotNull(extractedUserId);
        Assert.Equal(userId, extractedUserId.Value);
    }

    [Fact]
    public void GetUserIdFromToken_EmptyToken_ReturnsNull() {
        var userId = _jwtTokenService.GetUserIdFromToken(string.Empty);

        Assert.Null(userId);
    }

    [Fact]
    public void GetUserIdFromToken_NullToken_ReturnsNull() {
        var userId = _jwtTokenService.GetUserIdFromToken(null!);

        Assert.Null(userId);
    }

    [Fact]
    public void GetUserIdFromToken_InvalidToken_ReturnsNull() {
        var userId = _jwtTokenService.GetUserIdFromToken("invalid.token.value");

        Assert.Null(userId);
    }

    [Fact]
    public void GetUserIdFromToken_TamperedToken_ReturnsNull() {
        var user = CreateTestUser("test@example.com", "Test User");
        var roles = new List<string> { "User" };
        var token = _jwtTokenService.GenerateToken(user, roles, rememberMe: false);

        var tamperedToken = token[..^10] + "0000000000";

        var userId = _jwtTokenService.GetUserIdFromToken(tamperedToken);

        Assert.Null(userId);
    }

    [Fact]
    public void GetUserIdFromToken_ExpiredToken_ReturnsNull() {
        var handler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_jwtOptions.SecretKey);
        var user = CreateTestUser("test@example.com", "Test User");

        var now = DateTime.UtcNow;
        var tokenDescriptor = new SecurityTokenDescriptor {
            Subject = new ClaimsIdentity(
            [
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email)
            ]),
            NotBefore = now.AddMinutes(-10),
            Expires = now.AddSeconds(-1),
            Issuer = _jwtOptions.Issuer,
            Audience = _jwtOptions.Audience,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = handler.CreateToken(tokenDescriptor);
        var tokenString = handler.WriteToken(token);

        var userId = _jwtTokenService.GetUserIdFromToken(tokenString);

        Assert.Null(userId);
    }

    #endregion
}
