using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.AI.Handlers;

internal static class PromptEnhancementHandlers {
    internal static async Task<IResult> EnhancePromptHandler(
        [FromBody] PromptEnhancementRequest request,
        [FromServices] IPromptEnhancementService service,
        CancellationToken ct = default) {
        var result = await service.EnhanceAsync(request, ct);

        return !result.IsSuccessful
            ? Results.Problem(
                detail: result.Errors[0].Message,
                statusCode: StatusCodes.Status400BadRequest,
                title: "Prompt enhancement failed")
            : Results.Ok(result.Value);
    }
}
