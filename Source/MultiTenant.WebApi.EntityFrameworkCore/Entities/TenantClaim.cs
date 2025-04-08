namespace WebApi.Tenants.EntityFrameworkCore.Entities;

public class TenantClaim {
    public int Id { get; set; }
    public Guid TenantId { get; set; }
    [MaxLength(256)]
    public string ClaimType { get; set; } = null!;
    [MaxLength(4096)]
    public string ClaimValue { get; set; } = null!;
}
