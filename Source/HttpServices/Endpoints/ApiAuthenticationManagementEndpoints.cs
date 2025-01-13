using Microsoft.AspNetCore.Mvc;

using IResult = Microsoft.AspNetCore.Http.IResult;

// ReSharper disable once CheckNamespace
namespace Microsoft.AspNetCore.Routing;

internal static class ApiAuthenticationManagementEndpoints {
    public static async Task<IResult> GenerateTokenAsync(HttpContext context, [FromServices] ITokenService service, [FromBody] NewTokenRequest request, CancellationToken ct = default) {
        var response = await service.GenerateTokenAsync(context, request, ct);
        return response is null
            ? Results.Unauthorized()
            : Results.Ok(response);
    }

    public static async Task<IResult> GetTokenAsync(HttpContext context, [FromServices] ITokenService service, CancellationToken ct = default) {
        var response = await service.GetTokenAsync(context, ct);
        return response is null
            ? Results.NotFound()
            : Results.Ok(response);
    }

    public static async Task<IResult> RegisterAsync([FromServices] IClientService service, [FromBody] RegisterClientRequest request, CancellationToken ct = default) {
        var response = await service.RegisterAsync(request, ct);
        return Results.Ok(response);
    }
}
