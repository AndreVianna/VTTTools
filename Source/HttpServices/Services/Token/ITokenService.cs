namespace HttpServices.Services.Token;

internal interface ITokenService {
    Task<string?> GenerateClientTokenAsync(HttpContext context);
}
