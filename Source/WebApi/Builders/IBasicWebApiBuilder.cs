namespace WebApi.Builders;

public interface IBasicWebApiBuilder
    : IBasicWebApiBuilder<BasicWebApiOptions>;

public interface IBasicWebApiBuilder<out TOptions>
    : IHostApplicationBuilder
    where TOptions : WebApiOptions<TOptions>, new() {
    TOptions Options { get; }

    WebApplication Build(Action<WebApplication>? configure = null);
}