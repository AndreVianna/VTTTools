namespace WebApi.Identity.EntityFrameworkCore.Entities;

public class UserRole {
    public Guid UserId { get; set; }
    public Guid RoleId { get; set; }

    public Role Role { get; set; } = null!;
}
