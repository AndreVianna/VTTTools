using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Library.Handlers;

internal static class ContentHandlers {
    internal static async Task<IResult> GetContentHandler(
        HttpContext context,
        [FromQuery] Guid? after,
        [FromQuery] int limit,
        [FromQuery] string? contentType,
        [FromQuery] int? style,
        [FromQuery] bool? isPublished,
        [FromQuery] string? search,
        [FromQuery] string? owner,
        [FromQuery] bool? isOneShot,
        [FromQuery] int? minEncounterCount,
        [FromQuery] int? maxEncounterCount,
        [FromServices] IContentQueryService contentService,
        CancellationToken ct = default) {

        var userId = context.User.GetUserId();

        if (!string.IsNullOrWhiteSpace(search) && search.Length > 100) {
            return Results.BadRequest("Search query too long (max 100 characters)");
        }

        if (limit is < 0 or > 100) {
            return Results.BadRequest("Limit must be between 0 and 100");
        }

        if (after == Guid.Empty) {
            return Results.BadRequest("Invalid cursor");
        }

        var parsedType = contentType?.ToLowerInvariant() switch {
            "adventure" => ContentType.Adventure,
            "campaign" => ContentType.Campaign,
            "world" => ContentType.World,
            _ => (ContentType?)null,
        };

        if (contentType != null && parsedType == null) {
            var validTypes = new[] { "adventure", "campaign", "world" };
            return Results.BadRequest($"Invalid contentType. Must be one of: {string.Join(", ", validTypes)}");
        }

        var filters = new ContentFilters {
            After = after,
            Limit = limit > 0 ? Math.Min(limit, 100) : 20,
            ContentType = parsedType,
            Style = style.HasValue ? (AdventureStyle)style.Value : null,
            IsPublished = isPublished,
            Search = search,
            Owner = owner,
            IsOneShot = isOneShot,
            MinEncounterCount = minEncounterCount,
            MaxEncounterCount = maxEncounterCount,
        };

        var result = await contentService.GetContentAsync(userId, filters, ct);
        return Results.Ok(result);
    }
}