namespace WebApi.Tenants.EntityFrameworkCore.DataStores;

public class TenantMapper<TTenant, TTenantEntity>
    : ITenantMapper<TTenant, TTenantEntity>
    where TTenant : Tenant, new()
    where TTenantEntity : TenantEntity, new() {
    [return: NotNullIfNotNull(nameof(entity))]
    public TTenant? ToDomainModel(TTenantEntity? entity)
        => entity is null
               ? null
               : new() {
                   Id = entity.Id,
                   Name = entity.Name,
                   Secret = entity.Secret,
               };

    [return: NotNullIfNotNull(nameof(model))]
    public TTenantEntity? ToEntity(TTenant? model)
        => model is null
               ? null
               : new() {
                   Name = model.Name,
                   Secret = model.Secret,
               };

    [return: NotNullIfNotNull(nameof(entity))]
    public AccessToken? ToDomainModel(TenantTokenEntity? entity)
        => entity is null
               ? null
               : new() {
                   Id = entity.Id,
                   CreatedAt = entity.CreatedAt,
                   Type = AuthTokenType.Access,
                   DelayStartUntil = entity.DelayStartUntil,
                   ValidUntil = entity.ValidUntil,
                   Value = entity.Value,
                   RenewableUntil = entity.CanRefreshUntil,
               };

    [return: NotNullIfNotNull(nameof(model))]
    public TenantTokenEntity? ToEntity(AccessToken? model, Guid tenantId)
        => model is null
               ? null
               : new() {
                   TenantId = tenantId,
                   CreatedAt = model.CreatedAt,
                   DelayStartUntil = model.DelayStartUntil,
                   ValidUntil = model.ValidUntil,
                   Value = model.Value,
                   CanRefreshUntil = model.RenewableUntil,
               };
}
