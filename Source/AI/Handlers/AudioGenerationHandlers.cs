using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.AI.Handlers;

internal static class AudioGenerationHandlers {
    internal static async Task<IResult> GenerateAudioHandler(
        [FromBody] AudioGenerationRequest request,
        [FromServices] IAudioGenerationService service,
        CancellationToken ct = default) {
        var data = new AudioGenerationData {
            Prompt = request.Prompt,
            Provider = request.Provider,
            Model = request.Model,
            Duration = request.Duration,
            Loop = request.Loop,
        };

        var result = await service.GenerateAsync(data, ct);

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

    internal static IResult GetAudioProvidersHandler([FromServices] IAudioGenerationService service)
        => Results.Ok(service.GetAvailableProviders());
}
