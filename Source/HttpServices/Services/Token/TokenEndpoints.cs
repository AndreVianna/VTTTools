using IResult = Microsoft.AspNetCore.Http.IResult;

namespace HttpServices.Services.Token;

internal static class TokenEndpoints {
    public static void MapTokenEndpoints(this WebApplication app)
        => app.MapPost("/tokens", GenerateAsync);

    public static async Task<IResult> GenerateAsync(ITokenService service, HttpContext context) {
        var token = await service.GenerateClientTokenAsync(context);
        return token is null
            ? Results.Unauthorized()
            : Results.Ok(token);
    }
}