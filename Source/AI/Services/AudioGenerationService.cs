namespace VttTools.AI.Services;

public class AudioGenerationService(
    IAiProviderFactory providerFactory)
    : IAudioGenerationService {

    public async Task<Result<AudioGenerationResponse>> GenerateAsync(
        AudioGenerationRequest request,
        CancellationToken ct = default) {
        var provider = providerFactory.GetAudioProvider(request.Provider);

        var stopwatch = Stopwatch.StartNew();
        var result = await provider.GenerateAsync(request, ct);
        stopwatch.Stop();

        return !result.IsSuccessful
            ? Result.Failure<AudioGenerationResponse>(null!, result.Errors[0].Message)
            : (Result<AudioGenerationResponse>)new AudioGenerationResponse {
                AudioData = result.Value,
                ContentType = "audio/ogg",
                Provider = provider.ProviderType,
                Model = request.Model,
                Duration = request.Duration ?? TimeSpan.Zero,
                Cost = 0m,
            };
    }

    public Task<IReadOnlyList<AiProviderType>> GetAvailableProvidersAsync(CancellationToken ct = default) => Task.FromResult(providerFactory.GetAvailableAudioProviders());
}
