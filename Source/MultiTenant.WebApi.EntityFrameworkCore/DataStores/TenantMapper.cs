namespace WebApi.Tenants.EntityFrameworkCore.DataStores;

public class TenantMapper<TTenant, TTenantEntity>
    : ITenantMapper<TTenant, TTenantEntity>
    where TTenant : Tenant, new()
    where TTenantEntity : TenantEntity, new() {
    [return: NotNullIfNotNull(nameof(entity))]
    public TTenant? ToModel(TTenantEntity? entity)
        => entity is null
               ? null
               : new() {
                   Id = entity.Id,
                   Name = entity.Name,
                   Secret = entity.Secret,
                   AccessTokens = entity.Tokens.ToArray(ToShallowModel),
               };

    [return: NotNullIfNotNull(nameof(model))]
    public TTenantEntity? ToEntity(TTenant? model)
        => model is null
               ? null
               : new() {
                   Name = model.Name,
                   Secret = model.Secret,
               };

    public void UpdateEntity(TTenant model, TTenantEntity entity) {
        entity.Name = model.Name;
        entity.Secret = model.Secret;
    }

    [return: NotNullIfNotNull(nameof(token))]
    public OwnedAccessToken<TTenant>? ToModel(TenantTokenEntity? token, [NotNullIfNotNull(nameof(token))] TTenantEntity? tenant)
        => token is null
               ? null
               : new() {
                   Id = token.Id,
                   Owner = ToShallowModel(tenant!),
                   CreatedAt = token.CreatedAt,
                   DelayStartUntil = token.DelayStartUntil,
                   ValidUntil = token.ValidUntil,
                   Value = token.Value,
                   RenewableUntil = token.RenewableUntil,
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
                   RenewableUntil = model.RenewableUntil,
               };

    [return: NotNullIfNotNull(nameof(entity))]
    public AccessToken? ToModel(TenantTokenEntity? entity)
        => entity is null
               ? null
               : ToShallowModel(entity);

    private static TTenant ToShallowModel(TTenantEntity entity)
        => new() {
            Id = entity.Id,
            Name = entity.Name,
            Secret = entity.Secret,
        };

    private static AccessToken ToShallowModel(TenantTokenEntity entity)
        => new() {
            Id = entity.Id,
            CreatedAt = entity.CreatedAt,
            DelayStartUntil = entity.DelayStartUntil,
            ValidUntil = entity.ValidUntil,
            Value = entity.Value,
            RenewableUntil = entity.RenewableUntil,
        };
}
