namespace VttTools.AI.Providers;

public interface IAiProviderFactory {
    IImageProvider GetImageProvider(AiProviderType? providerType = null);
    IAudioProvider GetAudioProvider(AiProviderType? providerType = null);
    IVideoProvider GetVideoProvider(AiProviderType? providerType = null);
    IPromptProvider GetPromptProvider(AiProviderType? providerType = null);
    ITextProvider GetTextProvider(AiProviderType? providerType = null);

    IReadOnlyList<AiProviderType> GetAvailableImageProviders();
    IReadOnlyList<AiProviderType> GetAvailableAudioProviders();
    IReadOnlyList<AiProviderType> GetAvailableVideoProviders();
    IReadOnlyList<AiProviderType> GetAvailableTextProviders();
}
