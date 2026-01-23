using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.AI.Handlers;

internal static class ImageGenerationHandlers {
    internal static async Task<IResult> GenerateImageHandler(
        [FromBody] ImageGenerationRequest request,
        [FromServices] IImageGenerationService service,
        CancellationToken ct = default) {
        var data = new ImageGenerationData {
            ContentType = request.ContentType,
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
                title: "DefaultDisplay generation failed")
            : Results.File(
            result.Value.ImageData,
            result.Value.ContentType,
            fileDownloadName: $"generated_{DateTime.UtcNow:yyyyMMddHHmmss}.png");
    }

    /// <summary>
    /// Generate raw image bytes without side effects.
    /// Used for service-to-service calls where the caller handles storage.
    /// </summary>
    internal static async Task<IResult> GenerateImageBytesHandler(
        [FromBody] GenerateImageBytesRequest request,
        [FromServices] IImageGenerationService service,
        CancellationToken ct = default) {
        var data = new ImageGenerationData {
            ContentType = request.ContentType,
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

        if (!result.IsSuccessful) {
            return Results.Problem(
                detail: result.Errors[0].Message,
                statusCode: StatusCodes.Status400BadRequest,
                title: "Image generation failed");
        }

        var response = new GenerateImageBytesResponse {
            ImageDataBase64 = Convert.ToBase64String(result.Value.ImageData),
            ContentType = result.Value.ContentType,
            Width = request.Width ?? 1024,
            Height = request.Height ?? 1024,
            InputTokens = result.Value.InputTokens,
            OutputTokens = result.Value.OutputTokens,
            Cost = result.Value.Cost,
            Elapsed = result.Value.Elapsed,
        };

        return Results.Ok(response);
    }

    internal static IResult GetImageProvidersHandler([FromServices] IImageGenerationService service)
        => Results.Ok(service.GetAvailableProviders());
}