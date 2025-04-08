namespace WebApi.Options;

public interface IMultiTenantWebApiOptions
    : IMultiTenantWebApiOptions<MultiTenantWebApiOptions>;

public interface IMultiTenantWebApiOptions<TOptions>
    : IBasicWebApiOptions
    where TOptions : MultiTenantWebApiOptions<TOptions>, new() {
    TenantClaimsOptions Claims { get; set; }
    SecretOptions Secret { get; set; }
    AccessTokenOptions TenantAccessToken { get; }
}
