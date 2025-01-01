namespace IdentityService.Handlers.ApiClient;

internal interface IApiClientHandler {
    Task<string?> GenerateClientTokenAsync(HttpContext context);
}
