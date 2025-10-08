using IResult = Microsoft.AspNetCore.Http.IResult;
using static VttTools.Utilities.ErrorCollectionExtensions;

namespace VttTools.Assets.Handlers;

internal static class AssetHandlers {
    internal static async Task<IResult> GetAssetsHandler(
        HttpContext context,
        [FromQuery] string? kind,
        [FromQuery] string? creatureCategory,
        [FromQuery] string? search,
        [FromQuery] bool? published,
        [FromQuery] string? owner,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromServices] IAssetService assetService) {

        var userId = context.User.GetUserId();

        // Parse kind filter
        AssetKind? kindFilter = null;
        if (!string.IsNullOrEmpty(kind) && Enum.TryParse<AssetKind>(kind, ignoreCase: true, out var parsedKind)) {
            kindFilter = parsedKind;
        }

        // Parse creature category filter
        CreatureCategory? creatureCategoryFilter = null;
        if (!string.IsNullOrEmpty(creatureCategory) && Enum.TryParse<CreatureCategory>(creatureCategory, ignoreCase: true, out var parsedCategory)) {
            creatureCategoryFilter = parsedCategory;
        }

        // If pagination requested, use paged endpoint
        if (page.HasValue && pageSize.HasValue) {
            var skip = (page.Value - 1) * pageSize.Value;
            var (assets, totalCount) = await assetService.GetAssetsPagedAsync(userId, kindFilter, creatureCategoryFilter, search, published, owner, skip, pageSize.Value);
            return Results.Ok(new {
                data = assets,
                page = page.Value,
                pageSize = pageSize.Value,
                totalCount,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize.Value)
            });
        }

        // No pagination - return all assets
        var allAssets = await assetService.GetAssetsAsync(userId, kindFilter, creatureCategoryFilter, search, published, owner);
        return Results.Ok(allAssets);
    }

    internal static async Task<IResult> GetAssetByIdHandler([FromRoute] Guid id, [FromServices] IAssetService assetService)
        => await assetService.GetAssetByIdAsync(id) is { } asset
               ? Results.Ok(asset)
               : Results.NotFound();

    internal static async Task<IResult> CreateAssetHandler(HttpContext context, [FromBody] CreateAssetRequest request, [FromServices] IAssetService assetService) {
        var userId = context.User.GetUserId();
        var data = new CreateAssetData {
            Kind = request.Kind,
            Name = request.Name,
            Description = request.Description,
            ResourceId = request.ResourceId,
            ObjectProps = request.ObjectProps,
            CreatureProps = request.CreatureProps,
        };
        var result = await assetService.CreateAssetAsync(userId, data);
        return result.IsSuccessful
            ? Results.Created($"/api/assets/{result.Value.Id}", result.Value)
            : result.Errors[0].Message.StartsWith("Duplicate")
                ? Results.Conflict(new { error = result.Errors[0].Message })
                : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> UpdateAssetHandler(HttpContext context, [FromRoute] Guid id, [FromBody] UpdateAssetRequest request, [FromServices] IAssetService assetService) {
        var userId = context.User.GetUserId();
        var data = new UpdateAssetData {
            Name = request.Name,
            Description = request.Description,
            ResourceId = request.ResourceId,
            IsPublished = request.IsPublished,
            IsPublic = request.IsPublic,
            ObjectProps = request.ObjectProps,
            CreatureProps = request.CreatureProps,
        };
        var result = await assetService.UpdateAssetAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.NoContent()  // 204 No Content (UpdatedAt is audit metadata, not side effect)
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> DeleteAssetHandler(HttpContext context, [FromRoute] Guid id, [FromServices] IAssetService assetService) {
        var userId = context.User.GetUserId();
        var result = await assetService.DeleteAssetAsync(userId, id);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }
}