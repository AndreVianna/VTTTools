namespace WebApi.Tenants.EntityFrameworkCore.Entities;

public class Tenant {
    public virtual Guid Id { get; set; }
    [MaxLength(128)]
    public virtual string Name { get; set; } = null!;
    [MaxLength(1024)]
    public virtual string Secret { get; set; } = null!;

    public virtual IList<TenantTokenEntity> Tokens { get; } = [];
    public virtual IList<TenantClaim> Claims { get; } = [];
}