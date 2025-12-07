namespace VttTools.AI.EndpointMappers;

public static class AiEndpointsMapper {
    public static void MapAiEndpoints(this IEndpointRouteBuilder app) {
        var ai = app.MapGroup("/api/ai");

        var images = ai.MapGroup("/images");
        images.MapPost("/generate", ImageGenerationHandlers.GenerateImageHandler)
            .RequireAuthorization()
            .WithName("GenerateImage")
            .WithSummary("Generate an image using AI");
        images.MapGet("/providers", ImageGenerationHandlers.GetImageProvidersHandler)
            .RequireAuthorization()
            .WithName("GetImageProviders")
            .WithSummary("List available image generation providers");

        var audio = ai.MapGroup("/audio");
        audio.MapPost("/generate", AudioGenerationHandlers.GenerateAudioHandler)
            .RequireAuthorization()
            .WithName("GenerateAudio")
            .WithSummary("Generate audio using AI");
        audio.MapGet("/providers", AudioGenerationHandlers.GetAudioProvidersHandler)
            .RequireAuthorization()
            .WithName("GetAudioProviders")
            .WithSummary("List available audio generation providers");

        var video = ai.MapGroup("/video");
        video.MapPost("/generate", VideoGenerationHandlers.GenerateVideoHandler)
            .RequireAuthorization()
            .WithName("GenerateVideo")
            .WithSummary("Generate video using AI");
        video.MapGet("/providers", VideoGenerationHandlers.GetVideoProvidersHandler)
            .RequireAuthorization()
            .WithName("GetVideoProviders")
            .WithSummary("List available video generation providers");

        var prompts = ai.MapGroup("/prompts");
        prompts.MapPost("/enhance", PromptEnhancementHandlers.EnhancePromptHandler)
            .RequireAuthorization()
            .WithName("EnhancePrompt")
            .WithSummary("Enhance a prompt for AI image generation");

        ai.MapGet("/providers", ProviderInfoHandlers.GetAllProvidersHandler)
            .RequireAuthorization()
            .WithName("GetAllProviders")
            .WithSummary("List all available AI providers by category");

        ai.MapGet("/health", HealthCheckHandlers.GetHealthHandler)
            .WithName("GetAiHealth")
            .WithSummary("Check health of AI providers");
    }
}
