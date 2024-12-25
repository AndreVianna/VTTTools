namespace AuthService.Data;

public class AuthDbContext(DbContextOptions<AuthDbContext> options, IConfiguration configuration)
    : IdentityDbContext<ApplicationUser>(options) {
    public DbSet<ApiClient> Clients { get; init; }

    protected override void OnModelCreating(ModelBuilder builder) {
        base.OnModelCreating(builder);
        var clients = configuration.GetSection("Clients")?.Get<List<ApiClient>>() ?? [];
        builder.Entity<ApiClient>().HasData(clients);
    }
}
