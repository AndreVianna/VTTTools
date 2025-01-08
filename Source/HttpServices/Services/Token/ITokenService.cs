namespace HttpServices.Services.Token;

internal interface ITokenService {
    Task<NewTokenResponse?> GenerateTokenAsync(HttpContext context, NewTokenRequest request, CancellationToken ct = default);
    Task<TokenResponse?> GetTokenAsync(HttpContext context, CancellationToken ct = default);
}
