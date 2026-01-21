using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Admin.Configuration.Handlers;

public static class ConfigurationHandlers {
    public static async Task<IResult> GetConfigurationHandler(
        string serviceName,
        IConfigurationService configService,
        CancellationToken ct) {

        var response = await configService.GetServiceConfigurationAsync(serviceName, ct);
        return Results.Ok(response);
    }

    public static async Task<IResult> RevealConfigValueHandler(
        RevealConfigValueRequest request,
        ClaimsPrincipal user,
        IConfigurationService configService,
        CancellationToken ct) {

        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var userId)) {
            return Results.Unauthorized();
        }

        try {
            var value = await configService.RevealConfigValueAsync(
                userId,
                request.ServiceName,
                request.Key,
                request.TotpCode,
                ct);

            return Results.Ok(new RevealConfigValueResponse {
                Value = value,
                RevealedAt = DateTime.UtcNow
            });
        }
        catch (UnauthorizedAccessException ex) {
            return Results.Problem(ex.Message, statusCode: 401);
        }
        catch (KeyNotFoundException ex) {
            return Results.Problem(ex.Message, statusCode: 404);
        }
        catch (NotSupportedException ex) {
            return Results.Problem(ex.Message, statusCode: 400);
        }
    }
}