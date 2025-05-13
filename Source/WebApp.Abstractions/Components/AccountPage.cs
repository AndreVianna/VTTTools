namespace VttTools.WebApp.Components;

public class AccountPage
    : Page, IAccountPage {
    [CascadingParameter]
    public virtual User CurrentUser { get; private set; } = null!;

    protected override async Task ConfigureAsync() {
        await base.ConfigureAsync();
        var scope = ScopeFactory.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var user = HttpContext.User is not null
                       ? await userManager.GetUserAsync(HttpContext.User)
                       : null;
        if (user is null) {
            this.GoToSignIn();
            return;
        }
        CurrentUser = user;
    }
}

public class AccountPage<TPage, THandler>
    : AccountPage
    where TPage : AccountPage<TPage, THandler>
    where THandler : AccountPageHandler<THandler, TPage> {
    public AccountPage() {
        EnsureHandlerIsCreated();
    }

    protected override async Task ConfigureAsync() {
        await base.ConfigureAsync();
        await Handler.ConfigureAsync();
    }

    [MemberNotNull(nameof(Handler))]
    protected void EnsureHandlerIsCreated() {
        if (Handler is not null)
            return;
        Handler = InstanceFactory.Create<THandler>(this);
    }

    protected THandler Handler { get; set; } = null!;
}