namespace HttpServices.Identity.Data;

public interface IUserRoleDbContext<TKey, TRole, TUserRole, TRoleClaim>
    where TKey : IEquatable<TKey>
    where TRole : IdentityRole<TKey>
    where TUserRole : IdentityUserRole<TKey>
    where TRoleClaim : IdentityRoleClaim<TKey> {
    DbSet<TRoleClaim> RoleClaims { get; set; }
    DbSet<TRole> Roles { get; set; }
    DbSet<TUserRole> UserRoles { get; set; }
}