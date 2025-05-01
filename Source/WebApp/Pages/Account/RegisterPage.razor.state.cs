namespace VttTools.WebApp.Pages.Account;

internal class RegisterPageState {
    public RegisterPageInputModel Input { get; set; } = new();
    public IEnumerable<IdentityError>? IdentityErrors { get; set; }
    public bool HasExternalLoginProviders { get; set; }

    public string? Message => IdentityErrors is null
        ? null
        : $"Error: {string.Join(", ", IdentityErrors.Select(error => error.Description))}";
}