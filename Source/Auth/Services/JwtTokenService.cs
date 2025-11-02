
namespace VttTools.Auth.Services;

public sealed class JwtTokenService(IOptions<JwtOptions> jwtOptions, ILogger<JwtTokenService> logger) : IJwtTokenService {
    private readonly JwtOptions _jwtOptions = jwtOptions.Value;

    public string GenerateToken(User user, IList<string> roles, bool rememberMe = false) {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_jwtOptions.SecretKey);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString("n")),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.UserName ?? user.Email),
            new("DisplayName", user.DisplayName ?? string.Empty)
        };

        if (roles.Any()) {
            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
        }

        var expirationMinutes = rememberMe
            ? _jwtOptions.RememberMeExpirationMinutes
            : _jwtOptions.ExpirationMinutes;

        var tokenDescriptor = new SecurityTokenDescriptor {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(expirationMinutes),
            Issuer = _jwtOptions.Issuer,
            Audience = _jwtOptions.Audience,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public bool ValidateToken(string token) {
        if (string.IsNullOrWhiteSpace(token))
            return false;

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_jwtOptions.SecretKey);

        try {
            tokenHandler.ValidateToken(token, new TokenValidationParameters {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _jwtOptions.Issuer,
                ValidateAudience = true,
                ValidAudience = _jwtOptions.Audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out _);

            return true;
        }
        catch (Exception ex) {
            logger.LogWarning(ex, "Token validation failed");
            return false;
        }
    }

    public Guid? GetUserIdFromToken(string token) {
        if (string.IsNullOrWhiteSpace(token))
            return null;

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_jwtOptions.SecretKey);

        try {
            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _jwtOptions.Issuer,
                ValidateAudience = true,
                ValidAudience = _jwtOptions.Audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out _);

            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
        }
        catch (Exception ex) {
            logger.LogWarning(ex, "Failed to extract user ID from token");
            return null;
        }
    }
}
