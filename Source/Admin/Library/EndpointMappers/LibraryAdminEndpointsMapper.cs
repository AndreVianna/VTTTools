namespace VttTools.Admin.Library.EndpointMappers;

public static class LibraryAdminEndpointsMapper {
    public static IEndpointRouteBuilder MapLibraryAdminEndpoints(this IEndpointRouteBuilder app) {
        var libraryGroup = app.MapGroup("/api/admin/library")
            .RequireRateLimiting("read");

        libraryGroup.MapGet("/config", LibraryAdminHandlers.GetConfigHandler)
            .WithName("GetLibraryConfig")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        libraryGroup.MapWorldEndpoints();
        libraryGroup.MapCampaignEndpoints();
        libraryGroup.MapAdventureEndpoints();
        libraryGroup.MapEncounterEndpoints();
        libraryGroup.MapAssetEndpoints();

        return app;
    }
}