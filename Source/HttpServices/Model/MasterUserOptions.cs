namespace HttpServices.Model;

public class MasterUserOptions : IUserIdentity {
    public static readonly string DefaultId = Guid.Empty.ToString();
    public const string DefaultName = "Master";
    public const string DefaultEmail = "master@host.com";
    public string Id { get; set; } = DefaultId;
    public string? Name { get; set; } = DefaultName;
    public string? Email { get; set; } = DefaultEmail;
    public required string Password { get; set; }
}