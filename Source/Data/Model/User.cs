using System.ComponentModel.DataAnnotations;

namespace VttTools.Data.Model;

// Add profile data for application users by adding properties to the User class
public class User
    : IdentityUser<Guid> {
    public override Guid Id { get; set; } = Guid.CreateVersion7();

    [MaxLength(128)]
    [Required(AllowEmptyStrings = false)]
    public string Name { get; set; } = null!;

    [MaxLength(32)]
    public string? DisplayName { get; set; }
}