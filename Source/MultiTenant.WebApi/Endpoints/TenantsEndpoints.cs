using static WebApi.Endpoints.TenantManagementEndpoints;

using IResult = Microsoft.AspNetCore.Http.IResult;

// ReSharper disable once CheckNamespace
namespace WebApi.Endpoints;

public static class TenantsEndpoints {
    public static IEndpointRouteBuilder MapApiClientManagementEndpoints(this IEndpointRouteBuilder app) {
        var tenantsGroup = app.MapGroup(TenantsEndpoint)
                       .WithTags("Tenant Management");

        tenantsGroup.MapPost("/", RegisterAsync)
             .WithName("RegisterTenant")
             .Produces<RegisterTenantResponse>()
             .Produces(StatusCodes.Status400BadRequest)
             .Produces<ProblemDetails>(StatusCodes.Status500InternalServerError);

        var authGroup = tenantsGroup.MapGroup("/auth") // Changed group to /auth
                           .WithTags("Tenant Authentication")
                           .WithDescription("Endpoints for tenant authentication and token management.");

        authGroup.MapPost("/", AuthenticateTenantAsync) // New endpoint for standard auth
             .WithName("AuthenticateTenant")
             .WithSummary("Authenticates a tenant using client ID/secret and returns access/refresh tokens.")
             .Produces<AccessTokenResponse>()
             .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
             .Produces<ProblemDetails>(StatusCodes.Status401Unauthorized)
             .Produces<ProblemDetails>(StatusCodes.Status500InternalServerError);

        authGroup.MapPost("/refresh", RefreshTenantTokenAsync) // New endpoint for refresh
             .WithName("RefreshTenantToken")
             .WithSummary("Refreshes an access token using a refresh token.")
             .Produces<AccessTokenResponse>()
             .Produces<ProblemDetails>(StatusCodes.Status400BadRequest) // e.g., missing refresh token
             .Produces<ProblemDetails>(StatusCodes.Status401Unauthorized); // e.g., invalid/expired refresh token

        return app;
    }

    private static async Task<IResult> RegisterAsync(
        [FromServices] ITenantManagementService service,
        [FromBody] RegisterTenantRequest request,
        [FromServices] ILoggerFactory loggerFactory) {
        var logger = loggerFactory.CreateLogger($"{nameof(MapApiClientManagementEndpoints)}.{nameof(RegisterAsync)}");
        try {
            var result = await service.RegisterAsync(request);
            return result.HasErrors
                   ? Results.BadRequest(result.Errors)
                   : Results.Ok(result.Value);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Tenant registration failed for request: {Request}.", request);
            return Results.Problem("An unexpected error occurred during the registration.",
                                   statusCode: StatusCodes.Status500InternalServerError,
                                   title: "Registration Failed");
        }
    }

    private static async Task<IResult> AuthenticateTenantAsync(
        [FromBody] AuthenticateTenantRequest request,
        [FromServices] ITenantManagementService service,
        [FromServices] ILoggerFactory loggerFactory) {
        var logger = loggerFactory.CreateLogger($"{nameof(MapApiClientManagementEndpoints)}.{nameof(AuthenticateTenantAsync)}");
        var result = await service.AuthenticateAsync(request);
        try {
            return result.HasErrors
                   ? Results.BadRequest(result.Errors)
                   : result.Value is null ? Results.Unauthorized()
                   : Results.Ok(result.Value);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Tenant authentication failed for tenant: {TenantIdentifier}.", request.Identifier);
            return Results.Problem("An unexpected error occurred during the tenant authentication.",
                                   statusCode: StatusCodes.Status500InternalServerError,
                                   title: "Tenant Authentication Failed");
        }
    }

    // Handler for refresh token requests (Structure Added)
    private static async Task<IResult> RefreshTenantTokenAsync(
        // Expect refresh token, e.g., in the body
        [FromBody] RefreshTenantAccessTokenRequest request, // Define this simple request record
        [FromServices] ITenantManagementService service,
        [FromServices] ILoggerFactory loggerFactory) {
        var logger = loggerFactory.CreateLogger($"{nameof(MapApiClientManagementEndpoints)}.{nameof(RefreshTenantTokenAsync)}");
        try {
            var result = await service.RefreshAccessTokenAsync(request);
            return result.HasErrors
                   ? Results.BadRequest(result.Errors)
                   : result.Value is null ? Results.Unauthorized()
                   : Results.Ok(result.Value);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Tenant access token refresh failed for token: {TokenId}.", request.TokenId);
            return Results.Problem("An unexpected error occurred during the access token refresh.",
                                   statusCode: StatusCodes.Status500InternalServerError,
                                   title: "Access Token Refresh Failed");
        }
    }
}