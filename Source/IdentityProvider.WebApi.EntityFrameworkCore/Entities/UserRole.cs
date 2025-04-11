namespace WebApi.Identity.EntityFrameworkCore.Entities;

public class UserRole {
    public virtual Guid UserId { get; set; }
    [MaxLength(128)]
    [Required(AllowEmptyStrings = false)]
    public virtual string Name { get; set; } = string.Empty;
}
