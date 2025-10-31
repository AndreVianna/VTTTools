using Microsoft.AspNetCore.Mvc;

using VttTools.Auth.ApiContracts;
using VttTools.Auth.Services;
using VttTools.Extensions;

namespace VttTools.Auth.Handlers;

public static class TwoFactorHandlers {
    public static async Task<Microsoft.AspNetCore.Http.IResult> InitiateSetupHandler(
        HttpContext context,
        [FromServices] ITwoFactorService twoFactorService,
        CancellationToken ct = default) {

        var userId = context.User.GetUserId();
        if (userId == Guid.Empty) {
            return Results.Unauthorized();
        }

        var response = await twoFactorService.InitiateSetupAsync(userId, ct);

        if (response.Success)
            return Results.Ok(response);

        var errors = new Dictionary<string, string[]> {
            ["userId"] = [response.Message ?? "Failed to initiate two-factor setup"]
        };

        return Results.ValidationProblem(errors);
    }

    public static async Task<Microsoft.AspNetCore.Http.IResult> VerifySetupHandler(
        HttpContext context,
        [FromBody] VerifySetupRequest request,
        [FromServices] ITwoFactorService twoFactorService,
        CancellationToken ct = default) {

        var userId = context.User.GetUserId();
        if (userId == Guid.Empty) {
            return Results.Unauthorized();
        }

        var response = await twoFactorService.VerifySetupAsync(userId, request, ct);

        if (response.Success)
            return Results.Ok(response);

        var errors = new Dictionary<string, string[]> {
            [""] = [response.Message ?? "Failed to verify two-factor setup"]
        };

        return Results.ValidationProblem(errors);
    }

    public static async Task<Microsoft.AspNetCore.Http.IResult> DisableTwoFactorHandler(
        HttpContext context,
        [FromBody] DisableTwoFactorRequest request,
        [FromServices] ITwoFactorService twoFactorService,
        CancellationToken ct = default) {

        var userId = context.User.GetUserId();
        if (userId == Guid.Empty) {
            return Results.Unauthorized();
        }

        var response = await twoFactorService.DisableTwoFactorAsync(userId, request, ct);

        if (response.Success)
            return Results.Ok(response);

        var errors = new Dictionary<string, string[]> {
            [""] = [response.Message ?? "Failed to disable two-factor authentication"]
        };

        return Results.ValidationProblem(errors);
    }
}
