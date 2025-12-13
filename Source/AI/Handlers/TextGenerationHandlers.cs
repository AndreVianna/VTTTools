using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.AI.Handlers;

internal static class TextGenerationHandlers {
    internal static async Task<IResult> GenerateTextHandler(
        [FromBody] TextGenerationRequest request,
        [FromServices] ITextGenerationService service,
        CancellationToken ct = default) {
        var data = new TextGenerationData {
            Prompt = request.Prompt,
            SystemPrompt = request.SystemPrompt,
            ContentType = request.ContentType,
            TemplateName = request.Template,
            TemplateContext = request.Context,
            Provider = request.Provider,
            Model = request.Model,
            MaxTokens = request.MaxTokens,
            Temperature = request.Temperature,
        };

        var result = await service.GenerateAsync(data, ct);

        return !result.IsSuccessful
            ? Results.Problem(
                detail: result.Errors[0].Message,
                statusCode: StatusCodes.Status400BadRequest,
                title: "Text generation failed")
            : Results.Ok(result.Value);
    }

    internal static IResult GetTextProvidersHandler([FromServices] ITextGenerationService service)
        => Results.Ok(service.GetAvailableProviders());
}
