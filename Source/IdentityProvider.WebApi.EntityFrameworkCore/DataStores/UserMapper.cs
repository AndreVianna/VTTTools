namespace WebApi.Identity.EntityFrameworkCore.DataStores;

public class UserMapper<TUser, TUserEntity>
    : IUserMapper<TUser, TUserEntity>
    where TUser : User, new()
    where TUserEntity : UserEntity, new() {
    public TUser? ToDomainModel(TUserEntity? entity)
        => entity is null
               ? null
               : new() {
                   Identifier = entity.Identifier,
                   Email = entity.Email,
                   EmailIsConfirmed = entity.EmailIsConfirmed,
                   PhoneNumber = entity.PhoneNumber,
                   PhoneNumberIsConfirmed = entity.PhoneNumberIsConfirmed,
                   AccountIsConfirmed = entity.AccountIsConfirmed,
                   TwoFactorIsSetup = entity.TwoFactorIsSetup,
                   CanBeLockedOut = entity.CanBeLockedOut,
                   LockoutEnd = entity.LockoutEnd,
                   FailedSignInCount = entity.FailedSignInCount,
                   IsBlocked = entity.IsBlocked,
                   Logins = entity.Logins.ToArray(l => new Login { Provider = l.Provider?.Name ?? "[NotLoaded]" }),
                   Roles = entity.Roles.ToArray(r => r.Name),
               };

    public TUserEntity? ToEntity(TUser? model)
        => model is null
               ? null
               : new() {
                   Identifier = model.Identifier,
                   Email = model.Email,
                   PhoneNumber = model.PhoneNumber,
                   TwoFactorIsSetup = model.TwoFactorIsSetup,
               };
}