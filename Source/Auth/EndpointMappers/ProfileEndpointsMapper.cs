namespace VttTools.Auth.EndpointMappers;

internal static class ProfileEndpointsMapper {
    public static void MapProfileEndpoints(this IEndpointRouteBuilder app) {
        var profile = app.MapGroup("/api/profile")
            .RequireAuthorization();

        profile.MapGet("", ProfileHandlers.GetProfileHandler)
            .WithName("GetProfile")
            .WithSummary("Get current user profile information");

        profile.MapPut("", ProfileHandlers.UpdateProfileHandler)
            .WithName("UpdateProfile")
            .WithSummary("Update current user profile");

        profile.MapPost("/avatar", ProfileHandlers.UpdateAvatarHandler)
            .WithName("UpdateAvatar")
            .WithSummary("Update user avatar")
            .DisableAntiforgery();

        profile.MapDelete("/avatar", ProfileHandlers.RemoveAvatarHandler)
            .WithName("RemoveAvatar")
            .WithSummary("Remove user avatar");
    }
}