namespace VttTools.Admin.Handlers;

public static class CampaignAdminHandlers {
    public static async Task<IResult> SearchHandler(
        [AsParameters] LibrarySearchRequest request,
        ICampaignAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.SearchCampaignsAsync(request, ct);
            return Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while searching campaigns");
        }
    }

    public static async Task<IResult> GetByIdHandler(
        Guid id,
        ICampaignAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.GetCampaignByIdAsync(id, ct);
            return response is null ? Results.NotFound() : Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while retrieving campaign");
        }
    }

    public static async Task<IResult> CreateHandler(
        [FromBody] LibraryAdminHandlers.CreateContentRequest request,
        ICampaignAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.CreateCampaignAsync(request.Name, request.Description, ct);
            return Results.Created($"/api/admin/library/campaigns/{response.Id}", response);
        }
        catch (ArgumentException ex) {
            return Results.BadRequest(new { error = ex.Message });
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while creating campaign");
        }
    }

    public static async Task<IResult> UpdateHandler(
        Guid id,
        [FromBody] LibraryAdminHandlers.UpdateContentRequest request,
        ICampaignAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.UpdateCampaignAsync(id, request.Name, request.Description, request.IsPublished, request.IsPublic, ct);
            return Results.Ok(response);
        }
        catch (KeyNotFoundException) {
            return Results.NotFound();
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while updating campaign");
        }
    }

    public static async Task<IResult> DeleteHandler(
        Guid id,
        ICampaignAdminService service,
        CancellationToken ct) {
        try {
            await service.DeleteCampaignAsync(id, ct);
            return Results.NoContent();
        }
        catch (KeyNotFoundException) {
            return Results.NotFound();
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while deleting campaign");
        }
    }

    public static async Task<IResult> TransferOwnershipHandler(
        Guid id,
        [FromBody] TransferOwnershipRequest request,
        ICampaignAdminService service,
        CancellationToken ct) {
        try {
            await service.TransferCampaignOwnershipAsync(id, request, ct);
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

    public static async Task<IResult> GetAdventuresHandler(
        Guid id,
        ICampaignAdminService service,
        CancellationToken ct) {
        try {
            var adventures = await service.GetAdventuresByCampaignIdAsync(id, ct);
            return Results.Ok(adventures);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while retrieving adventures");
        }
    }

    public static async Task<IResult> CreateAdventureHandler(
        Guid id,
        [FromBody] LibraryAdminHandlers.CreateContentRequest request,
        ICampaignAdminService service,
        CancellationToken ct) {
        try {
            var adventure = await service.CreateAdventureForCampaignAsync(id, request.Name, request.Description, ct);
            return Results.Created($"/api/admin/library/campaigns/{id}/adventures/{adventure.Id}", adventure);
        }
        catch (KeyNotFoundException) {
            return Results.NotFound();
        }
        catch (ArgumentException ex) {
            return Results.BadRequest(new { error = ex.Message });
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while creating adventure");
        }
    }

    public static async Task<IResult> CloneAdventureHandler(
        Guid id,
        Guid adventureId,
        [FromBody] CloneAdventureRequest? request,
        ICampaignAdminService service,
        CancellationToken ct) {
        try {
            var cloned = await service.CloneAdventureAsync(id, adventureId, request?.Name, ct);
            return Results.Created($"/api/admin/library/campaigns/{id}/adventures/{cloned.Id}", cloned);
        }
        catch (KeyNotFoundException) {
            return Results.NotFound();
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while cloning adventure");
        }
    }

    public static async Task<IResult> RemoveAdventureHandler(
        Guid id,
        Guid adventureId,
        ICampaignAdminService service,
        CancellationToken ct) {
        try {
            await service.RemoveAdventureFromCampaignAsync(id, adventureId, ct);
            return Results.NoContent();
        }
        catch (KeyNotFoundException) {
            return Results.NotFound();
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while removing adventure");
        }
    }

    public record CloneAdventureRequest(string? Name);
}
