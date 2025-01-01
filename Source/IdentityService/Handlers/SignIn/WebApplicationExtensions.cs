// ReSharper disable once CheckNamespace

namespace Microsoft.AspNetCore.Builder;

internal static partial class WebApplicationExtensions {
    public static void MapSignInEndpoints(this WebApplication app)
        => app.MapPost("/signin", SignInHandler.SignInWithPasswordAsync);
}
