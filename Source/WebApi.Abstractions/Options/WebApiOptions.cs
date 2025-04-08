namespace WebApi.Options;

public record WebApiOptions<TOptions>
    : IWebApiOptions<TOptions>
    where TOptions : WebApiOptions<TOptions>, new() {
    public static TOptions Default => new();

    public bool UseRedisCache { get; set; } = true;
    public ShowOpenApi ShowOpenApi { get; set; } = ShowOpenApi.OnlyInDevelopment;
    public bool UseTelemetry { get; set; } = true;

    public virtual Result Validate(IMap? context = null)
        => Result.Default;
}
