namespace VttTools.WebApp.Server.Pages.Account;

internal class RegisterPageState {
    public RegisterInputModel Input { get; set; } = new();
    public IEnumerable<IdentityError>? IdentityErrors { get; set; }
    public bool HasExternalLoginProviders { get; set; }

    public string? Message => IdentityErrors is null
        ? null
        : $"Error: {string.Join(", ", IdentityErrors.Select(error => error.Description))}";
}