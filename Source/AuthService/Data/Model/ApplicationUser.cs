namespace Domain.Auth;

public class ApplicationUser : IdentityUser {
    [StringLength(256)]
    [ProtectedPersonalData]
    public virtual string? Name { get; set; }

    [StringLength(256)]
    [ProtectedPersonalData]
    public virtual string? PreferredName { get; set; }

    [StringLength(25)]
    [ProtectedPersonalData]
    public override string? PhoneNumber { get; set; }

    [StringLength(50)]
    public override string? SecurityStamp { get; set; }

    [StringLength(50)]
    public override string? ConcurrencyStamp { get; set; } = Guid.NewGuid().ToString();
}
