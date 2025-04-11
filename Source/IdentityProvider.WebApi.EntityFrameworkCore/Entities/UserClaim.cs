namespace WebApi.Identity.EntityFrameworkCore.Entities;

[method: SetsRequiredMembers]
public class UserClaim() {
    public int Id { get; set; }
    public Guid UserId { get; set; }
    [MaxLength(256)]
    [Required(AllowEmptyStrings = false)]
    public required string Type { get; set; } = string.Empty;
    [MaxLength(4096)]
    [Required(AllowEmptyStrings = false)]
    public string Value { get; set; } = string.Empty;
}
