namespace VttTools.Library.EndpointMappers;

internal static class EncounterEndpointsMapper {
    public static void MapEncounterEndpoints(this IEndpointRouteBuilder app) {
        var encounters = app.MapGroup("/api/encounters").RequireAuthorization();

        encounters.MapGet("/{id:guid}", EncounterHandlers.GetEncounterByIdHandler);
        encounters.MapPatch("/{id:guid}", EncounterHandlers.UpdateEncounterHandler);
        encounters.MapDelete("/{id:guid}", EncounterHandlers.DeleteEncounterHandler);
        encounters.MapGet("/{id:guid}/assets", EncounterHandlers.GetAssetsHandler);
        encounters.MapPatch("/{id:guid}/assets", EncounterHandlers.BulkUpdateAssetsHandler);
        encounters.MapPost("/{id:guid}/assets/clone", EncounterHandlers.BulkCloneAssetsHandler);
        encounters.MapDelete("/{id:guid}/assets", EncounterHandlers.BulkDeleteAssetsHandler);
        encounters.MapPost("/{id:guid}/assets", EncounterHandlers.BulkAddAssetsHandler);
        encounters.MapPost("/{id:guid}/assets/{assetId:guid}", EncounterHandlers.AddAssetHandler);
        encounters.MapPost("/{id:guid}/assets/{index:int}/clone", EncounterHandlers.CloneAssetHandler);
        encounters.MapPatch("/{id:guid}/assets/{index:int}", EncounterHandlers.UpdateAssetHandler);
        encounters.MapDelete("/{id:guid}/assets/{index:int}", EncounterHandlers.RemoveAssetHandler);
        encounters.MapPost("/{id:guid}/walls", EncounterHandlers.AddWallHandler);
        encounters.MapPatch("/{id:guid}/walls/{index:int}", EncounterHandlers.UpdateWallHandler);
        encounters.MapDelete("/{id:guid}/walls/{index:int}", EncounterHandlers.RemoveWallHandler);
        encounters.MapPost("/{id:guid}/regions", EncounterHandlers.AddRegionHandler);
        encounters.MapPatch("/{id:guid}/regions/{index:int}", EncounterHandlers.UpdateRegionHandler);
        encounters.MapDelete("/{id:guid}/regions/{index:int}", EncounterHandlers.RemoveRegionHandler);
        encounters.MapPost("/{id:guid}/lights", EncounterHandlers.AddLightSourceHandler);
        encounters.MapPatch("/{id:guid}/lights/{index:int}", EncounterHandlers.UpdateLightSourceHandler);
        encounters.MapDelete("/{id:guid}/lights/{index:int}", EncounterHandlers.RemoveLightSourceHandler);
        encounters.MapPost("/{id:guid}/sounds", EncounterHandlers.AddSoundSourceHandler);
        encounters.MapPatch("/{id:guid}/sounds/{index:int}", EncounterHandlers.UpdateSoundSourceHandler);
        encounters.MapDelete("/{id:guid}/sounds/{index:int}", EncounterHandlers.RemoveSoundSourceHandler);
    }
}