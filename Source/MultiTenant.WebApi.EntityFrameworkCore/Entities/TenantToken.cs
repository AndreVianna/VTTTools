namespace WebApi.Tenants.EntityFrameworkCore.Entities;

public class TenantToken {
    public virtual Guid Id { get; set; }
    public virtual Guid TenantId { get; set; }
    public virtual TenantEntity Tenant { get; set; } = null!;

    [MaxLength(4096)]
    [ProtectedPersonalData]
    [Required(AllowEmptyStrings = false)]
    public virtual string Value { get; set; } = null!;
    public virtual DateTimeOffset CreatedAt { get; set; }
    public virtual DateTimeOffset DelayStartUntil { get; set; }
    public virtual DateTimeOffset ValidUntil { get; set; }

    public virtual DateTimeOffset? CanRefreshUntil { get; set; }
}
