namespace VttTools.Admin.EndpointMappers;

public static class WorldAdminEndpointsMapper {
    public static void MapWorldEndpoints(this RouteGroupBuilder libraryGroup) {
        var worldsGroup = libraryGroup.MapGroup("/worlds");

        worldsGroup.MapGet("/", WorldAdminHandlers.SearchHandler)
            .WithName("SearchWorlds")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        worldsGroup.MapGet("/{id:guid}", WorldAdminHandlers.GetByIdHandler)
            .WithName("GetWorldById")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        worldsGroup.MapPost("/", WorldAdminHandlers.CreateHandler)
            .WithName("CreateWorld")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        worldsGroup.MapPatch("/{id:guid}", WorldAdminHandlers.UpdateHandler)
            .WithName("UpdateWorld")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        worldsGroup.MapDelete("/{id:guid}", WorldAdminHandlers.DeleteHandler)
            .WithName("DeleteWorld")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        worldsGroup.MapPost("/{id:guid}/transfer", WorldAdminHandlers.TransferOwnershipHandler)
            .WithName("TransferWorldOwnership")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        worldsGroup.MapGet("/{id:guid}/campaigns", WorldAdminHandlers.GetCampaignsHandler)
            .WithName("GetWorldCampaigns")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        worldsGroup.MapPost("/{id:guid}/campaigns", WorldAdminHandlers.CreateCampaignHandler)
            .WithName("CreateWorldCampaign")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        worldsGroup.MapPost("/{id:guid}/campaigns/{campaignId:guid}/clone", WorldAdminHandlers.CloneCampaignHandler)
            .WithName("CloneWorldCampaign")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        worldsGroup.MapDelete("/{id:guid}/campaigns/{campaignId:guid}", WorldAdminHandlers.RemoveCampaignHandler)
            .WithName("RemoveWorldCampaign")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));
    }
}
