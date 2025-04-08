namespace WebApi.Options;

public interface IWebApiOptions<out TOptions>
    : IValidatable
    where TOptions : IWebApiOptions<TOptions> {
    bool UseRedisCache { get; }
    ShowOpenApi ShowOpenApi { get; }
    bool UseTelemetry { get; }
}
