// ReSharper disable once CheckNamespace

namespace Microsoft.AspNetCore.Builder;

internal static partial class WebApplicationExtensions {
    public static void MapUserAccountEndpoints(this WebApplication app) {
        app.MapGet("/users/{id}", UserAccountHandler.FindByIdAsync);
        app.MapPost("/users", UserAccountHandler.RegisterAsync);
    }
}
