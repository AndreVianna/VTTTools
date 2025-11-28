namespace VttTools.Admin.Handlers;

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
}
