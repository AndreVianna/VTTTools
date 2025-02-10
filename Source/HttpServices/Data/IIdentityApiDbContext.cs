namespace HttpServices.Data;

public interface IIdentityApiDbContext<TKey, TClient, TToken>
    where TKey : IEquatable<TKey>
    where TClient : ApiClient<TKey>
    where TToken : ApiToken<TKey> {
    DbSet<TClient> Clients { get; set; }
    DbSet<TToken> Tokens { get; set; }
}
