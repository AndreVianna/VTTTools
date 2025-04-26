namespace VttTools.WebApp.Components.Account;

public partial class ExternalLoginPickerComponent {
    private AuthenticationScheme[] _externalLogins = [];

    [Inject]
    protected SignInManager<User> SignInManager { get; init; } = null!;

    [Inject]
    protected NavigationManager NavigationManager { get; set; } = null!;

    [SupplyParameterFromQuery]
    private string? ReturnUrl { get; set; }

    protected override async Task OnInitializedAsync() {
        var schemes = await SignInManager.GetExternalAuthenticationSchemesAsync();
        _externalLogins = [.. schemes];
    }
}