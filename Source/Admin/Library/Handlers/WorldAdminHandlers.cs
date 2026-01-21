using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Admin.Library.Handlers;

public static class WorldAdminHandlers {
    public static async Task<IResult> SearchHandler(
        [AsParameters] LibrarySearchRequest request,
        IWorldAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.SearchWorldsAsync(request, ct);
            return Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while searching worlds");
        }
    }

    public static async Task<IResult> GetByIdHandler(
        Guid id,
        IWorldAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.GetWorldByIdAsync(id, ct);
            return response is null ? Results.NotFound() : Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while retrieving world");
        }
    }

    public static async Task<IResult> CreateHandler(
        [FromBody] LibraryAdminHandlers.CreateContentRequest request,
        IWorldAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.CreateWorldAsync(request.Name, request.Description, ct);
            return Results.Created($"/api/admin/library/worlds/{response.Id}", response);
        }
        catch (ArgumentException ex) {
            return Results.BadRequest(new { error = ex.Message });
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while creating world");
        }
    }

    public static async Task<IResult> UpdateHandler(
        Guid id,
        [FromBody] LibraryAdminHandlers.UpdateContentRequest request,
        IWorldAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.UpdateWorldAsync(id, request.Name, request.Description, request.IsPublished, request.IsPublic, ct);
            return Results.Ok(response);
        }
        catch (KeyNotFoundException) {
            return Results.NotFound();
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while updating world");
        }
    }

    public static async Task<IResult> DeleteHandler(
        Guid id,
        IWorldAdminService service,
        CancellationToken ct) {
        try {
            await service.DeleteWorldAsync(id, ct);
            return Results.NoContent();
        }
        catch (KeyNotFoundException) {
            return Results.NotFound();
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while deleting world");
        }
    }

    public static async Task<IResult> TransferOwnershipHandler(
        Guid id,
        [FromBody] TransferOwnershipRequest request,
        IWorldAdminService service,
        CancellationToken ct) {
        try {
            await service.TransferWorldOwnershipAsync(id, request, ct);
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

    public static async Task<IResult> GetCampaignsHandler(
        Guid id,
        IWorldAdminService service,
        CancellationToken ct) {
        try {
            var campaigns = await service.GetCampaignsByWorldIdAsync(id, ct);
            return Results.Ok(campaigns);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while retrieving campaigns");
        }
    }

    public static async Task<IResult> CreateCampaignHandler(
        Guid id,
        [FromBody] LibraryAdminHandlers.CreateContentRequest request,
        IWorldAdminService service,
        CancellationToken ct) {
        try {
            var campaign = await service.CreateCampaignForWorldAsync(id, request.Name, request.Description, ct);
            return Results.Created($"/api/admin/library/worlds/{id}/campaigns/{campaign.Id}", campaign);
        }
        catch (KeyNotFoundException) {
            return Results.NotFound();
        }
        catch (ArgumentException ex) {
            return Results.BadRequest(new { error = ex.Message });
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while creating campaign");
        }
    }

    public static async Task<IResult> CloneCampaignHandler(
        Guid id,
        Guid campaignId,
        [FromBody] CloneCampaignRequest? request,
        IWorldAdminService service,
        CancellationToken ct) {
        try {
            var cloned = await service.CloneCampaignAsync(id, campaignId, request?.Name, ct);
            return Results.Created($"/api/admin/library/worlds/{id}/campaigns/{cloned.Id}", cloned);
        }
        catch (KeyNotFoundException) {
            return Results.NotFound();
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while cloning campaign");
        }
    }

    public static async Task<IResult> RemoveCampaignHandler(
        Guid id,
        Guid campaignId,
        IWorldAdminService service,
        CancellationToken ct) {
        try {
            await service.RemoveCampaignFromWorldAsync(id, campaignId, ct);
            return Results.NoContent();
        }
        catch (KeyNotFoundException) {
            return Results.NotFound();
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while removing campaign");
        }
    }

    public record CloneCampaignRequest(string? Name);
}