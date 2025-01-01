// ReSharper disable once CheckNamespace

namespace Microsoft.AspNetCore.Builder;

internal static partial class WebApplicationExtensions {
    public static void MapApiClientEndpoints(this WebApplication app)
        => app.MapPost("/tokens", ApiClientHandler.GenerateTokenAsync);
}
