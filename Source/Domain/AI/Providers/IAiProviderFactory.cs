namespace VttTools.AI.Providers;

public interface IAiProviderFactory {
    IImageProvider GetImageProvider(string provider);
    IAudioProvider GetAudioProvider(string provider);
    IVideoProvider GetVideoProvider(string provider);
    IPromptProvider GetPromptProvider(string provider);
    ITextProvider GetTextProvider(string provider);

    IReadOnlyList<string> GetAvailableImageProviders();
    IReadOnlyList<string> GetAvailableAudioProviders();
    IReadOnlyList<string> GetAvailableVideoProviders();
    IReadOnlyList<string> GetAvailablePromptProviders();
    IReadOnlyList<string> GetAvailableTextProviders();
}
