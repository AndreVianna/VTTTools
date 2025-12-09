using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.AI.Handlers;

internal static class ImageGenerationHandlers {
    internal static async Task<IResult> GenerateImageHandler(
        [FromBody] ImageGenerationRequest request,
        [FromServices] IImageGenerationService service,
        CancellationToken ct = default) {
        var result = await service.GenerateAsync(request, ct);

        return !result.IsSuccessful
            ? Results.Problem(
                detail: result.Errors[0].Message,
                statusCode: StatusCodes.Status400BadRequest,
                title: "Image generation failed")
            : Results.File(
            result.Value.ImageData,
            result.Value.ContentType,
            fileDownloadName: $"generated_{DateTime.UtcNow:yyyyMMddHHmmss}.png");
    }

    internal static async Task<IResult> GetImageProvidersHandler(
        [FromServices] IImageGenerationService service,
        CancellationToken ct = default) {
        var providers = await service.GetAvailableProvidersAsync(ct);
        return Results.Ok(providers.Select(p => p.ToString()));
    }
}
