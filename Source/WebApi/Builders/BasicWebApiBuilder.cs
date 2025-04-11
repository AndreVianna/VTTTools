namespace WebApi.Builders;

public class BasicWebApiBuilder(string[] args)
    : BasicWebApiBuilder<BasicWebApiBuilder, BasicWebApiOptions>(args)
    , IBasicWebApiBuilder;

public class BasicWebApiBuilder<TBuilder, TOptions>(string[] args)
    : WebApiBuilder<TBuilder, TOptions>(args)
    , IBasicWebApiBuilder<TOptions>
    where TBuilder : BasicWebApiBuilder<TBuilder, TOptions>
    where TOptions : BasicWebApiOptions<TOptions>, new();