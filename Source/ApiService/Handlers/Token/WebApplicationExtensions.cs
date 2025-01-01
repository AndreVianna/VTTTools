// ReSharper disable once CheckNamespace

using TokenHandler = ApiService.Handlers.Token.TokenHandler;

namespace Microsoft.AspNetCore.Builder;

internal static partial class WebApplicationExtensions {
    public static void MapApiClientEndpoints(this WebApplication app)
        => app.MapPost("/tokens", TokenHandler.GenerateTokenAsync);
}
