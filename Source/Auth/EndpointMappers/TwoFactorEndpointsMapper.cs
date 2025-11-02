namespace VttTools.Auth.EndpointMappers;

internal static class TwoFactorEndpointsMapper {
    public static void MapTwoFactorEndpoints(this IEndpointRouteBuilder app) {
        var twoFactor = app.MapGroup("/api/two-factor")
            .RequireAuthorization();

        twoFactor.MapPost("/setup", TwoFactorHandlers.InitiateSetupHandler)
            .WithName("InitiateTwoFactorSetup")
            .WithSummary("Initiate two-factor authentication setup");

        twoFactor.MapPut("/setup", TwoFactorHandlers.VerifySetupHandler)
            .WithName("VerifyTwoFactorSetup")
            .WithSummary("Verify and complete two-factor authentication setup");

        twoFactor.MapDelete("", TwoFactorHandlers.DisableTwoFactorHandler)
            .WithName("DisableTwoFactor")
            .WithSummary("Disable two-factor authentication");
    }
}