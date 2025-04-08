namespace WebApi.Contracts;

public sealed record RefreshTenantAccessTokenRequest
    : IValidatable {
    public required Guid TokenId { get; init; }

    public Result Validate(IMap? context = null)
        => Result.Default;
}
