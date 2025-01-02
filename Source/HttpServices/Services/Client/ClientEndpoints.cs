using IResult = Microsoft.AspNetCore.Http.IResult;

namespace HttpServices.Services.Client;

internal static class ClientEndpoints {
    public static void MapClientEndpoints(this WebApplication app)
        => app.MapPost("/clients", RegisterAsync);

    public static async Task<IResult> RegisterAsync(IClientService service, RegisterClientRequest request) {
        var result = await service.RegisterAsync(request);
        return Results.Created($"/clients/{result.Value.ClientId}", result);
    }
}