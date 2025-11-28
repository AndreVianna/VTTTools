namespace VttTools.Admin.Handlers;

public static class AssetAdminHandlers {
    public static async Task<IResult> SearchHandler(
        [AsParameters] LibrarySearchRequest request,
        IAssetAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.SearchAssetsAsync(request, ct);
            return Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while searching assets");
        }
    }

    public static async Task<IResult> GetByIdHandler(
        Guid id,
        IAssetAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.GetAssetByIdAsync(id, ct);
            return response is null ? Results.NotFound() : Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while retrieving asset");
        }
    }

    public static async Task<IResult> CreateHandler(
        [FromBody] LibraryAdminHandlers.CreateContentRequest request,
        IAssetAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.CreateAssetAsync(request.Name, request.Description, ct);
            return Results.Created($"/api/admin/library/assets/{response.Id}", response);
        }
        catch (ArgumentException ex) {
            return Results.BadRequest(new { error = ex.Message });
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while creating asset");
        }
    }

    public static async Task<IResult> UpdateHandler(
        Guid id,
        [FromBody] LibraryAdminHandlers.UpdateContentRequest request,
        IAssetAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.UpdateAssetAsync(id, request.Name, request.Description, request.IsPublished, request.IsPublic, ct);
            return Results.Ok(response);
        }
        catch (KeyNotFoundException) {
            return Results.NotFound();
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while updating asset");
        }
    }

    public static async Task<IResult> DeleteHandler(
        Guid id,
        IAssetAdminService service,
        CancellationToken ct) {
        try {
            await service.DeleteAssetAsync(id, ct);
            return Results.NoContent();
        }
        catch (KeyNotFoundException) {
            return Results.NotFound();
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while deleting asset");
        }
    }

    public static async Task<IResult> TransferOwnershipHandler(
        Guid id,
        [FromBody] TransferOwnershipRequest request,
        IAssetAdminService service,
        CancellationToken ct) {
        try {
            await service.TransferAssetOwnershipAsync(id, request, ct);
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
