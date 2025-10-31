using System.ComponentModel.DataAnnotations;

using VttTools.Common.ApiContracts;

namespace VttTools.Auth.ApiContracts;

public record GenerateRecoveryCodesRequest : Request {
    [Required(ErrorMessage = "Password is required")]
    public string Password { get; init; } = string.Empty;
}
