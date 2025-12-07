using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.AI.Handlers;

internal static class AudioGenerationHandlers {
    internal static async Task<IResult> GenerateAudioHandler(
        HttpContext context,
        [FromBody] AudioGenerationRequest request,
        [FromServices] IAudioGenerationService service,
        CancellationToken ct = default) {
        var result = await service.GenerateAsync(request, ct);

        return !result.IsSuccessful
            ? Results.Problem(
                detail: result.Errors[0].Message,
                statusCode: StatusCodes.Status400BadRequest,
                title: "Audio generation failed")
            : Results.File(
            result.Value.AudioData,
            result.Value.ContentType,
            fileDownloadName: $"generated_{DateTime.UtcNow:yyyyMMddHHmmss}.ogg");
    }

    internal static async Task<IResult> GetAudioProvidersHandler(
        [FromServices] IAudioGenerationService service,
        CancellationToken ct = default) {
        var providers = await service.GetAvailableProvidersAsync(ct);
        return Results.Ok(providers.Select(p => p.ToString()));
    }
}
