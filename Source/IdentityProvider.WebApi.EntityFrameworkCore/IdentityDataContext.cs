namespace WebApi.Identity.EntityFrameworkCore;

public class IdentityDataContext(DbContextOptions options)
    : IdentityDataContext<UserEntity>(options);

public class IdentityDataContext<TUser>(DbContextOptions options)
    : DbContext(options)
    where TUser : UserEntity, new() {
    public virtual DbSet<TUser> Users { get; set; } = null!;
    public virtual DbSet<UserClaim> UserClaims { get; set; } = null!;
    public virtual DbSet<UserLogin> UserLogins { get; set; } = null!;
    public virtual DbSet<UserRole> UserRoles { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);
        IdentityDataContextBuilder.ConfigureModel<TUser>(this, modelBuilder);
    }
}