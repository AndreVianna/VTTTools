namespace WebApi.Tokens;

public interface ITypedRefreshableToken<out TToken>
    where TToken : ITypedRefreshableToken<TToken> {
    static abstract TToken Create(string value, DateTimeOffset validUntil, DateTimeOffset? renewableUntil = null, DateTimeOffset? delayStartUntil = null, DateTimeOffset? createdAt = null, TimeProvider? clock = null);
}
