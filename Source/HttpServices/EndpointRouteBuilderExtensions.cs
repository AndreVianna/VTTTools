namespace Microsoft.AspNetCore.Abstractions;

public static class EndpointRouteBuilderExtensions {
    public static void MapApiClientEndpoints<TWebApp>(this TWebApp app)
        where TWebApp : IEndpointRouteBuilder {
        app.MapPost("/tokens", TokenEndpoints.GenerateAsync);
        app.MapPost("/clients", ClientEndpoints.RegisterAsync);
    }
}
