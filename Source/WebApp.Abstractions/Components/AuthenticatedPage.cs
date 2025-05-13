namespace VttTools.WebApp.Components;

public class AuthenticatedPage
    : Page, IAuthenticatedPage {
    [CascadingParameter]
    public virtual Guid UserId { get; private set; }
    public virtual string UserDisplayName { get; private set; } = "User";
    public virtual bool UserIsAdministrator { get; private set; }

    protected override void Configure() {
        base.Configure();
        var user = HttpContext?.User;
        var userId = user?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) {
            this.GoToSignIn();
            return;
        }
        UserId = Guid.Parse(userId);
        UserDisplayName = GetUserDisplayName(user!);
        UserIsAdministrator = HttpContext?.User.IsInRole("Administrator") ?? false;
    }

    private static string GetUserDisplayName(ClaimsPrincipal user)
        => user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.GivenName)?.Value
        ?? user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value
        ?? "User";
}

public class AuthenticatedPage<TPage, THandler>
    : AuthenticatedPage
    where TPage : AuthenticatedPage<TPage, THandler>
    where THandler : AuthenticatedPageHandler<THandler, TPage> {
    public AuthenticatedPage() {
        EnsureHandlerIsCreated();
    }

    protected override async Task ConfigureAsync() {
        await base.ConfigureAsync();
        await Handler.ConfigureAsync();
    }

    [MemberNotNull(nameof(Handler))]
    protected void EnsureHandlerIsCreated() {
        if (Handler is not null) return;
        Handler = InstanceFactory.Create<THandler>(this);
    }

    protected THandler Handler { get; set; } = null!;
}