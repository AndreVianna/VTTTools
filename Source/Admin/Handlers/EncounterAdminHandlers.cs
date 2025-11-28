namespace VttTools.Admin.Handlers;

public static class EncounterAdminHandlers {
    public static async Task<IResult> SearchHandler(
        [AsParameters] LibrarySearchRequest request,
        IEncounterAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.SearchEncountersAsync(request, ct);
            return Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while searching encounters");
        }
    }

    public static async Task<IResult> GetByIdHandler(
        Guid id,
        IEncounterAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.GetEncounterByIdAsync(id, ct);
            return response is null ? Results.NotFound() : Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while retrieving encounter");
        }
    }

    public static async Task<IResult> CreateHandler(
        [FromBody] LibraryAdminHandlers.CreateContentRequest request,
        IEncounterAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.CreateEncounterAsync(request.Name, request.Description, ct);
            return Results.Created($"/api/admin/library/encounters/{response.Id}", response);
        }
        catch (ArgumentException ex) {
            return Results.BadRequest(new { error = ex.Message });
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while creating encounter");
        }
    }

    public static async Task<IResult> UpdateHandler(
        Guid id,
        [FromBody] LibraryAdminHandlers.UpdateContentRequest request,
        IEncounterAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.UpdateEncounterAsync(id, request.Name, request.Description, request.IsPublished, ct);
            return Results.Ok(response);
        }
        catch (KeyNotFoundException) {
            return Results.NotFound();
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while updating encounter");
        }
    }

    public static async Task<IResult> DeleteHandler(
        Guid id,
        IEncounterAdminService service,
        CancellationToken ct) {
        try {
            await service.DeleteEncounterAsync(id, ct);
            return Results.NoContent();
        }
        catch (KeyNotFoundException) {
            return Results.NotFound();
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while deleting encounter");
        }
    }

    public static async Task<IResult> TransferOwnershipHandler(
        Guid id,
        [FromBody] TransferOwnershipRequest request,
        IEncounterAdminService service,
        CancellationToken ct) {
        try {
            await service.TransferEncounterOwnershipAsync(id, request, ct);
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
}
