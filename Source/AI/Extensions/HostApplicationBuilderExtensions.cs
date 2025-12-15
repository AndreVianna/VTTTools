namespace VttTools.AI.Extensions;

public static class HostApplicationBuilderExtensions {
    public const string AiProviderHttpClientName = "AiProvider";

    public static IHostApplicationBuilder AddAiServices(this IHostApplicationBuilder builder) {
        var resilienceConfig = builder.Configuration
            .GetSection($"{AiOptions.SectionName}:Resilience")
            .Get<ResilienceConfig>() ?? new ResilienceConfig();

        var totalTimeout = TimeSpan.FromSeconds(resilienceConfig.TotalTimeoutSeconds);
        var attemptTimeout = TimeSpan.FromSeconds(resilienceConfig.AttemptTimeoutSeconds);
        var samplingDuration = (attemptTimeout * 2) + TimeSpan.FromMinutes(1);

        var httpClientBuilder = builder.Services.AddHttpClient(AiProviderHttpClientName)
            .ConfigureHttpClient(client => client.Timeout = totalTimeout);

        if (resilienceConfig.MaxRetries > 0) {
            httpClientBuilder.AddStandardResilienceHandler(options => {
                options.TotalRequestTimeout.Timeout = totalTimeout;
                options.AttemptTimeout.Timeout = attemptTimeout;
                options.Retry.MaxRetryAttempts = resilienceConfig.MaxRetries;
                options.CircuitBreaker.SamplingDuration = samplingDuration;
            });
        }

        builder.Services.AddScoped<IImageProvider, OpenAiImageProvider>();
        builder.Services.AddScoped<IImageProvider, StabilityImageProvider>();
        builder.Services.AddScoped<IImageProvider, GoogleImageProvider>();

        builder.Services.AddScoped<IAudioProvider, ElevenLabsAudioProvider>();
        builder.Services.AddScoped<IAudioProvider, SunoAudioProvider>();

        builder.Services.AddScoped<IVideoProvider, RunwayVideoProvider>();

        builder.Services.AddScoped<IPromptProvider, OpenAiPromptProvider>();

        builder.Services.AddScoped<ITextProvider, OpenAiTextProvider>();

        builder.Services.AddScoped<IAiProviderFactory, AiProviderFactory>();

        builder.Services.AddScoped<IImageGenerationService, ImageGenerationService>();
        builder.Services.AddScoped<IPromptEnhancementService, PromptEnhancementService>();
        builder.Services.AddScoped<IAudioGenerationService, AudioGenerationService>();
        builder.Services.AddScoped<IVideoGenerationService, VideoGenerationService>();
        builder.Services.AddScoped<ITextGenerationService, TextGenerationService>();

        return builder;
    }
}
