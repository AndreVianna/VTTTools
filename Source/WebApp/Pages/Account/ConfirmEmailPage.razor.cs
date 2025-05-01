namespace VttTools.WebApp.Pages.Account;

public partial class ConfirmEmailPage {
    [CascadingParameter]
    internal HttpContext HttpContext { get; set; } = null!;

    [Inject]
    internal UserManager<User> UserManager { get; set; } = null!;
    [Inject]
    internal NavigationManager NavigationManager { get; set; } = null!;

    [SupplyParameterFromQuery]
    internal string? UserId { get; set; }

    [SupplyParameterFromQuery]
    internal string? Code { get; set; }

    internal ConfirmEmailPageHandler Handler { get; } = new();

    internal ConfirmEmailPageState State => Handler.State;

    protected override async Task OnInitializedAsync() => await Handler.InitializeAsync(
            UserId,
            Code,
            UserManager,
            NavigationManager,
            HttpContext);
}