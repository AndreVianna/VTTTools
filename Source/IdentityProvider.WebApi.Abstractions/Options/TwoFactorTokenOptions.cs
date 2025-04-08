namespace WebApi.Options;

public record TwoFactorTokenOptions()
    : TemporaryTokenOptions(DefaultLifetimeInSeconds) {
    public new const uint DefaultLifetimeInSeconds = 15 * 60; // 15 minutes
    public TwoFactorType Type { get; init; }
}