namespace VttTools.Auth.EndpointMappers;

internal static class SecurityEndpointsMapper {
    public static void MapSecurityEndpoints(this IEndpointRouteBuilder app) {
        var security = app.MapGroup("/api/security")
            .RequireAuthorization();

        security.MapGet("", SecurityHandlers.GetSecuritySettingsHandler)
            .WithName("GetSecuritySettings")
            .WithSummary("Get current user security settings");
    }
}
