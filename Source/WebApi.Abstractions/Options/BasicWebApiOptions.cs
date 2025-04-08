namespace WebApi.Options;

public record BasicWebApiOptions
    : WebApiOptions<BasicWebApiOptions>
    , IBasicWebApiOptions;

public record BasicWebApiOptions<TOptions>
    : WebApiOptions<TOptions>
    , IBasicWebApiOptions
    where TOptions : BasicWebApiOptions<TOptions>, new();
