namespace VttTools.AI.Providers;

public interface IAiProviderFactory {
    (string Provider, string Model) GetProviderAndModel(GeneratedContentType contentType);

    IImageProvider GetImageProvider(string? providerName = null);
    IAudioProvider GetAudioProvider(string? providerName = null);
    IVideoProvider GetVideoProvider(string? providerName = null);
    IPromptProvider GetPromptProvider(string? providerName = null);
    ITextProvider GetTextProvider(string? providerName = null);

    IReadOnlyList<string> GetAvailableImageProviders();
    IReadOnlyList<string> GetAvailableAudioProviders();
    IReadOnlyList<string> GetAvailableVideoProviders();
    IReadOnlyList<string> GetAvailablePromptProviders();
    IReadOnlyList<string> GetAvailableTextProviders();
}
