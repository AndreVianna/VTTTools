using VttTools.Admin.Handlers;

namespace VttTools.Admin.EndpointMappers;

public static class LibraryAdminEndpointsMapper {
    public static IEndpointRouteBuilder MapLibraryAdminEndpoints(this IEndpointRouteBuilder app) {
        var libraryGroup = app.MapGroup("/api/admin/library")
            .RequireRateLimiting("admin");

        libraryGroup.MapGet("/config", LibraryAdminHandlers.GetConfigHandler)
            .WithName("GetLibraryConfig")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        MapWorldEndpoints(libraryGroup);
        MapCampaignEndpoints(libraryGroup);
        MapAdventureEndpoints(libraryGroup);
        MapEncounterEndpoints(libraryGroup);
        MapAssetEndpoints(libraryGroup);

        return app;
    }

    private static void MapWorldEndpoints(RouteGroupBuilder libraryGroup) {
        var worldsGroup = libraryGroup.MapGroup("/worlds");

        worldsGroup.MapGet("/", LibraryAdminHandlers.SearchWorldsHandler)
            .WithName("SearchWorlds")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        worldsGroup.MapGet("/{id:guid}", LibraryAdminHandlers.GetWorldByIdHandler)
            .WithName("GetWorldById")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        worldsGroup.MapPost("/", LibraryAdminHandlers.CreateWorldHandler)
            .WithName("CreateWorld")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        worldsGroup.MapPatch("/{id:guid}", LibraryAdminHandlers.UpdateWorldHandler)
            .WithName("UpdateWorld")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        worldsGroup.MapDelete("/{id:guid}", LibraryAdminHandlers.DeleteWorldHandler)
            .WithName("DeleteWorld")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        worldsGroup.MapPost("/{id:guid}/transfer", LibraryAdminHandlers.TransferWorldOwnershipHandler)
            .WithName("TransferWorldOwnership")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));
    }

    private static void MapCampaignEndpoints(RouteGroupBuilder libraryGroup) {
        var campaignsGroup = libraryGroup.MapGroup("/campaigns");

        campaignsGroup.MapGet("/", LibraryAdminHandlers.SearchCampaignsHandler)
            .WithName("SearchCampaigns")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        campaignsGroup.MapGet("/{id:guid}", LibraryAdminHandlers.GetCampaignByIdHandler)
            .WithName("GetCampaignById")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        campaignsGroup.MapPost("/", LibraryAdminHandlers.CreateCampaignHandler)
            .WithName("CreateCampaign")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        campaignsGroup.MapPatch("/{id:guid}", LibraryAdminHandlers.UpdateCampaignHandler)
            .WithName("UpdateCampaign")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        campaignsGroup.MapDelete("/{id:guid}", LibraryAdminHandlers.DeleteCampaignHandler)
            .WithName("DeleteCampaign")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        campaignsGroup.MapPost("/{id:guid}/transfer", LibraryAdminHandlers.TransferCampaignOwnershipHandler)
            .WithName("TransferCampaignOwnership")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));
    }

    private static void MapAdventureEndpoints(RouteGroupBuilder libraryGroup) {
        var adventuresGroup = libraryGroup.MapGroup("/adventures");

        adventuresGroup.MapGet("/", LibraryAdminHandlers.SearchAdventuresHandler)
            .WithName("SearchAdventures")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        adventuresGroup.MapGet("/{id:guid}", LibraryAdminHandlers.GetAdventureByIdHandler)
            .WithName("GetAdventureById")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        adventuresGroup.MapPost("/", LibraryAdminHandlers.CreateAdventureHandler)
            .WithName("CreateAdventure")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        adventuresGroup.MapPatch("/{id:guid}", LibraryAdminHandlers.UpdateAdventureHandler)
            .WithName("UpdateAdventure")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        adventuresGroup.MapDelete("/{id:guid}", LibraryAdminHandlers.DeleteAdventureHandler)
            .WithName("DeleteAdventure")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        adventuresGroup.MapPost("/{id:guid}/transfer", LibraryAdminHandlers.TransferAdventureOwnershipHandler)
            .WithName("TransferAdventureOwnership")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));
    }

    private static void MapEncounterEndpoints(RouteGroupBuilder libraryGroup) {
        var encountersGroup = libraryGroup.MapGroup("/encounters");

        encountersGroup.MapGet("/", LibraryAdminHandlers.SearchEncountersHandler)
            .WithName("SearchEncounters")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        encountersGroup.MapGet("/{id:guid}", LibraryAdminHandlers.GetEncounterByIdHandler)
            .WithName("GetEncounterById")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        encountersGroup.MapPost("/", LibraryAdminHandlers.CreateEncounterHandler)
            .WithName("CreateEncounter")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        encountersGroup.MapPatch("/{id:guid}", LibraryAdminHandlers.UpdateEncounterHandler)
            .WithName("UpdateEncounter")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        encountersGroup.MapDelete("/{id:guid}", LibraryAdminHandlers.DeleteEncounterHandler)
            .WithName("DeleteEncounter")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        encountersGroup.MapPost("/{id:guid}/transfer", LibraryAdminHandlers.TransferEncounterOwnershipHandler)
            .WithName("TransferEncounterOwnership")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));
    }

    private static void MapAssetEndpoints(RouteGroupBuilder libraryGroup) {
        var assetsGroup = libraryGroup.MapGroup("/assets");

        assetsGroup.MapGet("/", LibraryAdminHandlers.SearchAssetsHandler)
            .WithName("SearchAssets")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        assetsGroup.MapGet("/{id:guid}", LibraryAdminHandlers.GetAssetByIdHandler)
            .WithName("GetAssetById")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        assetsGroup.MapPost("/", LibraryAdminHandlers.CreateAssetHandler)
            .WithName("CreateAsset")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        assetsGroup.MapPatch("/{id:guid}", LibraryAdminHandlers.UpdateAssetHandler)
            .WithName("UpdateAsset")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        assetsGroup.MapDelete("/{id:guid}", LibraryAdminHandlers.DeleteAssetHandler)
            .WithName("DeleteAsset")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        assetsGroup.MapPost("/{id:guid}/transfer", LibraryAdminHandlers.TransferAssetOwnershipHandler)
            .WithName("TransferAssetOwnership")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));
    }
}
