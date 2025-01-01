namespace ApiService.Handlers.Token;

internal interface ITokenHandler {
    Task<string?> GenerateClientTokenAsync(HttpContext context);
}
