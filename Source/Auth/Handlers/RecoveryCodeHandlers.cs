namespace VttTools.Auth.Handlers;

public static class RecoveryCodeHandlers {
    public static async Task<IResult> GenerateNewCodesHandler(
        HttpContext context,
        [FromBody] GenerateRecoveryCodesRequest request,
        [FromServices] IRecoveryCodeService recoveryCodeService,
        CancellationToken ct = default) {

        var userId = context.User.GetUserId();
        if (userId == Guid.Empty) {
            return Results.Unauthorized();
        }

        var response = await recoveryCodeService.GenerateNewCodesAsync(userId, request, ct);

        if (response.Success)
            return Results.Ok(response);

        var errors = new Dictionary<string, string[]> {
            ["password"] = [response.Message ?? "Failed to generate recovery codes"]
        };

        return Results.ValidationProblem(errors);
    }

    public static async Task<IResult> GetStatusHandler(
        HttpContext context,
        [FromServices] IRecoveryCodeService recoveryCodeService,
        CancellationToken ct = default) {

        var userId = context.User.GetUserId();
        if (userId == Guid.Empty) {
            return Results.Unauthorized();
        }

        var response = await recoveryCodeService.GetStatusAsync(userId, ct);

        if (response.Success)
            return Results.Ok(response);

        var errors = new Dictionary<string, string[]> {
            ["userId"] = [response.Message ?? "Failed to retrieve status"]
        };

        return Results.ValidationProblem(errors);
    }
}