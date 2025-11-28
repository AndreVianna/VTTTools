namespace VttTools.Admin.EndpointMappers;

public static class CampaignAdminEndpointsMapper {
    public static void MapCampaignEndpoints(this RouteGroupBuilder libraryGroup) {
        var campaignsGroup = libraryGroup.MapGroup("/campaigns");

        campaignsGroup.MapGet("/", CampaignAdminHandlers.SearchHandler)
            .WithName("SearchCampaigns")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        campaignsGroup.MapGet("/{id:guid}", CampaignAdminHandlers.GetByIdHandler)
            .WithName("GetCampaignById")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        campaignsGroup.MapPost("/", CampaignAdminHandlers.CreateHandler)
            .WithName("CreateCampaign")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        campaignsGroup.MapPatch("/{id:guid}", CampaignAdminHandlers.UpdateHandler)
            .WithName("UpdateCampaign")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        campaignsGroup.MapDelete("/{id:guid}", CampaignAdminHandlers.DeleteHandler)
            .WithName("DeleteCampaign")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        campaignsGroup.MapPost("/{id:guid}/transfer", CampaignAdminHandlers.TransferOwnershipHandler)
            .WithName("TransferCampaignOwnership")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));
    }
}
