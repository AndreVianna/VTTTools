namespace VttTools.Auth.EndpointMappers;

internal static class RecoveryCodeEndpointsMapper {
    public static void MapRecoveryCodeEndpoints(this IEndpointRouteBuilder app) {
        var group = app.MapGroup("/api/recovery-codes")
            .RequireAuthorization();

        group.MapPost("", RecoveryCodeHandlers.GenerateNewCodesHandler)
            .WithName("GenerateRecoveryCodes")
            .WithSummary("Generate new recovery codes");

        group.MapGet("/status", RecoveryCodeHandlers.GetStatusHandler)
            .WithName("GetRecoveryCodesStatus")
            .WithSummary("Get recovery codes status");
    }
}