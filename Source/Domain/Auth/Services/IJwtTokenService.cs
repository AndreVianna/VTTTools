namespace VttTools.Auth.Services;

public interface IJwtTokenService {
    string GenerateToken(User user, IList<string> roles, bool rememberMe = false);
    bool ValidateToken(string token);
    Guid? GetUserIdFromToken(string token);
}