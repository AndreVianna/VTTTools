namespace VttTools.WebApp.Pages.Account.Manage;

public partial class PersonalDataPage {
    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = null!;

    [Inject]
    private UserManager<User> UserManager { get; set; } = null!;

    [Inject]
    private IIdentityUserAccessor UserAccessor { get; set; } = null!;

    protected override Task OnInitializedAsync()
        => UserAccessor.GetCurrentUserOrRedirectAsync();
}