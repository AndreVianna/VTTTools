namespace WebApi.Tenants.EntityFrameworkCore.Entities;

[method: SetsRequiredMembers]
public class TenantClaim() {
    public int Id { get; set; }
    public Guid TenantId { get; set; }
    [MaxLength(256)]
    [Required(AllowEmptyStrings = false)]
    public required string ClaimType { get; set; } = string.Empty;
    [MaxLength(4096)]
    [Required(AllowEmptyStrings = false)]
    public required string ClaimValue { get; set; } = string.Empty;
}
