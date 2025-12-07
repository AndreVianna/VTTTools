using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.AI.Handlers;

internal static class VideoGenerationHandlers {
    internal static async Task<IResult> GenerateVideoHandler(
        HttpContext context,
        [FromBody] VideoGenerationRequest request,
        [FromServices] IVideoGenerationService service,
        CancellationToken ct = default) {
        var result = await service.GenerateAsync(request, ct);

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

    internal static async Task<IResult> GetVideoProvidersHandler(
        [FromServices] IVideoGenerationService service,
        CancellationToken ct = default) {
        var providers = await service.GetAvailableProvidersAsync(ct);
        return Results.Ok(providers.Select(p => p.ToString()));
    }
}
