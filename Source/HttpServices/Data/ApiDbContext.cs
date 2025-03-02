namespace HttpServices.Data;

public class ApiDbContext(DbContextOptions options)
    : ApiDbContext<string, ApiClient, ApiToken>(options)
    , IApiDbContext;

public class ApiDbContext<TKey>(DbContextOptions options)
    : ApiDbContext<TKey, ApiClient<TKey>, ApiToken<TKey>>(options)
    , IApiDbContext<TKey>
    where TKey : IEquatable<TKey>;

public class ApiDbContext<TClient, TToken>(DbContextOptions options)
    : ApiDbContext<string, TClient, TToken>(options)
    , IApiDbContext<TClient, TToken>
    where TClient : ApiClient
    where TToken : ApiToken;

public class ApiDbContext<TKey, TClient, TToken>(DbContextOptions options)
    : DbContext(options)
    , IApiDbContext<TKey, TClient, TToken>
    where TKey : IEquatable<TKey>
    where TClient : ApiClient<TKey>
    where TToken : ApiToken<TKey> {
    public DbSet<TClient> Clients { get; set; } = null!;
    public DbSet<TToken> Tokens { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);
        ApiDbContextBuilder.ConfigureModel<TKey, TClient, TToken>(this, modelBuilder);
    }
}