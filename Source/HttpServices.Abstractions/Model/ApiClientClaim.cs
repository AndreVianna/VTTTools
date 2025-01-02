namespace HttpServices.Abstractions.Model;

public class ApiClientClaim()
    : ApiClientClaim<Guid>();

public class ApiClientClaim<TKey>()
    where TKey : IEquatable<TKey> {
    public virtual int Id { get; set; }
    public virtual TKey ApiClientId { get; set; } = default!;
    public virtual string? ClaimType { get; set; }
    public virtual string? ClaimValue { get; set; }
    public virtual Claim ToClaim() => new(ClaimType!, ClaimValue!);
    public virtual void InitializeFromClaim(Claim claim) {
        ClaimType = claim.Type;
        ClaimValue = claim.Value;
    }
}
