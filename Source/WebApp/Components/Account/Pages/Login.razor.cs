using VttTools.WebApp.Utilities;

namespace VttTools.WebApp.Components.Account.Pages;

public partial class Login {
    private string? _errorMessage;

    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = null!;

    [Inject]
    private UserManager<User> UserManager { get; set; } = null!;
    [Inject]
    private SignInManager<User> SignInManager { get; set; } = null!;
    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;
    [Inject]
    private IdentityRedirectManager RedirectManager { get; set; } = null!;
    [Inject]
    private ILogger<Login> Logger { get; set; } = null!;

    [SupplyParameterFromForm]
    private InputModel Input { get; set; } = new();

    [SupplyParameterFromQuery]
    private string? ReturnUrl { get; set; }

    private bool HasExternalLoginProviders { get; set; }

    protected override async Task OnInitializedAsync() {
        if (!HttpMethods.IsGet(HttpContext.Request.Method))
            return;
        await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);
        var externalLogins = await SignInManager.GetExternalAuthenticationSchemesAsync();
        HasExternalLoginProviders = externalLogins.Any();
    }

    public async Task LoginUser() {
        var result = await SignInManager.PasswordSignInAsync(Input.Email, Input.Password, Input.RememberMe, lockoutOnFailure: true);
        if (result.Succeeded) {
            var user = await UserManager.FindByEmailAsync(Input.Email);
            var principal = await SignInManager.ClaimsFactory.CreateAsync(user!);
            await HttpContext.SignInAsync(IdentityConstants.ExternalScheme, principal);
            Logger.LogInformation("User logged in.");
            RedirectManager.RedirectTo(ReturnUrl);
            return;
        }

        if (result.RequiresTwoFactor) {
            RedirectManager.RedirectTo("Account/LoginWith2fa",
                                       new() { ["returnUrl"] = ReturnUrl, ["rememberMe"] = Input.RememberMe });
            return;
        }

        if (result.IsLockedOut) {
            Logger.LogWarning("User account locked out.");
            RedirectManager.RedirectTo("Account/Lockout");
            return;
        }

        _errorMessage = "Error: Invalid login attempt.";
    }

    private sealed class InputModel {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = "";

        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; } = "";

        [Display(Name = "Remember me?")]
        public bool RememberMe { get; set; }
    }
}