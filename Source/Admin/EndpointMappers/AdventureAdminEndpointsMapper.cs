namespace VttTools.Admin.EndpointMappers;

public static class AdventureAdminEndpointsMapper {
    public static void MapAdventureEndpoints(this RouteGroupBuilder libraryGroup) {
        var adventuresGroup = libraryGroup.MapGroup("/adventures");

        adventuresGroup.MapGet("/", AdventureAdminHandlers.SearchHandler)
            .WithName("SearchAdventures")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        adventuresGroup.MapGet("/{id:guid}", AdventureAdminHandlers.GetByIdHandler)
            .WithName("GetAdventureById")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        adventuresGroup.MapPost("/", AdventureAdminHandlers.CreateHandler)
            .WithName("CreateAdventure")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        adventuresGroup.MapPatch("/{id:guid}", AdventureAdminHandlers.UpdateHandler)
            .WithName("UpdateAdventure")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        adventuresGroup.MapDelete("/{id:guid}", AdventureAdminHandlers.DeleteHandler)
            .WithName("DeleteAdventure")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        adventuresGroup.MapPost("/{id:guid}/transfer", AdventureAdminHandlers.TransferOwnershipHandler)
            .WithName("TransferAdventureOwnership")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        adventuresGroup.MapGet("/{id:guid}/encounters", AdventureAdminHandlers.GetEncountersHandler)
            .WithName("GetAdventureEncounters")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        adventuresGroup.MapPost("/{id:guid}/encounters", AdventureAdminHandlers.CreateEncounterHandler)
            .WithName("CreateAdventureEncounter")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        adventuresGroup.MapPost("/{id:guid}/encounters/{encounterId:guid}/clone", AdventureAdminHandlers.CloneEncounterHandler)
            .WithName("CloneAdventureEncounter")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        adventuresGroup.MapDelete("/{id:guid}/encounters/{encounterId:guid}", AdventureAdminHandlers.RemoveEncounterHandler)
            .WithName("RemoveAdventureEncounter")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));
    }
}
