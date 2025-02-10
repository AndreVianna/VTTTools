namespace Microsoft.Extensions.Hosting;

public class WebApiOptions {
    public WebApiType Type { get; init; }
    public string[]? Args { get; init; }
    public string? EnvironmentName { get; init; }
    public string? ApplicationName { get; init; }

    public bool UsesClientSecret { get; init; }
    public bool UsesApiKey { get; init; }
    public bool UsesJwt { get; init; }
    public bool UsesAuthentication => UsesClientSecret || UsesApiKey || UsesJwt;
    public bool CanGrantAccess { get; init; }

    public TokenValidationParameters? JwtOptions { get; init; }
}
