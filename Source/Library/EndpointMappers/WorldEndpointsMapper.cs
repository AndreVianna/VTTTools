namespace VttTools.Library.EndpointMappers;

internal static class WorldEndpointsMapper {
    public static void MapWorldEndpoints(this IEndpointRouteBuilder app) {
        var worlds = app.MapGroup("/api/worlds").RequireAuthorization();

        worlds.MapGet("/", WorldHandlers.GetWorldsHandler);
        worlds.MapPost("/", WorldHandlers.CreateWorldHandler);
        worlds.MapPost("/{id:guid}/clone", WorldHandlers.CloneWorldHandler);
        worlds.MapGet("/{id:guid}", WorldHandlers.GetWorldByIdHandler);
        worlds.MapPatch("/{id:guid}", WorldHandlers.UpdateWorldHandler);
        worlds.MapDelete("/{id:guid}", WorldHandlers.DeleteWorldHandler);
        worlds.MapGet("/{id:guid}/campaigns", WorldHandlers.GetCampaignsHandler);
        worlds.MapPost("/{id:guid}/campaigns", WorldHandlers.AddNewCampaignHandler);
        worlds.MapPost("/{id:guid}/campaigns/{campaignId:guid}/clone", WorldHandlers.AddClonedCampaignHandler);
        worlds.MapDelete("/{id:guid}/campaigns/{campaignId:guid}", WorldHandlers.RemoveCampaignHandler);
    }
}