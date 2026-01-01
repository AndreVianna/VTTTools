using Microsoft.AspNetCore.Identity;

namespace VttTools.Data.Identity.Entities;

public class User : IdentityUser<Guid> {
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public Guid? AvatarId { get; set; }
    public UnitSystem UnitSystem { get; set; } = UnitSystem.Imperial;
}
