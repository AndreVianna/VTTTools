namespace AuthService.Handlers.ApiClient;

internal interface IApiClientHandler {
    Task<string?> GenerateTokenAsync(HttpContext context);
}
