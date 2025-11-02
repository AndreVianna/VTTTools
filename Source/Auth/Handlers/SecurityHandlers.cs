namespace VttTools.Auth.Handlers;

public static class SecurityHandlers {
    public static async Task<IResult> GetSecuritySettingsHandler(
        HttpContext context,
        [FromServices] ISecurityService securityService,
        CancellationToken ct = default) {

        var userId = context.User.GetUserId();
        if (userId == Guid.Empty) {
            return Results.Unauthorized();
        }

        var response = await securityService.GetSecuritySettingsAsync(userId, ct);

        if (response.Success)
            return Results.Ok(response);

        var errors = new Dictionary<string, string[]> {
            ["userId"] = [response.Message ?? "Failed to retrieve security settings"]
        };

        return Results.ValidationProblem(errors);
    }
}