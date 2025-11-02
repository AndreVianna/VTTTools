namespace VttTools.Auth.ApiContracts;

public record VerifySetupRequest : Request {
    [Required(ErrorMessage = "Verification code is required")]
    [RegularExpression(@"^\d{6}$", ErrorMessage = "Code must be exactly 6 digits")]
    public string Code { get; init; } = string.Empty;
}