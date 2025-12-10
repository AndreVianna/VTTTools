namespace VttTools.AI.Factory;

public sealed class AiProviderFactory(
    IConfiguration configuration,
    IEnumerable<IImageProvider> imageProviders,
    IEnumerable<IAudioProvider> audioProviders,
    IEnumerable<IVideoProvider> videoProviders,
    IEnumerable<IPromptProvider> promptProviders,
    IEnumerable<ITextProvider> textProviders) : IAiProviderFactory {
    private readonly Dictionary<AiProviderType, IImageProvider> _imageProviders = imageProviders.ToDictionary(p => p.ProviderType);
    private readonly Dictionary<AiProviderType, IAudioProvider> _audioProviders = audioProviders.ToDictionary(p => p.ProviderType);
    private readonly Dictionary<AiProviderType, IVideoProvider> _videoProviders = videoProviders.ToDictionary(p => p.ProviderType);
    private readonly Dictionary<AiProviderType, IPromptProvider> _promptProviders = promptProviders.ToDictionary(p => p.ProviderType);
    private readonly Dictionary<AiProviderType, ITextProvider> _textProviders = textProviders.ToDictionary(p => p.ProviderType);

    public IImageProvider GetImageProvider(AiProviderType? providerType = null) {
        var type = providerType ?? GetDefaultProvider("Image");
        return !_imageProviders.TryGetValue(type, out var provider)
            ? throw new InvalidOperationException($"Image provider '{type}' is not registered.")
            : provider;
    }

    public IAudioProvider GetAudioProvider(AiProviderType? providerType = null) {
        var type = providerType ?? GetDefaultProvider("Audio");
        return !_audioProviders.TryGetValue(type, out var provider)
            ? throw new InvalidOperationException($"Audio provider '{type}' is not registered.")
            : provider;
    }

    public IVideoProvider GetVideoProvider(AiProviderType? providerType = null) {
        var type = providerType ?? GetDefaultProvider("Video");
        return !_videoProviders.TryGetValue(type, out var provider)
            ? throw new InvalidOperationException($"Video provider '{type}' is not registered.")
            : provider;
    }

    public IPromptProvider GetPromptProvider(AiProviderType? providerType = null) {
        var type = providerType ?? GetDefaultProvider("Prompt");
        return !_promptProviders.TryGetValue(type, out var provider)
            ? throw new InvalidOperationException($"Prompt provider '{type}' is not registered.")
            : provider;
    }

    public ITextProvider GetTextProvider(AiProviderType? providerType = null) {
        var type = providerType ?? GetDefaultProvider("Text");
        return !_textProviders.TryGetValue(type, out var provider)
            ? throw new InvalidOperationException($"Text provider '{type}' is not registered.")
            : provider;
    }

    public IReadOnlyList<AiProviderType> GetAvailableImageProviders()
        => _imageProviders.Keys.ToList().AsReadOnly();

    public IReadOnlyList<AiProviderType> GetAvailableAudioProviders()
        => _audioProviders.Keys.ToList().AsReadOnly();

    public IReadOnlyList<AiProviderType> GetAvailableVideoProviders()
        => _videoProviders.Keys.ToList().AsReadOnly();

    public IReadOnlyList<AiProviderType> GetAvailableTextProviders()
        => _textProviders.Keys.ToList().AsReadOnly();

    private AiProviderType GetDefaultProvider(string category) {
        var providerName = configuration[$"AI:DefaultProviders:{category}"];
        return string.IsNullOrEmpty(providerName)
            ? throw new InvalidOperationException($"Default provider for '{category}' is not configured.")
            : !Enum.TryParse<AiProviderType>(providerName, ignoreCase: true, out var type)
            ? throw new InvalidOperationException($"Invalid provider name '{providerName}' for category '{category}'.")
            : type;
    }
}
