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
}
