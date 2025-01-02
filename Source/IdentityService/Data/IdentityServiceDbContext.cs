namespace IdentityService.Data;

public class IdentityServiceDbContext(DbContextOptions<IdentityServiceDbContext> options)
    : IdentityApiDbContext<Client, User, Role>(options) {
    protected override void OnModelCreating(ModelBuilder builder) {
        base.OnModelCreating(builder);

        builder.Entity<User>(b => b.Property(e => e.PreferredName).HasMaxLength(256));
    }
}
