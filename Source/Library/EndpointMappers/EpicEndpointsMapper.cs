namespace VttTools.Library.EndpointMappers;

internal static class EpicEndpointsMapper {
    public static void MapEpicEndpoints(this IEndpointRouteBuilder app) {
        var epics = app.MapGroup("/api/epics").RequireAuthorization();

        epics.MapGet("/", EpicHandlers.GetEpicsHandler);
        epics.MapPost("/", EpicHandlers.CreateEpicHandler);
        epics.MapPost("/{id:guid}/clone", EpicHandlers.CloneEpicHandler);
        epics.MapGet("/{id:guid}", EpicHandlers.GetEpicByIdHandler);
        epics.MapPatch("/{id:guid}", EpicHandlers.UpdateEpicHandler);
        epics.MapDelete("/{id:guid}", EpicHandlers.DeleteEpicHandler);
        epics.MapGet("/{id:guid}/campaigns", EpicHandlers.GetCampaignsHandler);
        epics.MapPost("/{id:guid}/campaigns", EpicHandlers.AddNewCampaignHandler);
        epics.MapPost("/{id:guid}/campaigns/{campaignId:guid}/clone", EpicHandlers.AddClonedCampaignHandler);
        epics.MapDelete("/{id:guid}/campaigns/{campaignId:guid}", EpicHandlers.RemoveCampaignHandler);
    }
}
