namespace VttTools.AI.Extensions;

public static class HostApplicationBuilderExtensions {
    public static IHostApplicationBuilder AddAiServices(this IHostApplicationBuilder builder) {
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
