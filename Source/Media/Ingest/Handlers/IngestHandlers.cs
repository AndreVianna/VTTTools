using Microsoft.AspNetCore.Http;
using VttTools.Extensions;
using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Media.Ingest.Handlers;

/// <summary>
/// HTTP handlers for ingest operations.
/// </summary>
internal static class IngestHandlers {
    /// <summary>
    /// Start an ingest job to generate AI images for assets.
    /// </summary>
    internal static async Task<IResult> StartIngestHandler(
        HttpContext context,
        [FromBody] StartIngestRequest request,
        [FromServices] IIngestService ingestService,
        CancellationToken ct = default) {
        var userId = context.User.GetUserId();

        var data = new StartIngestData {
            OwnerId = userId,
            Items = request.Items.Select(i => new IngestItemData {
                AssetId = i.AssetId,
                Name = i.Name,
                Kind = i.Kind,
                Category = i.Category,
                Type = i.Type,
                Subtype = i.Subtype,
                Description = i.Description,
                Environment = i.Environment,
                Tags = i.Tags,
                GeneratePortrait = i.GeneratePortrait,
                GenerateToken = i.GenerateToken,
                TemplateId = i.TemplateId,
            }).ToList(),
        };

        var result = await ingestService.StartIngestAsync(data, ct);

        if (!result.IsSuccessful) {
            return Results.Problem(
                detail: string.Join(", ", result.Errors.Select(e => e.Message)),
                statusCode: StatusCodes.Status400BadRequest,
                title: "Failed to start ingest job");
        }

        return Results.Ok(result.Value);
    }
}
