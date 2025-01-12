namespace Microsoft.Extensions.Hosting;

public class WebApiOptions {
    public string[]? Args { get; init; }
    public string? EnvironmentName { get; init; }
    public string? ApplicationName { get; init; }
}
