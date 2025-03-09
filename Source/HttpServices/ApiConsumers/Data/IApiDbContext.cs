namespace HttpServices.ApiConsumers.Data;

public interface IApiDbContext
    : IApiDbContext<string, ApiConsumer, ApiConsumerToken>;

public interface IApiDbContext<TKey>
    : IApiDbContext<TKey, ApiConsumer<TKey>, ApiConsumerToken<TKey>>
    where TKey : IEquatable<TKey>;

public interface IApiDbContext<TClient, TToken>
    : IApiDbContext<string, TClient, TToken>
    where TClient : ApiConsumer
    where TToken : ApiConsumerToken;

public interface IApiDbContext<TKey, TClient, TToken>
    where TKey : IEquatable<TKey>
    where TClient : ApiConsumer<TKey>
    where TToken : ApiConsumerToken<TKey> {
    DbSet<TClient> Clients { get; set; }
    DbSet<TToken> Tokens { get; set; }
}