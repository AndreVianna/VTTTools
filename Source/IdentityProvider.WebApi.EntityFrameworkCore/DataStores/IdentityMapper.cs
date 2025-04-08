namespace WebApi.Identity.EntityFrameworkCore.DataStores;

public class IdentityMapper<TUser, TUserEntity>(TimeProvider clock)
    : IIdentityMapper<TUser, TUserEntity>
    where TUser : User, new()
    where TUserEntity : UserEntity, new() {
    public TUser? ToDomainModel(TUserEntity? entity)
        => entity is null
               ? null
               : new() {
                   Id = entity.Id,
                   Identifier = entity.Identifier,
                   Email = entity.Email,
                   PhoneNumber = entity.PhoneNumber,
                   AccountConfirmed = entity.AccountConfirmed,
                   IsLocked = entity.LockoutEnd > clock.GetUtcNow(),
                   TwoFactorType = entity.TwoFactorType,
                   Logins = entity.Logins.ToArray(l => new Login { Provider = l.Provider.Name }),
                   Claims = entity.Claims.ToArray(c => new Claim(c.Type, c.Value)),
               };

    public TUserEntity? ToEntity(TUser? model)
        => model is null
               ? null
               : new() {
                   Id = model.Id,
                   Identifier = model.Identifier,
                   Email = model.Email,
                   PhoneNumber = model.PhoneNumber,
                   TwoFactorType = model.TwoFactorType,
               };
}