namespace AuthService.Data;

public class AuthDbContext(DbContextOptions<AuthDbContext> options, IConfiguration configuration)
    : IdentityDbContext<ApplicationUser>(options) {
    public DbSet<ApiClient> Clients { get; init; }

    protected override void OnModelCreating(ModelBuilder builder) {
        base.OnModelCreating(builder);
        var clients = configuration.GetSection("Clients")?.Get<List<ApiClient>>() ?? [];
        builder.Entity<ApiClient>().HasData(clients);
    }

    internal virtual void OnModelCreatingVersion2(ModelBuilder builder) {
        builder.Entity<ApplicationUser>(b => {
            b.ToTable("Users");
            b.Property(u => u.PhoneNumber).HasMaxLength(50);
            b.Property(u => u.ConcurrencyStamp).HasMaxLength(40);
            b.Property(u => u.SecurityStamp).HasMaxLength(40);
        });
        builder.Entity<IdentityRole<string>>(b => b.ToTable("Roles"));
        builder.Entity<IdentityUserRole<string>>(b => b.ToTable("UserRoles"));
        builder.Entity<IdentityUserClaim<string>>().ToTable("UserClaims");
        builder.Entity<IdentityUserLogin<string>>().ToTable("UserLogins");
        builder.Entity<IdentityUserToken<string>>().ToTable("UserTokens");
        builder.Entity<IdentityRoleClaim<string>>().ToTable("RoleClaims");
    }
}
