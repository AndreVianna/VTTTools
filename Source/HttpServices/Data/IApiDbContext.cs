namespace HttpServices.Data;

public interface IApiDbContext
    : IApiDbContext<string, ApiClient, ApiToken>;

public interface IApiDbContext<TKey>
    : IApiDbContext<TKey, ApiClient<TKey>, ApiToken<TKey>>
    where TKey : IEquatable<TKey>;

public interface IApiDbContext<TClient, TToken>
    : IApiDbContext<string, TClient, TToken>
    where TClient : ApiClient
    where TToken : ApiToken;

public interface IApiDbContext<TKey, TClient, TToken>
    where TClient : ApiClient<TKey>
    where TToken : ApiToken<TKey>
    where TKey : IEquatable<TKey> {
    DbSet<TClient> Clients { get; set; }
    DbSet<TToken> Tokens { get; set; }
}