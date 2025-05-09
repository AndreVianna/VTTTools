namespace VttTools.WebApp.Components;

public class AccountPage
    : Page, IAccountPage {
    [CascadingParameter]
    public User CurrentUser { get; private set; } = null!;

    protected override async Task<bool> ConfigureAsync() {
        if (!await base.ConfigureAsync())
            return false;
        var scope = ScopeFactory.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var user = HttpContext?.User is not null
                       ? await userManager.GetUserAsync(HttpContext.User)
                       : null;
        if (user is null) {
            this.GoToSignIn();
            return false;
        }
        CurrentUser = user;
        return true;
    }
}

public class AccountPage<THandler>
    : AccountPage
    where THandler : AccountPageHandler<THandler> {
    protected override bool Configure() {
        SetHandler();
        return base.Configure();
    }
    protected override async Task<bool> ConfigureAsync() {
        if (!await base.ConfigureAsync())
            return false;
        await Handler.ConfigureAsync();
        return true;
    }

    [MemberNotNull(nameof(Handler))]
    protected void SetHandler() {
        if (Handler is not null)
            return;
        Handler = InstanceFactory.Create<THandler>(this);
    }

    protected THandler Handler { get; set; } = null!;
}
