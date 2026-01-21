using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Admin.Library.Handlers;

public static class AdventureAdminHandlers {
    public static async Task<IResult> SearchHandler(
        [AsParameters] LibrarySearchRequest request,
        IAdventureAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.SearchAdventuresAsync(request, ct);
            return Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while searching adventures");
        }
    }

    public static async Task<IResult> GetByIdHandler(
        Guid id,
        IAdventureAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.GetAdventureByIdAsync(id, ct);
            return response is null ? Results.NotFound() : Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while retrieving adventure");
        }
    }

    public static async Task<IResult> CreateHandler(
        [FromBody] LibraryAdminHandlers.CreateContentRequest request,
        IAdventureAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.CreateAdventureAsync(request.Name, request.Description, ct);
            return Results.Created($"/api/admin/library/adventures/{response.Id}", response);
        }
        catch (ArgumentException ex) {
            return Results.BadRequest(new { error = ex.Message });
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while creating adventure");
        }
    }

    public static async Task<IResult> UpdateHandler(
        Guid id,
        [FromBody] LibraryAdminHandlers.UpdateContentRequest request,
        IAdventureAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.UpdateAdventureAsync(id, request.Name, request.Description, request.IsPublished, request.IsPublic, ct);
            return Results.Ok(response);
        }
        catch (KeyNotFoundException) {
            return Results.NotFound();
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while updating adventure");
        }
    }

    public static async Task<IResult> DeleteHandler(
        Guid id,
        IAdventureAdminService service,
        CancellationToken ct) {
        try {
            await service.DeleteAdventureAsync(id, ct);
            return Results.NoContent();
        }
        catch (KeyNotFoundException) {
            return Results.NotFound();
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while deleting adventure");
        }
    }

    public static async Task<IResult> TransferOwnershipHandler(
        Guid id,
        [FromBody] TransferOwnershipRequest request,
        IAdventureAdminService service,
        CancellationToken ct) {
        try {
            await service.TransferAdventureOwnershipAsync(id, request, ct);
            return Results.NoContent();
        }
        catch (KeyNotFoundException) {
            return Results.NotFound();
        }
        catch (ArgumentException ex) {
            return Results.BadRequest(new { error = ex.Message });
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while transferring ownership");
        }
    }

    public static async Task<IResult> GetEncountersHandler(
        Guid id,
        IAdventureAdminService service,
        CancellationToken ct) {
        try {
            var encounters = await service.GetEncountersByAdventureIdAsync(id, ct);
            return Results.Ok(encounters);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while retrieving encounters");
        }
    }

    public static async Task<IResult> CreateEncounterHandler(
        Guid id,
        [FromBody] LibraryAdminHandlers.CreateContentRequest request,
        IAdventureAdminService service,
        CancellationToken ct) {
        try {
            var encounter = await service.CreateEncounterForAdventureAsync(id, request.Name, request.Description, ct);
            return Results.Created($"/api/admin/library/adventures/{id}/encounters/{encounter.Id}", encounter);
        }
        catch (KeyNotFoundException) {
            return Results.NotFound();
        }
        catch (ArgumentException ex) {
            return Results.BadRequest(new { error = ex.Message });
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while creating encounter");
        }
    }

    public static async Task<IResult> CloneEncounterHandler(
        Guid id,
        Guid encounterId,
        [FromBody] CloneEncounterRequest? request,
        IAdventureAdminService service,
        CancellationToken ct) {
        try {
            var cloned = await service.CloneEncounterAsync(id, encounterId, request?.Name, ct);
            return Results.Created($"/api/admin/library/adventures/{id}/encounters/{cloned.Id}", cloned);
        }
        catch (KeyNotFoundException) {
            return Results.NotFound();
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while cloning encounter");
        }
    }

    public static async Task<IResult> RemoveEncounterHandler(
        Guid id,
        Guid encounterId,
        IAdventureAdminService service,
        CancellationToken ct) {
        try {
            await service.RemoveEncounterFromAdventureAsync(id, encounterId, ct);
            return Results.NoContent();
        }
        catch (KeyNotFoundException) {
            return Results.NotFound();
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while removing encounter");
        }
    }

    public record CloneEncounterRequest(string? Name);
}