namespace VttTools.Identity.Model;

public record SignInResult {
    public bool Succeeded { get; init; }
    public bool IsLockedOut { get; init; }
    public bool IsNotAllowed { get; init; }
    public bool RequiresTwoFactor { get; init; }
    public User? User { get; init; }
}
