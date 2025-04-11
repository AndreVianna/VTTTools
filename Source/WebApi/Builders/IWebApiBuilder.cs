namespace WebApi.Builders;

public interface IWebApiBuilder<out TOptions>
    : IHostApplicationBuilder
    where TOptions : WebApiOptions<TOptions>, new() {
    TOptions Options { get; }

    WebApplication Build(Action<WebApplication>? configure = null);
}
