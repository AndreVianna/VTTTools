namespace AuthService.Services;

public class JwtService : IJwtService {
    public Task<bool> IsClientCredentialsValidAsync(string clientId, string clientSecret)
        // Implement existing logic for client credential validation
        // ReSharper disable once ArrangeMethodOrOperatorBody
        => Task.FromResult(false);
}
