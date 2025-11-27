using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VttTools.Domain.Admin.ApiContracts.Library;
using VttTools.Domain.Admin.Services;

namespace VttTools.Admin.Handlers;

public static class LibraryAdminHandlers {
    public sealed record CreateContentRequest {
        public required string Name { get; init; }
        public string Description { get; init; } = string.Empty;
    }

    public sealed record UpdateContentRequest {
        public string? Name { get; init; }
        public string? Description { get; init; }
        public bool? IsPublished { get; init; }
        public bool? IsPublic { get; init; }
    }

    public static async Task<IResult> GetConfigHandler(
        ILibraryAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.GetConfigAsync(ct);
            return Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while retrieving library configuration");
        }
    }

    public static async Task<IResult> SearchWorldsHandler(
        [AsParameters] LibrarySearchRequest request,
        ILibraryAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.SearchWorldsAsync(request, ct);
            return Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while searching worlds");
        }
    }

    public static async Task<IResult> GetWorldByIdHandler(
        Guid id,
        ILibraryAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.GetWorldByIdAsync(id, ct);
            return response is null ? Results.NotFound() : Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while retrieving world");
        }
    }

    public static async Task<IResult> CreateWorldHandler(
        [FromBody] CreateContentRequest request,
        ILibraryAdminService service,
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

    public static async Task<IResult> UpdateWorldHandler(
        Guid id,
        [FromBody] UpdateContentRequest request,
        ILibraryAdminService service,
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

    public static async Task<IResult> DeleteWorldHandler(
        Guid id,
        ILibraryAdminService service,
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

    public static async Task<IResult> TransferWorldOwnershipHandler(
        Guid id,
        [FromBody] TransferOwnershipRequest request,
        ILibraryAdminService service,
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

    public static async Task<IResult> SearchCampaignsHandler(
        [AsParameters] LibrarySearchRequest request,
        ILibraryAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.SearchCampaignsAsync(request, ct);
            return Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while searching campaigns");
        }
    }

    public static async Task<IResult> GetCampaignByIdHandler(
        Guid id,
        ILibraryAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.GetCampaignByIdAsync(id, ct);
            return response is null ? Results.NotFound() : Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while retrieving campaign");
        }
    }

    public static async Task<IResult> CreateCampaignHandler(
        [FromBody] CreateContentRequest request,
        ILibraryAdminService service,
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

    public static async Task<IResult> UpdateCampaignHandler(
        Guid id,
        [FromBody] UpdateContentRequest request,
        ILibraryAdminService service,
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

    public static async Task<IResult> DeleteCampaignHandler(
        Guid id,
        ILibraryAdminService service,
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

    public static async Task<IResult> TransferCampaignOwnershipHandler(
        Guid id,
        [FromBody] TransferOwnershipRequest request,
        ILibraryAdminService service,
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

    public static async Task<IResult> SearchAdventuresHandler(
        [AsParameters] LibrarySearchRequest request,
        ILibraryAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.SearchAdventuresAsync(request, ct);
            return Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while searching adventures");
        }
    }

    public static async Task<IResult> GetAdventureByIdHandler(
        Guid id,
        ILibraryAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.GetAdventureByIdAsync(id, ct);
            return response is null ? Results.NotFound() : Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while retrieving adventure");
        }
    }

    public static async Task<IResult> CreateAdventureHandler(
        [FromBody] CreateContentRequest request,
        ILibraryAdminService service,
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

    public static async Task<IResult> UpdateAdventureHandler(
        Guid id,
        [FromBody] UpdateContentRequest request,
        ILibraryAdminService service,
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

    public static async Task<IResult> DeleteAdventureHandler(
        Guid id,
        ILibraryAdminService service,
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

    public static async Task<IResult> TransferAdventureOwnershipHandler(
        Guid id,
        [FromBody] TransferOwnershipRequest request,
        ILibraryAdminService service,
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

    public static async Task<IResult> SearchEncountersHandler(
        [AsParameters] LibrarySearchRequest request,
        ILibraryAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.SearchEncountersAsync(request, ct);
            return Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while searching encounters");
        }
    }

    public static async Task<IResult> GetEncounterByIdHandler(
        Guid id,
        ILibraryAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.GetEncounterByIdAsync(id, ct);
            return response is null ? Results.NotFound() : Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while retrieving encounter");
        }
    }

    public static async Task<IResult> CreateEncounterHandler(
        [FromBody] CreateContentRequest request,
        ILibraryAdminService service,
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

    public static async Task<IResult> UpdateEncounterHandler(
        Guid id,
        [FromBody] UpdateContentRequest request,
        ILibraryAdminService service,
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

    public static async Task<IResult> DeleteEncounterHandler(
        Guid id,
        ILibraryAdminService service,
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

    public static async Task<IResult> TransferEncounterOwnershipHandler(
        Guid id,
        [FromBody] TransferOwnershipRequest request,
        ILibraryAdminService service,
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

    public static async Task<IResult> SearchAssetsHandler(
        [AsParameters] LibrarySearchRequest request,
        ILibraryAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.SearchAssetsAsync(request, ct);
            return Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while searching assets");
        }
    }

    public static async Task<IResult> GetAssetByIdHandler(
        Guid id,
        ILibraryAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.GetAssetByIdAsync(id, ct);
            return response is null ? Results.NotFound() : Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while retrieving asset");
        }
    }

    public static async Task<IResult> CreateAssetHandler(
        [FromBody] CreateContentRequest request,
        ILibraryAdminService service,
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

    public static async Task<IResult> UpdateAssetHandler(
        Guid id,
        [FromBody] UpdateContentRequest request,
        ILibraryAdminService service,
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

    public static async Task<IResult> DeleteAssetHandler(
        Guid id,
        ILibraryAdminService service,
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

    public static async Task<IResult> TransferAssetOwnershipHandler(
        Guid id,
        [FromBody] TransferOwnershipRequest request,
        ILibraryAdminService service,
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
