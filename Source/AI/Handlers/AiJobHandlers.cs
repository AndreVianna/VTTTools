using VttTools.Jobs.Services;

using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.AI.Handlers;

public static class AiJobHandlers {
    public static async Task<IResult> StartBulkGenerationHandler(
        HttpContext context,
        [FromBody] BulkAssetGenerationRequest request,
        IImageGenerationService service,
        CancellationToken ct) {
        var userId = context.User.GetUserId();
        var data = new GenerateManyAssetsData {
            Items = [.. request.Items.Select(i => new AssetGenerationData {
                Name = i.Name,
                TemplateId = request.TemplateId,
                GeneratePortrait = request.GeneratePortrait,
                GenerateToken = request.GenerateToken,
                Kind = i.Kind,
                Category = i.Category,
                Type = i.Type,
                Subtype = i.Subtype,
                Size = i.Size,
                Environment = i.Environment,
                Description = i.Description,
                Tags = i.Tags,
            })],
        };

        var result = await service.GenerateManyAsync(userId, data, ct);

        return result.IsSuccessful
            ? Results.Created($"/api/jobs/{result.Value.Id}", result.Value)
            : Results.BadRequest(new { errors = result.Errors.Select(e => e.Message) });
    }

    public static async Task<IResult> CancelJobHandler(
        [FromRoute] Guid id,
        [FromServices] IJobService service,
        CancellationToken ct) {
        var isSuccess = await service.CancelAsync(id, ct);

        return isSuccess
            ? Results.NoContent()
            : Results.NotFound();
    }

    public static async Task<IResult> RetryJobHandler(
        [FromRoute] Guid id,
        [FromServices] IJobService service,
        CancellationToken ct) {
        var isSuccess = await service.RetryAsync(id, ct: ct);

        return isSuccess
            ? Results.NoContent()
            : Results.NotFound();
    }
}
