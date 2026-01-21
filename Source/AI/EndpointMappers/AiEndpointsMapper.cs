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

        var text = ai.MapGroup("/text");
        text.MapPost("/generate", TextGenerationHandlers.GenerateTextHandler)
            .RequireAuthorization()
            .WithName("GenerateText")
            .WithSummary("Generate text content using AI");
        text.MapGet("/providers", TextGenerationHandlers.GetTextProvidersHandler)
            .RequireAuthorization()
            .WithName("GetTextProviders")
            .WithSummary("List available text generation providers");

        ai.MapGet("/providers", ProviderInfoHandlers.GetAllProvidersHandler)
            .RequireAuthorization()
            .WithName("GetAllProviders")
            .WithSummary("List all available AI providers by category");

        ai.MapGet("/health", HealthCheckHandlers.GetHealthHandler)
            .WithName("GetAiHealth")
            .WithSummary("Check health of AI providers");

        var templates = ai.MapGroup("/templates");
        templates.MapGet("", PromptTemplateHandlers.SearchTemplatesHandler)
            .RequireAuthorization()
            .WithName("SearchTemplates")
            .WithSummary("Search prompt templates with filters and pagination");
        templates.MapGet("{id:guid}", PromptTemplateHandlers.GetTemplateByIdHandler)
            .RequireAuthorization()
            .WithName("GetTemplateById")
            .WithSummary("Get a prompt template by ID");
        templates.MapGet("by-name/{name}", PromptTemplateHandlers.GetLatestTemplateByNameHandler)
            .RequireAuthorization()
            .WithName("GetLatestTemplateByName")
            .WithSummary("Get the latest prompt template by name");
        templates.MapPost("", PromptTemplateHandlers.CreateTemplateHandler)
            .RequireAuthorization(policy => policy.RequireRole("Administrator"))
            .WithName("CreateTemplate")
            .WithSummary("Create a new prompt template");
        templates.MapPut("{id:guid}", PromptTemplateHandlers.UpdateTemplateHandler)
            .RequireAuthorization(policy => policy.RequireRole("Administrator"))
            .WithName("UpdateTemplate")
            .WithSummary("Update a prompt template");
        templates.MapDelete("{id:guid}", PromptTemplateHandlers.DeleteTemplateHandler)
            .RequireAuthorization(policy => policy.RequireRole("Administrator"))
            .WithName("DeleteTemplate")
            .WithSummary("Delete a prompt template");

        var jobs = ai.MapGroup("/jobs");
        jobs.MapPost("", AiJobHandlers.StartBulkGenerationHandler)
            .RequireAuthorization()
            .WithName("StartJob")
            .WithSummary("Start an AI job");
        jobs.MapDelete("{id:guid}", AiJobHandlers.CancelJobHandler)
            .RequireAuthorization()
            .WithName("CancelJob")
            .WithSummary("Cancel an AI job");
        jobs.MapPost("{id:guid}/retry", AiJobHandlers.RetryJobHandler)
            .RequireAuthorization()
            .WithName("RetryJob")
            .WithSummary("Retry failed items in an AI job");
    }
}