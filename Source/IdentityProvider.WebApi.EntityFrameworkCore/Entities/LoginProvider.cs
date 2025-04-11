namespace WebApi.Identity.EntityFrameworkCore.Entities;

[method: SetsRequiredMembers]
public class LoginProvider() {
    public Guid Id { get; set; }
    [MaxLength(128)]
    public required string Name { get; set; } = string.Empty;
}
