namespace WebApi.Identity.EntityFrameworkCore.Entities;

public class UserClaim {
    public int Id { get; set; }
    public Guid UserId { get; set; }
    [MaxLength(256)]
    public string Type { get; set; } = null!;
    [MaxLength(4096)]
    public string Value { get; set; } = null!;
}
