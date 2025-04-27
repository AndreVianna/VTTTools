namespace VttTools.WebApp.Pages.Account;

public partial class ConfirmEmailPage {
    private string? _statusMessage;

    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = null!;

    [Inject]
    private UserManager<User> UserManager { get; set; } = null!;
    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;

    [SupplyParameterFromQuery]
    private string? UserId { get; set; }

    [SupplyParameterFromQuery]
    private string? Code { get; set; }

    protected override async Task OnInitializedAsync() {
        if (UserId is null || Code is null) {
            NavigationManager.RedirectToHome();
            return;
        }

        var user = await UserManager.FindByIdAsync(UserId);
        if (user is null) {
            HttpContext.Response.StatusCode = StatusCodes.Status404NotFound;
            _statusMessage = $"Error loading user with ID {UserId}";
            return;
        }

        var code = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(Code));
        var result = await UserManager.ConfirmEmailAsync(user, code);
        _statusMessage = result.Succeeded ? "Thank you for confirming your email." : "Error confirming your email.";
    }
}