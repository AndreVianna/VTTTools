namespace WebApi.Contracts;

public sealed record RegisterTenantResponse {
    public required string Identifier { get; init; }
    public required string Secret { get; init; }
}