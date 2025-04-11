namespace WebApi.Identity.EntityFrameworkCore.Builders;

public class EntityFrameworkIdentityProviderWebApiBuilder(string[] args)
    : EntityFrameworkIdentityProviderWebApiBuilder<EntityFrameworkIdentityProviderWebApiBuilder,
                                              EntityFrameworkIdentityProviderWebApiOptions,
                                              UserDataStore,
                                              User,
                                              UserEntity>(args);

public class EntityFrameworkIdentityProviderWebApiBuilder<TBuilder, TOptions, TUserDataStore, TUser, TUserEntity>
    : IdentityProviderWebApiBuilder<TBuilder, TOptions, TUserDataStore, TUser>
    where TBuilder : EntityFrameworkIdentityProviderWebApiBuilder<TBuilder, TOptions, TUserDataStore, TUser, TUserEntity>
    where TOptions : EntityFrameworkIdentityProviderWebApiOptions<TOptions>, new()
    where TUserDataStore : UserDataStore<TUserDataStore, TUser, TUserEntity>
    where TUser : User, new()
    where TUserEntity : UserEntity, new() {
    public EntityFrameworkIdentityProviderWebApiBuilder(string[] args)
        : base(args) {
        Services.AddSingleton<IUserMapper<TUser, TUserEntity>, UserMapper<TUser, TUserEntity>>();
    }
}
