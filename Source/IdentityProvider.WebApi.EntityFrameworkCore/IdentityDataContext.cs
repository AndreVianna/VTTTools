namespace WebApi.Identity.EntityFrameworkCore;

public class IdentityDataContext(DbContextOptions options)
    : IdentityDataContext<UserEntity, RoleEntity>(options);

public class IdentityDataContext<TUser, TRole>(DbContextOptions options)
    : DbContext(options)
    where TUser : UserEntity, new()
    where TRole : RoleEntity {
    public virtual DbSet<TUser> Users { get; set; } = null!;
    public virtual DbSet<UserClaim> UserClaims { get; set; } = null!;
    public virtual DbSet<UserLogin> UserLogins { get; set; } = null!;
    public virtual DbSet<TRole> Roles { get; set; } = null!;
    public virtual DbSet<RoleClaim> RoleClaims { get; set; } = null!;
    public virtual DbSet<UserRole> UserRoles { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);
        IdentityDataContextBuilder.ConfigureModel<TUser, TRole>(this, modelBuilder);
    }
}