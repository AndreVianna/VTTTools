using static Microsoft.AspNetCore.Http.StatusCodes;

using static WebApi.Endpoints.UserEndpointHandlers;
using static WebApi.Endpoints.UserEndpoints;
using static WebApi.Endpoints.UserEndpoints.Authentication;

// ReSharper disable once CheckNamespace
namespace WebApi.Endpoints;

public static class UserEndpointMappings {
    private static RouteGroupBuilder? _usersGroup;
    private static RouteGroupBuilder GetUsersGroup(IEndpointRouteBuilder app)
        => _usersGroup ??= app.MapGroup(UsersPrefix).WithTags("Users");

    public static IEndpointRouteBuilder MapUserAuthenticationEndpoints(this IEndpointRouteBuilder app) {
        var group = GetUsersGroup(app).WithTags("User Authentication");

        group.MapPost(SignIn, SignInAsync)
             .WithName("SignIn")
             .Produces<SignInResponse>()
             .Produces<ValidationProblemDetails>(Status400BadRequest)
             .Produces<SignInResponse>(Status401Unauthorized)
             .Produces<SignInResponse>(Status403Forbidden)
             .Produces<SignInResponse>(Status404NotFound)
             .Produces<ProblemDetails>(Status500InternalServerError);

        group.MapPost(SignOut, SignOutAsync)
             .WithName("SignOut")
             .Produces(Status200OK)
             .Produces<ValidationProblemDetails>(Status400BadRequest)
             .Produces<ProblemDetails>(Status500InternalServerError);

        group.MapGet(GetAuthenticationSchemes, GetAuthenticationSchemesAsync)
             .WithName("GetAuthenticationSchemes")
             .Produces<AuthenticationScheme[]>()
             .Produces<ProblemDetails>(Status500InternalServerError);

        return app;
    }
}
