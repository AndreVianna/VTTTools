namespace VttTools.AI.Factory;

public sealed class AiProviderFactory(
    IOptionsSnapshot<AiOptions> options,
    IEnumerable<IImageProvider> imageProviders,
    IEnumerable<IAudioProvider> audioProviders,
    IEnumerable<IVideoProvider> videoProviders,
    IEnumerable<IPromptProvider> promptProviders,
    IEnumerable<ITextProvider> textProviders)
    : IAiProviderFactory {

    private readonly Dictionary<string, IImageProvider> _imageProviders = imageProviders.ToDictionary(p => p.Name);
    private readonly Dictionary<string, IAudioProvider> _audioProviders = audioProviders.ToDictionary(p => p.Name);
    private readonly Dictionary<string, IVideoProvider> _videoProviders = videoProviders.ToDictionary(p => p.Name);
    private readonly Dictionary<string, IPromptProvider> _promptProviders = promptProviders.ToDictionary(p => p.Name);
    private readonly Dictionary<string, ITextProvider> _textProviders = textProviders.ToDictionary(p => p.Name);

    public (string Provider, string Model) GetProviderAndModel(GeneratedContentType contentType) {
        (var type, var subtype) = contentType.GetTypeAndSubtype();
        var defaults = options.Value.Defaults;

        if (defaults.TryGetValue(type, out var subtypes)) {
            if (subtypes.TryGetValue(subtype, out var config))
                return (config.Provider, config.Model);

            if (subtypes.TryGetValue("_default", out var defaultConfig))
                return (defaultConfig.Provider, defaultConfig.Model);
        }

        throw new InvalidOperationException($"No default configured for {type}:{subtype}");
    }

    public IImageProvider GetImageProvider(string? providerName = null) {
        var name = providerName ?? GetProviderAndModel(GeneratedContentType.ImagePortrait).Provider;
        return _imageProviders.TryGetValue(name, out var provider)
            ? provider
            : throw new InvalidOperationException($"DefaultDisplay provider '{name}' is not registered.");
    }

    public IAudioProvider GetAudioProvider(string? providerName = null) {
        var name = providerName ?? GetProviderAndModel(GeneratedContentType.AudioVoice).Provider;
        return _audioProviders.TryGetValue(name, out var provider)
            ? provider
            : throw new InvalidOperationException($"Audio provider '{name}' is not registered.");
    }

    public IVideoProvider GetVideoProvider(string? providerName = null) {
        var name = providerName ?? GetProviderAndModel(GeneratedContentType.VideoBackground).Provider;
        return _videoProviders.TryGetValue(name, out var provider)
            ? provider
            : throw new InvalidOperationException($"Video provider '{name}' is not registered.");
    }

    public IPromptProvider GetPromptProvider(string? providerName = null) {
        var name = providerName ?? GetProviderAndModel(GeneratedContentType.PromptEnhancement).Provider;
        return _promptProviders.TryGetValue(name, out var provider)
            ? provider
            : throw new InvalidOperationException($"Prompt provider '{name}' is not registered.");
    }

    public ITextProvider GetTextProvider(string? providerName = null) {
        var name = providerName ?? GetProviderAndModel(GeneratedContentType.TextDescription).Provider;
        return _textProviders.TryGetValue(name, out var provider)
            ? provider
            : throw new InvalidOperationException($"Text provider '{name}' is not registered.");
    }

    public IReadOnlyList<string> GetAvailableImageProviders()
        => [.. _imageProviders.Keys];

    public IReadOnlyList<string> GetAvailableAudioProviders()
        => [.. _audioProviders.Keys];

    public IReadOnlyList<string> GetAvailableVideoProviders()
        => [.. _videoProviders.Keys];

    public IReadOnlyList<string> GetAvailablePromptProviders()
        => [.. _promptProviders.Keys];

    public IReadOnlyList<string> GetAvailableTextProviders()
        => [.. _textProviders.Keys];
}