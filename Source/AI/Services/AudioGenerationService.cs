namespace VttTools.AI.Services;

public class AudioGenerationService(IAiProviderFactory providerFactory)
    : IAudioGenerationService {

    public async Task<Result<AudioGenerationResponse>> GenerateAsync(
        AudioGenerationData data,
        CancellationToken ct = default) {
        var validation = data.Validate();
        if (validation.HasErrors)
            return Result.Failure<AudioGenerationResponse>(null!, validation.Errors);

        var provider = providerFactory.GetAudioProvider(data.Provider);

        var stopwatch = Stopwatch.StartNew();
        var result = await provider.GenerateAsync(data, ct);
        stopwatch.Stop();

        return !result.IsSuccessful
            ? Result.Failure(result.Errors).WithNo<AudioGenerationResponse>()
            : new AudioGenerationResponse {
                AudioData = result.Value,
                ContentType = "audio/ogg",
                InputTokens = 0,
                OutputTokens = 0,
                Cost = 0m,
                Elapsed = TimeSpan.Zero,
            };
    }

    public IReadOnlyList<string> GetAvailableProviders()
        => providerFactory.GetAvailableAudioProviders();
}
