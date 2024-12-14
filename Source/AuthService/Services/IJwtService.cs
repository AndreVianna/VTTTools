namespace AuthService.Services;

public interface IJwtService {
    Task<bool> IsClientCredentialsValidAsync(string clientId, string clientSecret);
}
