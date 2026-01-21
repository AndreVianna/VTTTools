using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.AI.Handlers;

internal static class VideoGenerationHandlers {
    internal static async Task<IResult> GenerateVideoHandler(
        [FromBody] VideoGenerationRequest request,
        [FromServices] IVideoGenerationService service,
        CancellationToken ct = default) {
        var data = new VideoGenerationData {
            ContentType = request.ContentType,
            Prompt = request.Prompt,
            Provider = request.Provider,
            Model = request.Model,
            Duration = request.Duration,
            AspectRatio = request.AspectRatio,
            ReferenceImage = request.ReferenceImage,
        };

        var result = await service.GenerateAsync(data, ct);

        return !result.IsSuccessful
            ? Results.Problem(
                detail: result.Errors[0].Message,
                statusCode: StatusCodes.Status400BadRequest,
                title: "Video generation failed")
            : Results.File(
            result.Value.VideoData,
            result.Value.ContentType,
            fileDownloadName: $"generated_{DateTime.UtcNow:yyyyMMddHHmmss}.mp4");
    }

    internal static IResult GetVideoProvidersHandler([FromServices] IVideoGenerationService service)
        => Results.Ok(service.GetAvailableProviders());
}