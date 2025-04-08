namespace WebApi.Identity.EntityFrameworkCore.Entities;

public class UserLogin {
    public Guid UserId { get; set; }
    [MaxLength(128)]
    public Guid ProviderId { get; set; }
    [MaxLength(256)]
    [ProtectedPersonalData]
    public string HashedSecret { get; set; } = null!;
    [MaxLength(4096)]
    [ProtectedPersonalData]
    [Required(AllowEmptyStrings = false)]
    public string Token { get; set; } = null!;
    public Guid? SecurityStamp { get; set; }

    public LoginProvider Provider { get; set; } = null!;
}
