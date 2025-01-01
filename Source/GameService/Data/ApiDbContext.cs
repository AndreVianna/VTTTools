namespace GameService.Data;

public class ApiDbContext(DbContextOptions<ApiDbContext> options, IConfiguration configuration)
    : DbContext(options) {
    public DbSet<ApiClient> Clients { get; init; }

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);
        var clients = configuration.GetSection("Clients").Get<List<ApiClient>>() ?? [];
        modelBuilder.Entity<ApiClient>().HasData(clients);
    }
}
