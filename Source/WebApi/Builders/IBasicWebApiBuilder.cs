namespace WebApi.Builders;

public interface IBasicWebApiBuilder
    : IWebApiBuilder<BasicWebApiOptions>;

public interface IBasicWebApiBuilder<out TOptions>
    : IWebApiBuilder<TOptions>
    where TOptions : BasicWebApiOptions<TOptions>, new();