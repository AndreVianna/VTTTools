namespace VttTools.Admin.Library.EndpointMappers;

public static class EncounterAdminEndpointsMapper {
    public static void MapEncounterEndpoints(this RouteGroupBuilder libraryGroup) {
        var encountersGroup = libraryGroup.MapGroup("/encounters");

        encountersGroup.MapGet("/", EncounterAdminHandlers.SearchHandler)
            .WithName("SearchEncounters")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        encountersGroup.MapGet("/{id:guid}", EncounterAdminHandlers.GetByIdHandler)
            .WithName("GetEncounterById")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        encountersGroup.MapPost("/", EncounterAdminHandlers.CreateHandler)
            .WithName("CreateEncounter")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        encountersGroup.MapPatch("/{id:guid}", EncounterAdminHandlers.UpdateHandler)
            .WithName("UpdateEncounter")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        encountersGroup.MapDelete("/{id:guid}", EncounterAdminHandlers.DeleteHandler)
            .WithName("DeleteEncounter")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        encountersGroup.MapPost("/{id:guid}/transfer", EncounterAdminHandlers.TransferOwnershipHandler)
            .WithName("TransferEncounterOwnership")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));
    }
}