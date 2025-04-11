namespace WebApi.Identity.EntityFrameworkCore.Entities;

[method: SetsRequiredMembers]
public class UserLogin() {
    public Guid UserId { get; set; }
    public Guid ProviderId { get; set; }

    [MaxLength(256)]
    [ProtectedPersonalData]
    [Required(AllowEmptyStrings = false)]
    public string HashedSecret { get; set; } = string.Empty;

    [MaxLength(4096)]
    [ProtectedPersonalData]
    public string? Token { get; set; }

    public Guid? SecurityStamp { get; set; }

    public LoginProviderEntity? Provider { get; set; }
}
