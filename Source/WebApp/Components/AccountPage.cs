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
            GoToSignIn();
            return false;
        }
        CurrentUser = user;
        return true;
    }
}

public class AccountPage<THandler>
    : AccountPage
    where THandler : AccountPageHandler<THandler> {
    protected override async Task<bool> ConfigureAsync() {
        if (!await base.ConfigureAsync())
            return false;
        await SetHandlerAsync();
        return true;
    }

    [MemberNotNull(nameof(Handler))]
    protected async Task SetHandlerAsync() {
        if (Handler is not null)
            return;
        Handler = InstanceFactory.Create<THandler>(this);
        await Handler.ConfigureAsync();
    }

    protected THandler Handler { get; set; } = null!;
}
