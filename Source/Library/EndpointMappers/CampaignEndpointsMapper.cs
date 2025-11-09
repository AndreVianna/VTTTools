namespace VttTools.Library.EndpointMappers;

internal static class CampaignEndpointsMapper {
    public static void MapCampaignEndpoints(this IEndpointRouteBuilder app) {
        var campaigns = app.MapGroup("/api/campaigns").RequireAuthorization();

        campaigns.MapGet("/", CampaignHandlers.GetCampaignsHandler);
        campaigns.MapPost("/", CampaignHandlers.CreateCampaignHandler);
        campaigns.MapPost("/{id:guid}/clone", CampaignHandlers.CloneCampaignHandler);
        campaigns.MapGet("/{id:guid}", CampaignHandlers.GetCampaignByIdHandler);
        campaigns.MapPatch("/{id:guid}", CampaignHandlers.UpdateCampaignHandler);
        campaigns.MapDelete("/{id:guid}", CampaignHandlers.DeleteCampaignHandler);
        campaigns.MapGet("/{id:guid}/adventures", CampaignHandlers.GetAdventuresHandler);
        campaigns.MapPost("/{id:guid}/adventures", CampaignHandlers.AddNewAdventureHandler);
        campaigns.MapPost("/{id:guid}/adventures/{adventureId:guid}/clone", CampaignHandlers.AddClonedAdventureHandler);
        campaigns.MapDelete("/{id:guid}/adventures/{adventureId:guid}", CampaignHandlers.RemoveAdventureHandler);
    }
}
