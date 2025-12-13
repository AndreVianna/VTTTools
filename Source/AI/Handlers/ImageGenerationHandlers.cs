using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.AI.Handlers;

internal static class ImageGenerationHandlers {
    internal static async Task<IResult> GenerateImageHandler(
        [FromBody] ImageGenerationRequest request,
        [FromServices] IImageGenerationService service,
        CancellationToken ct = default) {
        var data = new ImageGenerationData {
            Prompt = request.Prompt,
            NegativePrompt = request.NegativePrompt,
            Provider = request.Provider,
            Model = request.Model,
            AspectRatio = request.AspectRatio,
            Width = request.Width,
            Height = request.Height,
            Style = request.Style,
        };

        var result = await service.GenerateAsync(data, ct);

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

    internal static IResult GetImageProvidersHandler([FromServices] IImageGenerationService service)
        => Results.Ok(service.GetAvailableProviders());
}
