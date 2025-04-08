namespace WebApi.Identity.EntityFrameworkCore.Entities;

public class RoleClaim {
    public int Id { get; set; }
    public Guid RoleId { get; set; }
    [MaxLength(128)]
    public string ClaimType { get; set; } = null!;
    [MaxLength(4096)]
    public string ClaimValue { get; set; } = null!;
}
