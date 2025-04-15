namespace WebApp.Components.Account.Pages.Manage;

public partial class PersonalData {
    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = null!;

    [Inject]
    private UserManager<User> UserManager { get; set; } = null!;

    [Inject]
    private IdentityUserAccessor UserAccessor { get; set; } = null!;

    protected override Task OnInitializedAsync()
        => UserAccessor.GetRequiredUserOrRedirectAsync(HttpContext, UserManager);
}
