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
            ? Result.Failure<AudioGenerationResponse>(null!, result.Errors[0].Message)
            : (Result<AudioGenerationResponse>)new AudioGenerationResponse {
                AudioData = result.Value,
                ContentType = "audio/ogg",
                Provider = provider.ProviderType,
                Model = data.Model,
                Duration = data.Duration ?? TimeSpan.Zero,
                Cost = 0m,
            };
    }

    public Task<IReadOnlyList<AiProviderType>> GetAvailableProvidersAsync(CancellationToken ct = default) => Task.FromResult(providerFactory.GetAvailableAudioProviders());
}
