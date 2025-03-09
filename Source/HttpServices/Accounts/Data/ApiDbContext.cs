namespace HttpServices.Accounts.Data;

public class ApiDbContext(DbContextOptions options)
    : ApiDbContext<string, ApiConsumer, ApiConsumerToken>(options)
    , IApiDbContext {
    DbSet<ApiConsumer> IApiDbContext<string, ApiConsumer, ApiConsumerToken>.Clients { get; set; }
}

public class ApiDbContext<TKey>(DbContextOptions options)
    : ApiDbContext<TKey, ApiConsumer<TKey>, ApiConsumerToken<TKey>>(options)
    , IApiDbContext<TKey>
    where TKey : IEquatable<TKey>;

public class ApiDbContext<TClient, TToken>(DbContextOptions options)
    : ApiDbContext<string, TClient, TToken>(options)
    , IApiDbContext<TClient, TToken>
    where TClient : ApiConsumer
    where TToken : ApiConsumerToken;

public class ApiDbContext<TKey, TClient, TToken>(DbContextOptions options)
    : DbContext(options)
    , IApiDbContext<TKey, TClient, TToken>
    where TKey : IEquatable<TKey>
    where TClient : ApiConsumer<TKey>
    where TToken : ApiConsumerToken<TKey> {
    public DbSet<TClient> Clients { get; set; } = null!;
    public DbSet<TToken> Tokens { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);
        ApiDbContextBuilder.ConfigureModel<TKey, TClient, TToken>(this, modelBuilder);
    }
}