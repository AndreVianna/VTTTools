namespace WebApi.Identity.EntityFrameworkCore.Entities;

public class LoginProvider {
    public Guid Id { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = null!;
}
