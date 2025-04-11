namespace WebApi.Identity.EntityFrameworkCore.DataStores;

public interface IUserMapper<TUser, TUserEntity>
    where TUser : User, new()
    where TUserEntity : UserEntity, new() {
    TUser? ToDomainModel(TUserEntity? entity);
    TUserEntity? ToEntity(TUser? model);
}