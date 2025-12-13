namespace VttTools.AI.Factory;

public sealed class AiProviderFactory(
    IConfiguration configuration,
    IAiProviderConfigStorage providerStorage,
    IMemoryCache cache,
    ILogger<AiProviderFactory> logger,
    IEnumerable<IImageProvider> imageProviders,
    IEnumerable<IAudioProvider> audioProviders,
    IEnumerable<IVideoProvider> videoProviders,
    IEnumerable<IPromptProvider> promptProviders,
    IEnumerable<ITextProvider> textProviders) : IAiProviderFactory {
    private const string _cacheKey = "AiProviderFactory_DefaultProviders";
    private static readonly TimeSpan _cacheDuration = TimeSpan.FromMinutes(5);
    private static readonly Lock _cacheLock = new();

    private readonly Dictionary<string, IImageProvider> _imageProviders = imageProviders.ToDictionary(p => p.Name);
    private readonly Dictionary<string, IAudioProvider> _audioProviders = audioProviders.ToDictionary(p => p.Name);
    private readonly Dictionary<string, IVideoProvider> _videoProviders = videoProviders.ToDictionary(p => p.Name);
    private readonly Dictionary<string, IPromptProvider> _promptProviders = promptProviders.ToDictionary(p => p.Name);
    private readonly Dictionary<string, ITextProvider> _textProviders = textProviders.ToDictionary(p => p.Name);

    public IImageProvider GetImageProvider(string? providerType = null) {
        var type = providerType ?? GetDefaultProvider("Image");
        return !_imageProviders.TryGetValue(type, out var provider)
            ? throw new InvalidOperationException($"Image provider '{type}' is not registered.")
            : provider;
    }

    public IAudioProvider GetAudioProvider(string? providerType = null) {
        var type = providerType ?? GetDefaultProvider("Audio");
        return !_audioProviders.TryGetValue(type, out var provider)
            ? throw new InvalidOperationException($"Audio provider '{type}' is not registered.")
            : provider;
    }

    public IVideoProvider GetVideoProvider(string? providerType = null) {
        var type = providerType ?? GetDefaultProvider("Video");
        return !_videoProviders.TryGetValue(type, out var provider)
            ? throw new InvalidOperationException($"Video provider '{type}' is not registered.")
            : provider;
    }

    public IPromptProvider GetPromptProvider(string? providerType = null) {
        var type = providerType ?? GetDefaultProvider("Prompt");
        return !_promptProviders.TryGetValue(type, out var provider)
            ? throw new InvalidOperationException($"Prompt provider '{type}' is not registered.")
            : provider;
    }

    public ITextProvider GetTextProvider(string? providerType = null) {
        var type = providerType ?? GetDefaultProvider("Text");
        return !_textProviders.TryGetValue(type, out var provider)
            ? throw new InvalidOperationException($"Text provider '{type}' is not registered.")
            : provider;
    }

    public IReadOnlyList<string> GetAvailableImageProviders()
        => _imageProviders.Keys.ToList().AsReadOnly();

    public IReadOnlyList<string> GetAvailableAudioProviders()
        => _audioProviders.Keys.ToList().AsReadOnly();

    public IReadOnlyList<string> GetAvailableVideoProviders()
        => _videoProviders.Keys.ToList().AsReadOnly();

    public IReadOnlyList<string> GetAvailablePromptProviders()
        => _promptProviders.Keys.ToList().AsReadOnly();

    public IReadOnlyList<string> GetAvailableTextProviders()
        => _textProviders.Keys.ToList().AsReadOnly();

    private string GetDefaultProvider(string category) {
        if (!Enum.TryParse<GeneratedContentType>(category, ignoreCase: true, out var categoryEnum)) {
            throw new InvalidOperationException($"Invalid category '{category}'.");
        }

        var defaultProviders = GetCachedDefaultProviders();
        if (defaultProviders.TryGetValue(categoryEnum, out var providerType)) {
            return providerType;
        }

        var providerName = configuration[$"AI:DefaultProviders:{category}"];
        return string.IsNullOrEmpty(providerName)
            ? throw new InvalidOperationException($"Default provider for '{category}' is not configured.")
            : providerName;
    }

    private Dictionary<GeneratedContentType, string> GetCachedDefaultProviders() {
        if (cache.TryGetValue(_cacheKey, out Dictionary<GeneratedContentType, string>? cached) && cached is not null) {
            return cached;
        }

        lock (_cacheLock) {
            if (cache.TryGetValue(_cacheKey, out cached) && cached is not null) {
                return cached;
            }

            var defaultProviders = LoadDefaultProvidersFromStorage();
            cache.Set(_cacheKey, defaultProviders, _cacheDuration);
            return defaultProviders;
        }
    }

    private Dictionary<GeneratedContentType, string> LoadDefaultProvidersFromStorage() {
        var defaultProviders = new Dictionary<GeneratedContentType, string>();

        try {
            var allProviders = providerStorage.GetAllProvidersAsync().GetAwaiter().GetResult();
            var providerLookup = allProviders.ToDictionary(p => p.Id, p => p.Name);

            foreach (var category in Enum.GetValues<GeneratedContentType>()) {
                var model = providerStorage.GetDefaultModelAsync(category).GetAwaiter().GetResult();
                if (model is not null && providerLookup.TryGetValue(model.ProviderId, out var providerType)) {
                    defaultProviders[category] = providerType;
                }
            }

            logger.LogDebug("Loaded {Count} default provider configurations from database", defaultProviders.Count);
        }
        catch (Exception ex) {
            logger.LogWarning(ex, "Failed to load default providers from database, falling back to appsettings");
        }

        return defaultProviders;
    }
}
