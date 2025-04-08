namespace WebApi.Services;

internal static class Mapper {
    internal static RegisterTenantResponse ToResponse(this Tenant tenant, string secret)
        => new() {
            Identifier = Base64UrlEncoder.Encode(tenant.Id.ToByteArray()),
            Secret = secret,
        };

    internal static AccessTokenResponse ToResponse(this AccessToken accessToken)
        => new() {
            Id = accessToken.Id,
            Type = AuthTokenType.Access,
            CreatedAt = accessToken.CreatedAt,
            ValidUntil = accessToken.ValidUntil,
            DelayStartUntil = accessToken.DelayStartUntil,
            Value = accessToken.Value,
            CanRefreshUntil = accessToken.RenewableUntil,
        };
}
