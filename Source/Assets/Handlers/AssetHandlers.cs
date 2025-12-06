using static VttTools.Utilities.ErrorCollectionExtensions;

using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Assets.Handlers;

internal static class AssetHandlers {
    internal static async Task<IResult> GetAssetsHandler(
        HttpContext context,
        [FromQuery] string? availability,
        [FromQuery] string? kind,
        [FromQuery] string? category,
        [FromQuery] string? type,
        [FromQuery] string? subtype,
        [FromQuery] string? search,
        [FromQuery] string[]? filter,
        [FromQuery] int? pageIndex,
        [FromQuery] int? pageSize,
        [FromServices] IAssetService assetService) {
        var cts = new CancellationTokenSource();

        var userId = context.User.GetUserId();

        var kindFilter = Enum.TryParse<AssetKind>(kind, ignoreCase: true, out var parsedKind)
            ? parsedKind
            : (AssetKind?)null;

        var availabilityFilter = Enum.TryParse<Availability>(availability, ignoreCase: true, out var parsedAvailability)
            ? parsedAvailability
            : (Availability?)null;

        var advancedFilter = filter is null ? [] : AdvancedSearchFilter.Parse(filter);

        var pagination = pageIndex.HasValue && pageSize.HasValue && pageIndex.Value >= 0 && pageSize.Value >= 1
            ? new Pagination(pageIndex.Value, pageSize.Value)
            : null;

        var (assets, totalCount) = await assetService.SearchAssetsAsync(userId, availabilityFilter, kindFilter, category, type, subtype, search, advancedFilter, pagination, cts.Token);

        return Results.Ok(new {
            data = assets,
            page = pagination?.Index ?? 0,
            pageSize = pagination?.Size ?? assets.Length,
            totalCount,
            totalPages = pagination is null ? 1 : (int)Math.Ceiling((double)totalCount / pagination.Size),
        });
    }

    internal static async Task<IResult> GetAssetByIdHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromServices] IAssetService assetService) {
        var cts = new CancellationTokenSource();

        var userId = context.User.GetUserId();
        var asset = await assetService.GetAssetByIdAsync(userId, id, cts.Token);

        if (asset == null)
            return Results.NotFound();

        if (asset.OwnerId != userId && !(asset.IsPublic && asset.IsPublished))
            return Results.Forbid();

        asset = asset with { Tokens = [.. asset.Tokens.Where(v => v.OwnerId == userId || (v.IsPublic && v.IsPublished))] };

        return Results.Ok(asset);
    }

    internal static async Task<IResult> CreateAssetHandler(HttpContext context, [FromBody] CreateAssetRequest request, [FromServices] IAssetService assetService) {
        var userId = context.User.GetUserId();
        var data = new CreateAssetData {
            Kind = request.Kind,
            Category = request.Category,
            Type = request.Type,
            Subtype = request.Subtype,
            Name = request.Name,
            Description = request.Description,
            PortraitId = request.PortraitId,
            TokenSize = request.TokenSize,
            TokenId = request.TokenId,
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
            Kind = request.Kind,
            Category = request.Category,
            Type = request.Type,
            Subtype = request.Subtype,
            Name = request.Name,
            Description = request.Description,
            PortraitId = request.PortraitId,
            TokenSize = request.TokenSize,
            IsPublished = request.IsPublished,
            IsPublic = request.IsPublic,
        };

        var result = await assetService.UpdateAssetAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.NoContent()
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