using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.AI.Handlers;

public static class AiJobHandlers {
    public static async Task<IResult> StartBulkGenerationHandler(
        [FromBody] BulkAssetGenerationRequest request,
        IAiJobOrchestrationService service,
        CancellationToken ct) {
        var data = new BulkAssetGenerationData {
            Items = [.. request.Items.Select(i => new BulkAssetGenerationItemData {
                Name = i.Name,
                Kind = i.Kind,
                Category = i.Category,
                Type = i.Type,
                Subtype = i.Subtype,
                Size = i.Size,
                Environment = i.Environment,
                Description = i.Description,
                Tags = i.Tags
            })],
            TemplateId = request.TemplateId,
            GeneratePortrait = request.GeneratePortrait,
            GenerateToken = request.GenerateToken
        };

        var result = await service.StartBulkAssetGenerationAsync(data, ct);

        return result.IsSuccessful
            ? Results.Created($"/api/jobs/{result.Value.Id}", result.Value)
            : Results.BadRequest(new { errors = result.Errors.Select(e => e.Message) });
    }

    public static async Task<IResult> CancelJobHandler(
        [FromRoute] Guid id,
        IAiJobOrchestrationService service,
        CancellationToken ct) {
        var result = await service.CancelJobAsync(id, ct);

        return result.IsSuccessful
            ? Results.NoContent()
            : Results.NotFound(new { errors = result.Errors.Select(e => e.Message) });
    }

    public static async Task<IResult> RetryJobHandler(
        [FromRoute] Guid id,
        IAiJobOrchestrationService service,
        CancellationToken ct) {
        var result = await service.RetryFailedItemsAsync(id, ct: ct);

        return result.IsSuccessful
            ? Results.Ok(result.Value)
            : Results.NotFound(new { errors = result.Errors.Select(e => e.Message) });
    }
}
