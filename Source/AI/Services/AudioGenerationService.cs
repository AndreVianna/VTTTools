namespace VttTools.AI.Services;

public class AudioGenerationService(IAiProviderFactory providerFactory)
    : IAudioGenerationService {

    public async Task<Result<AudioGenerationResponse>> GenerateAsync(
        AudioGenerationData data,
        CancellationToken ct = default) {
        var validation = data.Validate();
        if (validation.HasErrors)
            return Result.Failure<AudioGenerationResponse>(null!, validation.Errors);

        var resolvedData = ResolveProviderAndModel(data);
        var provider = providerFactory.GetAudioProvider(resolvedData.Provider);

        var stopwatch = Stopwatch.StartNew();
        var result = await provider.GenerateAsync(resolvedData, ct);
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

    private AudioGenerationData ResolveProviderAndModel(AudioGenerationData data) {
        if (!string.IsNullOrEmpty(data.Provider) && !string.IsNullOrEmpty(data.Model))
            return data;

        (var provider, var model) = providerFactory.GetProviderAndModel(data.ContentType);
        return data with {
            Provider = data.Provider ?? provider,
            Model = data.Model ?? model,
        };
    }
}
